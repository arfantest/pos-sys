import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { PurchaseReturnsService } from "./purchase-returns.service"
import { CreatePurchaseReturnDto, ApprovePurchaseReturnDto } from "./dto/create-purchase-return.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"

@ApiTags("purchase-returns")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("purchase-returns")
export class PurchaseReturnsController {
  constructor(private readonly purchaseReturnsService: PurchaseReturnsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new purchase return" })
  create(@Body() createPurchaseReturnDto: CreatePurchaseReturnDto, @Request() req) {
    return this.purchaseReturnsService.create(createPurchaseReturnDto, req.user.userId)
  }

  @Get()
  @ApiOperation({ summary: "Get all purchase returns" })
  findAll() {
    return this.purchaseReturnsService.findAll()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get purchase return by ID" })
  findOne(@Param("id") id: string) {
    return this.purchaseReturnsService.findOne(id)
  }

  @Patch(":id/approve")
  @ApiOperation({ summary: "Approve purchase return" })
  approve(@Param("id") id: string, @Body() approveDto: ApprovePurchaseReturnDto, @Request() req) {
    return this.purchaseReturnsService.approve(id, approveDto, req.user.userId)
  }

  @Patch(":id/reject")
  @ApiOperation({ summary: "Reject purchase return" })
  reject(@Param("id") id: string, @Body("reason") reason: string, @Request() req) {
    return this.purchaseReturnsService.reject(id, reason, req.user.userId)
  }

  @Patch(":id/ship")
  @ApiOperation({ summary: "Mark purchase return as shipped" })
  ship(@Param("id") id: string) {
    return this.purchaseReturnsService.ship(id)
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Complete purchase return" })
  complete(@Param("id") id: string) {
    return this.purchaseReturnsService.complete(id)
  }
}
