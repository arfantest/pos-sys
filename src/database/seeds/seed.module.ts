import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SeedService } from "./seed.service"
import { User } from "src/users/entities/user.entity"
import { Category } from "src/categories/entities/category.entity"
import { Brand } from "src/brands/entities/brand.entity"
import { Product } from "src/products/entities/product.entity"
import { Account } from "src/accounts/entities/account.entity"
import { CompanySetting } from "src/settings/entities/company-setting.entity"

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Brand, Product, Account, CompanySetting])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
