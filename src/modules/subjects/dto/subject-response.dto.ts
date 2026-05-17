import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { DateUtils } from '@/src/common/utils/date.utils';

/**
 * Assignment counts for a subject
 */
export class SubjectCountsDto {
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
    example: 8,
  })
  done!: number;

  @ApiProperty({
    description: 'Total number of assignments',
    example: 19,
  })
  total!: number;
}

/**
 * Recent assignment in subject details
 */
export class RecentAssignmentDto {
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
    example: 'DONE',
  })
  status!: string;
}

/**
 * Subject details response
 */
export class SubjectResponseDto {
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

  @ApiProperty({
    description: 'Assignment counts for this subject',
    type: SubjectCountsDto,
  })
  counts!: SubjectCountsDto;

  @ApiProperty({
    description: 'Recent assignments for this subject (optional)',
    type: [RecentAssignmentDto],
    isArray: true,
    required: false,
  })
  recentAssignments?: RecentAssignmentDto[];

  /**
   * Factory method to create SubjectResponseDto from raw query result
   */
  static fromRaw(
    raw: {
      id: number;
      name: string;
      icon: string;
      customName: string | null;
      todo: string;
      inProgress: string;
      done: string;
      total: string;
    },
    recentAssignments?: HtAssignment[],
  ): SubjectResponseDto {
    const dto = new SubjectResponseDto();
    dto.id = Number(raw.id);
    dto.name = raw.name;
    dto.icon = raw.icon;
    dto.customName = raw.customName ?? null;
    dto.counts = {
      todo: Number(raw.todo ?? 0),
      inProgress: Number(raw.inProgress ?? 0),
      done: Number(raw.done ?? 0),
      total: Number(raw.total ?? 0),
    };
    if (recentAssignments) {
      dto.recentAssignments = recentAssignments.map((a) => ({
        id: a.id,
        title: a.title,
        date: DateUtils.toLocalString(a.date),
        status: a.status,
      }));
    }
    return dto;
  }
}
