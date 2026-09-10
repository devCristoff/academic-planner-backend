import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/src/common/exceptions/app.exception';
import { AssignmentRepository } from '@/src/common/repositories';
import { SubjectRepository } from '@/src/common/repositories';
import { GeminiService } from '@/src/common/services/gemini.service';
import { AssignmentFilterDto } from '@/src/modules/assignments/dto/assignment-filter.dto';
import {
  AssignmentResponseDto,
} from '@/src/modules/assignments/dto/assignment-response.dto';
import { PaginatedResult } from '@/src/common/dto/paginated-result.interface';
import { GenerateEssayResponseDto } from '@/src/modules/assignments/dto/generate-essay-response.dto';
import { CreateAssignmentDto } from '@/src/modules/assignments/dto/create-assignment.dto';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';
import { UpdateAssignmentDto } from '@/src/modules/assignments/dto/update-assignment.dto';
import { UpdateAssignmentStatusDto } from '@/src/modules/assignments/dto/update-assignment-status.dto';
import { AssignmentType } from '@/src/common/enums/assignment.enum';
import { HtAssignmentHasDefType } from '@/src/modules/assignments/entities/ht-assignment-has-def-type.entity';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { DateUtils } from '@/src/common/utils/date.utils';

const EDITABLE_STATUSES: ReadonlySet<AssignmentStatus> = new Set(Object.values(AssignmentStatus));

/**
 * Assignments service
 * Handles assignment CRUD operations and filtering
 * Uses AssignmentRepository for optimized queries
 */
@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly geminiService: GeminiService,
    @InjectRepository(HtAssignmentHasDefType)
    private readonly assignmentTypeRepository: Repository<HtAssignmentHasDefType>,
  ) {}

  /**
   * Lists assignments for a user and term applying optional filters, paginated.
   */
  async listAssignments(
    userId: number,
    termId: number,
    filter: AssignmentFilterDto,
  ): Promise<PaginatedResult<AssignmentResponseDto>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const { items, total } = await this.assignmentRepository.getAssignmentsWithFilters(
      userId,
      termId,
      filter,
      page,
      limit,
    );

    return {
      data: items.map((a) => this.toResponseDto(a)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  /**
   * Returns a single assignment with types and subject.
   *
   * @throws AppException(404, 'ASSIGNMENT_NOT_FOUND')
   */
  async getAssignment(
    userId: number,
    termId: number,
    assignmentId: number,
  ): Promise<AssignmentResponseDto | null> {
    const assignment = await this.assignmentRepository.getAssignmentWithDetails(
      assignmentId,
      userId,
    );
    if (!assignment) {
      return null;
    }

    // Validate term ownership
    if (assignment.subject.dtAcademicTermId !== termId) {
      return null;
    }

    return this.toResponseDto(assignment);
  }

  /**
   * Creates a manual assignment owned by the user in the provided term.
   *
   * @throws AppException(403, 'SUBJECT_FORBIDDEN')
   */
  async createAssignment(
    userId: number,
    termId: number,
    body: CreateAssignmentDto,
  ): Promise<AssignmentResponseDto | null> {
    const subject = await this.subjectRepository.getSubjectWithValidation(
      body.subjectId,
      userId,
    );
    if (!subject || subject.dtAcademicTermId !== termId) {
      throw AppException.forbidden('SUBJECT_FORBIDDEN', 'Not allowed');
    }

    const assignment = this.assignmentRepository.createInstance({
      htSubjectId: subject.id,
      canvasId: null,
      title: body.title,
      description: body.description ?? null,
      date: new Date(body.date),
      url: body.url ?? null,
      status: AssignmentStatus.TO_DO,
    });

    const saved = await this.assignmentRepository.save(assignment);

    if (body.types && body.types.length > 0) {
      await this.assignmentTypeRepository.insert(
        body.types.map((t) => ({
          htAssignmentId: saved.id,
          defTypeId: t,
        })),
      );
    }

    return this.getAssignment(userId, termId, saved.id);
  }

  /**
   * Updates assignment status.
   *
   * @throws AppException(400, 'INVALID_STATUS_TRANSITION')
   * @throws AppException(404, 'ASSIGNMENT_NOT_FOUND')
   */
  async updateStatus(
    userId: number,
    termId: number,
    assignmentId: number,
    body: UpdateAssignmentStatusDto,
  ): Promise<AssignmentResponseDto | null> {
    const status = body.status as AssignmentStatus;

    if (!EDITABLE_STATUSES.has(status)) {
      throw AppException.badRequest(
        'INVALID_STATUS_TRANSITION',
        'Only TO_DO, IN_PROGRESS, DONE are allowed',
      );
    }

    const assignment = await this.assignmentRepository.getAssignmentWithDetails(
      assignmentId,
      userId,
    );

    if (!assignment) return null;
    if (assignment.subject.dtAcademicTermId !== termId) return null;

    assignment.status = status;
    await this.assignmentRepository.save(assignment);
    return this.toResponseDto(assignment);
  }

  /**
   * Updates a manual assignment (canvas_id < 0 only) and optionally replaces its types.
   *
   * @throws AppException(403, 'CANVAS_ASSIGNMENT_NOT_EDITABLE')
   * @throws AppException(404, 'ASSIGNMENT_NOT_FOUND')
   */
  async updateAssignment(
    userId: number,
    termId: number,
    assignmentId: number,
    body: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto | null> {
    const assignment = await this.assignmentRepository.getAssignmentWithDetails(
      assignmentId,
      userId,
    );

    if (!assignment) return null;
    if (assignment.subject.dtAcademicTermId !== termId) return null;

    // if (assignment.canvasId > 0) {
    //   throw AppException.forbidden(
    //     'CANVAS_ASSIGNMENT_NOT_EDITABLE',
    //     'Canvas assignments cannot be edited',
    //   );
    // }

    if (body.title !== undefined) assignment.title = body.title;
    if (body.description !== undefined)
      assignment.description = body.description;
    if (body.date !== undefined) assignment.date = new Date(body.date);
    if (body.url !== undefined) assignment.url = body.url;

    await this.assignmentRepository.save(assignment);

    if (body.types !== undefined) {
      const types = body.types as AssignmentType[];

      await this.assignmentTypeRepository.delete({
        htAssignmentId: assignment.id,
      });
      if (types.length > 0) {
        await this.assignmentTypeRepository.insert(
          types.map((t) => ({
            htAssignmentId: assignment.id,
            defTypeId: t,
          })),
        );
      }
    }

    return this.getAssignment(userId, termId, assignment.id);
  }

  /**
   * Generates a technical essay for an assignment using its title as the topic.
   *
   * @throws AppException(404, 'ASSIGNMENT_NOT_FOUND')
   * @throws InternalServerErrorException if Gemini API call fails
   */
  async generateTechnicalEssay(
    userId: number,
    termId: number,
    assignmentId: number,
  ): Promise<GenerateEssayResponseDto> {
    const assignment = await this.assignmentRepository.getAssignmentWithDetails(
      assignmentId,
      userId,
    );

    if (!assignment || assignment.subject.dtAcademicTermId !== termId) {
      throw AppException.notFound('ASSIGNMENT_NOT_FOUND', 'Assignment not found');
    }

    const essay = await this.geminiService.generateTechnicalEssay(assignment.title);

    const dto = new GenerateEssayResponseDto();
    dto.assignmentId = assignment.id;
    dto.title = assignment.title;
    dto.essay = essay;
    return dto;
  }

  private toResponseDto(entity: HtAssignment): AssignmentResponseDto {
    const types: AssignmentType[] = (entity.typeLinks ?? []).map(
      (l) => l.defTypeId,
    );

    const dto = new AssignmentResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.date = DateUtils.toLocalString(entity.date);
    dto.dueTime = DateUtils.toLocalString(entity.date).split(' ')[1];
    dto.url = entity.url;
    dto.status = entity.status;
    dto.types = types;
    dto.isManual = entity.canvasId === null;
    dto.isOverdue =
      entity.date < new Date() &&
      [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS].includes(
        entity.status as AssignmentStatus,
      );
    dto.subject = {
      id: entity.subject.id,
      name: entity.subject.name,
      icon: entity.subject.icon,
      customName: entity.subject.customName,
    };
    return dto;
  }
}
