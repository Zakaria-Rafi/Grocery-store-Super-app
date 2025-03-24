import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Invoice } from '../invoices/invoice.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}
  // get all users
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
  // get user by ID
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }
 // get user by email
  async createUser(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    // Check if user already exists
    if (existingUser) {
      throw new ConflictException('User already exists.');
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }
  // update user by ID
  async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
    const user = await this.getUserById(userId);
    Object.assign(user, updateData);// merge the existing user with the new data
    return this.userRepository.save(user);
  }
  // delete user by ID
  async deleteUser(userId: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      // Delete all invoices for the user

      await this.invoiceRepository
        .createQueryBuilder()
        .delete()
        .from(Invoice)
        .where('userId = :userId', { userId })
        .execute();

      const result = await this.userRepository.delete(userId);
      // Check if the user was deleted
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error deleting user with ID ${userId}`,
      );
    }
  }
  // update password for user
  async updatePasswordForUser(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.getUserById(userId);
    // Check if the old password matches
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Wrong password');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
  // update password as admin
  async updatePasswordAsAdmin(
    userId: number,
    newPassword: string,
  ): Promise<void> {
    const user = await this.getUserById(userId);
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}
