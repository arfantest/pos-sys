import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PurchaseReturn, PurchaseReturnStatus } from "./entities/purchase-return.entity"
import { PurchaseReturnItem } from "./entities/purchase-return-item.entity"
import { CreatePurchaseReturnDto, ApprovePurchaseReturnDto } from "./dto/create-purchase-return.dto"
import { PurchasesService } from "./purchases.service"
import { ProductsService } from "../products/products.service"

@Injectable()
export class PurchaseReturnsService {
  constructor(
    @InjectRepository(PurchaseReturn)
    private purchaseReturnsRepository: Repository<PurchaseReturn>,
    @InjectRepository(PurchaseReturnItem)
    private purchaseReturnItemsRepository: Repository<PurchaseReturnItem>,
    private purchasesService: PurchasesService,
    private productsService: ProductsService,
  ) {}

  async create(createPurchaseReturnDto: CreatePurchaseReturnDto, createdById: string): Promise<PurchaseReturn> {
    // Verify original purchase exists
    const originalPurchase = await this.purchasesService.findOne(createPurchaseReturnDto.originalPurchaseId)

    if (originalPurchase.status !== "received") {
      throw new BadRequestException("Can only return received purchases")
    }

    // Calculate total amount
    let totalAmount = 0
    const returnItems = []

    for (const item of createPurchaseReturnDto.items) {
      // Verify the original purchase item exists
      const originalPurchaseItem = originalPurchase.items.find((pi) => pi.id === item.originalPurchaseItemId)
      if (!originalPurchaseItem) {
        throw new BadRequestException(`Original purchase item not found: ${item.originalPurchaseItemId}`)
      }

      // Check if return quantity is valid
      if (item.quantity > originalPurchaseItem.quantity) {
        throw new BadRequestException(
          `Return quantity cannot exceed original quantity for item ${originalPurchaseItem.product.name}`,
        )
      }

      const itemTotal = item.quantity * item.unitCost
      totalAmount += itemTotal

      returnItems.push({
        originalPurchaseItemId: item.originalPurchaseItemId,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: itemTotal,
        condition: item.condition,
      })
    }

    // Generate return number
    const returnNumber = await this.generateReturnNumber()

    const purchaseReturn = this.purchaseReturnsRepository.create({
      returnNumber,
      originalPurchaseId: createPurchaseReturnDto.originalPurchaseId,
      supplierName: originalPurchase.supplierName,
      supplierContact: originalPurchase.supplierContact,
      reason: createPurchaseReturnDto.reason,
      notes: createPurchaseReturnDto.notes,
      totalAmount,
      createdById,
      status: PurchaseReturnStatus.PENDING,
    })

    const savedReturn = await this.purchaseReturnsRepository.save(purchaseReturn)

    // Create return items
    for (const item of returnItems) {
      const returnItem = this.purchaseReturnItemsRepository.create({
        ...item,
        purchaseReturnId: savedReturn.id,
      })
      await this.purchaseReturnItemsRepository.save(returnItem)
    }

    return this.findOne(savedReturn.id)
  }

  async findAll(): Promise<PurchaseReturn[]> {
    return this.purchaseReturnsRepository.find({
      relations: ["items", "items.product", "originalPurchase", "createdBy", "approvedBy"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<PurchaseReturn> {
    const purchaseReturn = await this.purchaseReturnsRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "originalPurchase", "createdBy", "approvedBy"],
    })
    if (!purchaseReturn) {
      throw new NotFoundException("Purchase return not found")
    }
    return purchaseReturn
  }

  async approve(id: string, approveDto: ApprovePurchaseReturnDto, approvedById: string): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(id)

    if (purchaseReturn.status !== PurchaseReturnStatus.PENDING) {
      throw new BadRequestException("Can only approve pending returns")
    }

    // Update product stock (remove returned items)
    for (const item of purchaseReturn.items) {
      await this.productsService.updateStock(item.productId, -item.quantity)
    }

    purchaseReturn.status = PurchaseReturnStatus.APPROVED
    purchaseReturn.creditAmount = approveDto.creditAmount
    purchaseReturn.approvedById = approvedById
    purchaseReturn.approvedAt = new Date()
    if (approveDto.notes) {
      purchaseReturn.notes = `${purchaseReturn.notes || ""}\nApproval Notes: ${approveDto.notes}`
    }

    return this.purchaseReturnsRepository.save(purchaseReturn)
  }

  async reject(id: string, reason: string, approvedById: string): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(id)

    if (purchaseReturn.status !== PurchaseReturnStatus.PENDING) {
      throw new BadRequestException("Can only reject pending returns")
    }

    purchaseReturn.status = PurchaseReturnStatus.REJECTED
    purchaseReturn.approvedById = approvedById
    purchaseReturn.approvedAt = new Date()
    purchaseReturn.notes = `${purchaseReturn.notes || ""}\nRejection Reason: ${reason}`

    return this.purchaseReturnsRepository.save(purchaseReturn)
  }

  async ship(id: string): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(id)

    if (purchaseReturn.status !== PurchaseReturnStatus.APPROVED) {
      throw new BadRequestException("Can only ship approved returns")
    }

    purchaseReturn.status = PurchaseReturnStatus.SHIPPED
    return this.purchaseReturnsRepository.save(purchaseReturn)
  }

  async complete(id: string): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(id)

    if (purchaseReturn.status !== PurchaseReturnStatus.SHIPPED) {
      throw new BadRequestException("Can only complete shipped returns")
    }

    purchaseReturn.status = PurchaseReturnStatus.COMPLETED
    return this.purchaseReturnsRepository.save(purchaseReturn)
  }

  private async generateReturnNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    const lastReturn = await this.purchaseReturnsRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })

    let sequence = 1
    if (lastReturn && lastReturn.returnNumber.startsWith(`PRET-${dateStr}`)) {
      const lastSequence = Number.parseInt(lastReturn.returnNumber.split("-")[2])
      sequence = lastSequence + 1
    }

    return `PRET-${dateStr}-${sequence.toString().padStart(4, "0")}`
  }
}
