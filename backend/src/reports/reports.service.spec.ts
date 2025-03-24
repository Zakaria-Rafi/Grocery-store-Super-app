import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { Product } from '../products/product.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceProduct } from '../invoices/invoice-product.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let invoiceRepository: Repository<Invoice>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({}),
    andWhere: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(InvoiceProduct),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTotalSales', () => {
    it('should return total sales', async () => {
      mockQueryBuilder.select.mockReset();
      mockQueryBuilder.addSelect.mockReset();
      mockQueryBuilder.where.mockReset();
      mockQueryBuilder.getRawMany.mockReset();
      mockQueryBuilder.getRawOne.mockReset();
      mockQueryBuilder.groupBy.mockReset();

      const mockRawResult = [
        {
          period: '2024-01-01',
          totalSales: 1000,
        },
      ];

      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.addSelect.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.leftJoin.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.groupBy.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRawResult);

      const result = await service.getTotalSalesAggregated(
        '2024-01-01',
        '2024-01-31',
      );

      const expectedResult = [
        {
          period: '2024-01',
          totalSales: 1000,
        },
      ];

      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.groupBy).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity', async () => {
      const userActivityMock = [
        { firstName: 'John', lastName: 'Doe', invoiceCount: 5 },
        { firstName: 'Jane', lastName: 'Smith', invoiceCount: 3 },
      ];
      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(userActivityMock),
      } as any);

      const result = await service.getUserActivity();
      expect(result).toEqual(userActivityMock);
    });
  });

  describe('getTopProducts', () => {
    it('should return top products', async () => {
      const topProductsMock = [
        { name: 'Product A', quantity: 10, price: 100 },
        { name: 'Product B', quantity: 8, price: 80 },
      ];
      mockQueryBuilder.getRawMany.mockReset();
      mockQueryBuilder.getRawMany.mockResolvedValue(topProductsMock);

      const result = await service.getTopProductsOfTheCurrentWeek();
      expect(result).toEqual(topProductsMock);
    });
  });
});
