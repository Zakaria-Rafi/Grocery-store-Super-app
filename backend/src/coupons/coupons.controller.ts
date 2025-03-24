import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Coupons') // Group routes under "Coupons"
@ApiBearerAuth() // Indicate authentication is required
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new coupon (admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon successfully created' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Coupon code' },
        discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'], description: 'Type of discount' },
        discountValue: { type: 'number', description: 'Value of the discount' },
        isGlobal: { type: 'boolean', description: 'Indicates if the coupon applies globally' },
        usageLimit: { type: 'number', description: 'Maximum number of uses for the coupon' },
        expiryDate: { type: 'string', format: 'date-time', description: 'Expiration date of the coupon' },
        productIds: { type: 'array', items: { type: 'number' }, description: 'Array of product IDs the coupon applies to' },
        userIds: { type: 'array', items: { type: 'number' }, description: 'Array of user IDs the coupon applies to' },
      },
      required: ['code', 'discountType', 'discountValue', 'isGlobal', 'usageLimit', 'expiryDate'],
    },
  })
  // Create a new coupon
  async createCoupon(
    @Body('code') code: string,
    @Body('discountType') discountType: 'PERCENTAGE' | 'FIXED',
    @Body('discountValue') discountValue: number,
    @Body('isGlobal') isGlobal: boolean,
    @Body('usageLimit') usageLimit: number,
    @Body('expiryDate') expiryDate: Date,
    @Body('productIds') productIds: number[] = [],
    @Body('userIds') userIds: number[] = [],
  ) {
    // Call the service to create a new coupon
    return this.couponService.createCoupon({
      code,
      discountType,
      discountValue,
      isGlobal,
      usageLimit,
      expiryDate,
      productIds,
      userIds,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiResponse({ status: 200, description: 'List of all coupons' })
  // Get all coupons
  async getAllCoupons() {
    return this.couponService.getAllCoupons();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get a coupon by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the coupon' })
  // Get a coupon by ID
  async getCouponById(@Param('id') id: number) {
    const coupon = await this.couponService.getCouponById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found.`);
    }
    return coupon;
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a coupon by its code' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  @ApiParam({ name: 'code', type: 'string', description: 'Code of the coupon' })
  // Get a coupon by its code 
  async getCouponByCode(@Param('code') code: string) {
    return this.couponService.getCouponByCode(code);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a coupon (admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon successfully updated' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the coupon to update' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Coupon code' },
        discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'], description: 'Type of discount' },
        discountValue: { type: 'number', description: 'Value of the discount' },
        isGlobal: { type: 'boolean', description: 'Indicates if the coupon applies globally' },
        usageLimit: { type: 'number', description: 'Maximum number of uses for the coupon' },
        expiryDate: { type: 'string', format: 'date-time', description: 'Expiration date of the coupon' },
        productIds: { type: 'array', items: { type: 'number' }, description: 'Array of product IDs the coupon applies to' },
        userIds: { type: 'array', items: { type: 'number' }, description: 'Array of user IDs the coupon applies to' },
      },
    },
  })
  // Update a coupon by ID (admin only)
  async updateCoupon(
    @Param('id') id: number,
    @Body('code') code?: string,
    @Body('discountType') discountType?: 'PERCENTAGE' | 'FIXED',
    @Body('discountValue') discountValue?: number,
    @Body('isGlobal') isGlobal?: boolean,
    @Body('usageLimit') usageLimit?: number,
    @Body('expiryDate') expiryDate?: Date,
    @Body('productIds') productIds?: number[],
    @Body('userIds') userIds?: number[],
  ) {
    return this.couponService.updateCoupon(id, {
      code,
      discountType,
      discountValue,
      isGlobal,
      usageLimit,
      expiryDate,
      productIds,
      userIds,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a coupon (admin only)' })
  @ApiResponse({ status: 204, description: 'Coupon successfully deleted' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the coupon to delete' })
  // Delete a coupon by ID (admin only)
  async deleteCoupon(@Param('id') id: number) {
    await this.couponService.deleteCoupon(id);
    return { message: 'Coupon deleted successfully' };
  }

  @Post(':id/apply-to-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Apply a coupon to a user (admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon successfully applied to user' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the coupon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'ID of the user to apply the coupon to' },
      },
      required: ['userId'],
    },
  })
  // Apply a coupon to a user (admin only)
  async applyCouponToUser(
    @Param('id') couponId: number,
    @Body('userId') userId: number,
  ) {
    await this.couponService.applyCouponToUser(userId, couponId);
    return { message: 'Coupon applied to user successfully' };
  }
}
