import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("company_settings")
export class CompanySetting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  companyName: string

  @Column({ nullable: true })
  address: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  website: string

  @Column({ nullable: true })
  taxNumber: string

  @Column({ default: "USD" })
  currency: string

  @Column({ default: "$" })
  currencySymbol: string

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  defaultTaxRate: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
