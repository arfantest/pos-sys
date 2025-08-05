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
import { SaleReturnItem } from "./sale-return-item.entity"
import { Sale } from "./sale.entity"
import { User } from "../../users/entities/user.entity"

export enum SaleReturnReason {
  DEFECTIVE = "defective",
  WRONG_ITEM = "wrong_item",
  CUSTOMER_CHANGE_MIND = "customer_change_mind",
  DAMAGED = "damaged",
  EXPIRED = "expired",
  OTHER = "other",
}

export enum SaleReturnStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

@Entity("sale_returns")
export class SaleReturn {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  returnNumber: string

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  refundAmount: number

  @Column({
    type: "enum",
    enum: SaleReturnReason,
  })
  reason: SaleReturnReason

  @Column({ nullable: true })
  notes: string

  @Column({
    type: "enum",
    enum: SaleReturnStatus,
    default: SaleReturnStatus.PENDING,
  })
  status: SaleReturnStatus

  @ManyToOne(() => Sale)
  @JoinColumn({ name: "originalSaleId" })
  originalSale: Sale

  @Column()
  originalSaleId: string

  @OneToMany(
    () => SaleReturnItem,
    (returnItem) => returnItem.saleReturn,
    { cascade: true },
  )
  items: SaleReturnItem[]

  @ManyToOne(() => User)
  @JoinColumn({ name: "processedById" })
  processedBy: User

  @Column()
  processedById: string

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
