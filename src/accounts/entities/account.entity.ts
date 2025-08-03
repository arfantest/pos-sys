import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum AccountType {
  ASSET = "asset",
  LIABILITY = "liability",
  EQUITY = "equity",
  INCOME = "income",
  EXPENSE = "expense",
}

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column()
  name: string

  @Column({
    type: "enum",
    enum: AccountType,
  })
  type: AccountType

  @Column({ nullable: true })
  description: string

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  balance: number

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
