import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { JournalEntry } from "./journal-entry.entity"
import { Account } from "../../accounts/entities/account.entity"

@Entity("journal_entry_lines")
export class JournalEntryLine {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  debit: number

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  credit: number

  @Column({ nullable: true })
  description: string

  @ManyToOne(
    () => JournalEntry,
    (journalEntry) => journalEntry.lines,
  )
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
