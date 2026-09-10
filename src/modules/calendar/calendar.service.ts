import { Injectable } from '@nestjs/common';
import { AppException } from '@/src/common/exceptions/app.exception';
import { AssignmentRepository } from '@/src/common/repositories';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';
import { DateUtils } from '@/src/common/utils/date.utils';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { CalendarQueryDto } from '@/src/modules/calendar/dto/calendar-query.dto';
import {
  CalendarEntryDto,
  type CalendarResponseDto,
} from '@/src/modules/calendar/dto/calendar-response.dto';

function toDateKeyLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calendar service
 * Provides assignment data grouped by calendar date
 * Uses AssignmentRepository for optimized date range queries
 */
@Injectable()
export class CalendarService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  /**
   * Returns calendar entries grouped by day.
   *
   * @throws AppException(400, 'MISSING_PARAMS')
   */
  async getCalendar(
    userId: number,
    termId: number,
    query: CalendarQueryDto,
  ): Promise<CalendarResponseDto> {
    if (query.year === undefined || query.month === undefined) {
      throw AppException.badRequest(
        'MISSING_PARAMS',
        'year and month are required',
      );
    }

    const start = new Date(query.year, query.month - 1, 1, 0, 0, 0, 0);
    const end = new Date(query.year, query.month, 0, 23, 59, 59, 999);

    const assignments = await this.assignmentRepository.getAssignmentsInDateRange(
      userId,
      termId,
      start,
      end,
    );

    const now = new Date();
    const result: Record<string, CalendarEntryDto[]> = {};

    for (const a of assignments) {
      const key = toDateKeyLocal(a.date);
      const entry = this.toCalendarEntry(a, now);
      (result[key] ??= []).push(entry);
    }

    return result;
  }

  private toCalendarEntry(assignment: HtAssignment, now: Date): CalendarEntryDto {
    const entry = new CalendarEntryDto();
    entry.id = assignment.id;
    entry.title = assignment.title;
    entry.status = assignment.status;
    entry.dueTime = DateUtils.toLocalString(assignment.date).split(' ')[1];
    entry.isManual = assignment.canvasId === null;
    entry.types = (assignment.typeLinks ?? []).map((t) => t.defTypeId);
    entry.isOverdue =
      assignment.date < now &&
      [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS].includes(
        assignment.status as AssignmentStatus,
      );
    entry.subject = {
      id: assignment.subject.id,
      name: assignment.subject.name,
      icon: assignment.subject.icon,
      customName: assignment.subject.customName,
    };
    return entry;
  }
}
