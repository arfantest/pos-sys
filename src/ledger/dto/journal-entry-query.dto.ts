import { IsOptional, IsEnum, IsNumber, IsDateString, Min, Max } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { TransactionType } from "../entities/journal-entry.entity"

export class JournalEntryQueryDto {
  @ApiProperty({ 
    description: "Page number for pagination",
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1

  @ApiProperty({ 
    description: "Number of entries per page",
    minimum: 1,
    maximum: 100,
    default: 50,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50

  @ApiProperty({ 
    enum: TransactionType,
    description: "Filter by transaction type",
    required: false
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType

  @ApiProperty({ 
    description: "Start date for filtering (YYYY-MM-DD)",
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiProperty({ 
    description: "End date for filtering (YYYY-MM-DD)",
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiProperty({ 
    description: "Filter by account ID",
    required: false
  })
  @IsOptional()
  accountId?: string
}
