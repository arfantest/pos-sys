import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { ReportsService } from "./reports.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@ApiTags("reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get("sales")
  @ApiOperation({ summary: "Get sales report" })
  getSalesReport(@Query('startDate') startDate: string,
    @Query('endDate') endDate: string) {
    return this.reportsService.getSalesReport(new Date(startDate), new Date(endDate))
  }

  @Get("purchases")
  @ApiOperation({ summary: "Get purchase report" })
  getPurchaseReport(startDate: string, endDate: string) {
    return this.reportsService.getPurchaseReport(new Date(startDate), new Date(endDate))
  }

  @Get("stock")
  @ApiOperation({ summary: "Get stock report" })
  getStockReport() {
    return this.reportsService.getStockReport()
  }

  @Get("profit-loss")
  @ApiOperation({ summary: "Get profit & loss statement" })
  getProfitLossStatement(startDate: string, endDate: string) {
    return this.reportsService.getProfitLossStatement(new Date(startDate), new Date(endDate))
  }

  @Get("sale-returns")
  @ApiOperation({ summary: "Get sale returns report" })
  getSaleReturnsReport(startDate: string, endDate: string) {
    return this.reportsService.getSaleReturnsReport(new Date(startDate), new Date(endDate))
  }

  @Get("purchase-returns")
  @ApiOperation({ summary: "Get purchase returns report" })
  getPurchaseReturnsReport(startDate: string, endDate: string) {
    return this.reportsService.getPurchaseReturnsReport(new Date(startDate), new Date(endDate))
  }

  @Get("returns-overview")
  @ApiOperation({ summary: "Get returns overview report" })
  getReturnsOverview(startDate: string, endDate: string) {
    return this.reportsService.getReturnsOverview(new Date(startDate), new Date(endDate))
  }
}
