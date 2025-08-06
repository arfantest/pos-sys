import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsUUID, IsEnum, IsDateString, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { TransactionType } from "../entities/journal-entry.entity"
import { EntryType } from "../entities/journal-entry-line.entity"

export class CreateJournalEntryLineDto {
  @ApiProperty({ description: "Account ID for this journal entry line" })
  @IsNotEmpty()
  @IsUUID()
  accountId: string

  @ApiProperty({ 
    enum: EntryType, 
    description: "Whether this is a debit or credit entry" 
  })
  @IsEnum(EntryType)
  entryType: EntryType

  @ApiProperty({ 
    description: "Amount for this entry line",
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0.01)
  amount: number

  @ApiProperty({ 
    description: "Optional description for this specific line",
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string
}

export class CreateJournalEntryDto {
  @ApiProperty({ 
    enum: TransactionType,
    description: "Type of transaction (sale, purchase, payment, etc.)"
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType

  @ApiProperty({ description: "Description of the journal entry" })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({ 
    description: "Date of the transaction",
    example: "2024-01-15"
  })
  @IsDateString()
  transactionDate: string

  @ApiProperty({ 
    type: [CreateJournalEntryLineDto],
    description: "Array of journal entry lines (debits and credits)"
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines: CreateJournalEntryLineDto[]

  @ApiProperty({ 
    description: "Reference ID to link this entry to another entity (like a sale)",
    required: false
  })
  @IsOptional()
  @IsUUID()
  referenceId?: string

  @ApiProperty({ 
    description: "Type of reference (sale, purchase, etc.)",
    required: false
  })
  @IsOptional()
  @IsString()
  referenceType?: string
}
