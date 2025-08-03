import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class UpdateCompanySettingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  companyName: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currency: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currencySymbol: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  defaultTaxRate: number
}
