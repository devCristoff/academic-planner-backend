import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { SubjectResponseDto } from '@/src/modules/subjects/dto/subject-response.dto';
import { SubjectFilterDto } from '@/src/modules/subjects/dto/subject-filter.dto';
import { PaginatedSubjectResponseDto } from '@/src/modules/subjects/dto/paginated-subject-response.dto';
import { UpdateSubjectDto } from '@/src/modules/subjects/dto/update-subject.dto';
import { SubjectsService } from '@/src/modules/subjects/subjects.service';
import { PaginatedResult } from '@/src/common/dto/paginated-result.interface';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
@ApiTags('Subjects')
@ApiBearerAuth('access-token')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'List subjects for current user/term with assignment counts, paginated' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Paginated subjects list', type: PaginatedSubjectResponseDto })
  @Get()
  async list(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: SubjectFilterDto,
  ): Promise<PaginatedResult<SubjectResponseDto>> {
    return this.subjectsService.listSubjects(user.userId, user.termId, query);
  }

  @ApiOperation({ summary: 'Get a single subject with counts and recent assignments' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Subject detail', type: SubjectResponseDto })
  @Get(':id')
  async getOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubjectResponseDto | null> {
    return this.subjectsService.getSubject(user.userId, user.termId, id);
  }

  @ApiOperation({ summary: 'Update a subject icon/custom name' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Updated subject', type: SubjectResponseDto })
  @Patch(':id')
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSubjectDto,
  ): Promise<SubjectResponseDto | null> {
    return this.subjectsService.updateSubject(
      user.userId,
      user.termId,
      id,
      body,
    );
  }
}
