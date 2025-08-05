import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import { Repository } from "typeorm"
import { Account } from "./entities/account.entity"
import { CreateAccountDto } from "./dto/create-account.dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class AccountsService {
  private accountsRepository: Repository<Account>

  constructor(@InjectRepository(Account) accountsRepository: Repository<Account>) {
    this.accountsRepository = accountsRepository
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const existingAccount = await this.accountsRepository.findOne({
      where: [{ code: createAccountDto.code }, { name: createAccountDto.name }],
    })

    if (existingAccount) {
      throw new ConflictException("Account code or name already exists")
    }

    const account = this.accountsRepository.create(createAccountDto)
    return this.accountsRepository.save(account)
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.find({ where: { isActive: true } })
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { id } })
    if (!account) {
      throw new NotFoundException("Account not found")
    }
    return account
  }

  async update(id: string, updateAccountDto: CreateAccountDto): Promise<Account> {
    const account = await this.findOne(id)
    Object.assign(account, updateAccountDto)
    return this.accountsRepository.save(account)
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id)
    account.isActive = false
    await this.accountsRepository.save(account)
  }
}
