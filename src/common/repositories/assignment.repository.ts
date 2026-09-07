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
 * const { items, total } = await assignmentRepository.getAssignmentsWithFilters(userId, termId, filter, page, limit);
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
   * Get a page of assignments with filters applied
   * Used by assignments service
   * @param userId User ID
   * @param termId Academic term ID
   * @param filter Optional filter criteria (subjectId, status, type, from, to)
   * @param page Page number (1-based)
   * @param limit Items per page
   * @returns Page of filtered assignments with relations, and the total matching count
   */
  async getAssignmentsWithFilters(
    userId: number,
    termId: number,
    filter: AssignmentFilterDto,
    page: number,
    limit: number,
  ): Promise<{ items: HtAssignment[]; total: number }> {
    const baseQb = this.repository.createQueryBuilder('a')
      .innerJoin('a.subject', 's')
      .leftJoin('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId });

    if (filter.subjectId !== undefined) {
      baseQb.andWhere('s.id = :subjectId', { subjectId: filter.subjectId });
    }
    if (filter.status !== undefined) {
      baseQb.andWhere('a.status = :status', { status: filter.status });
    }
    if (filter.type !== undefined) {
      baseQb.andWhere('atl.defTypeId = :type', { type: filter.type });
    }
    if (filter.from !== undefined) {
      baseQb.andWhere('a.date >= :from', { from: new Date(filter.from) });
    }
    if (filter.to !== undefined) {
      baseQb.andWhere('a.date <= :to', { to: new Date(filter.to) });
    }

    // `atl` is a to-many join, so counting/paginating on `baseQb` directly would be
    // thrown off by row fanout. Count and page distinct assignment ids first, then
    // fetch full entities (with relations) for just that page of ids.
    const totalRow = await baseQb.clone()
      .select('COUNT(DISTINCT a.id)', 'count')
      .getRawOne<{ count: string }>();
    const total = Number(totalRow?.count ?? 0);

    const idRows = await baseQb.clone()
      .select('a.id', 'id')
      .groupBy('a.id')
      .orderBy('a.date', 'ASC')
      .addOrderBy('a.id', 'ASC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return { items: [], total };
    }

    const items = await this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('a.id IN (:...ids)', { ids })
      .orderBy('a.date', 'ASC')
      .addOrderBy('a.id', 'ASC')
      .getMany();

    return { items, total };
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
  ): Promise<HtAssignment[]> {
    const qb = this.repository.createQueryBuilder('a')
      .innerJoinAndSelect('a.subject', 's')
      .leftJoinAndSelect('a.typeLinks', 'atl')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS, AssignmentStatus.DONE],
      });

    return qb.orderBy('a.date', 'ASC').getMany();
  }
}
