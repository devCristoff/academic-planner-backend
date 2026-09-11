import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { AssignmentStatus, AssignmentType } from '@/src/common/enums/assignment.enum';
import { PaginationQueryDto } from '@/src/common/dto/pagination-query.dto';

export class AssignmentFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by subject identifiers (comma-separated)',
    example: '3,7,12',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const raw = Array.isArray(value) ? value : String(value).split(',');
    return raw.map((v) => Number(v));
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  subjectIds?: number[];

  @ApiPropertyOptional({
    description: 'Filter by assignment statuses (comma-separated)',
    enum: AssignmentStatus,
    isArray: true,
    example: 'TO_DO,DONE',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Array.isArray(value) ? value : String(value).split(',');
  })
  @IsArray()
  @IsEnum(AssignmentStatus, { each: true })
  statuses?: AssignmentStatus[];

  @ApiPropertyOptional({
    description: 'Filter by assignment type',
    enum: AssignmentType,
    example: AssignmentType.QUIZ,
  })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({
    description: 'Filter start date (inclusive) in ISO format',
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter end date (inclusive) in ISO format',
    example: '2024-10-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
