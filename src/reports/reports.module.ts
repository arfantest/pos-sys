import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReportsService } from "./reports.service"
import { ReportsController } from "./reports.controller"
import { Sale } from "../sales/entities/sale.entity"
import { Purchase } from "../purchases/entities/purchase.entity"
import { Product } from "../products/entities/product.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Purchase, Product])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
