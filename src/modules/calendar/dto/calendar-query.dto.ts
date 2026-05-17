import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CalendarQueryDto {
  @ApiPropertyOptional({
    description: 'Year filter (4-digit)',
    example: 2024,
    minimum: 2000,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    description: 'Month filter (1-12)',
    example: 10,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
