import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Products') // Swagger category
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products', type: [Product] })
  async getAllProducts(): Promise<Product[]> {
    return this.productsService.getAllProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product details', type: Product })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the product' })
  async getProductById(@Param('id') id: number): Promise<Product> {
    return this.productsService.getProductById(id);
  }

  @Get('/barcodeUser/:barcode')
  @ApiOperation({ summary: 'Get a product by barcode (public)' })
  @ApiResponse({ status: 200, description: 'Product details', type: Product })
  @ApiParam({ name: 'barcode', type: String, description: 'Barcode of the product' })
  async getProductByBarcodeUser(@Param('barcode') barcode: string): Promise<Product> {
    return this.productsService.getProductByBarcodeUser(barcode);
  }

  @Get('/barcode/:barcode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a product by barcode (admin only)' })
  @ApiResponse({ status: 200, description: 'Product details', type: Product })
  @ApiParam({ name: 'barcode', type: String, description: 'Barcode of the product' })
  async getProductByBarcode(@Param('barcode') barcode: string): Promise<Product> {
    return this.productsService.getProductByBarcode(barcode);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new product (admin only)' })
  @ApiResponse({ status: 201, description: 'Product successfully created', type: Product })
  @ApiBody({ type: CreateProductDto, description: 'Details of the product to create' })
  async addProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing product (admin only)' })
  @ApiResponse({ status: 200, description: 'Product successfully updated', type: Product })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the product to update' })
  @ApiBody({ type: UpdateProductDto, description: 'Updated details of the product' })
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update an existing product (admin only)' })
  @ApiResponse({ status: 200, description: 'Product successfully updated', type: Product })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the product to update' })
  @ApiBody({ type: UpdateProductDto, description: 'Partial update details of the product' })
  async partialUpdateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiResponse({ status: 204, description: 'Product successfully deleted' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the product to delete' })
  async deleteProduct(@Param('id') id: number): Promise<void> {
    return this.productsService.deleteProduct(id);
  }


  @Get('fetch/:barcode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Fetch product details from Open Food Facts' })
  @ApiResponse({ status: 200, description: 'Fetched product details from Open Food Facts', type: Object })
  @ApiResponse({ status: 404, description: 'Product not found in Open Food Facts' })
  @ApiParam({ name: 'barcode', type: String, description: 'Barcode of the product to fetch' })
  async fetchProductFromOpenFoodFacts(@Param('barcode') barcode: string): Promise<any> {
      return this.productsService.fetchProductFromOpenFoodFacts(barcode);
  }


}
