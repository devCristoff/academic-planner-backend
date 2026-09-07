import { SetMetadata } from '@nestjs/common';
import { Role } from '@/src/common/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Marks a route (or controller) as requiring one of the given roles.
 * Must be combined with `RolesGuard` (after `JwtAuthGuard`) to be enforced.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.ADMIN)
 * @Post()
 * async create() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
