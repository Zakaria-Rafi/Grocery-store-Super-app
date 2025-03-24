import { SetMetadata } from '@nestjs/common';
//roles managments for the user
export const Roles = (...roles: string[]) => SetMetadata('role', roles);
