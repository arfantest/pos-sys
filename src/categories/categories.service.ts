import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Category } from "./entities/category.entity"
import type { CreateCategoryDto } from "./dto/create-category.dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class CategoriesService {
  private categoriesRepository: Repository<Category>
  
  constructor(@InjectRepository(Category) categoriesRepository: Repository<Category>) {
    this.categoriesRepository = categoriesRepository
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    })

    if (existingCategory) {
      throw new ConflictException("Category name already exists")
    }

    const category = this.categoriesRepository.create(createCategoryDto)
    return this.categoriesRepository.save(category)
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { isActive: true } })
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } })
    if (!category) {
      throw new NotFoundException("Category not found")
    }
    return category
  }

  async update(id: string, updateCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)
    Object.assign(category, updateCategoryDto)
    return this.categoriesRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)
    category.isActive = false
    await this.categoriesRepository.save(category)
  }
}
