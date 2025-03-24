import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { createTransport } from 'nodemailer';
import { randomBytes } from 'crypto';
import { MailService } from '../utils/mail.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly esService: ElasticsearchService,
  ) {}
  // Register a new user

  async register(
    userData: Partial<User>,
  ): Promise<Omit<User, 'password' | 'role'>> {
    // Check if the email already exists
    const existingUser = await this.userRepository.findOneBy({
      email: userData.email,
    });

    // Throw an error if the email already exists
    if (existingUser) {
      this.esService.index({
        index: 'logs',
        body: {
          service: 'AuthService',
          message: `HTTP "POST" "/auth/register" responded 409`,
          content: userData.email,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new ConflictException(
        'Email already exists. Please use a different email.',
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'user', // Default role
    });

    // Save the user to the database
    const savedUser = await this.userRepository.save(newUser);

    // Exclude sensitive fields
    delete savedUser.password;
    delete savedUser.role;

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/auth/register" responded 201`,
        content: savedUser.email,
        level: 'Information',
        timestamp: new Date(),
      },
    });

    // Return the user without the password and role
    return savedUser;
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    // Check if the user exists and the password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/auth/login" responded 401`,
        content: `Email: ${email}`,
        level: 'Error',
        timestamp: new Date(),
      },
    });
    throw new UnauthorizedException('Invalid credentials');
  }

  // Log in a user and return a JWT token
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role }; // JWT Payload
    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/auth/login" responded 200`,
        content: `User ${user.id} logged in`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    return {
      access_token: this.jwtService.sign(payload), // Return token only
      id: user.id,
    };
  }
  // Initiate password reset by providing an email address with a reset token
  async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist.');
    }
    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/auth/forgot-password" responded 200`,
        content: `User ${user.id} forgot password`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await this.userRepository.save(user);
    const resetUrl = `http://localhost:3000/reset-password/?token=${resetToken}`;

    if (process.env.NODE_ENV === 'development') {
      try {
        // Send email using Nodemailer
        const transporter = createTransport({
          host: 'mailhog',
          port: 1025, // Adjust if you have different setup
        });

        await transporter.sendMail({
          from: 'support@example.com',
          to: email,
          subject: 'Reset Your Password',
          text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
        });
      } catch (error) {
        this.esService.index({
          index: 'logs',
          body: {
            message: `HTTP "POST" "/auth/forgot-password" responded 500`,
            content: `Error sending email: ${error.message}`,
            level: 'Error',
            timestamp: new Date(),
          },
        });
      }
    } else {
      try {
        await this.mailService.sendResetPasswordEmail(email, resetUrl);
      } catch (error) {
        this.esService.index({
          index: 'logs',
          body: {
            message: `HTTP "POST" "/auth/forgot-password" responded 500`,
            content: `Error sending email: ${error.message}`,
            level: 'Error',
            timestamp: new Date(),
          },
        });
      }
    }

    return 'Password reset email sent.';
  }

  // Reset password using a reset token and new password
  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Find user by reset token
    const user = await this.userRepository.findOne({
      where: { resetToken, resetTokenExpiry: MoreThan(new Date()) },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    // Save the user
    await this.userRepository.save(user);
    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/auth/reset-password" responded 200`,
        content: `User ${user.id} reset password`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    return { message: 'Password reset successfully.' };
  }

  async decodeJWT(JWT: string): Promise<any> {
    return this.jwtService.decode(JWT);
  }
}
