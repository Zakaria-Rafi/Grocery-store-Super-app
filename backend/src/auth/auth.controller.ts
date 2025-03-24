// Purpose: Controller for the authentication routes.
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication') // Group all routes under the "Authentication" tag
@Controller('auth')

// Purpose: Controller for the authentication routes.
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }
  // Purpose: Get the current authenticated user
  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiBearerAuth() // Indicates the need for a bearer token
  @UseGuards(JwtAuthGuard)
  async getConnectedUser(@Request() req: any): Promise<User> {
    const userId = req.user.id;
    return this.usersService.getUserById(userId);
  }
  // Purpose: Update the current user's password
  @Put('me/password')
  @ApiOperation({ summary: "Update the current user's password" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userIdNumber = parseInt(req.user.id, 10);
    return this.usersService
      .updatePasswordForUser(
        userIdNumber,
        updatePasswordDto.oldPassword,
        updatePasswordDto.newPassword,
      )
      .then(() => ({ message: 'Password updated successfully' }));
  }
  // Purpose: Register a new user
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<Omit<User, 'password' | 'role'>> {
    return plainToInstance(User, await this.authService.register(registerDto));
  }
  // Purpose: Log in a user and receive a JWT token
  @Post('login')
  @ApiOperation({ summary: 'Log in a user and receive a JWT token' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }
  // Purpose: Initiate password reset by providing an email address
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Initiate password reset by providing an email address',
  })
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' } } },
  })
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.forgotPassword(email);
  }
  // Purpose: Reset a password using a reset token and new password
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset a password using a reset token and new password',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resetToken: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })

  // resetPassword method that takes a resetToken and newPassword as parameters
  // and calls the authService.resetPassword method with these parameters.
  async resetPassword(
    @Body('resetToken') resetToken: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!resetToken || !newPassword) {
      throw new BadRequestException(
        'Reset token and new password are required',
      );
    }
    return this.authService.resetPassword(resetToken, newPassword);
  }
}
