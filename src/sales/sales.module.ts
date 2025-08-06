import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SalesService } from "./sales.service"
import { SalesController } from "./sales.controller"
import { SaleReturnsService } from "./sale-returns.service"
import { SaleReturnsController } from "./sale-returns.controller"
import { Sale } from "./entities/sale.entity"
import { SaleItem } from "./entities/sale-item.entity"
import { SaleReturn } from "./entities/sale-return.entity"
import { SaleReturnItem } from "./entities/sale-return-item.entity"
import { ProductsModule } from "../products/products.module"
import { AccountsModule } from "src/accounts/accounts.module"

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, SaleReturn, SaleReturnItem]), ProductsModule,AccountsModule],
  controllers: [SalesController, SaleReturnsController],
  providers: [SalesService, SaleReturnsService],
  exports: [SalesService, SaleReturnsService],
})
export class SalesModule {}
