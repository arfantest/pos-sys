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
import { SaleItem } from "./sale-item.entity"
import { User } from "../../users/entities/user.entity"

export enum SaleStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  invoiceNumber: string

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  tax: number

  @Column("decimal", { precision: 10, scale: 2 })
  total: number

  @Column("decimal", { precision: 10, scale: 2 })
  paid: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  change: number

  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  status: SaleStatus

  @Column({ nullable: true })
  customerName: string

  @Column({ nullable: true })
  customerPhone: string

  @OneToMany(
    () => SaleItem,
    (saleItem) => saleItem.sale,
    { cascade: true },
  )
  items: SaleItem[]

  @ManyToOne(() => User)
  @JoinColumn({ name: "cashierId" })
  cashier: User

  @Column()
  cashierId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
