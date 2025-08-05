import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { ExpensesService } from "./expenses.service"
import { CreateExpenseDto } from "./dto/create-expense.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@ApiTags("expenses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new expense" })
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.create(createExpenseDto, req.user.userId)
  }

  @Get()
  @ApiOperation({ summary: "Get all expenses" })
  findAll() {
    return this.expensesService.findAll()
  }

  @Get("date-range")
  @ApiOperation({ summary: "Get expenses by date range" })
  @ApiQuery({ name: "startDate", required: true })
  @ApiQuery({ name: "endDate", required: true })
  findByDateRange(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    return this.expensesService.findByDateRange(new Date(startDate), new Date(endDate))
  }

  @Get("category/:category")
  @ApiOperation({ summary: "Get expenses by category" })
  findByCategory(@Param("category") category: string) {
    return this.expensesService.findByCategory(category)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get expense by ID" })
  findOne(@Param("id") id: string) {
    return this.expensesService.findOne(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update expense" })
  update(@Param("id") id: string, @Body() updateExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.update(id, updateExpenseDto, req.user.userId)
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Delete expense" })
  remove(@Param("id") id: string) {
    return this.expensesService.remove(id)
  }
}
