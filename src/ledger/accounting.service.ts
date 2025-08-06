import { Injectable, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { JournalEntry, TransactionType } from "./entities/journal-entry.entity"
import { JournalEntryLine, EntryType } from "./entities/journal-entry-line.entity"
import { AccountsService } from "../accounts/accounts.service"
import { Account, AccountType } from "../accounts/entities/account.entity"

export interface JournalEntryLineDto {
  accountId: string
  entryType: EntryType
  amount: number
  description?: string
}

export interface CreateJournalEntryDto {
  transactionType: TransactionType
  description: string
  transactionDate: Date
  lines: JournalEntryLineDto[]
  referenceId?: string
  referenceType?: string
}

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,

    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLineRepository: Repository<JournalEntryLine>,

    private readonly accountsService: AccountsService,
  ) {}

  async createJournalEntry(
    createJournalEntryDto: CreateJournalEntryDto,
    createdBy: string,
  ): Promise<JournalEntry> {
    // Validate that debits equal credits
    const totalDebits = createJournalEntryDto.lines
      .filter(line => line.entryType === EntryType.DEBIT)
      .reduce((sum, line) => sum + line.amount, 0)

    const totalCredits = createJournalEntryDto.lines
      .filter(line => line.entryType === EntryType.CREDIT)
      .reduce((sum, line) => sum + line.amount, 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Journal entry is not balanced. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`
      )
    }

    // Validate all accounts exist and are active
    for (const line of createJournalEntryDto.lines) {
      const account = await this.accountsService.findOne(line.accountId)
      if (!account.isActive) {
        throw new BadRequestException(`Account ${account.name} is not active`)
      }
    }

    // Generate entry number
    const entryNumber = await this.generateEntryNumber()

    // Create journal entry
    const journalEntry = this.journalEntryRepository.create({
      entryNumber,
      transactionType: createJournalEntryDto.transactionType,
      description: createJournalEntryDto.description,
      transactionDate: createJournalEntryDto.transactionDate,
      totalAmount: totalDebits, // or totalCredits, they should be equal
      referenceId: createJournalEntryDto.referenceId,
      referenceType: createJournalEntryDto.referenceType,
      createdBy,
    })

    const savedEntry = await this.journalEntryRepository.save(journalEntry)

    // Create journal entry lines and update account balances
    for (const lineDto of createJournalEntryDto.lines) {
      const account = await this.accountsService.findOne(lineDto.accountId)

      // Create journal entry line
      const line = this.journalEntryLineRepository.create({
        journalEntryId: savedEntry.id,
        accountId: lineDto.accountId,
        entryType: lineDto.entryType,
        amount: lineDto.amount,
        description: lineDto.description,
      })

      await this.journalEntryLineRepository.save(line)

      // Update account balance
      await this.updateAccountBalance(account, lineDto.entryType, lineDto.amount)
    }

    return this.findJournalEntry(savedEntry.id)
  }

  private async updateAccountBalance(
    account: Account,
    entryType: EntryType,
    amount: number,
  ): Promise<void> {
    let balanceChange = 0

    // Apply accounting rules for balance changes
    if (entryType === EntryType.DEBIT) {
      // Debit increases: Assets, Expenses
      // Debit decreases: Liabilities, Equity, Income
      switch (account.type) {
        case AccountType.ASSET:
        case AccountType.EXPENSE:
          balanceChange = amount
          break
        case AccountType.LIABILITY:
        case AccountType.EQUITY:
        case AccountType.INCOME:
          balanceChange = -amount
          break
      }
    } else {
      // Credit decreases: Assets, Expenses
      // Credit increases: Liabilities, Equity, Income
      switch (account.type) {
        case AccountType.ASSET:
        case AccountType.EXPENSE:
          balanceChange = -amount
          break
        case AccountType.LIABILITY:
        case AccountType.EQUITY:
        case AccountType.INCOME:
          balanceChange = amount
          break
      }
    }

    await this.accountsService.updateBalance(account.id, balanceChange)
  }

  // Convenience methods for common transactions
  async recordSaleTransaction(
    saleId: string,
    cashAccountId: string,
    salesAccountId: string,
    totalAmount: number,
    paidAmount: number,
    createdBy: string,
  ): Promise<JournalEntry> {
    const lines: JournalEntryLineDto[] = [
      {
        accountId: cashAccountId,
        entryType: EntryType.DEBIT,
        amount: paidAmount,
        description: "Cash received from sale",
      },
      {
        accountId: salesAccountId,
        entryType: EntryType.CREDIT,
        amount: totalAmount,
        description: "Sales revenue",
      },
    ]

    // If there's a change, add accounts receivable or reduce cash
    if (paidAmount > totalAmount) {
      const change = paidAmount - totalAmount
      lines.push({
        accountId: cashAccountId,
        entryType: EntryType.CREDIT,
        amount: change,
        description: "Change given to customer",
      })
    }

    return this.createJournalEntry(
      {
        transactionType: TransactionType.SALE,
        description: `Sale transaction`,
        transactionDate: new Date(),
        lines,
        referenceId: saleId,
        referenceType: "sale",
      },
      createdBy,
    )
  }

  async recordPayment(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<JournalEntry> {
    const lines: JournalEntryLineDto[] = [
      {
        accountId: toAccountId,
        entryType: EntryType.DEBIT,
        amount,
        description: `Payment received: ${description}`,
      },
      {
        accountId: fromAccountId,
        entryType: EntryType.CREDIT,
        amount,
        description: `Payment made: ${description}`,
      },
    ]

    return this.createJournalEntry(
      {
        transactionType: TransactionType.PAYMENT,
        description,
        transactionDate: new Date(),
        lines,
      },
      createdBy,
    )
  }

  async recordAdjustment(
    accountId: string,
    amount: number,
    entryType: EntryType,
    description: string,
    createdBy: string,
  ): Promise<JournalEntry> {
    // For adjustments, we need a balancing entry to a general adjustment account
    // You should create an "Adjustments" or "Miscellaneous" account for this
    const adjustmentAccountId = await this.getOrCreateAdjustmentAccount()

    const lines: JournalEntryLineDto[] = [
      {
        accountId,
        entryType,
        amount,
        description,
      },
      {
        accountId: adjustmentAccountId,
        entryType: entryType === EntryType.DEBIT ? EntryType.CREDIT : EntryType.DEBIT,
        amount,
        description: `Balancing entry for: ${description}`,
      },
    ]

    return this.createJournalEntry(
      {
        transactionType: TransactionType.ADJUSTMENT,
        description,
        transactionDate: new Date(),
        lines,
      },
      createdBy,
    )
  }

  // Query methods
  async findJournalEntry(id: string): Promise<JournalEntry> {
    const entry = await this.journalEntryRepository.findOne({
      where: { id },
      relations: ["lines", "lines.account", "createdByUser"],
    })

    if (!entry) {
      throw new BadRequestException("Journal entry not found")
    }

    return entry
  }

  async getJournalEntries(
    page: number = 1,
    limit: number = 50,
    transactionType?: TransactionType,
    startDate?: Date,
    endDate?: Date,
    accountId?: string,
  ): Promise<{ entries: JournalEntry[]; total: number; page: number; totalPages: number }> {
    const query = this.journalEntryRepository.createQueryBuilder("entry")
      .leftJoinAndSelect("entry.lines", "lines")
      .leftJoinAndSelect("lines.account", "account")
      .leftJoinAndSelect("entry.createdByUser", "user")
      .orderBy("entry.transactionDate", "DESC")
      .addOrderBy("entry.createdAt", "DESC")

    if (transactionType) {
      query.andWhere("entry.transactionType = :transactionType", { transactionType })
    }

    if (startDate) {
      query.andWhere("entry.transactionDate >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("entry.transactionDate <= :endDate", { endDate })
    }

    if (accountId) {
      query.andWhere("lines.accountId = :accountId", { accountId })
    }

    const [entries, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(total / limit)

    return { entries, total, page, totalPages }
  }

  async getAccountStatement(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    account: Account
    transactions: JournalEntryLine[]
    openingBalance: number
    closingBalance: number
  }> {
    const account = await this.accountsService.findOne(accountId)

    const query = this.journalEntryLineRepository.createQueryBuilder("line")
      .leftJoinAndSelect("line.journalEntry", "entry")
      .where("line.accountId = :accountId", { accountId })
      .orderBy("entry.transactionDate", "ASC")
      .addOrderBy("entry.createdAt", "ASC")

    if (startDate) {
      query.andWhere("entry.transactionDate >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("entry.transactionDate <= :endDate", { endDate })
    }

    const transactions = await query.getMany()

    // Calculate opening balance (you might want to store this separately)
    const openingBalance = 0 // This should be calculated based on your business logic

    return {
      account,
      transactions,
      openingBalance,
      closingBalance: account.balance,
    }
  }

  async getTrialBalance(date: Date): Promise<{
    accounts: Array<{
      account: Account
      debitBalance: number
      creditBalance: number
    }>
    totalDebits: number
    totalCredits: number
    isBalanced: boolean
  }> {
    const accounts = await this.accountsService.findAll()
    const trialBalanceData = []
    let totalDebits = 0
    let totalCredits = 0

    for (const account of accounts) {
      const balance = account.balance
      let debitBalance = 0
      let creditBalance = 0

      // Determine if balance should be shown as debit or credit
      switch (account.type) {
        case AccountType.ASSET:
        case AccountType.EXPENSE:
          if (balance >= 0) {
            debitBalance = balance
          } else {
            creditBalance = Math.abs(balance)
          }
          break
        case AccountType.LIABILITY:
        case AccountType.EQUITY:
        case AccountType.INCOME:
          if (balance >= 0) {
            creditBalance = balance
          } else {
            debitBalance = Math.abs(balance)
          }
          break
      }

      totalDebits += debitBalance
      totalCredits += creditBalance

      trialBalanceData.push({
        account,
        debitBalance,
        creditBalance,
      })
    }

    return {
      accounts: trialBalanceData,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    }
  }

  async getAccountBalance(accountId: string): Promise<{
    account: Account
    balance: number
    lastTransactionDate?: Date
  }> {
    const account = await this.accountsService.findOne(accountId)
    
    // Get the last transaction date for this account
    const lastTransaction = await this.journalEntryLineRepository
      .createQueryBuilder("line")
      .leftJoin("line.journalEntry", "entry")
      .where("line.accountId = :accountId", { accountId })
      .orderBy("entry.transactionDate", "DESC")
      .addOrderBy("entry.createdAt", "DESC")
      .getOne()

    return {
      account,
      balance: account.balance,
      lastTransactionDate: lastTransaction?.journalEntry?.transactionDate,
    }
  }

  private async generateEntryNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    const lastEntry = await this.journalEntryRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })

    let sequence = 1
    if (lastEntry && lastEntry.entryNumber.startsWith(`JE-${dateStr}`)) {
      const lastSequence = Number.parseInt(lastEntry.entryNumber.split("-")[2])
      sequence = lastSequence + 1
    }

    return `JE-${dateStr}-${sequence.toString().padStart(4, "0")}`
  }

  private async getOrCreateAdjustmentAccount(): Promise<string> {
    // This is a placeholder - you should implement logic to get or create an adjustment account
    // For now, return a hardcoded ID or create the account if it doesn't exist
    return "adjustment-account-id"
  }
}
