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
import { PurchaseItem } from "./purchase-item.entity"
import { User } from "../../users/entities/user.entity"

export enum PurchaseStatus {
  PENDING = "pending",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  purchaseOrderNumber: string

  @Column()
  supplierName: string

  @Column({ nullable: true })
  supplierContact: string

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  tax: number

  @Column("decimal", { precision: 10, scale: 2 })
  total: number

  @Column({
    type: "enum",
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus

  @OneToMany(
    () => PurchaseItem,
    (purchaseItem) => purchaseItem.purchase,
    { cascade: true },
  )
  items: PurchaseItem[]

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
