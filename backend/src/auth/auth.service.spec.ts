const mockSendMail = jest.fn().mockResolvedValue(true);
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
});

jest.mock('nodemailer', () => ({
  createTransport: mockCreateTransport,
}));
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { MailService } from '../utils/mail.service';
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test_token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendResetPasswordEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = { email: 'test1@example.com', password: 'test1234' };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(userData as User);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...userData, id: 1 } as User);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');

      const result = await service.register(userData);

      expect(result).toEqual({ email: 'test1@example.com', id: 1 });
    });

    it('should throw conflict exception if email already exists', async () => {
      const userData = { email: 'test1@example.com', password: 'test1234' };
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(userData as User);

      await expect(service.register(userData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user credentials', async () => {
      const user = {
        email: 'test1@example.com',
        password: 'hashed_password',
      } as User;
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(
        'test1@example.com',
        'test1234',
      );

      expect(result).toEqual(user);
    });

    it('should throw unauthorized exception if credentials are invalid', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.validateUser('test1@example.com', 'test1234'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token and user id', async () => {
      const user = { email: 'test1@example.com', id: 1, role: 'user' } as User;
      const result = await service.login(user);

      expect(result).toEqual({ access_token: 'test_token', id: 1 });
    });
  });

  jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true),
    }),
  }));

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const user = {
        email: 'test1@example.com',
        resetToken: 'token',
        resetTokenExpiry: new Date(),
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.forgotPassword('test1@example.com');

      expect(result).toBe('Password reset email sent.');
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset the password', async () => {
      const user = {
        resetToken: 'valid_token',
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new_hashed_password');
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.resetPassword('valid_token', 'new_password');

      expect(result).toEqual({ message: 'Password reset successfully.' });
    });

    it('should throw bad request exception if token is invalid or expired', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid_token', 'new_password'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
