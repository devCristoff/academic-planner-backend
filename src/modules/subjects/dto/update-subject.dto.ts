import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSubjectDto {
  @ApiPropertyOptional({
    description: 'Updated subject icon (emoji)',
    example: 'book',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Updated custom subject name',
    example: 'Data Structures II',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customName?: string;
}
