import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';

export class BoardQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by subject identifiers (comma-separated)',
    example: '3,7,12',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const raw = Array.isArray(value) ? value : String(value).split(',');
    return raw.map((v) => Number(v));
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  subjectIds?: number[];
}
