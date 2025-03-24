import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoicesModule } from '../invoices/invoices.module';
import { MailService } from '../utils/mail.service';
@Module({
  imports: [TypeOrmModule.forFeature([User, Invoice]), InvoicesModule],
  providers: [UsersService, MailService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
