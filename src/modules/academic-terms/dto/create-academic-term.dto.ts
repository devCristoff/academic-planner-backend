import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';
import { AcademicTermStatus } from '@/src/common/enums/academic-term.enum';

export class CreateAcademicTermDto {
  @ApiProperty({
    description: 'Term definition identifier (must exist in def_academic_term)',
    example: 'FIRST_TERM',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  defAcademicTermId!: string;

  @ApiProperty({
    description: 'Academic year',
    example: 2026,
  })
  @IsInt()
  @Min(2000)
  year!: number;

  @ApiProperty({
    description: 'Term validity start date in ISO format',
    example: '2026-01-05T00:00:00.000Z',
  })
  @IsDateString()
  validFrom!: string;

  @ApiProperty({
    description: 'Term validity end date in ISO format',
    example: '2026-04-30T23:59:59.000Z',
  })
  @IsDateString()
  validTo!: string;

  @ApiProperty({
    description: 'Term status',
    enum: AcademicTermStatus,
    example: AcademicTermStatus.ACTIVE,
  })
  @IsEnum(AcademicTermStatus)
  status!: AcademicTermStatus;
}
