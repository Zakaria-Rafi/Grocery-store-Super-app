import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly esService: ElasticsearchService,
  ) {}
  // create a new coupon
  async createCoupon(data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    isGlobal: boolean;
    usageLimit: number;
    expiryDate: Date;
    productIds?: number[];
    userIds?: number[];
  }): Promise<Coupon> {
    const { productIds, userIds, ...couponData } = data;

    const products = productIds
      ? await this.productRepository.findByIds(productIds)
      : [];
    const users = userIds ? await this.userRepository.findByIds(userIds) : [];

    const coupon = this.couponRepository.create({
      ...couponData,
      products,
      users,
    });

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/coupons/create" responded 200`,
        content: `Coupon created`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return this.couponRepository.save(coupon);
  }
  // get coupon by code
  async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['products'],
    });

    if (!coupon) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "GET" "/coupons/code/${code}" responded 404`,
          content: `Coupon with code ${code} not found.`,
          level: 'Error',
          timestamp: new Date().toISOString(),
        },
      });
      throw new NotFoundException(`Coupon with code ${code} not found.`);
    }

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "GET" "/coupons/code/${code}" responded 200`,
        content: `Coupon with code ${code} found.`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return coupon;
  }
  // get coupon by ID
  async getCouponById(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['products', 'users'],
    });

    if (!coupon) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "GET" "/coupons/${id}" responded 404`,
          content: `Coupon with ID ${id} not found.`,
          level: 'Error',
          timestamp: new Date().toISOString(),
        },
      });
      throw new NotFoundException(`Coupon with ID ${id} not found.`);
    }

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "GET" "/coupons/${id}" responded 200`,
        content: `Coupon with ID ${id} found.`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return coupon;
  }
  // get all
  async getAllCoupons(): Promise<Coupon[]> {
    const coupons = await this.couponRepository.find({
      relations: ['products', 'users'],
    });

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "GET" "/coupons" responded 200`,
        content: `All coupons found.`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return coupons;
  }
  // update coupon by ID
  async updateCoupon(
    id: number,
    data: {
      code?: string;
      discountType?: 'PERCENTAGE' | 'FIXED';
      discountValue?: number;
      isGlobal?: boolean;
      usageLimit?: number;
      expiryDate?: Date;
      productIds?: number[];
      userIds?: number[];
    },
  ): Promise<Coupon> {
    const coupon = await this.getCouponById(id);
    // update coupon data
    if (data.code) coupon.code = data.code;
    if (data.discountType) coupon.discountType = data.discountType;
    if (data.discountValue) coupon.discountValue = data.discountValue;
    if (data.isGlobal !== undefined) coupon.isGlobal = data.isGlobal;
    if (data.usageLimit) coupon.usageLimit = data.usageLimit;
    if (data.expiryDate) coupon.expiryDate = data.expiryDate;

    if (data.productIds) {
      const products = await this.productRepository.findByIds(data.productIds);
      coupon.products = products;
    }

    if (data.userIds) {
      const users = await this.userRepository.findByIds(data.userIds);
      coupon.users = users;
    }

    const updatedCoupon = await this.couponRepository.save(coupon);

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "PUT" "/coupons/${id}" responded 200`,
        content: `Coupon updated`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return updatedCoupon;
  }
  // delete coupon by ID
  async deleteCoupon(id: number): Promise<void> {
    const result = await this.couponRepository.delete(id);
    if (result.affected === 0) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "DELETE" "/coupons/${id}" responded 404`,
          content: `Coupon with ID ${id} not found.`,
          level: 'Error',
          timestamp: new Date().toISOString(),
        },
      });
      throw new NotFoundException(`Coupon with ID ${id} not found.`);
    }

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "DELETE" "/coupons/${id}" responded 200`,
        content: `Coupon with ID ${id} deleted.`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return;
  }
  // apply coupon to user by ID
  async applyCouponToUser(userId: number, couponId: number): Promise<void> {
    const coupon = await this.getCouponById(couponId);
    // get user by ID
    const user = await this.userRepository.findOne({ where: { id: userId } });
    // check if user exists
    if (!user) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/coupons/apply-to-user" responded 404`,
          content: `User with ID ${userId} not found.`,
          level: 'Error',
          timestamp: new Date().toISOString(),
        },
      });
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // check if coupon is already applied to user
    if (!coupon.isGlobal && coupon.users.some((u) => u.id === user.id)) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/coupons/apply-to-user" responded 400`,
          content: `Coupon already applied to this user.`,
          level: 'Error',
          timestamp: new Date().toISOString(),
        },
      });
      throw new BadRequestException('Coupon already applied to this user.');
    }
    // apply coupon to user
    coupon.users = [...(coupon.users || []), user];
    await this.couponRepository.save(coupon);

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/coupons/apply-to-user" responded 200`,
        content: `Coupon applied to user`,
        level: 'Information',
        timestamp: new Date().toISOString(),
      },
    });

    return;
  }
}
