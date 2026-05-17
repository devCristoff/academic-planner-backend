import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '@/src/common/repositories/base.repository';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';

/**
 * Repository for Academic Term entity
 * Provides query methods for term operations
 */
@Injectable()
export class AcademicTermRepository extends BaseRepository<DtAcademicTerm> {
  private termRepo: Repository<DtAcademicTerm>;

  constructor(private dataSource: DataSource) {
    super();
    this.termRepo = this.dataSource.getRepository(DtAcademicTerm);
    this.repository = this.termRepo;
  }

  /**
   * Get term by ID with definition
   * @param termId Term ID
   * @returns Term with definition or null
   */
  async getTermWithDefinition(termId: number): Promise<DtAcademicTerm | null> {
    return this.repository.createQueryBuilder('t')
      .leftJoinAndSelect('t.definition', 'def')
      .where('t.id = :termId', { termId })
      .getOne();
  }

  /**
   * Get active term for user
   * @param userId User ID
   * @returns Active term or null
   */
  async getActiveTermForUser(userId: number): Promise<DtAcademicTerm | null> {
    return this.repository.createQueryBuilder('t')
      .leftJoinAndSelect('t.definition', 'def')
      .where('t.dtUserId = :userId', { userId })
      .andWhere('t.isActive = :isActive', { isActive: true })
      .getOne();
  }

  /**
   * Get all terms for user ordered by year/term
   * @param userId User ID
   * @returns Array of terms
   */
  async getTermsForUser(userId: number): Promise<DtAcademicTerm[]> {
    return this.repository.createQueryBuilder('t')
      .leftJoinAndSelect('t.definition', 'def')
      .where('t.dtUserId = :userId', { userId })
      .orderBy('t.year', 'DESC')
      .addOrderBy('t.defAcademicTermId', 'DESC')
      .getMany();
  }
}
