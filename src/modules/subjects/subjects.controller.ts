import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { SubjectResponseDto } from '@/src/modules/subjects/dto/subject-response.dto';
import { UpdateSubjectDto } from '@/src/modules/subjects/dto/update-subject.dto';
import { SubjectsService } from '@/src/modules/subjects/subjects.service';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
@ApiTags('Subjects')
@ApiBearerAuth('access-token')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'List subjects for current user/term with assignment counts' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ description: 'Subjects list' })
  @Get()
  async list(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubjectResponseDto[]> {
    return this.subjectsService.listSubjects(user.userId, user.termId);
  }

  @ApiOperation({ summary: 'Get a single subject with counts and recent assignments' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ description: 'Subject detail' })
  @Get(':id')
  async getOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubjectResponseDto | null> {
    return this.subjectsService.getSubject(user.userId, user.termId, id);
  }

  @ApiOperation({ summary: 'Update a subject icon/custom name' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ description: 'Updated subject' })
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
