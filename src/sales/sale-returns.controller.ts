import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { SaleReturnsService } from "./sale-returns.service"
import { CreateSaleReturnDto, ApproveSaleReturnDto } from "./dto/create-sale-return.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@ApiTags("sale-returns")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("sale-returns")
export class SaleReturnsController {
  constructor(private readonly saleReturnsService: SaleReturnsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new sale return" })
  create(createSaleReturnDto: CreateSaleReturnDto, @Request() req) {
    return this.saleReturnsService.create(createSaleReturnDto, req.user.userId)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Get all sale returns" })
  findAll() {
    return this.saleReturnsService.findAll()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sale return by ID" })
  findOne(@Param("id") id: string) {
    return this.saleReturnsService.findOne(id)
  }

  @Patch(":id/approve")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Approve sale return" })
  approve(@Param("id") id: string, approveDto: ApproveSaleReturnDto, @Request() req) {
    return this.saleReturnsService.approve(id, approveDto, req.user.userId)
  }

  @Patch(":id/reject")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Reject sale return" })
  reject(@Param("id") id: string, @Body("reason") reason: string, @Request() req) {
    return this.saleReturnsService.reject(id, reason, req.user.userId)
  }

  @Patch(":id/complete")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Complete sale return" })
  complete(@Param("id") id: string) {
    return this.saleReturnsService.complete(id)
  }
}
