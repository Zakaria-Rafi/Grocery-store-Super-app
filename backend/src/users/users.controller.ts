import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { InvoicesService } from '../invoices/invoices.service';

@ApiTags('Users') // Groups all routes under the "Users" tag in Swagger
@ApiBearerAuth() // Adds Bearer token authentication
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly invoicesService: InvoicesService
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAllUsers() {
    try {
      const users = await this.usersService.getAllUsers();
      
      const enrichedUsers = await Promise.all(users.map(async (user) => {
        try {
          const invoices = await this.invoicesService.getInvoicesByUser(user.id);
          
          // Vérifier que invoices est un tableau
          if (!Array.isArray(invoices)) {
            console.error(`Invalid invoices data for user ${user.id}:`, invoices);
            return {
              ...user,
              orderCount: 0,
              totalSpent: 0
            };
          }

          // Calculer le nombre total de commandes
          const orderCount = invoices.length;
          
          // Calculer le total des dépenses en vérifiant que amount est un nombre
          const totalSpent = invoices.reduce((sum, invoice) => {
            const amount = Number(invoice.amount) || 0;
            return sum + amount;
          }, 0);
          
          console.log(`User ${user.id} data:`, { orderCount, totalSpent, invoices }); // Debug log

          return {
            ...user,
            orderCount,
            totalSpent
          };
        } catch (error) {
          console.error(`Error processing invoices for user ${user.id}:`, error);
          return {
            ...user,
            orderCount: 0,
            totalSpent: 0
          };
        }
      }));

      return enrichedUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserById(@Param('id') userId: string, @Request() req: any) {
    const userIdNumber = parseInt(userId, 10);
    const reqUserIdNumber = parseInt(req.user.id, 10);
    if (reqUserIdNumber !== userIdNumber && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only access your own information');
    }
    return this.usersService.getUserById(userIdNumber);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  // Create a new user (admin only)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user\'s data by ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  // Update a user's data by ID (admin or user)
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const userIdNumber = parseInt(userId, 10);
    const reqUserIdNumber = parseInt(req.user.id, 10);
    if (reqUserIdNumber !== userIdNumber && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own information');
    }
    return this.usersService.updateUser(userIdNumber, updateUserDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Partially update a user\'s data by ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  // Partially update a user's data by ID (admin or user)
  async patchUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const userIdNumber = parseInt(userId, 10);
    const reqUserIdNumber = parseInt(req.user.id, 10);
    if (reqUserIdNumber !== userIdNumber && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own information');
    }
    return this.usersService.updateUser(userIdNumber, updateUserDto);
  }

  @Put(':id/admin-password')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user\'s password as admin' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully by admin' })
  // Update a user's password as admin
  async updatePasswordAsAdmin(
    @Param('id') userId: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    const userIdNumber = parseInt(userId, 10);
    return this.usersService
      .updatePasswordAsAdmin(userIdNumber, newPassword)
      .then(() => ({ message: 'Password updated successfully by admin' }));
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID (admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  // delete user by ID (admin only)
  async deleteUser(@Param('id') userId: string) {
    const userIdNumber = parseInt(userId, 10);
    return this.usersService.deleteUser(userIdNumber);
  }
}
