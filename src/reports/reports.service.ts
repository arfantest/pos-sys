import { Injectable } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { Sale, SaleStatus } from "../sales/entities/sale.entity"
import { Purchase } from "../purchases/entities/purchase.entity"
import { Product } from "../products/entities/product.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,

    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) { }

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
}
