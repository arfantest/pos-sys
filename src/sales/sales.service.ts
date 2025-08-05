import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { Sale, SaleStatus } from "./entities/sale.entity"
import { SaleItem } from "./entities/sale-item.entity"
import { CreateSaleDto } from "./dto/create-sale.dto"
import { ProductsService } from "../products/products.service"

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,

    private readonly productsService: ProductsService, // This should work now
  ) {}

  async create(createSaleDto: CreateSaleDto, cashierId: string): Promise<Sale> {
    // Calculate subtotal
    let subtotal = 0
    const saleItems = []

    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId)

      // Check stock availability
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`)
      }

      const itemTotal = item.quantity * item.unitPrice
      subtotal += itemTotal

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal,
      })

      // Update product stock
      await this.productsService.updateStock(item.productId, -item.quantity)
    }

    const total = subtotal - createSaleDto.discount + createSaleDto.tax
    const change = createSaleDto.paid - total

    if (change < 0) {
      throw new BadRequestException("Insufficient payment amount")
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber()

    const sale = this.salesRepository.create({
      invoiceNumber,
      subtotal,
      discount: createSaleDto.discount,
      tax: createSaleDto.tax,
      total,
      paid: createSaleDto.paid,
      change,
      customerName: createSaleDto.customerName,
      customerPhone: createSaleDto.customerPhone,
      cashierId,
      status: SaleStatus.COMPLETED,
    })

    const savedSale = await this.salesRepository.save(sale)

    // Create sale items
    for (const item of saleItems) {
      const saleItem = this.saleItemsRepository.create({
        ...item,
        saleId: savedSale.id,
      })
      await this.saleItemsRepository.save(saleItem)
    }

    return this.findOne(savedSale.id)
  }

  async findAll(): Promise<Sale[]> {
    return this.salesRepository.find({
      relations: ["items", "items.product", "cashier"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "cashier"],
    })
    if (!sale) {
      throw new NotFoundException("Sale not found")
    }
    return sale
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    const lastSale = await this.salesRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })

    let sequence = 1
    if (lastSale && lastSale.invoiceNumber.startsWith(`INV-${dateStr}`)) {
      const lastSequence = Number.parseInt(lastSale.invoiceNumber.split("-")[2])
      sequence = lastSequence + 1
    }

    return `INV-${dateStr}-${sequence.toString().padStart(4, "0")}`
  }
}
