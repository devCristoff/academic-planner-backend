import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus, AssignmentType } from '@/src/common/enums/assignment.enum';

/**
 * Subject information in assignment response
 */
export class AssignmentSubjectDto {
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
    description: 'Custom subject name set by user',
    example: 'Algo II',
    nullable: true,
  })
  customName!: string | null;
}

/**
 * Assignment details response
 */
export class AssignmentResponseDto {
  @ApiProperty({
    description: 'Assignment unique identifier',
    example: 156,
  })
  id!: number;

  @ApiProperty({
    description: 'Assignment title/name',
    example: 'Implement QuickSort Algorithm',
  })
  title!: string;

  @ApiProperty({
    description: 'Assignment description or instructions',
    example: 'Implement QuickSort with different pivot strategies',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Due date in local format',
    example: '2024-10-15 23:59:59',
  })
  date!: string;

  @ApiProperty({
    description: 'External URL (LMS link, GitHub, etc.)',
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
    description: 'Whether assignment deadline has passed',
    example: false,
  })
  isOverdue!: boolean;

  @ApiProperty({
    description: 'Whether assignment was created manually (not synced from LMS)',
    example: false,
  })
  isManual!: boolean;

  @ApiProperty({
    description: 'Assignment types/tags',
    isArray: true,
    enum: Object.values(AssignmentType),
    example: ['QUIZ', 'DOCUMENT'],
  })
  types!: AssignmentType[];

  @ApiProperty({
    description: 'Subject this assignment belongs to',
    type: AssignmentSubjectDto,
    example: { id: 42, name: 'Advanced Algorithms', icon: '📚', customName: 'Algo II' },
  })
  subject!: AssignmentSubjectDto;
}
