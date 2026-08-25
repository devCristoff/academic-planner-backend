import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { AssignmentsService } from '@/src/modules/assignments/assignments.service';
import { TemplateService } from '@/src/common/services/template.service';
import { AssignmentFilterDto } from '@/src/modules/assignments/dto/assignment-filter.dto';
import { AssignmentResponseDto } from '@/src/modules/assignments/dto/assignment-response.dto';
import { GenerateEssayResponseDto } from '@/src/modules/assignments/dto/generate-essay-response.dto';
import { CreateAssignmentDto } from '@/src/modules/assignments/dto/create-assignment.dto';
import { UpdateAssignmentDto } from '@/src/modules/assignments/dto/update-assignment.dto';
import { UpdateAssignmentStatusDto } from '@/src/modules/assignments/dto/update-assignment-status.dto';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiTags('Assignments')
@ApiBearerAuth('access-token')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly templateService: TemplateService,
    @InjectRepository(DtUser)
    private readonly userRepository: Repository<DtUser>,
  ) { }

  @ApiOperation({ summary: 'List assignments for current user/term with optional filters' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Assignments list', type: AssignmentResponseDto, isArray: true })
  @Get()
  async list(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: AssignmentFilterDto,
  ): Promise<AssignmentResponseDto[]> {
    return this.assignmentsService.listAssignments(
      user.userId,
      user.termId,
      query,
    );
  }

  @ApiOperation({ summary: 'Get presentation template with assignment title and due date' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Rendered presentation template', type: String })
  @Get(':id/presentation-template')
  async getPresentationTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<string> {
    const userEntity = await this.userRepository.findOneBy({ id: user.userId });

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const assignment = await this.assignmentsService.getAssignment(user.userId, user.termId, id);

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const dueDate = new Date(assignment.date);

    return this.templateService.renderPresentationTemplate(userEntity, assignment.title, dueDate);
  }

  @ApiOperation({ summary: 'Get assignment detail' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Assignment detail', type: AssignmentResponseDto })
  @Get(':id')
  async getOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssignmentResponseDto | null> {
    return this.assignmentsService.getAssignment(user.userId, user.termId, id);
  }

  @ApiOperation({ summary: 'Generate a technical essay for an assignment using its title as the topic' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Generated essay', type: GenerateEssayResponseDto })
  @Post(':id/generate-technical-essay')
  async generateTechnicalEssay(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GenerateEssayResponseDto> {
    return this.assignmentsService.generateTechnicalEssay(user.userId, user.termId, id);
  }

  @ApiOperation({ summary: 'Create a manual assignment' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Created assignment', type: AssignmentResponseDto })
  @Post()
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateAssignmentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AssignmentResponseDto | null> {
    const assignment = await this.assignmentsService.createAssignment(
      user.userId,
      user.termId,
      body,
    );

    res.setHeader('Location', `/assignments/${assignment!.id}`);

    return assignment;
  }

  @ApiOperation({ summary: 'Update assignment status (TO_DO/IN_PROGRESS/DONE only)' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Updated assignment', type: AssignmentResponseDto })
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAssignmentStatusDto,
  ): Promise<AssignmentResponseDto | null> {
    return this.assignmentsService.updateStatus(
      user.userId,
      user.termId,
      id,
      body,
    );
  }

  @ApiOperation({ summary: 'Edit a manual assignment (canvas_id < 0 only)' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Updated assignment', type: AssignmentResponseDto })
  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto | null> {
    return this.assignmentsService.updateAssignment(
      user.userId,
      user.termId,
      id,
      body,
    );
  }
}
