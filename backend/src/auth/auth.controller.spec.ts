// Jest test for the auth controller
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            login: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockUser = new User();
      Object.assign(mockUser, {
        id: 1,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      jest.spyOn(authService, 'register').mockResolvedValue(mockUser);

      const response = await controller.register(registerDto);
      expect(response).toMatchObject({
        id: 1,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const token = 'token';
      jest.spyOn(authService, 'validateUser').mockResolvedValue(new User());
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: token, id: 1 });

      const result = await controller.login(loginDto);
      expect(result).toEqual({ access_token: token, id: 1 });
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const mockUser = { id: 2, email: 'test@test.com' };
      jest
        .spyOn(usersService, 'getUserById')
        .mockResolvedValue(mockUser as any);

      const req = { user: { id: 2 } };
      const result = await controller.getConnectedUser(req);
      expect(result).toEqual(mockUser);
      expect(usersService.getUserById).toHaveBeenCalledWith(2);
    });
  });

  describe('forgotPassword', () => {
    it('should throw an error if email is not provided', async () => {
      await expect(controller.forgotPassword('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call forgotPassword service method', async () => {
      const email = 'test@test.com';
      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(undefined);

      await controller.forgotPassword(email);
      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
    });
  });

  describe('resetPassword', () => {
    it('should throw an error if resetToken or newPassword is not provided', async () => {
      await expect(controller.resetPassword('', 'newPassword')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.resetPassword('resetToken', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call resetPassword service method', async () => {
      const resetToken = 'resetToken';
      const newPassword = 'newPassword';
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(undefined);

      await controller.resetPassword(resetToken, newPassword);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetToken,
        newPassword,
      );
    });
  });
});
