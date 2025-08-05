import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { SaleReturn } from "./sale-return.entity"
import { Product } from "../../products/entities/product.entity"
import { SaleItem } from "./sale-item.entity"

@Entity("sale_return_items")
export class SaleReturnItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  quantity: number

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice: number

  @Column("decimal", { precision: 10, scale: 2 })
  total: number

  @Column({ nullable: true })
  condition: string // New, Used, Damaged, etc.

  @ManyToOne(
    () => SaleReturn,
    (saleReturn) => saleReturn.items,
  )
  @JoinColumn({ name: "saleReturnId" })
  saleReturn: SaleReturn

  @Column()
  saleReturnId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product

  @Column()
  productId: string

  @ManyToOne(() => SaleItem)
  @JoinColumn({ name: "originalSaleItemId" })
  originalSaleItem: SaleItem

  @Column()
  originalSaleItemId: string
}
