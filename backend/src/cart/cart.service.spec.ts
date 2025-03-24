import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { Coupon } from '../coupons/coupon.entity';
import { User } from '../users/user.entity';
import { MailService } from '../utils/mail.service';
import { AuthService } from '../auth/auth.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

jest.mock('@paypal/checkout-server-sdk');
jest.mock('stripe');

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let cartItemRepository: Repository<CartItem>;
  let productRepository: Repository<Product>;
  let userRepository: Repository<User>;
  let couponRepository: Repository<Coupon>;
  let invoicesService: InvoicesService;
  let authService: AuthService;

  const mockCartRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  const mockCartItemRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  });

  const mockProductRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
  });

  const mockCouponRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
  });

  const mockUserRepository = () => ({
    findOne: jest.fn(),
  });

  const mockInvoicesService = () => ({
    createInvoice: jest.fn(),
    generateInvoicePDF: jest.fn(),
  });

  const mockMailService = () => ({
    sendOrderConfirmationEmail: jest.fn(),
  });

  const mockAuthService = () => ({
    decodeJWT: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useFactory: mockCartRepository },
        { provide: getRepositoryToken(CartItem), useFactory: mockCartItemRepository },
        { provide: getRepositoryToken(Product), useFactory: mockProductRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Coupon), useFactory: mockCouponRepository },
        { provide: InvoicesService, useFactory: mockInvoicesService },
        { provide: MailService, useFactory: mockMailService },
        { provide: AuthService, useFactory: mockAuthService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepository = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    couponRepository = module.get<Repository<Coupon>>(getRepositoryToken(Coupon));
    invoicesService = module.get<InvoicesService>(InvoicesService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('should return a cart for a valid user', async () => {
      const mockCart = { id: 1, user: { id: 1 }, items: [], totalPrice: 0 };
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);

      const result = await service.getCart(1);
      expect(result).toEqual(mockCart);
      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['user', 'items', 'items.product', 'coupon', 'items.product.categories'],
      });
    });

    it('should throw NotFoundException if cart not found', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getCart(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCart_user', () => {
    it('should return a CartDto for existing cart', async () => {
      const mockCart = { id: 1, user: { id: 1 }, items: [], totalPrice: 0 };
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
  
      // Fix: Either use the result in assertions or don't assign it
      await service.getCart_user(1);
      expect(cartRepository.findOne).toHaveBeenCalled();
    });
  
    it('should create a new cart if one does not exist', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(cartRepository, 'create').mockReturnValue({ items: [], totalPrice: 0 } as any);
      jest.spyOn(cartRepository, 'save').mockResolvedValue({ id: 1 } as any);
  
      // Fix: Either use the result in assertions or don't assign it
      await service.getCart_user(1);
      expect(cartRepository.create).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalled();
    });
  });

  describe('addItemToCart', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockProduct = { id: 1, name: 'Test Product', price: 10, stock: 5 };
    const mockCart = {
      id: 1,
      user: mockUser,
      items: [],
      totalPrice: 0,
      status: 'PENDING',
    };

    it('should add a new item to cart', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue({ ...mockCart, items: [] } as any);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(cartItemRepository, 'create').mockReturnValue({
        product: mockProduct,
        quantity: 2,
        totalPrice: 20,
      } as any);
      
      await service.addItemToCart(1, 2, mockUser as User);
      
      expect(cartItemRepository.create).toHaveBeenCalled();
      expect(cartItemRepository.save).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('should update quantity for existing item', async () => {
      const mockCartItem = {
        product: { ...mockProduct },
        quantity: 1,
        totalPrice: 10,
      };
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      } as any);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      
      await service.addItemToCart(1, 2, mockUser as User);
      
      expect(cartItemRepository.save).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      
      await expect(service.addItemToCart(1, 10, mockUser as User)).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyCoupon', () => {
    it('should apply a valid global coupon to cart', async () => {
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [{ product: { id: 1 }, quantity: 2, totalPrice: 20 }],
        totalPrice: 20,
      };
      const mockCoupon = {
        id: 1,
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isGlobal: true,
        expiryDate: new Date(Date.now() + 86400000),
        usageLimit: 10,
        products: [],
      };
      
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      jest.spyOn(couponRepository, 'findOne').mockResolvedValue(mockCoupon as any);
      
      await service.applyCoupon(1, 'TEST10');
      
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid coupon code', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(couponRepository, 'findOne').mockResolvedValue(null);
      
      await expect(service.applyCoupon(1, 'INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for expired coupon', async () => {
      const mockCoupon = {
        code: 'EXPIRED',
        expiryDate: new Date(Date.now() - 86400000),
      };
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(couponRepository, 'findOne').mockResolvedValue(mockCoupon as any);
      
      await expect(service.applyCoupon(1, 'EXPIRED')).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCoupon', () => {
    it('should remove a coupon from cart', async () => {
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [
          { 
            appliedCouponCode: 'TEST10', 
            priceBeforeDiscount: 20, 
            totalPrice: 18 
          }
        ],
        totalPrice: 18,
        coupon: { id: 1, code: 'TEST10' },
      };
      
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      
      await service.removeCoupon(1);
      
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no coupon applied', async () => {
      const mockCart = { id: 1, coupon: null };
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      
      await expect(service.removeCoupon(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity successfully', async () => {
      const mockProduct = { id: 1, price: 10, stock: 5 };
      const mockCartItem = { product: mockProduct, quantity: 1, totalPrice: 10 };
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [mockCartItem],
        totalPrice: 10,
      };
      
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      
      await service.updateItemQuantity(1, 1, 3);
      
      expect(cartItemRepository.save).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if quantity exceeds stock', async () => {
      const mockProduct = { id: 1, price: 10, stock: 5 };
      const mockCart = {
        items: [{ product: { id: 1 } }],
      };
      
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      
      await expect(service.updateItemQuantity(1, 1, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove an item from cart', async () => {
      const mockCartItem = { id: 1, product: { id: 1 } };
      const mockCart = {
        id: 1,
        items: [mockCartItem],
        totalPrice: 10,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      
      await service.removeItemFromCart(1, 1);
      
      expect(cartItemRepository.remove).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not in cart', async () => {
      const mockCart = { id: 1, items: [] };
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      
      await expect(service.removeItemFromCart(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const mockCartItems = [{ id: 1 }, { id: 2 }];
      const mockCart = {
        id: 1,
        items: mockCartItems,
        totalPrice: 30,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      
      await service.clearCart(1);
      
      expect(cartItemRepository.remove).toHaveBeenCalledTimes(2);
      expect(cartRepository.save).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should process cash payment successfully', async () => {
      const mockItems = [
        { product: { id: 1, name: 'Product 1', price: 10, stock: 5 }, quantity: 2, totalPrice: 20 }
      ];
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: mockItems,
        totalPrice: 20,
        coupon: null,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      jest.spyOn(invoicesService, 'createInvoice').mockResolvedValue({ id: 1 } as any);
      
      const result = await service.checkout(1, 'cash', 30);
      
      expect(result.change).toBe(10);
      expect(invoicesService.createInvoice).toHaveBeenCalled();
      expect(cartItemRepository.delete).toHaveBeenCalled();
    });

    it('should generate PayPal checkout URL', async () => {
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [{ product: { id: 1, name: 'Product', price: 20, description: 'Test' }, quantity: 1, totalPrice: 20 }],
        totalPrice: 20,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      
      // Mock PayPal order creation
      const mockPayPalOrder = {
        result: {
          links: [{ rel: 'approve', href: 'https://paypal.com/checkout/approve' }]
        }
      };
      
      // This is a simplification - actual implementation will need more detailed mocking
      (paypal.orders.OrdersCreateRequest as jest.Mock).mockImplementation(() => ({
        prefer: jest.fn(),
        requestBody: jest.fn(),
      }));
      
      // Mock the PayPal client execute method
      service['paypalClient'] = {
        execute: jest.fn().mockResolvedValue(mockPayPalOrder),
      } as any;
      
      const result = await service.checkout(1, 'paypal');
      
      expect(result.approvalUrl).toBe('https://paypal.com/checkout/approve');
    });

    it('should generate Stripe checkout URL', async () => {
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [{ product: { id: 1, name: 'Product', price: 20 }, quantity: 1, totalPrice: 20 }],
        totalPrice: 20,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      
      // Mock Stripe session creation
      const mockStripeSession = {
        url: 'https://stripe.com/checkout/session'
      };
      
      // Setup Stripe mock
      service['stripe'] = {
        checkout: {
          sessions: {
            create: jest.fn().mockResolvedValue(mockStripeSession),
          },
        },
      } as any;
      
      const result = await service.checkout(1, 'stripe');
      
      expect(result.checkoutUrl).toBe('https://stripe.com/checkout/session');
    });

    it('should throw BadRequestException for empty cart', async () => {
      const mockCart = { id: 1, items: [], totalPrice: 0 };
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      
      await expect(service.checkout(1, 'cash', 20)).rejects.toThrow(BadRequestException);
    });
  });
  describe('capturePaypalPayment', () => {
    it('should capture PayPal payment successfully', async () => {
      // Mock necessary PayPal responses
      const mockOrderDetails = {
        result: {
          status: 'APPROVED',
        }
      };
      
      const mockCaptureResult = {
        result: {
          status: 'COMPLETED',
          purchase_units: [{
            payments: {
              captures: [{
                id: 'CAPTURE123',
                custom_id: JSON.stringify({ userId: 1, cartId: 1 })
              }]
            }
          }]
        }
      };
      
      // Setup mocks
      (paypal.orders.OrdersGetRequest as jest.Mock).mockImplementation(() => ({}));
      (paypal.orders.OrdersCaptureRequest as jest.Mock).mockImplementation(() => ({
        requestBody: jest.fn(),
      }));
      
      service['paypalClient'] = {
        execute: jest.fn()
          .mockResolvedValueOnce(mockOrderDetails)
          .mockResolvedValueOnce(mockCaptureResult)
      } as any;
      
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [{ product: { id: 1, stock: 5 }, quantity: 1, totalPrice: 10 }],
        totalPrice: 10,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      jest.spyOn(invoicesService, 'createInvoice').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(invoicesService, 'generateInvoicePDF').mockResolvedValue({ buffer: Buffer.from('') } as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      
      await service.capturePaypalPayment('ORDER123');
      
      expect(invoicesService.createInvoice).toHaveBeenCalled();
    });
  });
  
  describe('captureStripePayment', () => {
    it('should capture Stripe payment successfully', async () => {
      // Mock Stripe session
      const mockSession = {
        payment_status: 'paid',
        metadata: {
          userId: '1',
          cartId: '1'
        },
        payment_intent: 'pi_123'
      };
      
      service['stripe'] = {
        checkout: {
          sessions: {
            retrieve: jest.fn().mockResolvedValue(mockSession),
          },
        },
      } as any;
      
      const mockCart = {
        id: 1,
        user: { id: 1 },
        items: [{ product: { id: 1, stock: 5 }, quantity: 1, totalPrice: 10 }],
        totalPrice: 10,
      };
      
      jest.spyOn(service, 'getCart').mockResolvedValue(mockCart as any);
      jest.spyOn(invoicesService, 'createInvoice').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(invoicesService, 'generateInvoicePDF').mockResolvedValue({ buffer: Buffer.from('') } as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      
      await service.captureStripePayment('cs_123');
      
      expect(invoicesService.createInvoice).toHaveBeenCalled();
    });
  });

  describe('verifyCartId', () => {
    it('should verify cart belongs to JWT user', async () => {
      const mockCart = {
        id: 1,
        user: { id: 1 },
      };
      
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(authService, 'decodeJWT').mockResolvedValue({ sub: 1 });
      
      const result = await service.verifyCartId(1, 'valid-jwt');
      
      expect(result).toBe(true);
    });

    it('should throw if cart belongs to different user than JWT', async () => {
      const mockCart = {
        id: 1,
        user: { id: 1 },
      };
      
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(mockCart as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(authService, 'decodeJWT').mockResolvedValue({ sub: 2 });
      
      await expect(service.verifyCartId(1, 'different-user-jwt')).rejects.toThrow();
    });
  });
});
