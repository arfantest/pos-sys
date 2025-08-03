import { Controller, Get, Post, Body, Param, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { SalesService } from "./sales.service"
import type { CreateSaleDto } from "./dto/create-sale.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("sales")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new sale" })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.userId)
  }

  @Get()
  @ApiOperation({ summary: "Get all sales" })
  findAll() {
    return this.salesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
