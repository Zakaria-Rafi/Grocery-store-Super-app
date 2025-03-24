import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InvoiceProduct } from '../invoices/invoice-product.entity';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  findByIds: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  findOneOrFail: jest.fn(),
  findOneByOrFail: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(InvoiceProduct),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should return an array of products', async () => {
      const products = [{ id: 1, name: 'Product 1' }];
      jest.spyOn(productRepository, 'find').mockResolvedValue(products as any);

      expect(await service.getAllProducts()).toEqual(products);
    });
  });

  describe('getProductById', () => {
    it('should return a product if found', async () => {
      const product = { id: 1, name: 'Product 1' };
      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(product as any);

      expect(await service.getProductById(1)).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getProductById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProduct', () => {
    it('should create and return a product', async () => {
      const createProductDto = {
        name: 'Product 1',
        barcode: '12345',
        categoryIds: [],
      };
      const product = { id: 1, ...createProductDto };
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(productRepository, 'create').mockReturnValue(product as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(product as any);

      expect(await service.createProduct(createProductDto as any)).toEqual(
        product,
      );
    });

    it('should throw ConflictException if product with barcode already exists', async () => {
      const createProductDto = {
        name: 'Product 1',
        barcode: '12345',
        categoryIds: [],
      };
      const existingProduct = { id: 1, ...createProductDto };
      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(existingProduct as any);

      await expect(
        service.createProduct(createProductDto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if some categories not found', async () => {
      const createProductDto = {
        name: 'Product 1',
        barcode: '12345',
        categoryIds: [1, 2],
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'findByIds')
        .mockResolvedValue([{ id: 1 }] as any);
      jest.spyOn(productRepository, 'create').mockReturnValue({
        name: 'Product 1',
        barcode: '12345',
        price: 0,
        categories: [],
      } as any);

      await expect(
        service.createProduct(createProductDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('should update and return a product', async () => {
      const updateProductDto = { name: 'Updated Product', categoryIds: [] };
      const product = { id: 1, name: 'Product 1' };
      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(product as any);
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue({ ...product, ...updateProductDto } as any);

      expect(await service.updateProduct(1, updateProductDto as any)).toEqual({
        ...product,
        ...updateProductDto,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProduct(1, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if some categories not found', async () => {
      const updateProductDto = { categoryIds: [1, 2] };
      const product = { id: 1, name: 'Product 1' };
      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(product as any);
      jest
        .spyOn(categoryRepository, 'findByIds')
        .mockResolvedValue([{ id: 1 }] as any);

      await expect(
        service.updateProduct(1, updateProductDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const product = { deleted: true, id: 1, name: 'Product 1' };
      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(product as any);
      jest.spyOn(productRepository, 'remove').mockResolvedValue(product as any);

      await service.deleteProduct(1);
      expect(productRepository.save).toHaveBeenCalledWith(product);
    });
  });

  describe('getProductByBarcode', () => {
    it('should return a product if found by barcode', async () => {
      const product = { id: 1, name: 'Product 1', barcode: '12345' };
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockResolvedValue(product as any);

      expect(await service.getProductByBarcode('12345')).toEqual(product);
    });

    it('should call addProductFromOpenFoodFacts if product not found by barcode', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);
      jest
        .spyOn(service, 'addProductFromOpenFoodFacts')
        .mockResolvedValue({ id: 1, name: 'Product 1' } as any);

      expect(await service.getProductByBarcode('12345')).toEqual({
        id: 1,
        name: 'Product 1',
      });
      expect(service.addProductFromOpenFoodFacts).toHaveBeenCalledWith('12345');
    });
  });

  describe('getProductByBarcodeUser', () => {
    it('should return a product if found by barcode', async () => {
      const product = { id: 1, name: 'Product 1', barcode: '12345' };
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockResolvedValue(product as any);

      expect(await service.getProductByBarcodeUser('12345')).toEqual(product);
    });

    it('should throw NotFoundException if product not found by barcode', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getProductByBarcodeUser('12345')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addProductFromOpenFoodFacts', () => {
    it('should fetch and return a product from OpenFoodFacts API', async () => {
      const productData = {
        product_name: 'Product 1',
        generic_name: 'Generic Product',
        brands: 'Brand 1',
        image_url: 'http://example.com/image.jpg',
      };
      const fetchResponse = {
        status: 1,
        product: productData,
      };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(fetchResponse),
      } as any);

      const product = {
        name: productData.product_name,
        description: productData.generic_name,
        barcode: '12345',
        price: 0,
        stock: 0,
        imageUrl: productData.image_url,
        brand: productData.brands,
      };
      jest.spyOn(productRepository, 'create').mockReturnValue(product as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(product as any);

      expect(await service.addProductFromOpenFoodFacts('12345')).toEqual(
        product,
      );
    });

    it('should throw NotFoundException if product not found in OpenFoodFacts API', async () => {
      const fetchResponse = { status: 0 };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(fetchResponse),
      } as any);

      await expect(
        service.addProductFromOpenFoodFacts('12345'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      await expect(
        service.addProductFromOpenFoodFacts('12345'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
