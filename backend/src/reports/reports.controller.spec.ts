import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let reportsController: ReportsController;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getTotalSalesAggregated: jest.fn(),
            getTotalQuantitySoldAggregated: jest.fn(),
            getUserActivity: jest.fn(),
            getTopProductsOfTheCurrentWeek: jest.fn(),
          },
        },
      ],
    }).compile();

    reportsController = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(reportsController).toBeDefined();
  });

  describe('getTotalSales', () => {
    it('should return total sales when the service returns a value', async () => {
      const result = { totalSales: 1000 };
      (reportsService.getTotalSalesAggregated as jest.Mock).mockResolvedValue(
        result,
      );

      expect(
        await reportsController.getTotalSalesBetweenDates(
          '2024-01-01',
          '2024-01-31',
        ),
      ).toBe(result);
      expect(reportsService.getTotalSalesAggregated).toHaveBeenCalled();
    });

    it('should handle errors when the service throws an exception', async () => {
      (reportsService.getTotalSalesAggregated as jest.Mock).mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        reportsController.getTotalSalesBetweenDates('2024-01-01', '2024-01-31'),
      ).rejects.toThrow('Service error');
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity when the service returns a value', async () => {
      const result = [{ userId: 1, activity: 'login' }];
      (reportsService.getUserActivity as jest.Mock).mockResolvedValue(result);

      expect(await reportsController.getUserActivity()).toBe(result);
      expect(reportsService.getUserActivity).toHaveBeenCalled();
    });

    it('should handle errors when the service throws an exception', async () => {
      (reportsService.getUserActivity as jest.Mock).mockRejectedValue(
        new Error('Service error'),
      );

      await expect(reportsController.getUserActivity()).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getTopProducts', () => {
    it('should return top products when the service returns a value', async () => {
      const result = [{ productId: 1, sales: 100 }];
      (
        reportsService.getTopProductsOfTheCurrentWeek as jest.Mock
      ).mockResolvedValue(result);

      expect(await reportsController.getTopProductsOfTheCurrentWeek()).toEqual(
        result,
      ); // Expect the array directly
      expect(reportsService.getTopProductsOfTheCurrentWeek).toHaveBeenCalled();
    });

    it('should handle errors when the service throws an exception', async () => {
      (
        reportsService.getTopProductsOfTheCurrentWeek as jest.Mock
      ).mockRejectedValue(new Error('Service error'));

      await expect(
        reportsController.getTopProductsOfTheCurrentWeek(),
      ).rejects.toThrow('Service error');
    });
  });
});
