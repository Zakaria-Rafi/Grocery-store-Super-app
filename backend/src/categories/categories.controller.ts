import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Categories') // Group all endpoints under "Categories" in Swagger
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of all categories', type: [Category] })
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category details', type: Category })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the category' })
  // Get a category by ID
  async getCategoryById(@Param('id') id: number): Promise<Category> {
    return this.categoriesService.getCategoryById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can create categories
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (admin only)' })
  @ApiResponse({ status: 201, description: 'Category successfully created', type: Category })
  @ApiBody({ type: CreateCategoryDto, description: 'Details of the category to create' })
  // Create a new category
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.createCategory(createCategoryDto.name);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can update categories
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace a category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category successfully replaced', type: Category })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the category to replace' })
  @ApiBody({ type: UpdateCategoryDto, description: 'Details of the category to replace' })
  // Replace a category
  async replaceCategory(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategory(id, updateCategoryDto.name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can partially update categories
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update a category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category successfully updated', type: Category })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the category to update' })
  @ApiBody({ type: UpdateCategoryDto, description: 'Partial update details of the category' })
  // Partially update a category
  async updateCategory(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategory(id, updateCategoryDto.name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can delete categories
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiResponse({ status: 204, description: 'Category successfully deleted' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the category to delete' })
  // Delete a category
  async deleteCategory(@Param('id') id: number): Promise<void> {
    return this.categoriesService.deleteCategory(id);
  }

  @Get('/name/:name')
  @UseGuards(JwtAuthGuard)
  @Roles('admin') // Only admins can find categories by name
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find categories by name (admin only)' })
  @ApiResponse({ status: 200, description: 'Matching categories', type: [Category] })
  @ApiParam({ name: 'name', type: String, description: 'Name of the category' })
  // Find categories by name
  async findCategoryByName(@Param('name') name: string): Promise<Category[]> {
    return this.categoriesService.findCategoryByName(name);
  }
}
