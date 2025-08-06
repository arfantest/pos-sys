import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { AccountType } from "../entities/account.entity"
import { Type } from "class-transformer"

export class CreateAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  balance?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
