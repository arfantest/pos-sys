import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { Sale, SaleStatus } from "./entities/sale.entity"
import { SaleItem } from "./entities/sale-item.entity"
import { CreateSaleDto } from "./dto/create-sale.dto"
import { ProductsService } from "../products/products.service"
import { AccountsService } from "../accounts/accounts.service"
import { AccountType } from "src/accounts/entities/account.entity"
import { AccountingService } from "src/ledger/accounting.service"

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,

    private readonly productsService: ProductsService,
    private readonly accountsService: AccountsService,
    private readonly accountingService: AccountingService,
  ) { }

  async create(createSaleDto: CreateSaleDto, cashierId: string): Promise<Sale> {
    try {
      // Validate account if provided
      let selectedAccount = null
      if (createSaleDto.accountId) {
        selectedAccount = await this.accountsService.findOne(createSaleDto.accountId)
        if (!selectedAccount.isActive) {
          throw new BadRequestException("Selected account is not active")
        }
      }

      // Calculate subtotal and validate products
      let subtotal = 0
      const saleItems = []

      for (const item of createSaleDto.items) {
        const product = await this.productsService.findOne(item.productId)

        if (!product.isActive) {
          throw new BadRequestException(`Product ${product.name} is not active`)
        }

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

      // Create accounting entries
      if (createSaleDto.accountId) {
        await this.createSaleAccountingEntries(
          savedSale,
          createSaleDto,
          selectedAccount,
          cashierId
        )
      }

      return this.findOne(savedSale.id)
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  }

  private async createSaleAccountingEntries(
    sale: Sale,
    createSaleDto: CreateSaleDto,
    selectedAccount: any,
    cashierId: string
  ): Promise<void> {
    // For a typical sale, we need to:
    // 1. Debit Cash/Bank account (increase asset)
    // 2. Credit Sales Revenue account (increase income)
    // 3. Handle change if any

    if (selectedAccount.type === AccountType.ASSET) {
      // This is a cash/bank account - record the sale transaction
      // You'll need to have a Sales Revenue account set up
      const salesRevenueAccount = await this.getSalesRevenueAccount()

      await this.accountingService.recordSaleTransaction(
        sale.id,
        selectedAccount.id, // Cash account
        salesRevenueAccount.id, // Sales revenue account
        sale.total,
        createSaleDto.paid,
        cashierId
      )
    } else if (selectedAccount.type === AccountType.INCOME) {
      // This is a revenue account - we still need a cash account
      const cashAccount = await this.getDefaultCashAccount()

      await this.accountingService.recordSaleTransaction(
        sale.id,
        cashAccount.id, // Cash account
        selectedAccount.id, // Sales revenue account
        sale.total,
        createSaleDto.paid,
        cashierId
      )
    }
  }

  private async getSalesRevenueAccount(): Promise<any> {
    // Get or create a default sales revenue account
    const accounts = await this.accountsService.getAccountsByType(AccountType.INCOME)
    const salesAccount = accounts.find(acc => acc.name.toLowerCase().includes('sales'))

    if (!salesAccount) {
      throw new BadRequestException('No sales revenue account found. Please create one first.')
    }

    return salesAccount
  }

  private async getDefaultCashAccount(): Promise<any> {
    // Get or create a default cash account
    const accounts = await this.accountsService.getAccountsByType(AccountType.ASSET)
    const cashAccount = accounts.find(acc => acc.name.toLowerCase().includes('cash'))

    if (!cashAccount) {
      throw new BadRequestException('No cash account found. Please create one first.')
    }

    return cashAccount
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
