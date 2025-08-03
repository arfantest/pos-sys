import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Purchase, PurchaseStatus } from "./entities/purchase.entity"
import { PurchaseItem } from "./entities/purchase-item.entity"
import type { CreatePurchaseDto } from "./dto/create-purchase.dto"
import { ProductsService } from "../products/products.service"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,

    @InjectRepository(PurchaseItem)
    private readonly purchaseItemsRepository: Repository<PurchaseItem>,

    private readonly productsService: ProductsService,
  ) { }


  async create(createPurchaseDto: CreatePurchaseDto, createdById: string): Promise<Purchase> {
    // Calculate subtotal
    let subtotal = 0
    const purchaseItems = []

    for (const item of createPurchaseDto.items) {
      const product = await this.productsService.findOne(item.productId)
      const itemTotal = item.quantity * item.unitCost
      subtotal += itemTotal

      purchaseItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: itemTotal,
      })
    }

    const total = subtotal - createPurchaseDto.discount + createPurchaseDto.tax

    // Generate purchase order number
    const purchaseOrderNumber = await this.generatePurchaseOrderNumber()

    const purchase = this.purchasesRepository.create({
      purchaseOrderNumber,
      supplierName: createPurchaseDto.supplierName,
      supplierContact: createPurchaseDto.supplierContact,
      subtotal,
      discount: createPurchaseDto.discount,
      tax: createPurchaseDto.tax,
      total,
      createdById,
      status: PurchaseStatus.PENDING,
    })

    const savedPurchase = await this.purchasesRepository.save(purchase)

    // Create purchase items
    for (const item of purchaseItems) {
      const purchaseItem = this.purchaseItemsRepository.create({
        ...item,
        purchaseId: savedPurchase.id,
      })
      await this.purchaseItemsRepository.save(purchaseItem)
    }

    return this.findOne(savedPurchase.id)
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchasesRepository.find({
      relations: ["items", "items.product", "createdBy"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchasesRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "createdBy"],
    })
    if (!purchase) {
      throw new NotFoundException("Purchase not found")
    }
    return purchase
  }

  async receivePurchase(id: string): Promise<Purchase> {
    const purchase = await this.findOne(id)

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new Error("Purchase is not in pending status")
    }

    // Update product stock
    for (const item of purchase.items) {
      await this.productsService.updateStock(item.productId, item.quantity)
    }

    purchase.status = PurchaseStatus.RECEIVED
    return this.purchasesRepository.save(purchase)
  }

  private async generatePurchaseOrderNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    const lastPurchase = await this.purchasesRepository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })

    let sequence = 1
    if (lastPurchase && lastPurchase.purchaseOrderNumber.startsWith(`PO-${dateStr}`)) {
      const lastSequence = Number.parseInt(lastPurchase.purchaseOrderNumber.split("-")[2])
      sequence = lastSequence + 1
    }

    return `PO-${dateStr}-${sequence.toString().padStart(4, "0")}`
  }
}
