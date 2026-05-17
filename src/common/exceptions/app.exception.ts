import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  public readonly code: string;

  constructor(status: number, code: string, message?: string) {
    super({ code, message: message ?? code }, status);
    this.code = code;
  }

  static badRequest(code: string, message?: string): AppException {
    return new AppException(HttpStatus.BAD_REQUEST, code, message);
  }

  static unauthorized(code: string, message?: string): AppException {
    return new AppException(HttpStatus.UNAUTHORIZED, code, message);
  }

  static forbidden(code: string, message?: string): AppException {
    return new AppException(HttpStatus.FORBIDDEN, code, message);
  }

  static notFound(code: string, message?: string): AppException {
    return new AppException(HttpStatus.NOT_FOUND, code, message);
  }
}
