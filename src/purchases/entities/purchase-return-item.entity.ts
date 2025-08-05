import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { PurchaseReturn } from "./purchase-return.entity"
import { Product } from "../../products/entities/product.entity"
import { PurchaseItem } from "./purchase-item.entity"

@Entity("purchase_return_items")
export class PurchaseReturnItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  quantity: number

  @Column("decimal", { precision: 10, scale: 2 })
  unitCost: number

  @Column("decimal", { precision: 10, scale: 2 })
  total: number

  @Column({ nullable: true })
  condition: string

  @ManyToOne(
    () => PurchaseReturn,
    (purchaseReturn) => purchaseReturn.items,
  )
  @JoinColumn({ name: "purchaseReturnId" })
  purchaseReturn: PurchaseReturn

  @Column()
  purchaseReturnId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product

  @Column()
  productId: string

  @ManyToOne(() => PurchaseItem)
  @JoinColumn({ name: "originalPurchaseItemId" })
  originalPurchaseItem: PurchaseItem

  @Column()
  originalPurchaseItemId: string
}
