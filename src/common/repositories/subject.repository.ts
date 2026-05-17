import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '@/src/common/repositories/base.repository';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';

/**
 * Repository for Subject entity
 * Provides optimized query methods for subject operations
 */
@Injectable()
export class SubjectRepository extends BaseRepository<HtSubject> {
  private subjectRepo: Repository<HtSubject>;

  constructor(private dataSource: DataSource) {
    super();
    this.subjectRepo = this.dataSource.getRepository(HtSubject);
    this.repository = this.subjectRepo;
  }

  /**
   * Get all subjects for a user and term
   * @param userId User ID
   * @param termId Academic term ID
   * @returns Array of subjects
   */
  async getSubjectsForTerm(
    userId: number,
    termId: number,
  ): Promise<HtSubject[]> {
    return this.repository.createQueryBuilder('s')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .orderBy('s.name', 'ASC')
      .getMany();
  }

  /**
   * Get subject by ID with validation
   * @param subjectId Subject ID
   * @param userId User ID for ownership validation
   * @returns Subject or null
   */
  async getSubjectWithValidation(
    subjectId: number,
    userId: number,
  ): Promise<HtSubject | null> {
    return this.repository.createQueryBuilder('s')
      .where('s.id = :subjectId', { subjectId })
      .andWhere('s.dtUserId = :userId', { userId })
      .getOne();
  }

  /**
   * Get subjects with assignment counts (raw query)
   * Used by dashboard service for aggregation
   * @param userId User ID
   * @param termId Academic term ID
   * @returns Array of raw subject data with counts
   */
  async getSubjectsWithAssignmentCounts(
    userId: number,
    termId: number,
  ): Promise<
    Array<{
      id: number;
      name: string;
      icon: string;
      customName: string | null;
      todo: string;
      inProgress: string;
      done: string;
      total: string;
    }>
  > {
    return this.repository.createQueryBuilder('s')
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
      .getRawMany();
  }

  /**
   * Count subjects for a user and term
   * @param userId User ID
   * @param termId Academic term ID
   * @returns Count
   */
  async countForTerm(userId: number, termId: number): Promise<number> {
    return this.repository.createQueryBuilder('s')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .getCount();
  }

  /**
   * Check if subject exists and belongs to user
   * @param subjectId Subject ID
   * @param userId User ID
   * @returns Boolean
   */
  async existsByIdAndUser(subjectId: number, userId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('s')
      .where('s.id = :subjectId', { subjectId })
      .andWhere('s.dtUserId = :userId', { userId })
      .getCount();
    return count > 0;
  }
}
