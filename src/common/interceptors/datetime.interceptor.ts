import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { DateUtils } from '@/src/common/utils/date.utils';

const normalizeDates = (
  value: unknown,
  seen = new WeakSet<object>(),
): unknown => {
  if (value instanceof Date) {
    return DateUtils.toLocalString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDates(item, seen));
  }

  if (value && typeof value === 'object') {
    if (seen.has(value)) {
      return value;
    }

    seen.add(value);
    const result: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      result[key] = normalizeDates(entry, seen);
    }

    return result;
  }

  return value;
};

@Injectable()
export class DateTimeInterceptor implements NestInterceptor {
  intercept(_context: unknown, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => normalizeDates(data)));
  }
}
