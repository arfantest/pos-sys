import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Between } from "typeorm"
import { Sale, SaleStatus } from "../sales/entities/sale.entity"
import { Purchase } from "../purchases/entities/purchase.entity"
import { Product } from "../products/entities/product.entity"
import { SaleReturn } from "../sales/entities/sale-return.entity"
import { PurchaseReturn } from "../purchases/entities/purchase-return.entity"

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(SaleReturn)
    private saleReturnsRepository: Repository<SaleReturn>,
    @InjectRepository(PurchaseReturn)
    private purchaseReturnsRepository: Repository<PurchaseReturn>,
  ) {}

  async getSalesReport(startDate: Date, endDate: Date) {
    const sales = await this.salesRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: SaleStatus.COMPLETED,
      },
      relations: ["items", "items.product", "cashier"],
      order: { createdAt: "DESC" },
    })

    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discount), 0)
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.tax), 0)

    return {
      sales,
      summary: {
        totalSales,
        totalDiscount,
        totalTax,
        netSales: totalSales - totalDiscount,
        salesCount: sales.length,
      },
    }
  }

  async getPurchaseReport(startDate: Date, endDate: Date) {
    const purchases = await this.purchasesRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ["items", "items.product", "createdBy"],
      order: { createdAt: "DESC" },
    })

    const totalPurchases = purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0)
    const totalDiscount = purchases.reduce((sum, purchase) => sum + Number(purchase.discount), 0)
    const totalTax = purchases.reduce((sum, purchase) => sum + Number(purchase.tax), 0)

    return {
      purchases,
      summary: {
        totalPurchases,
        totalDiscount,
        totalTax,
        netPurchases: totalPurchases - totalDiscount,
        purchaseCount: purchases.length,
      },
    }
  }

  async getStockReport() {
    const products = await this.productsRepository.find({
      where: { isActive: true },
      relations: ["category", "brand"],
      order: { name: "ASC" },
    })

    const lowStockProducts = products.filter((product) => product.stock <= product.minStock)
    const outOfStockProducts = products.filter((product) => product.stock === 0)
    const totalStockValue = products.reduce((sum, product) => sum + Number(product.cost) * product.stock, 0)

    return {
      products,
      summary: {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalStockValue,
      },
      lowStockProducts,
      outOfStockProducts,
    }
  }

  async getProfitLossStatement(startDate: Date, endDate: Date) {
    const salesData = await this.getSalesReport(startDate, endDate)
    const purchaseData = await this.getPurchaseReport(startDate, endDate)

    const revenue = salesData.summary.netSales
    const costOfGoodsSold = purchaseData.summary.netPurchases
    const grossProfit = revenue - costOfGoodsSold

    return {
      period: { startDate, endDate },
      revenue,
      costOfGoodsSold,
      grossProfit,
      grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    }
  }

  async getSaleReturnsReport(startDate: Date, endDate: Date) {
    const saleReturns = await this.saleReturnsRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ["items", "items.product", "originalSale", "processedBy", "approvedBy"],
      order: { createdAt: "DESC" },
    })

    const totalReturns = saleReturns.reduce((sum, ret) => sum + Number(ret.totalAmount), 0)
    const totalRefunds = saleReturns.reduce((sum, ret) => sum + Number(ret.refundAmount), 0)
    const approvedReturns = saleReturns.filter((ret) => ret.status === "approved" || ret.status === "completed")

    return {
      saleReturns,
      summary: {
        totalReturns,
        totalRefunds,
        returnsCount: saleReturns.length,
        approvedCount: approvedReturns.length,
        pendingCount: saleReturns.filter((ret) => ret.status === "pending").length,
        rejectedCount: saleReturns.filter((ret) => ret.status === "rejected").length,
      },
    }
  }

  async getPurchaseReturnsReport(startDate: Date, endDate: Date) {
    const purchaseReturns = await this.purchaseReturnsRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ["items", "items.product", "originalPurchase", "createdBy", "approvedBy"],
      order: { createdAt: "DESC" },
    })

    const totalReturns = purchaseReturns.reduce((sum, ret) => sum + Number(ret.totalAmount), 0)
    const totalCredits = purchaseReturns.reduce((sum, ret) => sum + Number(ret.creditAmount), 0)
    const approvedReturns = purchaseReturns.filter((ret) => ret.status === "approved" || ret.status === "completed")

    return {
      purchaseReturns,
      summary: {
        totalReturns,
        totalCredits,
        returnsCount: purchaseReturns.length,
        approvedCount: approvedReturns.length,
        pendingCount: purchaseReturns.filter((ret) => ret.status === "pending").length,
        rejectedCount: purchaseReturns.filter((ret) => ret.status === "rejected").length,
      },
    }
  }

  async getReturnsOverview(startDate: Date, endDate: Date) {
    const saleReturnsData = await this.getSaleReturnsReport(startDate, endDate)
    const purchaseReturnsData = await this.getPurchaseReturnsReport(startDate, endDate)

    return {
      period: { startDate, endDate },
      saleReturns: saleReturnsData.summary,
      purchaseReturns: purchaseReturnsData.summary,
      totalReturnValue: saleReturnsData.summary.totalReturns + purchaseReturnsData.summary.totalReturns,
    }
  }
}
