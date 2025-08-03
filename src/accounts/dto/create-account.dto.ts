import { IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { AccountType } from "../entities/account.entity"

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
  @IsNotEmpty()
  @IsEnum(AccountType)
  type: AccountType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string
}
