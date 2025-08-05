import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  IsEnum,
} from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { SaleReturnReason } from "../entities/sale-return.entity"

export class CreateSaleReturnItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  originalSaleItemId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  condition?: string
}

export class CreateSaleReturnDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  originalSaleId: string

  @ApiProperty({ enum: SaleReturnReason })
  @IsNotEmpty()
  @IsEnum(SaleReturnReason)
  reason: SaleReturnReason

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ type: [CreateSaleReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleReturnItemDto)
  items: CreateSaleReturnItemDto[]
}

export class ApproveSaleReturnDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  refundAmount: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
