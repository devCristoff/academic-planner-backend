import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';

/**
 * Subject information in datatable row
 */
export class DatatableSubjectDto {
  @ApiProperty({
    description: 'Subject unique identifier',
    example: 42,
  })
  id!: number;

  @ApiProperty({
    description: 'Subject name',
    example: 'Advanced Algorithms',
  })
  name!: string;

  @ApiProperty({
    description: 'Subject icon (emoji)',
    example: '📚',
  })
  icon!: string;

  @ApiProperty({
    description: 'Custom subject name',
    example: 'Algo II',
    nullable: true,
  })
  customName!: string | null;
}

/**
 * Single row in datatable response
 */
export class DatatableRowDto {
  @ApiProperty({
    description: 'Assignment unique identifier',
    example: 156,
  })
  id!: number;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Implement QuickSort Algorithm',
  })
  title!: string;

  @ApiProperty({
    description: 'Due date in ISO format',
    example: '2024-10-15T23:59:59.000Z',
  })
  date!: string;

  @ApiProperty({
    description: 'Assignment status',
    enum: Object.values(AssignmentStatus),
    example: 'TO_DO',
  })
  status!: string;

  @ApiProperty({
    description: 'External assignment URL',
    example: 'https://example.com/assignment/156',
    nullable: true,
  })
  url!: string | null;

  @ApiProperty({
    description: 'Whether assignment is overdue',
    example: false,
  })
  isOverdue!: boolean;

  @ApiProperty({
    description: 'Whether assignment was created manually',
    example: true,
  })
  isManual!: boolean;

  @ApiProperty({
    description: 'Assignment types',
    isArray: true,
    example: ['QUIZ'],
  })
  types!: string[];

  @ApiProperty({
    description: 'Subject information',
    type: DatatableSubjectDto,
  })
  subject!: DatatableSubjectDto;
}

/**
 * Paginated datatable response
 */
export class DatatableResponseDto {
  @ApiProperty({
    description: 'Array of assignment rows',
    type: [DatatableRowDto],
  })
  data!: DatatableRowDto[];

  @ApiProperty({
    description: 'Total number of assignments matching filter',
    example: 47,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number (1-indexed)',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages!: number;
}
