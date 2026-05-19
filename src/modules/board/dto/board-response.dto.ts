import { ApiProperty } from '@nestjs/swagger';

/**
 * Subject information in board card
 */
export class BoardSubjectDto {
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
 * Card in kanban board (assignment)
 */
export class BoardCardDto {
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
    description: 'Subject this assignment belongs to',
    type: BoardSubjectDto,
    example: { id: 42, name: 'Advanced Algorithms', icon: '📚', customName: 'Algo II' },
  })
  subject!: BoardSubjectDto;
}

/**
 * Kanban board response with columns by status
 */
export class BoardResponseDto {
  @ApiProperty({
    description: 'Assignments with TO_DO status',
    type: [BoardCardDto],
    example: [{ id: 156, title: 'Implement QuickSort Algorithm', date: '2024-10-15 23:59:59', url: null, isOverdue: false, isManual: false, types: ['QUIZ'], subject: { id: 42, name: 'Advanced Algorithms', icon: '📚', customName: 'Algo II' } }],
  })
  todo!: BoardCardDto[];

  @ApiProperty({
    description: 'Assignments with IN_PROGRESS status',
    type: [BoardCardDto],
    example: [],
  })
  inProgress!: BoardCardDto[];

  @ApiProperty({
    description: 'Assignments with DONE status',
    type: [BoardCardDto],
    example: [],
  })
  done!: BoardCardDto[];
}
