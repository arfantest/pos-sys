import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ExpensesService } from "./expenses.service"
import { ExpensesController } from "./expenses.controller"
import { Expense } from "./entities/expense.entity"
import { AccountingModule } from "../ledger/accounting.module"

@Module({
  imports: [TypeOrmModule.forFeature([Expense]), AccountingModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
