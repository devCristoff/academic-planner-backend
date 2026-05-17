import * as moment from 'moment-timezone';

const DEFAULT_TIMEZONE = 'America/Santo_Domingo';
const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const HTTP_DATE_FORMAT = 'ddd, DD MMM YYYY HH:mm:ss z';

export class DateUtils {
  static getTimezone(): string {
    return process.env.APP_TIMEZONE ?? process.env.TZ ?? DEFAULT_TIMEZONE;
  }

  static getFormat(): string {
    return DEFAULT_FORMAT;
  }

  static toLocalString(date?: Date): string {
    const value = date ?? new Date();
    return moment(value).tz(this.getTimezone()).format(DEFAULT_FORMAT);
  }

  static fromLocalString(value: string): Date {
    return moment.tz(value, DEFAULT_FORMAT, this.getTimezone()).toDate();
  }

  static now(): string {
    return this.toLocalString(new Date());
  }

  static toHttpDate(date?: Date): string {
    const value = date ?? new Date();
    return moment(value).tz(this.getTimezone()).format(HTTP_DATE_FORMAT);
  }
}
