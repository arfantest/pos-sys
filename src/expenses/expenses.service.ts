import { Injectable, NotFoundException } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { Expense } from "./entities/expense.entity"
import { CreateExpenseDto } from "./dto/create-expense.dto"
import { AccountingService } from "../ledger/accounting.service"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private ledgerService: AccountingService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, createdById: string): Promise<Expense> {
    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      createdById,
    })

    const savedExpense = await this.expensesRepository.save(expense)

    // Create journal entry for the expense
    await this.createExpenseJournalEntry(savedExpense)

    return this.findOne(savedExpense.id)
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      relations: ["account", "createdBy"],
      order: { date: "DESC" },
    })
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ["account", "createdBy"],
    })
    if (!expense) {
      throw new NotFoundException("Expense not found")
    }
    return expense
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ["account", "createdBy"],
      order: { date: "DESC" },
    })
  }

  async findByCategory(category: string): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { category },
      relations: ["account", "createdBy"],
      order: { date: "DESC" },
    })
  }

  async update(id: string, updateExpenseDto: CreateExpenseDto, updatedById: string): Promise<Expense> {
    const expense = await this.findOne(id)

    // Update expense
    Object.assign(expense, updateExpenseDto)
    const updatedExpense = await this.expensesRepository.save(expense)

    // Update journal entry (you might want to reverse the old entry and create a new one)
    // For simplicity, we'll just create a new adjustment entry
    await this.createExpenseJournalEntry(updatedExpense, true)

    return this.findOne(updatedExpense.id)
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id)
    await this.expensesRepository.remove(expense)
  }

  private async createExpenseJournalEntry(expense: Expense, isAdjustment = false): Promise<void> {
    const description = isAdjustment ? `Expense adjustment: ${expense.description}` : `Expense: ${expense.description}`

    // For expenses, we debit the expense account and credit cash/bank
    const journalEntryData = {
      description,
      date: expense.date,
      lines: [
        {
          accountId: expense.accountId,
          debit: expense.amount,
          credit: 0,
          description: expense.description,
        },
        {
          accountId: "cash-account-id", // You should get this from settings or configuration
          debit: 0,
          credit: expense.amount,
          description: `Payment for: ${expense.description}`,
        },
      ],
    }

    // Note: You'll need to implement this method in AccountingService
    // await this.ledgerService.createJournalEntry(journalEntryData, expense.createdById)
  }
}
