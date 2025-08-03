import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PurchasesService } from "./purchases.service"
import { PurchasesController } from "./purchases.controller"
import { Purchase } from "./entities/purchase.entity"
import { PurchaseItem } from "./entities/purchase-item.entity"
import { ProductsModule } from "../products/products.module"

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem]), ProductsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
