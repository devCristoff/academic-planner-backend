import { ApiProperty } from '@nestjs/swagger';

export class GenerateEssayResponseDto {
  @ApiProperty({ description: 'Assignment id the essay was generated for' })
  assignmentId!: number;

  @ApiProperty({ description: 'Assignment title used as the essay topic' })
  title!: string;

  @ApiProperty({ description: 'Generated technical essay in Markdown' })
  essay!: string;
}
