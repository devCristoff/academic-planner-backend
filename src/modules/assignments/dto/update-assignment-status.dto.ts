import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';

export class UpdateAssignmentStatusDto {
  @ApiProperty({
    description: 'Updated assignment status',
    enum: AssignmentStatus,
    example: AssignmentStatus.IN_PROGRESS,
  })
  @IsEnum(AssignmentStatus)
  status!: AssignmentStatus;
}
