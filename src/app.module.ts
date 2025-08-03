import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { CategoriesModule } from "./categories/categories.module"
import { BrandsModule } from "./brands/brands.module"
import { ProductsModule } from "./products/products.module"
import { SalesModule } from "./sales/sales.module"
import { PurchasesModule } from "./purchases/purchases.module"
import { AccountsModule } from "./accounts/accounts.module"
import { LedgerModule } from "./ledger/ledger.module"
import { ReportsModule } from "./reports/reports.module"
import { SettingsModule } from "./settings/settings.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: true, 
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    BrandsModule,
    SalesModule,
    PurchasesModule,
    AccountsModule,
    LedgerModule,
    ReportsModule,
    SettingsModule,
  ],
})
export class AppModule { }
