import { ApiProperty } from '@nestjs/swagger';
import { SubjectResponseDto } from '@/src/modules/subjects/dto/subject-response.dto';

/**
 * Paginated envelope for the subjects list endpoint.
 * Shape matches the frontend's `DatatableResponse` type exactly.
 */
export class PaginatedSubjectResponseDto {
  @ApiProperty({ type: [SubjectResponseDto] })
  data!: SubjectResponseDto[];

  @ApiProperty({ description: 'Total number of matching subjects', example: 12 })
  total!: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages', example: 1 })
  totalPages!: number;
}
