import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Invoice } from '../invoices/invoice.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInvoiceRepository = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      const users = [{ id: 1, email: 'test@test.com' }];
      mockUserRepository.find.mockResolvedValue(users);
      expect(await service.getAllUsers()).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return a user', async () => {
      const user = { id: 1, email: 'test@test.com' };
      mockUserRepository.findOne.mockResolvedValue(user);
      expect(await service.getUserById(1)).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = { email: 'new@test.com', password: 'password' };
      const hashedPassword = 'hashedPassword';
      mockUserRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.create.mockReturnValue({
        ...userData,
        password: hashedPassword,
      });
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        ...userData,
        password: hashedPassword,
      });

      const result = await service.createUser(userData);
      expect(result.password).toBe(hashedPassword);
    });

    it('should throw ConflictException if user exists', async () => {
      const userData = { email: 'existing@test.com', password: 'password' };
      mockUserRepository.findOne.mockResolvedValue({ id: 1, ...userData });
      await expect(service.createUser(userData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const user = { id: 1, email: 'test@test.com' };
      const updateData = { email: 'updated@test.com' };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, ...updateData });

      const result = await service.updateUser(1, updateData);
      expect(result.email).toBe(updateData.email);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and related invoices', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteUser(1);
      expect(mockInvoiceRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePasswordForUser', () => {
    it('should update password when old password is correct', async () => {
      const user = { id: 1, password: 'hashedOldPassword' };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedNewPassword' as never);

      await service.updatePasswordForUser(1, 'oldPassword', 'newPassword');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when old password is incorrect', async () => {
      const user = { id: 1, password: 'hashedOldPassword' };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.updatePasswordForUser(1, 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updatePasswordAsAdmin', () => {
    it('should update password without old password check', async () => {
      const user = { id: 1, password: 'oldPassword' };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedNewPassword' as never);

      await service.updatePasswordAsAdmin(1, 'newPassword');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
