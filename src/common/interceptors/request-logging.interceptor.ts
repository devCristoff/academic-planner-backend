import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { catchError, tap, throwError, type Observable } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') ?? 'unknown';
    const startedAt = Date.now();

    this.logger.log(
      `${method} ${originalUrl} from ${ip ?? 'unknown'} (${userAgent})`,
    );

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        const response = context.switchToHttp().getResponse();
        this.logger.log(
          `${method} ${originalUrl} completed with ${response.statusCode} in ${durationMs}ms`,
        );
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startedAt;
        const message =
          error instanceof Error ? error.message : 'Unknown request failure';
        this.logger.error(
          `${method} ${originalUrl} failed after ${durationMs}ms: ${message}`,
          error instanceof Error ? error.stack : undefined,
        );
        return throwError(() => error);
      }),
    );
  }
}