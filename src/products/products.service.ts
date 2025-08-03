import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import type { CreateProductDto } from "./dto/create-product.dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class ProductsService {

  constructor(@InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,) {
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepository.findOne({
      where: [{ sku: createProductDto.sku }, { barcode: createProductDto.barcode }],
    })

    if (existingProduct) {
      throw new ConflictException("SKU or Barcode already exists")
    }

    const product = this.productsRepository.create(createProductDto)
    return this.productsRepository.save(product)
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ["category", "brand"],
    })
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ["category", "brand"],
    })
    if (!product) {
      throw new NotFoundException("Product not found")
    }
    return product
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { barcode, isActive: true },
      relations: ["category", "brand"],
    })
    if (!product) {
      throw new NotFoundException("Product not found")
    }
    return product
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id)
    product.stock += quantity
    return this.productsRepository.save(product)
  }

  async update(id: string, updateProductDto: CreateProductDto): Promise<Product> {
    const product = await this.findOne(id)
    Object.assign(product, updateProductDto)
    return this.productsRepository.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    product.isActive = false
    await this.productsRepository.save(product)
  }
}
