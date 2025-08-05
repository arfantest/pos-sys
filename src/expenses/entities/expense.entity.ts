import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Account } from "../../accounts/entities/account.entity"
import { User } from "../../users/entities/user.entity"

@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  description: string

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number

  @Column({ type: "date" })
  date: Date

  @Column()
  category: string

  @Column({ nullable: true })
  receiptNumber: string

  @Column({ nullable: true })
  notes: string

  @ManyToOne(() => Account)
  @JoinColumn({ name: "accountId" })
  account: Account

  @Column()
  accountId: string

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
