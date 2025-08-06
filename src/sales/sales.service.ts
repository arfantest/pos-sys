import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { Sale, SaleStatus } from "./entities/sale.entity"
import { SaleItem } from "./entities/sale-item.entity"
import { CreateSaleDto } from "./dto/create-sale.dto"
import { ProductsService } from "../products/products.service"
import { AccountsService } from "../accounts/accounts.service"
import { AccountType } from "src/accounts/entities/account.entity"

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,

    private readonly productsService: ProductsService,
    private readonly accountsService: AccountsService,
  ) { }

  async create(createSaleDto: CreateSaleDto, cashierId: string): Promise<Sale> {
    try {
      // Validate account if provided
      if (createSaleDto.accountId) {
        const account = await this.accountsService.findOne(createSaleDto.accountId)
        if (!account.isActive) {
          throw new BadRequestException("Selected account is not active")
        }
      }

      // Calculate subtotal and validate products
      let subtotal = 0
      const saleItems = []

      for (const item of createSaleDto.items) {
        const product = await this.productsService.findOne(item.productId)

        // Check if product is active
        if (!product.isActive) {
          throw new BadRequestException(`Product ${product.name} is not active`)
        }

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
        }

        const itemTotal = item.quantity * item.unitPrice
        subtotal += itemTotal

        saleItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: itemTotal,
        })
      }

      const total = subtotal - createSaleDto.discount + createSaleDto.tax
      const change = createSaleDto.paid - total

      if (change < 0) {
        throw new BadRequestException(`Insufficient payment amount. Required: ${total}, Paid: ${createSaleDto.paid}`)
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber()

      // Create sale
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

      // Create sale items and update product stock
      for (const item of saleItems) {
        const saleItem = this.saleItemsRepository.create({
          ...item,
          saleId: savedSale.id,
        })
        await this.saleItemsRepository.save(saleItem)

        // Update product stock
        await this.productsService.updateStock(item.productId, -item.quantity)
      }

      // Update account balance if account is selected
      if (createSaleDto.accountId) {
        await this.processAccountingEntries(createSaleDto, total, savedSale.id)
      }

      return this.findOne(savedSale.id)
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  }
  private async processAccountingEntries(
    createSaleDto: CreateSaleDto,
    total: number,
    saleId: string
  ): Promise<void> {
    const account = await this.accountsService.findOne(createSaleDto.accountId)

    try {
      switch (account.type) {
        case AccountType.ASSET:
          // Debit Cash/Bank account for the amount paid
          await this.accountsService.debitAccount(createSaleDto.accountId, createSaleDto.paid)

          // If there's a change, we need to credit back the change amount
          if (createSaleDto.paid > total) {
            const change = createSaleDto.paid - total
            await this.accountsService.creditAccount(createSaleDto.accountId, change)
          }
          break

        case AccountType.INCOME:
          // Credit Sales Revenue account for the total sale amount
          await this.accountsService.creditAccount(createSaleDto.accountId, total)
          break

        case AccountType.EXPENSE:
          // Debit Cost of Goods Sold account
          let totalCost = 0
          for (const item of createSaleDto.items) {
            const product = await this.productsService.findOne(item.productId)
            totalCost += (product.cost || 0) * item.quantity
          }
          await this.accountsService.debitAccount(createSaleDto.accountId, totalCost)
          break

        case AccountType.LIABILITY:
          // Credit Customer Accounts Payable or similar
          await this.accountsService.creditAccount(createSaleDto.accountId, total)
          break

        case AccountType.EQUITY:
          // Credit Owner's Equity with net profit
          const netProfit = total - createSaleDto.discount - createSaleDto.tax
          await this.accountsService.creditAccount(createSaleDto.accountId, netProfit)
          break

        default:
          throw new BadRequestException(`Account type ${account.type} is not supported for sales transactions`)
      }

      console.log(`Accounting entry processed for sale ${saleId}: ${account.type} account ${account.name} updated`)

    } catch (error) {
      console.error(`Failed to process accounting entries for sale ${saleId}:`, error)
      throw new BadRequestException(`Failed to update account balance: ${error.message}`)
    }
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
