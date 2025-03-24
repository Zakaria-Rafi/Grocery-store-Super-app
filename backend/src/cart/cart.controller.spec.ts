import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthService } from '../auth/auth.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { BadRequestException } from '@nestjs/common';
import * as sinon from 'sinon';

describe('CartController', () => {
    let controller: CartController;
    let cartService: sinon.SinonStubbedInstance<CartService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CartController],
            providers: [
                {
                    provide: CartService,
                    useValue: sinon.createStubInstance(CartService),
                },
                {
                    provide: AuthService,
                    useValue: sinon.createStubInstance(AuthService),
                },
            ],
        }).compile();

        controller = module.get<CartController>(CartController);
        cartService = module.get(CartService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getCart', () => {
        it('should return user cart', async () => {
            const req = { user: { id: '1' } };
            const result = { items: [] };
            cartService.getCart_user.resolves(result);

            expect(await controller.getCart(req)).toBe(result);
        });
    });

    describe('verifyCartId', () => {
        it('should verify cart ID with JWT', async () => {
            const cartId = 1;
            const jwt = 'jwt-token';
            const result = { valid: true };
            cartService.verifyCartId.resolves(result);

            expect(await controller.verifyCartId(cartId, jwt)).toBe(result);
        });
    });

    describe('getCartById', () => {
        it('should return cart by ID', async () => {
            const cartId = 1;
            const result = { id: cartId, items: [] };
            cartService.getCartById.resolves(result);

            expect(await controller.getCartById(cartId)).toBe(result);
        });
    });

    describe('addItemToCart', () => {
        it('should add an item to the cart', async () => {
            const req = { user: { id: '1' } };
            const createCartDto: CreateCartDto = { items: [{ productId: 1, quantity: 2 }] };
            const result = { success: true };
            cartService.addItemToCart.resolves(result);

            expect(await controller.addItemToCart(req, createCartDto)).toBe(result);
        });
    });

    describe('updateItemQuantity', () => {
        it('should update item quantity in the cart (PATCH)', async () => {
            const req = { user: { id: '1' } };
            const updateCartDto: UpdateCartDto = { items: [{ productId: 1, quantity: 3 }] };
            const result = { success: true };
            cartService.updateItemQuantity.resolves(result);

            expect(await controller.updateItemQuantity(req, updateCartDto)).toBe(result);
        });
    });

    describe('updateItemQuantityPut', () => {
        it('should update item quantity in the cart (PUT)', async () => {
            const req = { user: { id: '1' } };
            const updateCartDto: UpdateCartDto = { items: [{ productId: 1, quantity: 3 }] };
            const result = { success: true };
            cartService.updateItemQuantity.resolves(result);

            expect(await controller.updateItemQuantityPut(req, updateCartDto)).toBe(result);
        });
    });

    describe('removeItemFromCart', () => {
        it('should remove an item from the cart', async () => {
            const req = { user: { id: '1' } };
            const productId = 1;
            const result = { success: true };
            cartService.removeItemFromCart.resolves(result);

            expect(await controller.removeItemFromCart(req, productId)).toBe(result);
        });
    });

    describe('clearCart', () => {
        it('should clear the entire cart', async () => {
            const req = { user: { id: '1' } };
            const result = { success: true };
            cartService.clearCart.resolves(result);

            expect(await controller.clearCart(req)).toBe(result);
        });
    });

    describe('applyCouponToCart', () => {
        it('should apply a coupon code to the cart', async () => {
            const req = { user: { id: '1' } };
            const couponCode = 'DISCOUNT10';
            const result = { success: true };
            cartService.applyCoupon.resolves(result);

            expect(await controller.applyCouponToCart(req, couponCode)).toBe(result);
        });

        it('should throw BadRequestException if coupon code is not provided', async () => {
            const req = { user: { id: '1' } };

            await expect(controller.applyCouponToCart(req, '')).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeCoupon', () => {
        it('should remove the coupon from the cart', async () => {
            const req = { user: { id: '1' } };
            const result = { success: true };
            cartService.removeCoupon.resolves(result);

            expect(await controller.removeCoupon(req)).toBe(result);
        });
    });

    describe('checkout', () => {
        it('should checkout the cart', async () => {
            const req = { user: { id: '1' } };
            const paymentMethod = 'cash';
            const cashPaid = 100;
            const result = { success: true };
            cartService.checkout.resolves(result);

            expect(await controller.checkout(req, paymentMethod, cashPaid)).toBe(result);
        });
    });

    describe('capturePayPalPayment', () => {
        it('should capture PayPal payment', async () => {
            const orderId = 'PAYPAL_ORDER_ID';
            const result = { success: true };
            cartService.capturePaypalPayment.resolves(result);

            expect(await controller.capturePayPalPayment(orderId)).toBe(result);
        });
    });

    describe('captureStripePayment', () => {
        it('should capture Stripe payment', async () => {
            const orderId = 'STRIPE_ORDER_ID';
            const result = { success: true };
            cartService.captureStripePayment.resolves(result);

            expect(await controller.captureStripePayment(orderId)).toBe(result);
        });
    });
});