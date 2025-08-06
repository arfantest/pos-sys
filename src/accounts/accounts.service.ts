import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { Account } from "./entities/account.entity"
import { CreateAccountDto } from "./dto/create-account.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { AccountType } from "./entities/account.entity"

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>
  ) { }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const existingAccount = await this.accountsRepository.findOne({
      where: [{ code: createAccountDto.code }, { name: createAccountDto.name }],
    })

    if (existingAccount) {
      throw new ConflictException("Account code or name already exists")
    }

    const account = this.accountsRepository.create({
      ...createAccountDto,
      balance: createAccountDto.balance || 0,
      isActive: createAccountDto.isActive !== undefined ? createAccountDto.isActive : true,
    })

    return this.accountsRepository.save(account)
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    })
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { id } })
    if (!account) {
      throw new NotFoundException("Account not found")
    }
    return account
  }

  async update(id: string, updateAccountDto: Partial<CreateAccountDto>): Promise<Account> {
    const account = await this.findOne(id)
    Object.assign(account, updateAccountDto)
    return this.accountsRepository.save(account)
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id)
    account.isActive = false
    await this.accountsRepository.save(account)
  }

  async updateBalance(id: string, amount: number): Promise<Account> {
    const account = await this.findOne(id);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const currentBalance = parseFloat(account.balance.toString());


    if (isNaN(currentBalance)) {
      throw new BadRequestException(`Invalid balance value: ${account.balance}`);
    }

    const newBalance = currentBalance + amount;

    // Save as string again
    account.balance = newBalance; // Keep two decimal places as string
    return this.accountsRepository.save(account);
  }


  async debitAccount(id: string, amount: number): Promise<Account> {
    const account = await this.findOne(id)

    // In accounting: Debit increases Assets and Expenses, decreases Liabilities, Equity, and Income
    switch (account.type) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        account.balance += amount
        break
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.INCOME:
        account.balance -= amount
        break
    }

    return this.accountsRepository.save(account)
  }

  async creditAccount(id: string, amount: number): Promise<Account> {
    const account = await this.findOne(id)

    // In accounting: Credit decreases Assets and Expenses, increases Liabilities, Equity, and Income
    switch (account.type) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        account.balance -= amount
        break
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.INCOME:
        account.balance += amount
        break
    }

    return this.accountsRepository.save(account)
  }

  async getAccountBalance(id: string): Promise<number> {
    const account = await this.findOne(id)
    return account.balance
  }

  async getAccountsByType(type: AccountType): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { type, isActive: true },
      order: { name: 'ASC' }
    })
  }
}
