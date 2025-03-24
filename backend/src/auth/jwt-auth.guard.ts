import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// Import the AuthGuard class from the passport package
// This class will be used to protect routes that require authentication
// The 'jwt' strategy will be used to authenticate users
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
