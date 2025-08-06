import { IsNotEmpty, IsString, IsNumber, IsUUID, IsEnum, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { EntryType } from "../entities/journal-entry-line.entity"

export class CreateAdjustmentDto {
  @ApiProperty({ description: "Account ID to adjust" })
  @IsNotEmpty()
  @IsUUID()
  accountId: string

  @ApiProperty({ 
    description: "Amount to adjust",
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0.01)
  amount: number

  @ApiProperty({ 
    enum: EntryType,
    description: "Whether to debit or credit the account"
  })
  @IsEnum(EntryType)
  entryType: EntryType

  @ApiProperty({ description: "Reason for the adjustment" })
  @IsNotEmpty()
  @IsString()
  description: string
}
