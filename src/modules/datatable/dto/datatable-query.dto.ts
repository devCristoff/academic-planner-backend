import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DatatableSortField, DatatableSortOrder } from '@/src/common/enums/datatable.enum';

export class DatatableQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: Object.values(DatatableSortField),
    example: 'date',
  })
  @IsOptional()
  @IsIn(Object.values(DatatableSortField))
  sortBy?: 'date' | 'title' | 'status';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: Object.values(DatatableSortOrder),
    example: 'asc',
  })
  @IsOptional()
  @IsIn(Object.values(DatatableSortOrder))
  order?: 'asc' | 'desc';

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
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignment type',
    example: 'QUIZ',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Search by title or other text fields',
    example: 'quicksort',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
