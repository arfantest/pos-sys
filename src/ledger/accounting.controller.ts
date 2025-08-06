import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { AccountingService } from "./accounting.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto"
import { CreatePaymentDto } from "./dto/create-payment.dto"
import { CreateAdjustmentDto } from "./dto/create-adjustment.dto"
import { JournalEntryQueryDto } from "./dto/journal-entry-query.dto"
import { AccountStatementQueryDto } from "./dto/account-statement-query.dto"

@ApiTags("accounting")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("accounting")
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post("journal-entries")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Create a journal entry" })
  async createJournalEntry(
    @Body() createJournalEntryDto: CreateJournalEntryDto, 
    @Request() req
  ) {
    // Convert string date to Date object
    const journalEntryData = {
      ...createJournalEntryDto,
      transactionDate: new Date(createJournalEntryDto.transactionDate)
    }
    
    return this.accountingService.createJournalEntry(journalEntryData, req.user.userId)
  }

  @Get("journal-entries")
  @ApiOperation({ summary: "Get journal entries with filtering and pagination" })
  async getJournalEntries(@Query() query: JournalEntryQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined
    const endDate = query.endDate ? new Date(query.endDate) : undefined
    
    return this.accountingService.getJournalEntries(
      query.page,
      query.limit,
      query.transactionType,
      startDate,
      endDate,
      query.accountId
    )
  }

  @Get("journal-entries/:id")
  @ApiOperation({ summary: "Get journal entry by ID" })
  getJournalEntry(@Param("id") id: string) {
    return this.accountingService.findJournalEntry(id)
  }

  @Get("accounts/:id/statement")
  @ApiOperation({ summary: "Get account statement" })
  getAccountStatement(
    @Param("id") accountId: string,
    @Query() query: AccountStatementQueryDto
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined
    const endDate = query.endDate ? new Date(query.endDate) : undefined
    
    return this.accountingService.getAccountStatement(accountId, startDate, endDate)
  }

  @Post("payments")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Record a payment between accounts" })
  recordPayment(@Body() paymentDto: CreatePaymentDto, @Request() req) {
    return this.accountingService.recordPayment(
      paymentDto.fromAccountId,
      paymentDto.toAccountId,
      paymentDto.amount,
      paymentDto.description,
      req.user.userId,
    )
  }

  @Post("adjustments")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Record an account adjustment" })
  recordAdjustment(@Body() adjustmentDto: CreateAdjustmentDto, @Request() req) {
    return this.accountingService.recordAdjustment(
      adjustmentDto.accountId,
      adjustmentDto.amount,
      adjustmentDto.entryType,
      adjustmentDto.description,
      req.user.userId,
    )
  }

  @Get("trial-balance")
  @ApiOperation({ summary: "Get trial balance report" })
  getTrialBalance(@Query("date") date?: string) {
    const reportDate = date ? new Date(date) : new Date()
    return this.accountingService.getTrialBalance(reportDate)
  }

  @Get("accounts/:id/balance")
  @ApiOperation({ summary: "Get current account balance" })
  getAccountBalance(@Param("id") accountId: string) {
    return this.accountingService.getAccountBalance(accountId)
  }
}
