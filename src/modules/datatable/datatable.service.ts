import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from '@/src/common/repositories';
import { AssignmentFilterDto } from '@/src/modules/assignments/dto/assignment-filter.dto';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { DatatableQueryDto } from '@/src/modules/datatable/dto/datatable-query.dto';
import {
  DatatableResponseDto,
  DatatableRowDto,
} from '@/src/modules/datatable/dto/datatable-response.dto';

/**
 * Datatable service
 * Provides paginated and searchable assignment data for the datatable view
 * Uses AssignmentRepository for optimized queries with filtering, sorting, and pagination
 */
@Injectable()
export class DatatableService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  /**
   * Returns paginated datatable rows.
   */
  async getDatatable(
    userId: number,
    termId: number,
    query: DatatableQueryDto,
  ): Promise<DatatableResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'date';
    const order = query.order ?? 'asc';

    // Build filter for repository
    const filter: AssignmentFilterDto = {
      subjectId: query.subjectId,
      status: query.status ? (query.status as AssignmentStatus) : undefined,
      type: undefined,
      from: undefined,
      to: undefined,
    };

    // Get paginated data from repository
    const { items, total } = await this.assignmentRepository.getAssignmentsPaginated(
      userId,
      termId,
      filter,
      query.search,
      page,
      limit,
      sortBy,
      order,
    );

    const now = new Date();
    const data = items.map((a) => this.toRowDto(a, now));
    const totalPages = Math.ceil(total / limit);

    const response = new DatatableResponseDto();
    response.data = data;
    response.total = total;
    response.page = page;
    response.limit = limit;
    response.totalPages = totalPages;
    return response;
  }

  private toRowDto(assignment: HtAssignment, now: Date): DatatableRowDto {
    const row = new DatatableRowDto();
    row.id = assignment.id;
    row.title = assignment.title;
    row.date = assignment.date.toISOString();
    row.status = assignment.status;
    row.url = assignment.url;
    row.isManual = assignment.canvasId < 0;
    row.types = (assignment.typeLinks ?? []).map((t) => t.defTypeId);
    row.isOverdue =
      assignment.date < now &&
      [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS].includes(
        assignment.status as AssignmentStatus,
      );
    row.subject = {
      id: assignment.subject.id,
      name: assignment.subject.name,
      icon: assignment.subject.icon,
      customName: assignment.subject.customName,
    };
    return row;
  }
}
