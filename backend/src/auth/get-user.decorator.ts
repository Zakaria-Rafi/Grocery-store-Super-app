import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Partial<User> => {
    const request = ctx.switchToHttp().getRequest();// Get the request object from the context
    const { firstName, lastName, email } = request.user;// Get the user object from the request
    return { firstName, lastName, email }; // Return only firstName, lastName, and email
  },
);