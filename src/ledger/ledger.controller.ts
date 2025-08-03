import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { LedgerService } from "./ledger.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@ApiTags("ledger")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller("ledger")
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get("general")
  @ApiOperation({ summary: "Get general ledger" })
  getGeneralLedger(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.ledgerService.getGeneralLedger(start, end)
  }

  @Get("account/:accountId")
  @ApiOperation({ summary: "Get account ledger" })
  getAccountLedger(
    @Param('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.ledgerService.getAccountLedger(accountId, start, end)
  }

  @Get('daybook')
  @ApiOperation({ summary: 'Get day book' })
  @ApiQuery({ name: 'date', required: true, type: Date })
  getDayBook(@Query('date') date: string) {
    return this.ledgerService.getDayBook(new Date(date));
  }
}
