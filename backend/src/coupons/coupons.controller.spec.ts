import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { NotFoundException } from '@nestjs/common';

describe('CouponController', () => {
  let couponController: CouponController;

  const mockCouponsService = {
    createCoupon: jest.fn(),
    getAllCoupons: jest.fn(),
    getCouponById: jest.fn(),
    getCouponByCode: jest.fn(),
    updateCoupon: jest.fn(),
    deleteCoupon: jest.fn(),
    applyCouponToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponsService,
          useValue: mockCouponsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    couponController = module.get<CouponController>(CouponController);
  });

  it('should be defined', () => {
    expect(couponController).toBeDefined();
  });

  describe('createCoupon', () => {
    it('should create a coupon and return it', async () => {
      const couponDto = {
        code: 'DISCOUNT10',
        discountType: 'PERCENTAGE' as 'PERCENTAGE'|'FIXED',
        discountValue: 10,
        isGlobal: true,
        usageLimit: 100,
        expiryDate: new Date(),
        productIds: [],
        userIds: [],
      };
      const createdCoupon = { id: 1, ...couponDto };

      mockCouponsService.createCoupon.mockResolvedValue(createdCoupon);

      expect(
        await couponController.createCoupon(
          couponDto.code,
          couponDto.discountType,
          couponDto.discountValue,
          couponDto.isGlobal,
          couponDto.usageLimit,
          couponDto.expiryDate,
          couponDto.productIds,
          couponDto.userIds,
        ),
      ).toEqual(createdCoupon);
      expect(mockCouponsService.createCoupon).toHaveBeenCalledWith(couponDto);
    });
  });

  describe('getAllCoupons', () => {
    it('should return all coupons', async () => {
      const coupons = [{ id: 1, code: 'DISCOUNT10' }, { id: 2, code: 'SAVE20' }];

      mockCouponsService.getAllCoupons.mockResolvedValue(coupons);

      expect(await couponController.getAllCoupons()).toEqual(coupons);
      expect(mockCouponsService.getAllCoupons).toHaveBeenCalled();
    });
  });

  describe('getCouponById', () => {
    it('should return a coupon if found', async () => {
      const coupon = { id: 1, code: 'DISCOUNT10' };

      mockCouponsService.getCouponById.mockResolvedValue(coupon);

      expect(await couponController.getCouponById(1)).toEqual(coupon);
      expect(mockCouponsService.getCouponById).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if the coupon is not found', async () => {
      mockCouponsService.getCouponById.mockResolvedValue(null);

      await expect(couponController.getCouponById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCouponByCode', () => {
    it('should return a coupon if found by code', async () => {
      const coupon = { id: 1, code: 'DISCOUNT10' };

      mockCouponsService.getCouponByCode.mockResolvedValue(coupon);

      expect(await couponController.getCouponByCode('DISCOUNT10')).toEqual(coupon);
      expect(mockCouponsService.getCouponByCode).toHaveBeenCalledWith('DISCOUNT10');
    });
  });

  describe('updateCoupon', () => {
    it('should update a coupon and return the updated value', async () => {
      const updatedCoupon = { id: 1, code: 'NEWCODE' };

      mockCouponsService.updateCoupon.mockResolvedValue(updatedCoupon);

      expect(await couponController.updateCoupon(1, 'NEWCODE')).toEqual(updatedCoupon);
      expect(mockCouponsService.updateCoupon).toHaveBeenCalledWith(1, {
        code: 'NEWCODE',
      });
    });
  });

  describe('deleteCoupon', () => {
    it('should delete a coupon and return a success message', async () => {
      mockCouponsService.deleteCoupon.mockResolvedValue(undefined);

      expect(await couponController.deleteCoupon(1)).toEqual({ message: 'Coupon deleted successfully' });
      expect(mockCouponsService.deleteCoupon).toHaveBeenCalledWith(1);
    });
  });

  describe('applyCouponToUser', () => {
    it('should apply a coupon to a user and return a success message', async () => {
      mockCouponsService.applyCouponToUser.mockResolvedValue(undefined);

      expect(await couponController.applyCouponToUser(1, 42)).toEqual({
        message: 'Coupon applied to user successfully',
      });
      expect(mockCouponsService.applyCouponToUser).toHaveBeenCalledWith(42, 1);
    });
  });
});
