import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { AssignmentType } from '@/src/common/enums/assignment.enum';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Subject identifier for the assignment',
    example: 42,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  subjectId!: number;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Implement QuickSort Algorithm',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({
    description: 'Assignment description or instructions',
    example: 'Implement QuickSort with different pivot strategies',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Assignment due date in ISO format',
    example: '2024-10-15T23:59:59.000Z',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'External URL (LMS, GitHub, etc.)',
    example: 'https://canvas.university.edu/assignments/156',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    description: 'Assignment types/tags',
    enum: AssignmentType,
    isArray: true,
    example: ['QUIZ', 'DOCUMENT'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(3)
  @IsEnum(AssignmentType, { each: true })
  types?: AssignmentType[];
}
