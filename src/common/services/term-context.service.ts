import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';
import { AppException } from '@/src/common/exceptions/app.exception';

@Injectable()
export class TermContextService {
  private activeTermPromise?: Promise<DtAcademicTerm>;

  constructor(
    @InjectRepository(DtAcademicTerm)
    private readonly academicTermRepository: Repository<DtAcademicTerm>,
  ) {}

  /**
   * Returns the single dt_academic_term row where valid_from <= NOW() <= valid_to and status = 'ACTIVE'.
   * The result is cached per-request (REQUEST-scoped provider) to avoid repeated DB hits.
   *
   * @throws AppException(400, 'NO_ACTIVE_TERM')
   */
  async getActiveTerm(): Promise<DtAcademicTerm> {
    if (!this.activeTermPromise) {
      this.activeTermPromise = this.resolveActiveTerm();
    }
    return this.activeTermPromise;
  }

  private async resolveActiveTerm(): Promise<DtAcademicTerm> {
    const now = new Date();
    const term = await this.academicTermRepository
      .createQueryBuilder('term')
      .where('term.validFrom <= :now', { now })
      .andWhere('term.validTo >= :now', { now })
      .andWhere('term.status = :status', { status: 'ACTIVE' })
      .orderBy('term.validFrom', 'DESC')
      .getOne();

    if (!term) {
      throw AppException.badRequest(
        'NO_ACTIVE_TERM',
        'No active academic term',
      );
    }

    return term;
  }
}
