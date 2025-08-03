import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Brand } from "./entities/brand.entity"
import type { CreateBrandDto } from "./dto/create-brand.dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class BrandsService {
  constructor(@InjectRepository(Brand) private brandsRepository: Repository<Brand>) {}

  async create( createBrandDto: CreateBrandDto): Promise<Brand> {
    const existingBrand = await this.brandsRepository.findOne({
      where: { name: createBrandDto.name },
    })

    if (existingBrand) {
      throw new ConflictException("Brand name already exists")
    }

    const brand = this.brandsRepository.create(createBrandDto)
    return this.brandsRepository.save(brand)
  }

  async findAll(): Promise<Brand[]> {
    return this.brandsRepository.find({ where: { isActive: true } })
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } })
    if (!brand) {
      throw new NotFoundException("Brand not found")
    }
    return brand
  }

  async update(id: string, updateBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id)
    Object.assign(brand, updateBrandDto)
    return this.brandsRepository.save(brand)
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id)
    brand.isActive = false
    await this.brandsRepository.save(brand)
  }
}
