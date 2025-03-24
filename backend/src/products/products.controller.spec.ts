import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getAllProducts: jest.fn().mockResolvedValue([]),
            getProductById: jest.fn().mockResolvedValue({}),
            getProductByBarcode: jest.fn().mockResolvedValue({}),
            getProductByBarcodeUser: jest.fn().mockResolvedValue({}),
            createProduct: jest.fn().mockResolvedValue({}),
            updateProduct: jest.fn().mockResolvedValue({}),
            deleteProduct: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all products', async () => {
    await expect(controller.getAllProducts()).resolves.toEqual([]);
  });

  it('should get product by id', async () => {
    const id = 1;
    await expect(controller.getProductById(id)).resolves.toEqual({});
  });

  it('should get product by barcode', async () => {
    const barcode = '123456';
    await expect(controller.getProductByBarcode(barcode)).resolves.toEqual({});
  });

  it('should get product by barcode for user', async () => {
    const barcode = '123456';
    await expect(controller.getProductByBarcodeUser(barcode)).resolves.toEqual({});
  });

  it('should add a product', async () => {
    const createProductDto: CreateProductDto = { name: 'Test Product', price: 100, description: 'Test Description', stock: 10, barcode: '123456' };
    await expect(controller.addProduct(createProductDto)).resolves.toEqual({});
  });

  it('should update a product', async () => {
    const id = 1;
    const updateProductDto: UpdateProductDto = { name: 'Updated Product', price: 150 };
    await expect(controller.updateProduct(id, updateProductDto)).resolves.toEqual({});
  });

  it('should partially update a product', async () => {
    const id = 1;
    const updateProductDto: UpdateProductDto = { name: 'Partially Updated Product', price: 150 };
    await expect(controller.partialUpdateProduct(id, updateProductDto)).resolves.toEqual({});
  });

  it('should delete a product', async () => {
    const id = 1;
    await expect(controller.deleteProduct(id)).resolves.toBeUndefined();
  });
});
