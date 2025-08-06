import { IsOptional, IsDateString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AccountStatementQueryDto {
  @ApiProperty({ 
    description: "Start date for statement (YYYY-MM-DD)",
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiProperty({ 
    description: "End date for statement (YYYY-MM-DD)",
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string
}
