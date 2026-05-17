import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';

/**
 * Dashboard Query Repository
 * Specialized repository for optimized dashboard queries
 * Provides single aggregation method to replace multiple separate queries
 */
@Injectable()
export class DashboardQueryRepository {
  private subjectRepo: Repository<HtSubject>;
  private assignmentRepo: Repository<HtAssignment>;

  constructor(private dataSource: DataSource) {
    this.subjectRepo = this.dataSource.getRepository(HtSubject);
    this.assignmentRepo = this.dataSource.getRepository(HtAssignment);
  }

  /**
   * Get all dashboard aggregated data in optimized queries
   * Uses parallel queries for:
   * 1. Subjects with assignment counts
   * 2. Upcoming assignments (7-day window)
   * 3. Overdue assignments
   * 4. Assignment totals
   *
   * @param userId User ID
   * @param termId Academic term ID
   * @returns Dashboard data object
   */
  async getDashboardAggregations(
    userId: number,
    termId: number,
  ): Promise<{
    subjectsWithCounts: Array<{
      id: number;
      name: string;
      icon: string;
      customName: string | null;
      todo: string;
      inProgress: string;
      done: string;
      total: string;
    }>;
    upcoming: HtAssignment[];
    overdue: HtAssignment[];
    counts: { total: number; done: number };
  }> {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel
    const [subjectsWithCounts, upcoming, overdue, counts] = await Promise.all([
      // Query 1: Subjects with aggregated assignment counts
      this.subjectRepo
        .createQueryBuilder('s')
        .leftJoin('s.assignments', 'a')
        .where('s.dtUserId = :userId', { userId })
        .andWhere('s.dtAcademicTermId = :termId', { termId })
        .select('s.id', 'id')
        .addSelect('s.name', 'name')
        .addSelect('s.icon', 'icon')
        .addSelect('s.customName', 'customName')
        .addSelect(
          "SUM(CASE WHEN a.status = 'TO_DO' THEN 1 ELSE 0 END)",
          'todo',
        )
        .addSelect(
          "SUM(CASE WHEN a.status = 'IN_PROGRESS' THEN 1 ELSE 0 END)",
          'inProgress',
        )
        .addSelect("SUM(CASE WHEN a.status = 'DONE' THEN 1 ELSE 0 END)", 'done')
        .addSelect('COUNT(a.id)', 'total')
        .groupBy('s.id')
        .orderBy('s.name', 'ASC')
        .getRawMany(),

      // Query 2: Upcoming assignments (next 7 days)
      this.assignmentRepo
        .createQueryBuilder('a')
        .innerJoinAndSelect('a.subject', 's')
        .leftJoinAndSelect('a.typeLinks', 'atl')
        .where('s.dtUserId = :userId', { userId })
        .andWhere('s.dtAcademicTermId = :termId', { termId })
        .andWhere('a.date >= :now', { now })
        .andWhere('a.date <= :in7Days', { in7Days })
        .andWhere('a.status != :done', { done: AssignmentStatus.DONE })
        .orderBy('a.date', 'ASC')
        .getMany(),

      // Query 3: Overdue assignments
      this.assignmentRepo
        .createQueryBuilder('a')
        .innerJoinAndSelect('a.subject', 's')
        .leftJoinAndSelect('a.typeLinks', 'atl')
        .where('s.dtUserId = :userId', { userId })
        .andWhere('s.dtAcademicTermId = :termId', { termId })
        .andWhere('a.date < :now', { now })
        .andWhere('a.status IN (:...statuses)', {
          statuses: [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS],
        })
        .orderBy('a.date', 'ASC')
        .getMany(),

      // Query 4: Assignment counts (total and done)
      (async () => {
        const [totalResult, doneResult] = await Promise.all([
          this.assignmentRepo
            .createQueryBuilder('a')
            .innerJoin('a.subject', 's')
            .where('s.dtUserId = :userId', { userId })
            .andWhere('s.dtAcademicTermId = :termId', { termId })
            .getCount(),
          this.assignmentRepo
            .createQueryBuilder('a')
            .innerJoin('a.subject', 's')
            .where('s.dtUserId = :userId', { userId })
            .andWhere('s.dtAcademicTermId = :termId', { termId })
            .andWhere('a.status = :done', { done: AssignmentStatus.DONE })
            .getCount(),
        ]);
        return { total: totalResult, done: doneResult };
      })(),
    ]);

    return {
      subjectsWithCounts,
      upcoming,
      overdue,
      counts,
    };
  }

  /**
   * Alternative: Get dashboard data with a single query using subqueries
   * More complex but potentially faster for very large datasets
   * (Current implementation uses 4 parallel queries which is clearer)
   */
  // This is commented out as the parallel approach is clearer
  // async getDashboardAggregationsOptimized(userId: number, termId: number) { ... }
}
