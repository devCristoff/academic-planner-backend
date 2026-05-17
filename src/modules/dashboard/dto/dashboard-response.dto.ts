import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';

/**
 * Academic term information in dashboard response
 */
export class DashboardTermDto {
  @ApiProperty({
    description: 'Term unique identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Term alias (e.g., "Fall", "Spring")',
    example: 'Fall 2024',
  })
  alias!: string;

  @ApiProperty({
    description: 'Academic year',
    example: 2024,
  })
  year!: number;

  @ApiProperty({
    description: 'Term start date in ISO format',
    example: '2024-09-01T00:00:00.000Z',
  })
  validFrom!: string;

  @ApiProperty({
    description: 'Term end date in ISO format',
    example: '2024-12-31T23:59:59.999Z',
  })
  validTo!: string;
}

/**
 * Assignment counts for a subject
 */
export class DashboardSubjectCountsDto {
  @ApiProperty({
    description: 'Number of to-do assignments',
    example: 5,
  })
  todo!: number;

  @ApiProperty({
    description: 'Number of in-progress assignments',
    example: 2,
  })
  inProgress!: number;

  @ApiProperty({
    description: 'Number of completed assignments',
    example: 12,
  })
  done!: number;

  @ApiProperty({
    description: 'Total number of assignments for subject',
    example: 19,
  })
  total!: number;
}

/**
 * Subject information with assignment counts
 */
export class DashboardSubjectDto {
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
    description: 'Subject icon (emoji or icon code)',
    example: '📚',
  })
  icon!: string;

  @ApiProperty({
    description: 'Custom name set by user (optional)',
    example: 'Algo II',
    nullable: true,
  })
  customName!: string | null;

  @ApiProperty({
    description: 'Assignment counts for this subject',
    type: DashboardSubjectCountsDto,
  })
  counts!: DashboardSubjectCountsDto;
}

/**
 * Overall progress information
 */
export class DashboardProgressDto {
  @ApiProperty({
    description: 'Total number of assignments',
    example: 47,
  })
  total!: number;

  @ApiProperty({
    description: 'Number of completed assignments',
    example: 23,
  })
  done!: number;

  @ApiProperty({
    description: 'Completion percentage (0-100)',
    example: 49,
  })
  percentage!: number;
}

/**
 * Subject information in assignment details
 */
export class DashboardAssignmentSubjectDto {
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
    description: 'Subject icon',
    example: '📚',
  })
  icon!: string;

  @ApiProperty({
    description: 'Custom subject name (optional)',
    example: 'Algo II',
    nullable: true,
  })
  customName!: string | null;
}

/**
 * Assignment details for dashboard
 */
export class DashboardAssignmentDto {
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
    description: 'Assignment description or instructions',
    example: 'Implement QuickSort with pivot selection strategy',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Due date in ISO format',
    example: '2024-10-15T23:59:59.000Z',
  })
  date!: string;

  @ApiProperty({
    description: 'External URL for assignment (LMS link, etc.)',
    example: 'https://canvas.university.edu/assignments/156',
    nullable: true,
  })
  url!: string | null;

  @ApiProperty({
    description: 'Current assignment status',
    enum: Object.values(AssignmentStatus),
    example: 'IN_PROGRESS',
  })
  status!: string;

  @ApiProperty({
    description: 'Whether assignment is past due date',
    example: false,
  })
  isOverdue!: boolean;

  @ApiProperty({
    description: 'Whether assignment was manually created (not synced)',
    example: true,
  })
  isManual!: boolean;

  @ApiProperty({
    description: 'Assignment types/tags',
    isArray: true,
    example: ['QUIZ', 'ASSIGNMENT'],
  })
  types!: string[];

  @ApiProperty({
    description: 'Subject this assignment belongs to',
    type: DashboardAssignmentSubjectDto,
  })
  subject!: DashboardAssignmentSubjectDto;
}

/**
 * Complete dashboard response with aggregated data
 */
export class DashboardResponseDto {
  @ApiProperty({
    description: 'Current academic term information',
    type: DashboardTermDto,
  })
  term!: DashboardTermDto;

  @ApiProperty({
    description: 'List of subjects with assignment counts',
    type: [DashboardSubjectDto],
  })
  subjects!: DashboardSubjectDto[];

  @ApiProperty({
    description: 'Assignments due in next 7 days (not completed)',
    type: [DashboardAssignmentDto],
  })
  upcoming!: DashboardAssignmentDto[];

  @ApiProperty({
    description: 'Overdue assignments (not completed)',
    type: [DashboardAssignmentDto],
  })
  overdue!: DashboardAssignmentDto[];

  @ApiProperty({
    description: 'Overall progress statistics',
    type: DashboardProgressDto,
  })
  progress!: DashboardProgressDto;
}
