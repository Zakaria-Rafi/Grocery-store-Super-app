import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = { id: 1, name: 'Test Category' };

  const mockCategoriesService = {
    getAllCategories: jest.fn().mockResolvedValue([mockCategory]),
    getCategoryById: jest.fn().mockResolvedValue(mockCategory),
    createCategory: jest.fn().mockResolvedValue(mockCategory),
    updateCategory: jest.fn().mockResolvedValue(mockCategory),
    deleteCategory: jest.fn().mockResolvedValue(undefined),
    findCategoryByName: jest.fn().mockResolvedValue([mockCategory]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCategories', () => {
    it('should return an array of categories', async () => {
      const result = await controller.getAllCategories();
      expect(result).toEqual([mockCategory]);
      expect(service.getAllCategories).toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    it('should return a single category by ID', async () => {
      const result = await controller.getCategoryById(1);
      expect(result).toEqual(mockCategory);
      expect(service.getCategoryById).toHaveBeenCalledWith(1);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const dto: CreateCategoryDto = { name: 'New Category' };
      const result = await controller.createCategory(dto);
      expect(result).toEqual(mockCategory);
      expect(service.createCategory).toHaveBeenCalledWith(dto.name);
    });
  });

  describe('replaceCategory', () => {
    it('should replace a category', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated Category' };
      const result = await controller.replaceCategory(1, dto);
      expect(result).toEqual(mockCategory);
      expect(service.updateCategory).toHaveBeenCalledWith(1, dto.name);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated Category' };
      const result = await controller.updateCategory(1, dto);
      expect(result).toEqual(mockCategory);
      expect(service.updateCategory).toHaveBeenCalledWith(1, dto.name);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const result = await controller.deleteCategory(1);
      expect(result).toBeUndefined();
      expect(service.deleteCategory).toHaveBeenCalledWith(1);
    });
  });

  describe('findCategoryByName', () => {
    it('should find categories by name', async () => {
      const result = await controller.findCategoryByName('Test Category');
      expect(result).toEqual([mockCategory]);
      expect(service.findCategoryByName).toHaveBeenCalledWith('Test Category');
    });
  });
});
