import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports') // Groups all endpoints under the "Reports" category in Swagger
@Controller('reports')
@UseGuards(JwtAuthGuard)
@Roles('admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('total-sales')
  @ApiOperation({ summary: 'Get total sales report' })
  @ApiResponse({
    status: 200,
    description: 'Total sales report retrieved successfully',
    schema: {
      example: {
        totalSales: 12345,
        totalRevenue: 67890,
      },
    },
  })
  getTotalSalesBetweenDates(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getTotalSalesAggregated(startDate, endDate);
  }

  @Get('total-quantity-sold')
  @ApiOperation({ summary: 'Get total quantity sold report' })
  @ApiResponse({
    status: 200,
    description: 'Total quantity sold report retrieved successfully',
    schema: {
      example: [
        {
          productName: 'Product A',
          totalQuantitySold: 100,
        },
        {
          productName: 'Product B',
          totalQuantitySold: 80,
        },
      ],
    },
  })
  getTotalQuantitySoldBetweenDates(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getTotalQuantitySoldAggregated(
      startDate,
      endDate,
    );
  }

  @Get('total-quantity-sold-by-category')
  getTotalQuantitySoldByCategory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getTotalQuantitySoldByCategory(
      startDate,
      endDate,
    );
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity report' })
  @ApiResponse({
    status: 200,
    description: 'User activity report retrieved successfully',
    schema: {
      example: {
        activeUsers: 120,
        newUsers: 15,
        inactiveUsers: 5,
      },
    },
  })
  getUserActivity() {
    return this.reportsService.getUserActivity();
  }

  @Get('top-products-of-the-current-week')
  @ApiOperation({
    summary: 'Get top-performing products of the current week report',
  })
  @ApiResponse({
    status: 200,
    description: 'Top products report retrieved successfully',
    schema: {
      example: [
        { productName: 'Product A', unitsSold: 100, revenue: 5000 },
        { productName: 'Product B', unitsSold: 80, revenue: 4000 },
        { productName: 'Product C', unitsSold: 60, revenue: 3000 },
      ],
    },
  })
  getTopProductsOfTheCurrentWeek() {
    return this.reportsService.getTopProductsOfTheCurrentWeek();
  }

  @Get('soon-out-of-stock')
  getSoonOutOfStock() {
    return this.reportsService.soonOutOfStock();
  }

  @Get('orders-today')
  getOrdersToday() {
    return this.reportsService.getDetailedOrdersToday();
  }
}
