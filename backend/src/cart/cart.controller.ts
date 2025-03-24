import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'User cart retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard)
  getCart(@Req() req: any) {
    const userId = parseInt(req.user.id, 10);
    return this.cartService.getCart_user(userId);
  }

  @Get(':cartId/verify')
  @ApiOperation({ summary: 'Verify corresponding cartId with JWT' })
  @ApiParam({
    name: 'cartId',
    type: Number,
    description: 'ID of the cart to verify',
  })
  @ApiQuery({
    name: 'JWT',
    type: String,
    description: 'JWT token of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart ID verified successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found.',
  })
  verifyCartId(@Param('cartId') cartId: number, @Query('jwt') jwt: string) {
    return this.cartService.verifyCartId(cartId, jwt);
  }

  @Get(':cartId')
  @ApiOperation({ summary: 'Get cart by cartId' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully.',
  })
  getCartById(@Param('cartId') cartId: number) {
    return this.cartService.getCartById(cartId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully.' })
  @ApiBody({ type: CreateCartDto })
  @UseGuards(JwtAuthGuard)
  addItemToCart(@Req() req: any, @Body() createCartDto: CreateCartDto) {
    const authUser = req.user; // Use the authenticated user object directly
    return this.cartService.addItemToCart(
      createCartDto.items[0].productId,
      createCartDto.items[0].quantity,
      authUser,
    );
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update item quantity in the cart (PATCH)' })
  @ApiResponse({
    status: 200,
    description: 'Item quantity updated successfully.',
  })
  @ApiBody({ type: UpdateCartDto })
  @UseGuards(JwtAuthGuard)
  updateItemQuantity(@Req() req: any, @Body() updateCartDto: UpdateCartDto) {
    const userId = parseInt(req.user.id, 10);
    return this.cartService.updateItemQuantity(
      userId,
      updateCartDto.items[0].productId,
      updateCartDto.items[0].quantity,
    );
  }

  @Put('update')
  @ApiOperation({ summary: 'Update item quantity in the cart (PUT)' })
  @ApiResponse({
    status: 200,
    description: 'Item quantity updated successfully.',
  })
  @ApiBody({ type: UpdateCartDto })
  @UseGuards(JwtAuthGuard)
  updateItemQuantityPut(@Req() req: any, @Body() updateCartDto: UpdateCartDto) {
    const userId = parseInt(req.user.id, 10);
    return this.cartService.updateItemQuantity(
      userId,
      updateCartDto.items[0].productId,
      updateCartDto.items[0].quantity,
    );
  }

  @Delete('remove/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'ID of the product to remove',
  })
  @UseGuards(JwtAuthGuard)
  removeItemFromCart(@Req() req: any, @Param('productId') productId: number) {
    const userId = parseInt(req.user.id, 10);
    return this.cartService.removeItemFromCart(userId, productId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear the entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully.' })
  @UseGuards(JwtAuthGuard)
  clearCart(@Req() req: any) {
    const userId = parseInt(req.user.id, 10);
    return this.cartService.clearCart(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('apply-coupon')
  @ApiOperation({ summary: 'Apply a coupon code to the cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        couponCode: { type: 'string', example: 'DISCOUNT10' },
      },
      required: ['couponCode'],
    },
  })
  //apply coupon to cart
  async applyCouponToCart(
    @Req() req: any,
    @Body('couponCode') couponCode: string,
  ) {
    const userId = parseInt(req.user.id, 10);
    if (!couponCode) {
      throw new BadRequestException('Coupon code is required');
    }
    return this.cartService.applyCoupon(userId, couponCode);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('remove-coupon')
  @ApiOperation({ summary: 'Remove the coupon from the cart' })
  @ApiResponse({ status: 200, description: 'Coupon removed successfully.' })
  //remove coupon from cart
  async removeCoupon(@Req() req: any) {
    const userId = parseInt(req.user.id, 10);
    return this.cartService.removeCoupon(userId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout the cart' })
  @ApiResponse({ status: 200, description: 'Checkout successful.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentMethod: {
          type: 'string',
          enum: ['paypal', 'stripe', 'cash'],
          default: 'cash',
        },
        cashPaid: { type: 'number', example: 100 },
      },
      required: ['paymentMethod'],
    },
  })
  @UseGuards(JwtAuthGuard)
  async checkout(
    @Req() req: any,
    @Body('paymentMethod') paymentMethod: 'paypal' | 'stripe' | 'cash',
    @Body('cashPaid') cashPaid: number, // Only for cash payment
  ) {
    const userId = parseInt(req.user.id, 10);
    const chosenMethod = paymentMethod || 'cash';
    return this.cartService.checkout(userId, chosenMethod, cashPaid);
  }

  @Post('capturePaypal')
  @ApiOperation({ summary: 'Capture PayPal payment' })
  @ApiResponse({
    status: 200,
    description: 'PayPal payment captured successfully.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', example: 'PAYPAL_ORDER_ID' },
      },
      required: ['orderId'],
    },
  })
  async capturePayPalPayment(@Body('orderId') orderId: string) {
    return this.cartService.capturePaypalPayment(orderId);
  }

  @Post('captureStripe')
  @ApiOperation({ summary: 'Capture Stripe payment' })
  @ApiResponse({
    status: 200,
    description: 'Stripe payment captured successfully.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', example: 'STRIPE_ORDER_ID' },
      },
      required: ['orderId'],
    },
  })
  @UseGuards(JwtAuthGuard)
  async captureStripePayment(@Body('orderId') orderId: string) {
    return this.cartService.captureStripePayment(orderId);
  }
}
