import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AccountingService } from "./accounting.service"
import { AccountingController } from "./accounting.controller"
import { JournalEntry } from "./entities/journal-entry.entity"
import { JournalEntryLine } from "./entities/journal-entry-line.entity"
import { AccountsModule } from "src/accounts/accounts.module"

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine]),AccountsModule],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule { }
