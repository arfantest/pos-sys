import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Purchase } from "./purchase.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("purchase_items")
export class PurchaseItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  quantity: number

  @Column("decimal", { precision: 10, scale: 2 })
  unitCost: number

  @Column("decimal", { precision: 10, scale: 2 })
  total: number

  @ManyToOne(
    () => Purchase,
    (purchase) => purchase.items,
  )
  @JoinColumn({ name: "purchaseId" })
  purchase: Purchase

  @Column()
  purchaseId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product

  @Column()
  productId: string
}
