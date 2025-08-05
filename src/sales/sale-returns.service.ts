import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SaleReturn, SaleReturnStatus } from "./entities/sale-return.entity"
import { SaleReturnItem } from "./entities/sale-return-item.entity"
import { CreateSaleReturnDto, ApproveSaleReturnDto } from "./dto/create-sale-return.dto"
import { SalesService } from "./sales.service"
import { ProductsService } from "../products/products.service"

@Injectable()
export class SaleReturnsService {
  constructor(
    @InjectRepository(SaleReturn)
    private saleReturnsRepository: Repository<SaleReturn>,
    @InjectRepository(SaleReturnItem)
    private saleReturnItemsRepository: Repository<SaleReturnItem>,
    private salesService: SalesService,
    private productsService: ProductsService,
  ) {}

  async create(createSaleReturnDto: CreateSaleReturnDto, processedById: string): Promise<SaleReturn> {
    // Verify original sale exists
    const originalSale = await this.salesService.findOne(createSaleReturnDto.originalSaleId)

    if (originalSale.status !== "completed") {
      throw new BadRequestException("Can only return completed sales")
    }

    // Calculate total amount
    let totalAmount = 0
    const returnItems = []

    for (const item of createSaleReturnDto.items) {
      // Verify the original sale item exists
      const originalSaleItem = originalSale.items.find((si) => si.id === item.originalSaleItemId)
      if (!originalSaleItem) {
        throw new BadRequestException(`Original sale item not found: ${item.originalSaleItemId}`)
      }

      // Check if return quantity is valid
      if (item.quantity > originalSaleItem.quantity) {
        throw new BadRequestException(
          `Return quantity cannot exceed original quantity for item ${originalSaleItem.product.name}`,
        )
      }

      const itemTotal = item.quantity * item.unitPrice
      totalAmount += itemTotal

      returnItems.push({
        originalSaleItemId: item.originalSaleItemId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal,
        condition: item.condition,
      })
    }

    // Generate return number
    const returnNumber = await this.generateReturnNumber()

    const saleReturn = this.saleReturnsRepository.create({
      returnNumber,
      originalSaleId: createSaleReturnDto.originalSaleId,
      reason: createSaleReturnDto.reason,
      notes: createSaleReturnDto.notes,
      totalAmount,
      processedById,
      status: SaleReturnStatus.PENDING,
    })

    const savedReturn = await this.saleReturnsRepository.save(saleReturn)

    // Create return items
    for (const item of returnItems) {
      const returnItem = this.saleReturnItemsRepository.create({
        ...item,
        saleReturnId: savedReturn.id,
      })
      await this.saleReturnItemsRepository.save(returnItem)
    }

    return this.findOne(savedReturn.id)
  }

  async findAll(): Promise<SaleReturn[]> {
    return this.saleReturnsRepository.find({
      relations: ["items", "items.product", "originalSale", "processedBy", "approvedBy"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<SaleReturn> {
    const saleReturn = await this.saleReturnsRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "originalSale", "processedBy", "approvedBy"],
    })
    if (!saleReturn) {
      throw new NotFoundException("Sale return not found")
    }
    return saleReturn
  }

  async approve(id: string, approveDto: ApproveSaleReturnDto, approvedById: string): Promise<SaleReturn> {
    const saleReturn = await this.findOne(id)

    if (saleReturn.status !== SaleReturnStatus.PENDING) {
      throw new BadRequestException("Can only approve pending returns")
    }

    // Update product stock (add back returned items)
    for (const item of saleReturn.items) {
      await this.productsService.updateStock(item.productId, item.quantity)
    }

    saleReturn.status = SaleReturnStatus.APPROVED
    saleReturn.refundAmount = approveDto.refundAmount
    saleReturn.approvedById = approvedById
    saleReturn.approvedAt = new Date()
    if (approveDto.notes) {
      saleReturn.notes = `${saleReturn.notes || ""}\nApproval Notes: ${approveDto.notes}`
    }

    return this.saleReturnsRepository.save(saleReturn)
  }

  async reject(id: string, reason: string, approvedById: string): Promise<SaleReturn> {
    const saleReturn = await this.findOne(id)

    if (saleReturn.status !== SaleReturnStatus.PENDING) {
      throw new BadRequestException("Can only reject pending returns")
    }

    saleReturn.status = SaleReturnStatus.REJECTED
    saleReturn.approvedById = approvedById
    saleReturn.approvedAt = new Date()
    saleReturn.notes = `${saleReturn.notes || ""}\nRejection Reason: ${reason}`

    return this.saleReturnsRepository.save(saleReturn)
  }

  async complete(id: string): Promise<SaleReturn> {
    const saleReturn = await this.findOne(id)

    if (saleReturn.status !== SaleReturnStatus.APPROVED) {
      throw new BadRequestException("Can only complete approved returns")
    }

    saleReturn.status = SaleReturnStatus.COMPLETED
    return this.saleReturnsRepository.save(saleReturn)
  }

  private async generateReturnNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    const lastReturn = await this.saleReturnsRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })

    let sequence = 1
    if (lastReturn && lastReturn.returnNumber.startsWith(`RET-${dateStr}`)) {
      const lastSequence = Number.parseInt(lastReturn.returnNumber.split("-")[2])
      sequence = lastSequence + 1
    }

    return `RET-${dateStr}-${sequence.toString().padStart(4, "0")}`
  }
}
