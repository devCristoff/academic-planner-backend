import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';

export type CurrentUserPayload = { userId: number; termId: number };

/**
 * Decorator to extract current user from JWT payload
 * Throws UnauthorizedException if user is not authenticated
 * 
 * @example
 * @Get()
 * async getMyData(@CurrentUser() user: CurrentUserPayload) {
 *   return this.service.getUserData(user.userId, user.termId);
 * }
 * 
 * @throws UnauthorizedException if request doesn't contain authenticated user
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: CurrentUserPayload }>();
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return request.user;
  },
);
