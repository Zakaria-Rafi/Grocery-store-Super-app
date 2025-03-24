import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Invoice } from '../invoices/invoice.entity';
import { MailService } from 'src/utils/mail.service';
import { SearchModule } from 'src/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    PassportModule,
    SearchModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is not set.');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    TypeOrmModule.forFeature([User, Invoice]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
