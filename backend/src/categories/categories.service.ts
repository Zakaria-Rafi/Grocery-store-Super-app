import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  // get all Categories
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }
  // get Category by ID
  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
  // check if category exists
  private async checkCategoryExists(name: string, id?: number): Promise<void> {
    const existingCategory = await this.categoryRepository.findOne({ where: { name } });
    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictException('Category with this name already exists');
    }
  }
  // create Category
  async createCategory(name: string): Promise<Category> {
    await this.checkCategoryExists(name);
    const category = this.categoryRepository.create({ name });
    return this.categoryRepository.save(category);
  }
  // update Category
  async updateCategory(id: number, name: string): Promise<Category> {
    await this.checkCategoryExists(name, id);
    const category = await this.getCategoryById(id);
    category.name = name;
    return this.categoryRepository.save(category);
  }
  // find Category by name
  async findCategoryByName(name: string): Promise<Category[]> {
    const categories = await this.categoryRepository.find({ where: { name } });
    if (categories.length === 0) {
      throw new NotFoundException(`No categories found with name ${name}`);
    }
    return categories;
  }

  // delete Category
  async deleteCategory(id: number): Promise<void> {
    const category = await this.getCategoryById(id);
    await this.categoryRepository.remove(category);// delete the category
  }
}
