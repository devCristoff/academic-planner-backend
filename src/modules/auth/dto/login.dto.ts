import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Canvas user ID',
    example: 12345,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  canvasId!: number;
}
