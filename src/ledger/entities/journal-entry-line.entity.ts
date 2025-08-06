import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { JournalEntry } from "./journal-entry.entity"
import { Account } from "../../accounts/entities/account.entity"

export enum EntryType {
  DEBIT = "debit",
  CREDIT = "credit",
}

@Entity("journal_entry_lines")
export class JournalEntryLine {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: EntryType,
  })
  entryType: EntryType

  @Column("decimal", { precision: 15, scale: 2 })
  amount: number

  @Column({ nullable: true })
  description: string

  @ManyToOne(() => JournalEntry, (entry) => entry.lines)
  @JoinColumn({ name: "journalEntryId" })
  journalEntry: JournalEntry

  @Column()
  journalEntryId: string

  @ManyToOne(() => Account)
  @JoinColumn({ name: "accountId" })
  account: Account

  @Column()
  accountId: string
}
