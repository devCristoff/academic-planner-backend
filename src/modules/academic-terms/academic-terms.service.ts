import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/src/common/exceptions/app.exception';
import { AcademicTermResponseDto } from '@/src/modules/academic-terms/dto/academic-term-response.dto';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';

@Injectable()
export class AcademicTermsService {
  constructor(
    @InjectRepository(DtAcademicTerm)
    private readonly academicTermRepository: Repository<DtAcademicTerm>,
  ) {}

  /**
   * Lists all academic terms joined with their definition.
   */
  async listAll(): Promise<AcademicTermResponseDto[]> {
    const terms = await this.academicTermRepository
      .createQueryBuilder('term')
      .leftJoinAndSelect('term.definition', 'def')
      .orderBy('term.validFrom', 'DESC')
      .getMany();

    return terms.map((t) => AcademicTermResponseDto.fromEntity(t));
  }

  /**
   * Returns the current active academic term.
   *
   * @throws AppException(400, 'NO_ACTIVE_TERM')
   */
  async getCurrent(): Promise<AcademicTermResponseDto> {
    const now = new Date();
    const term = await this.academicTermRepository
      .createQueryBuilder('term')
      .leftJoinAndSelect('term.definition', 'def')
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

    return AcademicTermResponseDto.fromEntity(term);
  }
}
