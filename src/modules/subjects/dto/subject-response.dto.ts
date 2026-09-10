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
    example: { todo: 5, inProgress: 2, done: 8, total: 15 },
  })
  counts!: SubjectCountsDto;

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

    return dto;
  }
}
