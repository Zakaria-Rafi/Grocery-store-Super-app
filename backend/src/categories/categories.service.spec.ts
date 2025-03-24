import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockCategoryRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useFactory: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCategories', () => {
    it('should return an array of categories', async () => {
      const result: Category[] = [{ id: 1, name: 'Test Category', created_at: new Date(), updated_at: new Date(), products: [] }];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.getAllCategories()).toEqual(result);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category if found', async () => {
      const result: Category = { id: 1, name: 'Test Category', created_at: new Date(), updated_at: new Date(), products: [] };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(result);

      expect(await service.getCategoryById(1)).toEqual(result);
    });

    it('should throw a NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getCategoryById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCategory', () => {
    it('should create and return a category', async () => {
      const category: Category = { id: 1, name: 'New Category', created_at: new Date(), updated_at: new Date(), products: [] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(category);
      jest.spyOn(repository, 'save').mockResolvedValue(category);

      expect(await service.createCategory('New Category')).toEqual(category);
    });

    
  });

  describe('updateCategory', () => {
    it('should update and return the category', async () => {
      const category: Category = { id: 1, name: 'Updated Category', created_at: new Date(), updated_at: new Date(), products: [] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category);
      jest.spyOn(repository, 'save').mockResolvedValue(category);

      expect(await service.updateCategory(1, 'Updated Category')).toEqual(category);
    });

    it('should throw a NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.updateCategory(1, 'Updated Category')).rejects.toThrow(NotFoundException);
    });

    it('should throw a ConflictException if category name already exists', async () => {
      const existingCategory: Category = {
        id: 2,
        name: 'Existing Category',
        created_at: new Date(),
        updated_at: new Date(),
        products: [],
      };
    
      const categoryToUpdate: Category = {
        id: 1,
        name: 'Old Category Name',
        created_at: new Date(),
        updated_at: new Date(),
        products: [],
      };
    
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(categoryToUpdate);
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingCategory);
    
      await expect(service.updateCategory(1, 'Existing Category')).rejects.toThrow(ConflictException);
    });
    
  });

  describe('deleteCategory', () => {
    it('should delete the category', async () => {
      const category: Category = { id: 1, name: 'Category to delete', created_at: new Date(), updated_at: new Date(), products: [] };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category);
      jest.spyOn(repository, 'remove').mockResolvedValue(category);

      await service.deleteCategory(1);
      expect(repository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw a NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.deleteCategory(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCategoryByName', () => {
    it('should return an array of categories with the given name', async () => {
      const result: Category[] = [{ id: 1, name: 'Test Category', created_at: new Date(), updated_at: new Date(), products: [] }];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findCategoryByName('Test Category')).toEqual(result);
    });

    it('should throw a NotFoundException if no categories found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.findCategoryByName('Nonexistent Category')).rejects.toThrow(NotFoundException);
    });
  });
});
