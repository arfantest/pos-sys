import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PurchasesService } from "./purchases.service"
import { PurchasesController } from "./purchases.controller"
import { PurchaseReturnsService } from "./purchase-returns.service"
import { PurchaseReturnsController } from "./purchase-returns.controller"
import { Purchase } from "./entities/purchase.entity"
import { PurchaseItem } from "./entities/purchase-item.entity"
import { PurchaseReturn } from "./entities/purchase-return.entity"
import { PurchaseReturnItem } from "./entities/purchase-return-item.entity"
import { ProductsModule } from "../products/products.module"

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, PurchaseReturn, PurchaseReturnItem]), ProductsModule],
  controllers: [PurchasesController, PurchaseReturnsController],
  providers: [PurchasesService, PurchaseReturnsService],
  exports: [PurchasesService, PurchaseReturnsService],
})
export class PurchasesModule {}
