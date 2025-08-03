import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsUUID, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CreatePurchaseItemDto {
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
}

export class CreatePurchaseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  supplierName: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplierContact?: string

  @ApiProperty({ type: [CreatePurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[]

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  discount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tax: number
}
