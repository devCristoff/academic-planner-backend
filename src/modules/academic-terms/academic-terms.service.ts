import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/src/common/exceptions/app.exception';
import { AcademicTermResponseDto } from '@/src/modules/academic-terms/dto/academic-term-response.dto';
import { CreateAcademicTermDto } from '@/src/modules/academic-terms/dto/create-academic-term.dto';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';
import { DefAcademicTerm } from '@/src/modules/academic-terms/entities/def-academic-term.entity';

@Injectable()
export class AcademicTermsService {
  constructor(
    @InjectRepository(DtAcademicTerm)
    private readonly academicTermRepository: Repository<DtAcademicTerm>,
    @InjectRepository(DefAcademicTerm)
    private readonly defAcademicTermRepository: Repository<DefAcademicTerm>,
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

  /**
   * Creates a new academic term.
   *
   * @throws AppException(400, 'UNKNOWN_TERM_DEFINITION') if defAcademicTermId doesn't exist
   */
  async create(body: CreateAcademicTermDto): Promise<AcademicTermResponseDto> {
    const definitionExists = await this.defAcademicTermRepository.existsBy({
      id: body.defAcademicTermId,
    });
    if (!definitionExists) {
      throw AppException.badRequest(
        'UNKNOWN_TERM_DEFINITION',
        `No academic term definition found for id "${body.defAcademicTermId}"`,
      );
    }

    const term = this.academicTermRepository.create({
      defAcademicTermId: body.defAcademicTermId,
      year: body.year,
      validFrom: new Date(body.validFrom),
      validTo: new Date(body.validTo),
      status: body.status,
    });
    const saved = await this.academicTermRepository.save(term);

    const withDefinition = await this.academicTermRepository
      .createQueryBuilder('term')
      .leftJoinAndSelect('term.definition', 'def')
      .where('term.id = :id', { id: saved.id })
      .getOneOrFail();

    return AcademicTermResponseDto.fromEntity(withDefinition);
  }
}
