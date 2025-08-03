import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Category } from "../../categories/entities/category.entity"
import { Brand } from "../../brands/entities/brand.entity"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  sku: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ unique: true, nullable: true })
  barcode: string

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  cost: number

  @Column({ default: 0 })
  stock: number

  @Column({ default: 0 })
  minStock: number

  @Column({ default: true })
  isActive: boolean

  @ManyToOne(
    () => Category,
    (category) => category.products,
  )
  @JoinColumn({ name: "categoryId" })
  category: Category

  @Column()
  categoryId: string

  @ManyToOne(
    () => Brand,
    (brand) => brand.products,
  )
  @JoinColumn({ name: "brandId" })
  brand: Brand

  @Column()
  brandId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
