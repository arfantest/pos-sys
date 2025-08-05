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
import { PurchaseReturnItem } from "./purchase-return-item.entity"
import { Purchase } from "./purchase.entity"
import { User } from "../../users/entities/user.entity"

export enum PurchaseReturnReason {
  DEFECTIVE = "defective",
  WRONG_ITEM = "wrong_item",
  DAMAGED = "damaged",
  EXPIRED = "expired",
  QUALITY_ISSUE = "quality_issue",
  OVERSTOCK = "overstock",
  OTHER = "other",
}

export enum PurchaseReturnStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SHIPPED = "shipped",
  COMPLETED = "completed",
}

@Entity("purchase_returns")
export class PurchaseReturn {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  returnNumber: string

  @Column()
  supplierName: string

  @Column({ nullable: true })
  supplierContact: string

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  creditAmount: number

  @Column({
    type: "enum",
    enum: PurchaseReturnReason,
  })
  reason: PurchaseReturnReason

  @Column({ nullable: true })
  notes: string

  @Column({
    type: "enum",
    enum: PurchaseReturnStatus,
    default: PurchaseReturnStatus.PENDING,
  })
  status: PurchaseReturnStatus

  @ManyToOne(() => Purchase)
  @JoinColumn({ name: "originalPurchaseId" })
  originalPurchase: Purchase

  @Column()
  originalPurchaseId: string

  @OneToMany(
    () => PurchaseReturnItem,
    (returnItem) => returnItem.purchaseReturn,
    { cascade: true },
  )
  items: PurchaseReturnItem[]

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy: User

  @Column()
  createdById: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "approvedById" })
  approvedBy: User

  @Column({ nullable: true })
  approvedById: string

  @Column({ nullable: true })
  approvedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
