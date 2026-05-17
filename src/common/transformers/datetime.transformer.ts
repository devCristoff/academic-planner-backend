import type { ValueTransformer } from 'typeorm';
import { DateUtils } from '@/src/common/utils/date.utils';

export class DateTimeTransformer implements ValueTransformer {
  to(value: Date | string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return DateUtils.toLocalString(value);
    }

    if (typeof value === 'string') {
      return value;
    }

    return DateUtils.toLocalString(new Date(String(value)));
  }

  from(value: Date | string | null): Date | null {
    if (value === null) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    return DateUtils.fromLocalString(value);
  }
}
