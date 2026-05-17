import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { AssignmentType } from '@/src/common/enums/assignment.enum';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({
    description: 'Updated assignment title',
    example: 'Implement QuickSort Algorithm (Revised)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated assignment description',
    example: 'Use median-of-three pivot selection',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated due date in ISO format',
    example: '2024-10-20T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Updated external URL',
    example: 'https://canvas.university.edu/assignments/156',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    description: 'Updated assignment types/tags',
    enum: AssignmentType,
    isArray: true,
    example: ['QUIZ'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(3)
  @IsEnum(AssignmentType, { each: true })
  types?: AssignmentType[];
}
