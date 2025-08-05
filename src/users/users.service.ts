import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { Repository } from "typeorm"
import * as bcrypt from "bcryptjs"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { InjectRepository } from "@nestjs/typeorm"
// import type { UpdateUserDto } from "./dto/update-user.dto"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: createUserDto.username }, { email: createUserDto.email }],
    })

    if (existingUser) {
      throw new ConflictException("Username or email already exists")
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    return this.userRepository.save(user)
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ["id", "username", "email", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt"],
    })
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ["id", "username", "email", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt"],
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return user
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
    })
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
    })
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const user = await this.findOne(id)

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    await this.userRepository.update(id, updateUserDto)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    await this.userRepository.remove(user)
  }
}
