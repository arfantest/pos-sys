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
import { PurchaseReturnReason } from "../entities/purchase-return.entity"

export class CreatePurchaseReturnItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  originalPurchaseItemId: string

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
  unitCost: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  condition?: string
}

export class CreatePurchaseReturnDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  originalPurchaseId: string

  @ApiProperty({ enum: PurchaseReturnReason })
  @IsNotEmpty()
  @IsEnum(PurchaseReturnReason)
  reason: PurchaseReturnReason

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ type: [CreatePurchaseReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  items: CreatePurchaseReturnItemDto[]
}

export class ApprovePurchaseReturnDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  creditAmount: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
