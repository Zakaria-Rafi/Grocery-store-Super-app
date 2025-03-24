import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { Invoice } from './invoice.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { InvoiceProduct } from './invoice-product.entity';
import { RefundItem } from './RefundItem.entity';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';
import { NotFoundException } from '@nestjs/common';

describe('InvoicesService', () => {
  let service: InvoicesService;

  const mockInvoiceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const mockInvoiceProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockRefundItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockStripeService = {
    createRefund: jest.fn(),
  };

  const mockPayPalService = {
    createRefund: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(InvoiceProduct),
          useValue: mockInvoiceProductRepository,
        },
        {
          provide: getRepositoryToken(RefundItem),
          useValue: mockRefundItemRepository,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: PayPalService,
          useValue: mockPayPalService,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices', async () => {
      const mockInvoices = [{ id: 1 }, { id: 2 }];
      mockInvoiceRepository.find.mockResolvedValue(mockInvoices);

      const result = await service.getAllInvoices();
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice if found', async () => {
      const mockInvoice = { id: 1 };
      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.getInvoiceById(1);
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.getInvoiceById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createInvoice', () => {
    it('should create invoice successfully', async () => {
      const mockUser = { id: 1 };
      const mockProducts = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, price: 100 };
      const mockInvoice = { id: 1, user: mockUser };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(mockInvoice);
      mockInvoiceProductRepository.create.mockReturnValue({});
      mockInvoiceProductRepository.save.mockResolvedValue({});

      const result = await service.createInvoice(
        1,
        mockProducts,
        'PENDING',
        200,
        null,
        'STRIPE',
        'pi_123',
      );

      expect(result).toEqual(mockInvoice);
    });
  });

  describe('processFullRefund', () => {
    it('should process full refund successfully', async () => {
      const mockInvoice = {
        id: 1,
        amount: 100,
        paimentmethod: 'STRIPE',
        PaymentIntentId: 'pi_123',
        products: [{ product: { id: 1 }, quantity: 1 }],
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
      mockStripeService.createRefund.mockResolvedValue({ refundId: 're_123' });
      mockRefundItemRepository.create.mockReturnValue({});
      mockRefundItemRepository.save.mockResolvedValue({});
      mockInvoiceRepository.save.mockResolvedValue({ ...mockInvoice, status: 'REFUNDED' });

      const result = await service.processFullRefund(1);
      expect(result.status).toBe('REFUNDED');
    });
  });

  describe('processPartialRefund', () => {
    it('should process partial refund successfully', async () => {
      const mockInvoice = {
        id: 1,
        amount: 200,
        paimentmethod: 'STRIPE',
        PaymentIntentId: 'pi_123',
        products: [
          { product: { id: 1 }, quantity: 2, price: 100 },
        ],
        refundedAmount: 0,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
      mockStripeService.createRefund.mockResolvedValue({ refundId: 're_123' });
      mockRefundItemRepository.create.mockReturnValue({});
      mockRefundItemRepository.save.mockResolvedValue({});
      mockInvoiceRepository.save.mockResolvedValue({ 
        ...mockInvoice, 
        status: 'PARTIALLY_REFUNDED',
        refundedAmount: 100 
      });

      const result = await service.processPartialRefund(1, [{ productId: 1, quantity: 1 }]);
      expect(result.status).toBe('PARTIALLY_REFUNDED');
    });
  });
});