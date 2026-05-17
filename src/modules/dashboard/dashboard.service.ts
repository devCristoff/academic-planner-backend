import { Injectable } from '@nestjs/common';
import { AppException } from '@/src/common/exceptions/app.exception';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import {
  AcademicTermRepository,
  DashboardQueryRepository,
} from '@/src/common/repositories';
import {
  DashboardResponseDto,
  DashboardSubjectDto,
  DashboardTermDto,
} from '@/src/modules/dashboard/dto/dashboard-response.dto';
import { DateUtils } from '@/src/common/utils/date.utils';

/**
 * Dashboard service
 * Provides aggregated data for the user dashboard
 * Uses DashboardQueryRepository for optimized aggregation queries
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly termRepository: AcademicTermRepository,
    private readonly dashboardQueryRepository: DashboardQueryRepository,
  ) {}

  /**
   * Returns dashboard data for the current user and term.
   * Optimized to execute 2 queries only:
   * 1. Term data with definition
   * 2. Dashboard aggregations (subjects + upcoming + overdue + counts)
   */
  async getDashboard(
    userId: number,
    termId: number,
  ): Promise<DashboardResponseDto> {
    const term = await this.termRepository.getTermWithDefinition(termId);

    if (!term) {
      throw AppException.badRequest(
        'NO_ACTIVE_TERM',
        'No active academic term',
      );
    }

    // Single optimized call that returns all dashboard data via parallel queries
    const { subjectsWithCounts, upcoming, overdue, counts } =
      await this.dashboardQueryRepository.getDashboardAggregations(
        userId,
        termId,
      );

    const now = new Date();
    const response = new DashboardResponseDto();

    const termDto = new DashboardTermDto();
    termDto.id = term.id;
    termDto.alias = term.definition?.alias ?? term.defAcademicTermId;
    termDto.year = Number(term.year);
    termDto.validFrom = DateUtils.toLocalString(term.validFrom);
    termDto.validTo = DateUtils.toLocalString(term.validTo);
    response.term = termDto;

    response.subjects = subjectsWithCounts.map((r) => {
      const s = new DashboardSubjectDto();
      s.id = Number(r.id);
      s.name = r.name;
      s.icon = r.icon;
      s.customName = r.customName ?? null;
      s.counts = {
        todo: Number(r.todo ?? 0),
        inProgress: Number(r.inProgress ?? 0),
        done: Number(r.done ?? 0),
        total: Number(r.total ?? 0),
      };
      return s;
    });

    response.upcoming = upcoming.map((a) => this.mapAssignment(a, now));
    response.overdue = overdue.map((a) => this.mapAssignment(a, now));
    response.progress = {
      total: counts.total,
      done: counts.done,
      percentage:
        counts.total === 0
          ? 0
          : Math.round((counts.done / counts.total) * 100),
    };

    return response;
  }

  private mapAssignment(a: HtAssignment, now: Date) {
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      date: DateUtils.toLocalString(a.date),
      url: a.url,
      status: a.status,
      isManual: a.canvasId < 0,
      types: (a.typeLinks ?? []).map((t) => t.defTypeId),
      isOverdue:
        a.date < now &&
        [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS].includes(
          a.status as AssignmentStatus,
        ),
      subject: {
        id: a.subject.id,
        name: a.subject.name,
        icon: a.subject.icon,
        customName: a.subject.customName,
      },
    };
  }
}
