import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReportsService } from "./reports.service"
import { ReportsController } from "./reports.controller"
import { Sale } from "../sales/entities/sale.entity"
import { Purchase } from "../purchases/entities/purchase.entity"
import { Product } from "../products/entities/product.entity"
import { SaleReturn } from "../sales/entities/sale-return.entity"
import { PurchaseReturn } from "../purchases/entities/purchase-return.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Purchase, Product, SaleReturn, PurchaseReturn])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
