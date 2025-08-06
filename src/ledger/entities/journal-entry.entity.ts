import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { JournalEntryLine } from "./journal-entry-line.entity"

export enum TransactionType {
  SALE = "sale",
  PURCHASE = "purchase",
  PAYMENT = "payment",
  RECEIPT = "receipt",
  ADJUSTMENT = "adjustment",
  OPENING_BALANCE = "opening_balance",
  CLOSING = "closing",
}

@Entity("journal_entries")
export class JournalEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  entryNumber: string

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  transactionType: TransactionType

  @Column()
  description: string

  @Column({ type: "date" })
  transactionDate: Date

  @Column("decimal", { precision: 15, scale: 2 })
  totalAmount: number

  @Column({ nullable: true })
  referenceId: string // Reference to Sale, Purchase, etc.

  @Column({ nullable: true })
  referenceType: string // 'sale', 'purchase', etc.

  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, { cascade: true })
  lines: JournalEntryLine[]

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy" })
  createdByUser: User

  @Column()
  createdBy: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
