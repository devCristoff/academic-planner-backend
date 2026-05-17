import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '@/src/common/repositories/base.repository';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { AssignmentFilterDto } from '@/src/modules/assignments/dto/assignment-filter.dto';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';

/**
 * Repository for Assignment entity
 * Provides optimized query methods for common assignment operations
 * @apiexample
 * const assignments = await assignmentRepository.getAssignmentsWithFilters(userId, termId, filter);
 */
@Injectable()
export class AssignmentRepository extends BaseRepository<HtAssignment> {
  private assignmentRepo: Repository<HtAssignment>;

  constructor(private dataSource: DataSource) {
    super();
    this.assignmentRepo = this.dataSource.getRepository(HtAssignment);
    this.repository = this.assignmentRepo;
  }

  /**
   * Get assignments with filters applied
   * Used by assignments service, datatable, calendar, board services
   * @param userId User ID
   * @param termId Academic term ID
   * @param filter Optional filter criteria (subjectId, status, type, from, to)
   * @returns Filtered assignments with relations
   */
  async getAssignmentsWithFilters(
    userId: number,
    termId: number,
    filter: AssignmentFilterDto,
  ): Promise<HtAssignment[]> {
    const qb = this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId });

    if (filter.subjectId !== undefined) {
      qb.andWhere('s.id = :subjectId', { subjectId: filter.subjectId });
    }
    if (filter.status !== undefined) {
      qb.andWhere('a.status = :status', { status: filter.status });
    }
    if (filter.type !== undefined) {
      qb.andWhere('atl.defTypeId = :type', { type: filter.type });
    }
    if (filter.from !== undefined) {
      qb.andWhere('a.date >= :from', { from: new Date(filter.from) });
    }
    if (filter.to !== undefined) {
      qb.andWhere('a.date <= :to', { to: new Date(filter.to) });
    }

    return qb.orderBy('a.date', 'ASC').getMany();
  }

  /**
   * Get single assignment with full details
   * @param assignmentId Assignment ID
   * @param userId User ID for ownership validation
   * @returns Assignment with relations or null
   */
  async getAssignmentWithDetails(
    assignmentId: number,
    userId: number,
  ): Promise<HtAssignment | null> {
    return this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('a.id = :assignmentId', { assignmentId })
      .andWhere('s.dtUserId = :userId', { userId })
      .getOne();
  }

  /**
   * Get upcoming assignments (within 7 days)
   * Used by dashboard service
   * @param userId User ID
   * @param termId Academic term ID
   * @param fromDate Start date
   * @param toDate End date
   * @returns Upcoming assignments
   */
  async getUpcomingAssignments(
    userId: number,
    termId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<HtAssignment[]> {
    return this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('a.date >= :fromDate', { fromDate })
      .andWhere('a.date <= :toDate', { toDate })
      .andWhere('a.status != :done', { done: AssignmentStatus.DONE })
      .orderBy('a.date', 'ASC')
      .getMany();
  }

  /**
   * Get overdue assignments
   * Used by dashboard service
   * @param userId User ID
   * @param termId Academic term ID
   * @param beforeDate Date threshold
   * @returns Overdue assignments
   */
  async getOverdueAssignments(
    userId: number,
    termId: number,
    beforeDate: Date,
  ): Promise<HtAssignment[]> {
    return this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('a.date < :beforeDate', { beforeDate })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS],
      })
      .orderBy('a.date', 'ASC')
      .getMany();
  }

  /**
   * Get assignment counts by status
   * Used by dashboard service
   * @param userId User ID
   * @param termId Academic term ID
   * @returns Object with total and done counts
   */
  async getAssignmentCounts(
    userId: number,
    termId: number,
  ): Promise<{ total: number; done: number }> {
    const total = await this.repository.createQueryBuilder('a')
      .innerJoin('a.subject', 's')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .getCount();

    const done = await this.repository.createQueryBuilder('a')
      .innerJoin('a.subject', 's')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('a.status = :done', { done: AssignmentStatus.DONE })
      .getCount();

    return { total, done };
  }

  /**
   * Get all assignments for a term (used by assignment update)
   * @param userId User ID
   * @param termId Academic term ID
   * @returns All assignments for the term
   */
  async getAssignmentsForTerm(
    userId: number,
    termId: number,
  ): Promise<HtAssignment[]> {
    return this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .getMany();
  }

  /**
   * Get paginated assignments with filters and search
   * Used by datatable service
   * @param userId User ID
   * @param termId Academic term ID
   * @param filter Filters (subjectId, status, type)
   * @param search Optional search string for title
   * @param page Page number (1-based)
   * @param limit Items per page
   * @param sortBy Column to sort by (date, title, status)
   * @param order Sort direction (asc, desc)
   * @returns Paginated assignments with total count
   */
  async getAssignmentsPaginated(
    userId: number,
    termId: number,
    filter: AssignmentFilterDto,
    search: string | undefined,
    page: number,
    limit: number,
    sortBy: string,
    order: string,
  ): Promise<{ items: HtAssignment[]; total: number }> {
    const skip = (page - 1) * limit;

    const qb = this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId });

    if (filter.subjectId !== undefined) {
      qb.andWhere('s.id = :subjectId', { subjectId: filter.subjectId });
    }
    if (filter.status !== undefined) {
      qb.andWhere('a.status = :status', { status: filter.status });
    }
    if (filter.type !== undefined) {
      qb.andWhere('atl.defTypeId = :type', { type: filter.type });
    }
    if (search) {
      qb.andWhere('a.title LIKE :search', { search: `%${search}%` });
    }

    const total = await qb.clone().select('a.id').distinct(true).getCount();

    // Map sortBy column safely
    const sortColumns: Record<string, 'a.date' | 'a.title' | 'a.status'> = {
      date: 'a.date',
      title: 'a.title',
      status: 'a.status',
    };
    const orderByColumn = sortColumns[sortBy] ?? 'a.date';
    const direction = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const items = await qb
      .orderBy(orderByColumn, direction)
      .skip(skip)
      .take(limit)
      .getMany();

    return { items, total };
  }

  /**
   * Get assignments in a date range
   * Used by calendar service
   * @param userId User ID
   * @param termId Academic term ID
   * @param startDate Start of range
   * @param endDate End of range
   * @returns Assignments in the range
   */
  async getAssignmentsInDateRange(
    userId: number,
    termId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<HtAssignment[]> {
    return this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('a.date >= :startDate', { startDate })
      .andWhere('a.date <= :endDate', { endDate })
      .orderBy('a.date', 'ASC')
      .getMany();
  }

  /**
   * Get assignments grouped by status (for board view)
   * Used by board service
   * @param userId User ID
   * @param termId Academic term ID
   * @param subjectId Optional subject filter
   * @returns All assignments with status = TO_DO, IN_PROGRESS, or DONE
   */
  async getAssignmentsForBoard(
    userId: number,
    termId: number,
    subjectId?: number,
  ): Promise<HtAssignment[]> {
    const qb = this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS, AssignmentStatus.DONE],
      });

    if (subjectId !== undefined && Number.isFinite(subjectId)) {
      qb.andWhere('s.id = :subjectId', { subjectId });
    }

    return qb.orderBy('a.date', 'ASC').getMany();
  }
}
