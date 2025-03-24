import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InvoicesService } from '../invoices/invoices.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    updatePasswordAsAdmin: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockInvoicesService = {
    getInvoicesByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: InvoicesService, useValue: mockInvoicesService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return enriched users list with order counts and total spent', async () => {
      const mockUsers = [{ id: 1, name: 'Test User' }];
      const mockInvoices = [{ amount: 100 }, { amount: 200 }];

      mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
      mockInvoicesService.getInvoicesByUser.mockResolvedValue(mockInvoices);

      const result = await controller.getAllUsers();

      expect(result).toEqual([
        {
          id: 1,
          name: 'Test User',
          orderCount: 2,
          totalSpent: 300,
        },
      ]);
    });

    it('should handle errors when fetching invoices', async () => {
      const mockUsers = [{ id: 1, name: 'Test User' }];

      mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
      mockInvoicesService.getInvoicesByUser.mockRejectedValue(new Error());

      const result = await controller.getAllUsers();

      expect(result).toEqual([
        {
          id: 1,
          name: 'Test User',
          orderCount: 0,
          totalSpent: 0,
        },
      ]);
    });
  });

  describe('getUserById', () => {
    it('should allow users to get their own data', async () => {
      const userId = '1';
      const req = { user: { id: '1', role: 'user' } };

      mockUsersService.getUserById.mockResolvedValue({
        id: 1,
        name: 'Test User',
      });

      await controller.getUserById(userId, req);

      expect(usersService.getUserById).toHaveBeenCalledWith(1);
    });

    it('should allow admin to get any user data', async () => {
      const userId = '2';
      const req = { user: { id: '1', role: 'admin' } };

      mockUsersService.getUserById.mockResolvedValue({
        id: 2,
        name: 'Test User',
      });

      await controller.getUserById(userId, req);

      expect(usersService.getUserById).toHaveBeenCalledWith(2);
    });

    it('should throw ForbiddenException for non-admin accessing other user data', async () => {
      const userId = '2';
      const req = { user: { id: '1', role: 'user' } };

      await expect(controller.getUserById(userId, req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      };

      await controller.createUser(createUserDto);

      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should allow users to update their own data', async () => {
      const userId = '1';
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@test.com',
        phoneNumber: '+1234567890',
      };
      const req = { user: { id: '1', role: 'user' } };

      await controller.updateUser(userId, updateUserDto, req);

      expect(usersService.updateUser).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw ForbiddenException for non-admin updating other user data', async () => {
      const userId = '2';
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@test.com',
        phoneNumber: '+1234567890',
      };
      const req = { user: { id: '1', role: 'user' } };

      await expect(
        controller.updateUser(userId, updateUserDto, req),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePasswordAsAdmin', () => {
    it('should update user password as admin', async () => {
      const userId = '1';
      const newPassword = 'newPassword123';

      mockUsersService.updatePasswordAsAdmin.mockResolvedValue(undefined);

      const result = await controller.updatePasswordAsAdmin(
        userId,
        newPassword,
      );

      expect(result).toEqual({
        message: 'Password updated successfully by admin',
      });
      expect(usersService.updatePasswordAsAdmin).toHaveBeenCalledWith(
        1,
        newPassword,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '1';

      await controller.deleteUser(userId);

      expect(usersService.deleteUser).toHaveBeenCalledWith(1);
    });
  });
});
