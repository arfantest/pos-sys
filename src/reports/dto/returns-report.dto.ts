import { IsOptional, IsDateString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ReturnsReportDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string
}
