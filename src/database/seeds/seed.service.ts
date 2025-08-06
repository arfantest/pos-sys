import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import * as bcrypt from "bcryptjs"
import { Category } from "src/categories/entities/category.entity"
import { Brand } from "src/brands/entities/brand.entity"
import { Product } from "src/products/entities/product.entity"
import { Account, AccountType } from "src/accounts/entities/account.entity"
import { CompanySetting } from "src/settings/entities/company-setting.entity"
import { User, UserRole } from "src/users/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(CompanySetting)
    private companySettingsRepository: Repository<CompanySetting>,
  ) {}

  async seed() {
    this.logger.log("Starting database seeding...")

    try {
      await this.seedUsers()
      await this.seedCategories()
      await this.seedBrands()
      await this.seedProducts()
      await this.seedAccounts()
      await this.seedCompanySettings()

      this.logger.log("Database seeding completed successfully!")
    } catch (error) {
      this.logger.error("Database seeding failed:", error)
      throw error
    }
  }

  private async seedUsers() {
    const userCount = await this.usersRepository.count()
    if (userCount > 0) {
      this.logger.log("Users already exist, skipping user seeding")
      return
    }

    const users = [
      {
        username: "admin",
        email: "admin@pos.com",
        password: await bcrypt.hash("admin123", 10),
        firstName: "System",
        lastName: "Administrator",
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        username: "cashier1",
        email: "cashier1@pos.com",
        password: await bcrypt.hash("cashier123", 10),
        firstName: "John",
        lastName: "Doe",
        role: UserRole.CASHIER,
        isActive: true,
      },
      {
        username: "manager1",
        email: "manager1@pos.com",
        password: await bcrypt.hash("manager123", 10),
        firstName: "Jane",
        lastName: "Smith",
        role: UserRole.MANAGER,
        isActive: true,
      },
    ]

    await this.usersRepository.save(users)
    this.logger.log(`Seeded ${users.length} users`)
  }

  private async seedCategories(): Promise<void> {
    const categoryCount = await this.categoriesRepository.count()
    if (categoryCount > 0) {
      this.logger.log("Categories already exist, skipping category seeding")
      return
    }

    const categories = [
      { name: "Electronics", description: "Electronic devices and accessories" },
      { name: "Clothing", description: "Apparel and fashion items" },
      { name: "Food & Beverages", description: "Food items and drinks" },
      { name: "Books", description: "Books and educational materials" },
      { name: "Home & Garden", description: "Home improvement and garden supplies" },
      { name: "Sports & Outdoors", description: "Sports equipment and outdoor gear" },
      { name: "Health & Beauty", description: "Health and beauty products" },
    ]

    await this.categoriesRepository.save(categories)
    this.logger.log(`Seeded ${categories.length} categories`)
  }

  private async seedBrands(): Promise<void> {
    const brandCount = await this.brandsRepository.count()
    if (brandCount > 0) {
      this.logger.log("Brands already exist, skipping brand seeding")
      return
    }

    const brands = [
      { name: "Apple", description: "Technology and consumer electronics" },
      { name: "Samsung", description: "Electronics and mobile devices" },
      { name: "Nike", description: "Sports apparel and equipment" },
      { name: "Adidas", description: "Sports and lifestyle brand" },
      { name: "Sony", description: "Electronics and entertainment" },
      { name: "Generic", description: "Generic brand products" },
      { name: "Coca-Cola", description: "Beverages and soft drinks" },
      { name: "Nestle", description: "Food and beverage products" },
    ]

    await this.brandsRepository.save(brands)
    this.logger.log(`Seeded ${brands.length} brands`)
  }

  private async seedProducts(): Promise<void> {
    const productCount = await this.productsRepository.count()
    if (productCount > 0) {
      this.logger.log("Products already exist, skipping product seeding")
      return
    }

    const categories = await this.categoriesRepository.find()
    const brands = await this.brandsRepository.find()

    const products = [
      {
        name: "iPhone 15 Pro",
        description: "Latest iPhone with advanced features",
        sku: "IPH15PRO001",
        barcode: "1234567890123",
        price: 999.99,
        cost: 750.0,
        stockQuantity: 50,
        minStockLevel: 10,
        stock:20,
        category: categories.find((c) => c.name === "Electronics"),
        brand: brands.find((b) => b.name === "Apple"),
        isActive: true,
      },
      {
        name: "Samsung Galaxy S24",
        description: "Premium Android smartphone",
        sku: "SGS24001",
        barcode: "1234567890124",
        price: 899.99,
        cost: 650.0,
        stockQuantity: 30,
        stock:20,
        minStockLevel: 5,
        category: categories.find((c) => c.name === "Electronics"),
        brand: brands.find((b) => b.name === "Samsung"),
        isActive: true,
      },
      {
        name: "Nike Air Max 270",
        description: "Comfortable running shoes",
        sku: "NAM270001",
        barcode: "1234567890125",
        price: 150.0,
        stock:20,
        cost: 90.0,
        stockQuantity: 75,
        minStockLevel: 15,
        category: categories.find((c) => c.name === "Sports & Outdoors"),
        brand: brands.find((b) => b.name === "Nike"),
        isActive: true,
      },
      {
        name: "Adidas Ultraboost 22",
        description: "Premium running shoes with boost technology",
        sku: "AUB22001",
        barcode: "1234567890126",
        stock:20,
        price: 180.0,
        cost: 110.0,
        stockQuantity: 40,
        minStockLevel: 10,
        category: categories.find((c) => c.name === "Sports & Outdoors"),
        brand: brands.find((b) => b.name === "Adidas"),
        isActive: true,
      },
      {
        name: "Sony WH-1000XM5",
        description: "Noise-canceling wireless headphones",
        sku: "SWH1000XM5",
        barcode: "1234567890127",
        price: 399.99,
        stock:20,
        cost: 250.0,
        stockQuantity: 25,
        minStockLevel: 5,
        category: categories.find((c) => c.name === "Electronics"),
        brand: brands.find((b) => b.name === "Sony"),
        isActive: true,
      },
      {
        name: "Coca-Cola 500ml",
        description: "Classic Coca-Cola soft drink",
        sku: "CC500ML001",
        barcode: "1234567890128",
        stock:20,
        price: 2.5,
        cost: 1.2,
        stockQuantity: 200,
        minStockLevel: 50,
        category: categories.find((c) => c.name === "Food & Beverages"),
        brand: brands.find((b) => b.name === "Coca-Cola"),
        isActive: true,
      },
      {
        name: "Generic T-Shirt",
        description: "Basic cotton t-shirt",
        sku: "GTS001",
        barcode: "1234567890129",
        stock:20,
        price: 15.99,
        cost: 8.0,
        stockQuantity: 100,
        minStockLevel: 20,
        category: categories.find((c) => c.name === "Clothing"),
        brand: brands.find((b) => b.name === "Generic"),
        isActive: true,
      },
      {
        name: "Nestle KitKat",
        description: "Chocolate wafer bar",
        sku: "NKK001",
        barcode: "1234567890130",
        stock:20,
        price: 1.99,
        cost: 1.0,
        stockQuantity: 150,
        minStockLevel: 30,
        category: categories.find((c) => c.name === "Food & Beverages"),
        brand: brands.find((b) => b.name === "Nestle"),
        isActive: true,
      },
    ]

    await this.productsRepository.save(products)
    this.logger.log(`Seeded ${products.length} products`)
  }

  private async seedAccounts(): Promise<void> {
    const accountCount = await this.accountsRepository.count()
    if (accountCount > 0) {
      this.logger.log("Accounts already exist, skipping account seeding")
      return
    }

    const accounts = [
      { code: "1000", name: "Cash", type: AccountType.ASSET, description: "Cash on hand" },
      { code: "1100", name: "Accounts Receivable", type: AccountType.ASSET, description: "Money owed by customers" },
      { code: "1200", name: "Inventory", type: AccountType.ASSET, description: "Product inventory" },
      { code: "2000", name: "Accounts Payable", type: AccountType.LIABILITY, description: "Money owed to suppliers" },
      { code: "3000", name: "Owner's Equity", type: AccountType.EQUITY, description: "Owner's investment in business" },
      { code: "4000", name: "Sales Revenue", type: AccountType.INCOME, description: "Revenue from sales" },
      { code: "5000", name: "Cost of Goods Sold", type: AccountType.EXPENSE, description: "Direct cost of products sold" },
      { code: "6000", name: "Operating Expenses", type: AccountType.EXPENSE, description: "General business expenses" },
    ]

    await this.accountsRepository.save(accounts)
    this.logger.log(`Seeded ${accounts.length} accounts`)
  }

  private async seedCompanySettings(): Promise<void> {
    const settingCount = await this.companySettingsRepository.count()
    if (settingCount > 0) {
      this.logger.log("Company settings already exist, skipping company settings seeding")
      return
    }

    const settings = [
      { companyName: "company_name", value: "POS System Demo Store", description: "Company name" },
      { key: "company_address", value: "123 Business Street, City, State 12345", description: "Company address" },
      { key: "company_phone", value: "+1 (555) 123-4567", description: "Company phone number" },
      { key: "company_email", value: "info@possystem.com", description: "Company email" },
      { key: "tax_rate", value: "10.00", description: "Default tax rate percentage" },
      { key: "currency", value: "USD", description: "Default currency" },
      { key: "currency_symbol", value: "$", description: "Currency symbol" },
      { key: "receipt_footer", value: "Thank you for your business!", description: "Receipt footer message" },
    ]

    await this.companySettingsRepository.save(settings)
    this.logger.log(`Seeded ${settings.length} company settings`)
  }
}
