import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';

/**
 * Subject information in calendar entry
 */
export class CalendarSubjectDto {
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
 * Single calendar entry (assignment on a specific date)
 */
export class CalendarEntryDto {
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
    description: 'Assignment status',
    enum: Object.values(AssignmentStatus),
    example: 'TO_DO',
  })
  status!: string;

  @ApiProperty({
    description: 'Whether assignment is overdue',
    example: false,
  })
  isOverdue!: boolean;

  @ApiProperty({
    description: 'Whether assignment was created manually',
    example: false,
  })
  isManual!: boolean;

  @ApiProperty({
    description: 'Assignment types',
    isArray: true,
    example: ['QUIZ'],
  })
  types!: string[];

  @ApiProperty({
    description: 'Subject this assignment belongs to',
    type: CalendarSubjectDto,
    example: { id: 42, name: 'Advanced Algorithms', icon: '📚', customName: 'Algo II' },
  })
  subject!: CalendarSubjectDto;
}

/**
 * Calendar response - assignments grouped by date (ISO date string as key)
 * Example: { "2024-10-15": [...], "2024-10-16": [...] }
 */
export type CalendarResponseDto = Record<string, CalendarEntryDto[]>;
