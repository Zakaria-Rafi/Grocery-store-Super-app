import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceProduct } from '../invoices/invoice-product.entity';
import { Product } from '../products/product.entity';
import { Roles } from '../auth/roles.decorator';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceProduct)
    private readonly invoiceProductRepository: Repository<InvoiceProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Roles('admin')
  // Get user activity
  async getUserActivity() {
    const userActivity = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.user', 'user')
      .select('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('COUNT(invoice.id)', 'invoiceCount')
      .groupBy('user.id')
      .getRawMany();

    return userActivity;
  }

  @Roles('admin')
  // Get total sales
  async soonOutOfStock() {
    const soonOutOfStock = await this.productRepository
      .createQueryBuilder('product')
      .select('product.name', 'name')
      .addSelect('product.id', 'id')
      .addSelect('product.imagesUrl', 'imagesUrl')
      .addSelect('product.stock', 'stock')
      .where('product.stock < 10')
      .limit(5)
      .getRawMany();

    return soonOutOfStock;
  }

  @Roles('admin')
  // Get top products of the current week
  async getTopProductsOfTheCurrentWeek() {
    const now = new Date();
    const firstDayOfWeek = new Date(
      now.setDate(now.getDate() - now.getDay() + 1),
    );
    const lastDayOfWeek = new Date(now.setDate(firstDayOfWeek.getDate() + 6));

    const topProducts = await this.invoiceProductRepository
      .createQueryBuilder('invoiceProduct')
      .leftJoin('invoiceProduct.invoice', 'invoice')
      .leftJoinAndSelect('invoiceProduct.product', 'product')
      .select('product.name', 'name')
      .addSelect('product.imagesUrl', 'imagesUrl')
      .addSelect('product.id', 'id')
      .addSelect('SUM(invoiceProduct.quantity)', 'quantity')
      .addSelect('SUM(product.price * invoiceProduct.quantity)', 'totalRevenue')
      .where('invoice.created_at BETWEEN :start AND :end', {
        start: firstDayOfWeek,
        end: lastDayOfWeek,
      })
      .groupBy('product.id')
      .orderBy('quantity', 'DESC')
      .limit(5)
      .getRawMany();

    return topProducts;
  }

  @Roles('admin')
  // Get detailed orders of the current day
  async getDetailedOrdersToday() {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const detailedOrdersToday = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.user', 'user')
      .leftJoin('invoice.products', 'invoiceProduct')
      .leftJoin('invoiceProduct.product', 'product')
      .select([
        'user.firstName',
        'user.lastName',
        'invoice.id',
        'invoice.created_at',
        'SUM(invoiceProduct.quantity) AS totalQuantity',
        'SUM(product.price * invoiceProduct.quantity) AS totalAmount',
      ])
      .where('invoice.created_at >= :start AND invoice.created_at <= :end', {
        start: todayMidnight,
        end: todayEnd,
      })
      .groupBy('invoice.id')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .limit(5)
      .orderBy('invoice.created_at', 'DESC')
      .getRawMany();

    return detailedOrdersToday;
  }

  @Roles('admin')
  // Get total sales
  async getTotalSalesAggregated(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      startDate = new Date(
        new Date().setDate(new Date().getDate() - 60),
      ).toISOString();
      endDate = new Date().toISOString();
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const granularity = this.determineGranularity(start, end);

    let groupBy: string;
    let format: string;

    switch (granularity) {
      case 'month':
        groupBy = "DATE_TRUNC('month', invoice.created_at)";
        format = 'YYYY-MM';
        break;
      case 'week':
        groupBy = "DATE_TRUNC('week', invoice.created_at)";
        format = 'YYYY-WW';
        break;
      case 'day':
      default:
        groupBy = "DATE_TRUNC('day', invoice.created_at)::date";
        format = 'YYYY-MM-DD';
        break;
    }
    // Get total sales aggregated
    const salesData = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select(`TO_CHAR(${groupBy}, '${format}')`, 'period')
      .addSelect('SUM(invoice.amount)', 'totalSales')
      .where('invoice.created_at >= :start AND invoice.created_at <= :end', {
        start: start.toISOString(),
        end: end.toISOString(),
      })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // Normalize the data
    const normalizedSalesData = salesData.map((item) => {
      const [year, month] = item.period.split('-');
      return {
        period: `${year}-${month.padStart(2, '0')}`,
        totalSales: item.totalSales,
      };
    });

    return normalizedSalesData;
  }

  @Roles('admin')
  // Get total quantity sold by category
  async getTotalQuantitySoldByCategory(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      startDate = new Date(
        new Date().setDate(new Date().getDate() - 650),
      ).toISOString();
      endDate = new Date().toISOString();
    }

    let totalQuantitySoldByCategory = await this.invoiceProductRepository
      .createQueryBuilder('invoiceProduct')
      .leftJoin('invoiceProduct.invoice', 'invoice')
      .leftJoin('invoiceProduct.product', 'product')
      .leftJoin('product.categories', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(invoiceProduct.quantity)', 'totalQuantity')
      .where('invoice.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('category.name')
      .getRawMany();

    totalQuantitySoldByCategory = totalQuantitySoldByCategory.filter(
      (item) => item.category !== null,
    );

    const totalSold = totalQuantitySoldByCategory.reduce(
      (acc, item) => acc + item.totalQuantity,
      0,
    );

    return {
      totalSold,
      categories: totalQuantitySoldByCategory,
    };
  }

  @Roles('admin')
  // Get total quantity sold aggregated
  async getTotalQuantitySoldAggregated(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      startDate = new Date(
        new Date().setDate(new Date().getDate() - 650),
      ).toISOString();
      endDate = new Date().toISOString();
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const granularity = this.determineGranularity(start, end);

    let groupBy: string;
    let format: string;

    switch (granularity) {
      case 'month':
        groupBy = "DATE_TRUNC('month', invoice.created_at)";
        format = 'YYYY-MM';
        break;
      case 'week':
        groupBy = "DATE_TRUNC('week', invoice.created_at)";
        format = 'YYYY-WW';
        break;
      case 'day':
      default:
        groupBy = "DATE_TRUNC('day', invoice.created_at)::date";
        format = 'YYYY-MM-DD';
        break;
    }

    const quantityData = await this.invoiceProductRepository
      .createQueryBuilder('invoiceProduct')
      .leftJoin('invoiceProduct.invoice', 'invoice')
      .select(`TO_CHAR(${groupBy}, '${format}')`, 'period')
      .addSelect('SUM(invoiceProduct.quantity)', 'totalQuantitySold')
      .where('invoice.created_at >= :start AND invoice.created_at <= :end', {
        start: start.toISOString(),
        end: end.toISOString(),
      })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return quantityData;
  }
  // Determine granularity based on the date range
  private determineGranularity(
    startDate: Date,
    endDate: Date,
  ): 'day' | 'week' | 'month' {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 60) {
      return 'month';
    } else if (diffDays > 7) {
      return 'week';
    } else {
      return 'day';
    }
  }
}
