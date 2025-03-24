import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponsService } from './coupons.service';
import { Coupon } from './coupon.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CouponsService', () => {
    let service: CouponsService;
    let couponRepository: Repository<Coupon>;
    let productRepository: Repository<Product>;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponsService,
                {
                    provide: getRepositoryToken(Coupon),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Product),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<CouponsService>(CouponsService);
        couponRepository = module.get<Repository<Coupon>>(getRepositoryToken(Coupon));
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create and return a coupon', async () => {
        const couponData = {
            code: 'TEST',
            discountType: 'PERCENTAGE' as const,
            discountValue: 10,
            isGlobal: true,
            usageLimit: 100,
            expiryDate: new Date(),
            productIds: [1, 2],
            userIds: [1, 2],
        };
    
        const products = [{ id: 1 }, { id: 2 }] as Product[];
        const users = [{ id: 1 }, { id: 2 }] as User[];
    
        jest.spyOn(productRepository, 'findByIds').mockResolvedValue(products);
        jest.spyOn(userRepository, 'findByIds').mockResolvedValue(users);
        jest.spyOn(couponRepository, 'create').mockReturnValue({
            ...couponData,
            products,
            users,
        } as any); // Mocking returned coupon object
        jest.spyOn(couponRepository, 'save').mockResolvedValue({
            ...couponData,
            products,
            users,
        } as any);
    
        const result = await service.createCoupon(couponData);
    
        expect(result).toEqual({
            ...couponData,
            products,
            users,
        });
        expect(productRepository.findByIds).toHaveBeenCalledWith([1, 2]);
        expect(userRepository.findByIds).toHaveBeenCalledWith([1, 2]);
        expect(couponRepository.create).toHaveBeenCalledWith({
            code: 'TEST',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            isGlobal: true,
            usageLimit: 100,
            expiryDate: couponData.expiryDate,
            products,
            users,
        });
        expect(couponRepository.save).toHaveBeenCalledWith({
            ...couponData,
            products,
            users,
        });
    });
    
    describe('getCouponByCode', () => {
        it('should return a coupon by code', async () => {
            const coupon = { code: 'TEST' } as Coupon;
            jest.spyOn(couponRepository, 'findOne').mockResolvedValue(coupon);

            const result = await service.getCouponByCode('TEST');

            expect(result).toEqual(coupon);
            expect(couponRepository.findOne).toHaveBeenCalledWith({
                where: { code: 'TEST' },
                relations: ['products'],
            });
        });

        it('should throw NotFoundException if coupon not found', async () => {
            jest.spyOn(couponRepository, 'findOne').mockResolvedValue(null);

            await expect(service.getCouponByCode('TEST')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getCouponById', () => {
        it('should return a coupon by id', async () => {
            const coupon = { id: 1 } as Coupon;
            jest.spyOn(couponRepository, 'findOne').mockResolvedValue(coupon);

            const result = await service.getCouponById(1);

            expect(result).toEqual(coupon);
            expect(couponRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['products', 'users'],
            });
        });

        it('should throw NotFoundException if coupon not found', async () => {
            jest.spyOn(couponRepository, 'findOne').mockResolvedValue(null);

            await expect(service.getCouponById(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllCoupons', () => {
        it('should return all coupons', async () => {
            const coupons = [{ id: 1 }, { id: 2 }] as Coupon[];
            jest.spyOn(couponRepository, 'find').mockResolvedValue(coupons);

            const result = await service.getAllCoupons();

            expect(result).toEqual(coupons);
            expect(couponRepository.find).toHaveBeenCalledWith({ relations: ['products', 'users'] });
        });
    });

    describe('updateCoupon', () => {
        it('should update and return a coupon', async () => {
            const coupon = { id: 1, code: 'TEST' } as Coupon;
            const updatedCoupon = { ...coupon, code: 'UPDATED' } as Coupon;
            jest.spyOn(service, 'getCouponById').mockResolvedValue(coupon);
            jest.spyOn(couponRepository, 'save').mockResolvedValue(updatedCoupon);

            const result = await service.updateCoupon(1, { code: 'UPDATED' });

            expect(result).toEqual(updatedCoupon);
            expect(service.getCouponById).toHaveBeenCalledWith(1);
            expect(couponRepository.save).toHaveBeenCalledWith(updatedCoupon);
        });
    });

    describe('deleteCoupon', () => {
        it('should delete a coupon', async () => {
            jest.spyOn(couponRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

            await service.deleteCoupon(1);

            expect(couponRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if coupon not found', async () => {
            jest.spyOn(couponRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

            await expect(service.deleteCoupon(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('applyCouponToUser', () => {
        it('should apply a coupon to a user', async () => {
            const coupon = { id: 1, isGlobal: true, users: [] } as Coupon;
            const user = { id: 1 } as User;
            jest.spyOn(service, 'getCouponById').mockResolvedValue(coupon);
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(couponRepository, 'save').mockResolvedValue(coupon);

            await service.applyCouponToUser(1, 1);

            expect(service.getCouponById).toHaveBeenCalledWith(1);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(couponRepository.save).toHaveBeenCalledWith({
                ...coupon,
                users: [user],
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            const coupon = { id: 1, isGlobal: true, users: [] } as Coupon;
            jest.spyOn(service, 'getCouponById').mockResolvedValue(coupon);
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(service.applyCouponToUser(1, 1)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if coupon already applied to user', async () => {
            const user = { id: 1 } as User;
            const coupon = { id: 1, isGlobal: false, users: [user] } as Coupon;
            jest.spyOn(service, 'getCouponById').mockResolvedValue(coupon);
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

            await expect(service.applyCouponToUser(1, 1)).rejects.toThrow(BadRequestException);
        });
    });
});