import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { AssignmentStatus, AssignmentType } from '@/src/common/enums/assignment.enum';
import { PaginationQueryDto } from '@/src/common/dto/pagination-query.dto';

export class AssignmentFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by subject identifier',
    example: 42,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  subjectId?: number;

  @ApiPropertyOptional({
    description: 'Filter by assignment status',
    enum: AssignmentStatus,
    example: AssignmentStatus.TO_DO,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

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
