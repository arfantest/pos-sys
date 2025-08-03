import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LedgerService } from "./ledger.service"
import { LedgerController } from "./ledger.controller"
import { JournalEntry } from "./entities/journal-entry.entity"
import { JournalEntryLine } from "./entities/journal-entry-line.entity"

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine])],
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
