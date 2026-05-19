import { ApiProperty } from '@nestjs/swagger';
import { AcademicTermStatus } from '@/src/common/enums/academic-term.enum';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';
import { DateUtils } from '@/src/common/utils/date.utils';

/**
 * Academic term details response
 */
export class AcademicTermResponseDto {
  @ApiProperty({
    description: 'Term unique identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Term definition identifier (maps to definition)',
    example: 'FIRST_TERM',
  })
  defAcademicTermId!: string;

  @ApiProperty({
    description: 'Term alias (e.g., semester name)',
    example: 'First Term',
  })
  alias!: string;

  @ApiProperty({
    description: 'Term start month (1-12)',
    example: 1,
  })
  since!: number;

  @ApiProperty({
    description: 'Term end month (1-12)',
    example: 4,
  })
  until!: number;

  @ApiProperty({
    description: 'Academic year',
    example: 2024,
  })
  year!: number;

  @ApiProperty({
    description: 'Term validity start date in local format',
    example: '2024-01-05 00:00:00',
  })
  validFrom!: string;

  @ApiProperty({
    description: 'Term validity end date in local format',
    example: '2024-04-30 23:59:59',
  })
  validTo!: string;

  @ApiProperty({
    description: 'Term status',
    enum: Object.values(AcademicTermStatus),
    example: 'ACTIVE',
  })
  status!: string;

  /**
   * Factory method to create AcademicTermResponseDto from DtAcademicTerm entity
   */
  static fromEntity(entity: DtAcademicTerm): AcademicTermResponseDto {
    const dto = new AcademicTermResponseDto();
    dto.id = entity.id;
    dto.defAcademicTermId = entity.defAcademicTermId;
    dto.alias = entity.definition?.alias ?? entity.defAcademicTermId;
    dto.since = entity.definition?.since ?? 1;
    dto.until = entity.definition?.until ?? 12;
    dto.year = Number(entity.year);
    dto.validFrom = DateUtils.toLocalString(entity.validFrom);
    dto.validTo = DateUtils.toLocalString(entity.validTo);
    dto.status = entity.status;
    return dto;
  }
}
