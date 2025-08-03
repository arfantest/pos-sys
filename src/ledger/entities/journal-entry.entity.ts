import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { JournalEntryLine } from "./journal-entry-line.entity"
import { User } from "../../users/entities/user.entity"

@Entity("journal_entries")
export class JournalEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  entryNumber: string

  @Column()
  description: string

  @Column({ type: "date" })
  date: Date

  @Column("decimal", { precision: 15, scale: 2 })
  totalDebit: number

  @Column("decimal", { precision: 15, scale: 2 })
  totalCredit: number

  @OneToMany(
    () => JournalEntryLine,
    (line) => line.journalEntry,
    { cascade: true },
  )
  lines: JournalEntryLine[]

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy: User

  @Column()
  createdById: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
