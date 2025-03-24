import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { InvoiceProduct } from '../invoices/invoice-product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(InvoiceProduct)
    private readonly invoiceProductRepository: Repository<InvoiceProduct>,
  ) {}
  // get all products 
  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: {
        deleted: false,
      },
    });
    return products;
  }
// get product by ID 
  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
        deleted: false,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
  // create a new product
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const {
      name,
      description,
      price,
      categoryIds,
      barcode,
      imagesUrl,
      brand,
      stock,
      taxRate,
    } = createProductDto;
  
    // Check for an existing product with the same barcode
    const existingProduct = await this.productRepository.findOne({ where: { barcode } });
    if (existingProduct) {
      throw new ConflictException(`Product with barcode ${barcode} already exists`);
    }
  
    // Retrieve and validate categories if provided
    let categories: Category[] = [];
    if (categoryIds && categoryIds.length > 0) {
      categories = await this.categoryRepository.findByIds(categoryIds);
      if (categories.length !== categoryIds.length) {
        throw new NotFoundException('Some categories not found');
      }
    }
  
    // Calculate final price including tax
    let finalPrice = price;
    if (taxRate !== undefined && taxRate > 0) {
      const tax = (price * taxRate) / 100;
      finalPrice = parseFloat((price + tax).toFixed(2));
    }
  
    // Create the product with the calculated price
    const product = this.productRepository.create({
      name,
      description,
      price: finalPrice,       // Price including tax
      priceBeforeTax: price,   // Original price
      taxRate: taxRate || 0,
      barcode,
      imagesUrl,
      brand,
      stock,
      categories,
    });
  
    return this.productRepository.save(product);
  }
  

// update product by ID
async updateProduct(
  id: number,
  updateProductDto: UpdateProductDto,
): Promise<Product> {
  // Retrieve the product and check if it exists
  const {
    name,
    description,
    price,
    stock,
    barcode,
    imagesUrl,
    brand,
    categoryIds,
    taxRate,
    ingredients,
    allergens,
    nutritionalValues,
  } = updateProductDto;

  const product = await this.productRepository.findOne({ where: { id } });
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  // Update the product with the new data
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) {
    product.priceBeforeTax = price;
    product.price = price;
    if (taxRate !== undefined && taxRate > 0) {
      const tax = (price * taxRate) / 100;
      product.price = parseFloat((price + tax).toFixed(2));
    }
  }
  if (taxRate !== undefined) product.taxRate = taxRate;
  if (stock) product.stock = stock;
  if (barcode) product.barcode = barcode;
  if (imagesUrl) product.imagesUrl = imagesUrl;
  if (brand) product.brand = brand;
  if (ingredients) product.ingredients = ingredients;
  if (allergens) product.allergens = allergens;
  if (nutritionalValues) product.nutritionalValues = nutritionalValues;

  if (categoryIds && categoryIds.length > 0) {
    const categories = await this.categoryRepository.findByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      throw new NotFoundException('Some categories not found');
    }
    product.categories = categories;
  }

  return this.productRepository.save(product);
}
  // delete product by ID
  async deleteProduct(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.deleted = true;
    await this.productRepository.save(product);
  }
  // get product by barcode
  async getProductByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ barcode });
    if (product) {
      return product;
    }
    return this.addProductFromOpenFoodFacts(barcode);
  }
  // get product by barcode for user
  async getProductByBarcodeUser(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ barcode });
    if (product) {
      return product;
    } else {
      throw new NotFoundException('Product not found');
    }
  }
  // apply tax to product by ID
  async applyTaxToProduct(productId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.taxRate > 0) {
      if (!product.priceBeforeTax) {
        product.priceBeforeTax = product.price;
      }
      const tax = (product.priceBeforeTax * product.taxRate) / 100;
      product.price = parseFloat((product.priceBeforeTax + tax).toFixed(2));
    }

    return this.productRepository.save(product);
  }
  // remove tax from product by ID 
  async addProductFromOpenFoodFacts(barcode: string): Promise<Product> {
    // Fetch product data from OpenFoodFacts API
    const OPENFOODFACTS_API_URL = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    try {
        const response = await fetch(OPENFOODFACTS_API_URL);
        const data = await response.json();
        // Check if the product was found
        if (data.status !== 1) {
            throw new NotFoundException('Product not found in OpenFoodFacts API');
        }

        const productData = data.product;

        let categoryNames: string[] = [];
        if (productData.categories) {
            categoryNames = productData.categories.split(',').map(category => category.trim());
        }
        // Create categories if they don't exist
        const categories: Category[] = [];
        for (const categoryName of categoryNames) {
            let category = await this.categoryRepository.findOne({ where: { name: categoryName } });

            if (!category) {
                category = this.categoryRepository.create({ name: categoryName });
                category = await this.categoryRepository.save(category);
            }

            categories.push(category);
        }

        const images = [];
        // Add images if they exist
        if (productData.image_url) images.push(productData.image_url);
        if (productData.image_ingredients_url) images.push(productData.image_ingredients_url);
        if (productData.image_nutrition_url) images.push(productData.image_nutrition_url);

        // Create product
        const product = this.productRepository.create({
            name: productData.product_name || 'Unknown Product',
            description: productData.generic_name || 'No description available',
            barcode: barcode,
            price: 0,
            stock: 0,
            imagesUrl: images,
            brand: productData.brands || 'Unknown Brand',
            ingredients: productData.ingredients_text || 'Ingredients not available',
            allergens: productData.allergens || 'No allergens',
            nutritionalValues: productData.nutriscore_grade || 'Unknown',
            categories,
        });

        return this.productRepository.save(product);
    } catch {
        throw new NotFoundException('Failed to fetch product from OpenFoodFacts API');
    }
}


// fetch product from OpenFoodFacts API only for fetching data
async fetchProductFromOpenFoodFacts(barcode: string): Promise<any> {
  const OPENFOODFACTS_API_URL = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

  try {
      const response = await fetch(OPENFOODFACTS_API_URL);
      const data = await response.json();

      if (data.status !== 1) {
          throw new NotFoundException('Product not found in OpenFoodFacts API');
      }

      const productData = data.product;

      const categoryNames = productData.categories
          ? productData.categories.split(',').map(category => category.trim())
          : [];

      const imagesUrl: string[] = [];
      if (productData.image_url) imagesUrl.push(productData.image_url);
      if (productData.image_ingredients_url) imagesUrl.push(productData.image_ingredients_url);
      if (productData.image_nutrition_url) imagesUrl.push(productData.image_nutrition_url);

      return {
          name: productData.product_name || '',
          description: productData.generic_name || '',
          barcode,
          price: 0,
          stock: 0,
          imagesUrl,
          brand: productData.brands || '',
          ingredients: productData.ingredients_text || '',
          allergens: productData.allergens || '',
          nutritionalValues: productData.nutriscore_grade || '',
          categories: categoryNames,
      };
  } catch {
      throw new NotFoundException('Failed to fetch product from OpenFoodFacts API');
  }
}



}
