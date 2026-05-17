import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '@/src/common/exceptions/app.exception';
import { DateUtils } from '@/src/common/utils/date.utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = DateUtils.now();

    if (exception instanceof AppException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse() as { code: string; message: string };
      this.logger.warn(
        `${request.method} ${request.url} -> ${statusCode} ${body.code}: ${body.message}`,
      );
      response
        .status(statusCode)
        .json({ success: false, error: body, timestamp });
      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : typeof res === 'object' && res !== null && 'message' in res
            ? String((res as { message?: unknown }).message)
            : 'HTTP_ERROR';
        this.logger.warn(
          `${request.method} ${request.url} -> ${statusCode} HTTP_ERROR: ${message}`,
        );
      response.status(statusCode).json({
        success: false,
        error: { code: 'HTTP_ERROR', message },
        timestamp,
      });
      return;
    }

      this.logger.error(
        `${request.method} ${request.url} -> 500 INTERNAL_SERVER_ERROR`,
        exception instanceof Error ? exception.stack : undefined,
      );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
      timestamp,
    });
  }
}
