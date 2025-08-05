import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsUUID, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CreateExpenseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: Date

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  accountId: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiptNumber?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
