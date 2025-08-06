import { IsNotEmpty, IsString, IsNumber, IsUUID, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CreatePaymentDto {
  @ApiProperty({ description: "Account ID to transfer money from" })
  @IsNotEmpty()
  @IsUUID()
  fromAccountId: string

  @ApiProperty({ description: "Account ID to transfer money to" })
  @IsNotEmpty()
  @IsUUID()
  toAccountId: string

  @ApiProperty({ 
    description: "Amount to transfer",
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0.01)
  amount: number

  @ApiProperty({ description: "Description of the payment" })
  @IsNotEmpty()
  @IsString()
  description: string
}
