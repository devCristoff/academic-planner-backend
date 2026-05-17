import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from '@/src/common/repositories';
import { AssignmentStatus } from '@/src/common/enums/assignment.enum';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { BoardCardDto, BoardResponseDto } from '@/src/modules/board/dto/board-response.dto';

/**
 * Board service
 * Provides assignment data grouped by status for Kanban-style board view
 * Uses AssignmentRepository for optimized queries
 */
@Injectable()
export class BoardService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  /**
   * Returns board columns for the current user and term.
   */
  async getBoard(
    userId: number,
    termId: number,
    subjectId?: number,
  ): Promise<BoardResponseDto> {
    const assignments = await this.assignmentRepository.getAssignmentsForBoard(
      userId,
      termId,
      subjectId,
    );

    const now = new Date();
    const response = new BoardResponseDto();
    response.todo = [];
    response.inProgress = [];
    response.done = [];

    for (const a of assignments) {
      const status = a.status as AssignmentStatus;
      const card = this.toBoardCard(a, now);

      if (status === AssignmentStatus.TO_DO) response.todo.push(card);
      else if (status === AssignmentStatus.IN_PROGRESS)
        response.inProgress.push(card);
      else if (status === AssignmentStatus.DONE) response.done.push(card);
    }

    return response;
  }

  private toBoardCard(assignment: HtAssignment, now: Date): BoardCardDto {
    const card = new BoardCardDto();
    card.id = assignment.id;
    card.title = assignment.title;
    card.date = assignment.date.toISOString();
    card.url = assignment.url;
    card.isManual = assignment.canvasId < 0;
    card.types = (assignment.typeLinks ?? []).map((t) => t.defTypeId);
    card.isOverdue =
      assignment.date < now &&
      [AssignmentStatus.TO_DO, AssignmentStatus.IN_PROGRESS].includes(
        assignment.status as AssignmentStatus,
      );
    card.subject = {
      id: assignment.subject.id,
      name: assignment.subject.name,
      icon: assignment.subject.icon,
      customName: assignment.subject.customName,
    };
    return card;
  }
}
