import { SetMetadata } from '@nestjs/common';

export const HasRoles = (...roles: String[]) => SetMetadata('roles', roles);
