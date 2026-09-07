import { ApiProperty } from '@nestjs/swagger';
import { AssignmentResponseDto } from '@/src/modules/assignments/dto/assignment-response.dto';

/**
 * Paginated envelope for the assignments list endpoint.
 * Shape matches the frontend's `DatatableResponse` type exactly.
 */
export class PaginatedAssignmentResponseDto {
  @ApiProperty({ type: [AssignmentResponseDto] })
  data!: AssignmentResponseDto[];

  @ApiProperty({ description: 'Total number of matching assignments', example: 42 })
  total!: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages!: number;
}
