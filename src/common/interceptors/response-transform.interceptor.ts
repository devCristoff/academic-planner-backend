import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  { success: boolean; data: T; timestamp: string }
> {
  intercept(
    _context: unknown,
    next: CallHandler<T>,
  ): Observable<{ success: boolean; data: T; timestamp: string }> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
