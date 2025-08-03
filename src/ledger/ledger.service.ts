import { Injectable } from "@nestjs/common"
import { Between, type Repository } from "typeorm"
import { JournalEntry } from "./entities/journal-entry.entity"
import { JournalEntryLine } from "./entities/journal-entry-line.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntriesRepository: Repository<JournalEntry>,

    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLinesRepository: Repository<JournalEntryLine>,
  ) {}

  async getGeneralLedger(startDate?: Date, endDate?: Date) {
    const whereClause = startDate && endDate ? { date: Between(startDate, endDate), } : {}

    return this.journalEntriesRepository.find({
      where: whereClause,
      relations: ["lines", "lines.account", "createdBy"],
      order: { date: "ASC", createdAt: "ASC" },
    })
  }

  async getAccountLedger(accountId: string, startDate?: Date, endDate?: Date) {
    const query = this.journalEntryLinesRepository
      .createQueryBuilder("line")
      .leftJoinAndSelect("line.journalEntry", "entry")
      .leftJoinAndSelect("line.account", "account")
      .where("line.accountId = :accountId", { accountId })

    if (startDate && endDate) {
      query.andWhere("entry.date BETWEEN :startDate AND :endDate", { startDate, endDate })
    }

    return query.orderBy("entry.date", "ASC").addOrderBy("entry.createdAt", "ASC").getMany()
  }

  async getDayBook(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.journalEntriesRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ["lines", "lines.account", "createdBy"],
      order: { createdAt: "ASC" },
    })
  }
}
