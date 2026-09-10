import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/src/common/exceptions/app.exception';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { SubjectResponseDto } from '@/src/modules/subjects/dto/subject-response.dto';
import { SubjectFilterDto } from '@/src/modules/subjects/dto/subject-filter.dto';
import { UpdateSubjectDto } from '@/src/modules/subjects/dto/update-subject.dto';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';
import { PaginatedResult } from '@/src/common/dto/paginated-result.interface';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(HtSubject)
    private readonly subjectRepository: Repository<HtSubject>,
    @InjectRepository(HtAssignment)
    private readonly assignmentRepository: Repository<HtAssignment>,
  ) {}

  /**
   * Returns a page of subjects for a user and term, including assignment counts grouped by status.
   */
  async listSubjects(
    userId: number,
    termId: number,
    filter: SubjectFilterDto,
  ): Promise<PaginatedResult<SubjectResponseDto>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const baseQb = this.subjectRepository
      .createQueryBuilder('s')
      .leftJoin('s.assignments', 'a')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.status = :status', { status: 'ACTIVE' })
      .andWhere('s.dtAcademicTermId = :termId', { termId });

    // getCount() on a grouped query builder is unreliable in TypeORM, so total is
    // computed separately with a distinct count over the ungrouped where clause.
    const totalRow = await baseQb.clone()
      .select('COUNT(DISTINCT s.id)', 'count')
      .getRawOne<{ count: string }>();
    const total = Number(totalRow?.count ?? 0);

    const rows = await baseQb
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('s.icon', 'icon')
      .addSelect('s.customName', 'customName')
      .addSelect("SUM(CASE WHEN a.status = 'TO_DO' THEN 1 ELSE 0 END)", 'todo')
      .addSelect(
        "SUM(CASE WHEN a.status = 'IN_PROGRESS' THEN 1 ELSE 0 END)",
        'inProgress',
      )
      .addSelect("SUM(CASE WHEN a.status = 'DONE' THEN 1 ELSE 0 END)", 'done')
      .addSelect('COUNT(a.id)', 'total')
      .groupBy('s.id')
      .orderBy('s.name', 'ASC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany<{
        id: number;
        name: string;
        icon: string;
        customName: string | null;
        todo: string;
        inProgress: string;
        done: string;
        total: string;
      }>();

    return {
      data: rows.map((r) => SubjectResponseDto.fromRaw(r)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  /**
   * Returns a single subject with counts and recent assignments.
   *
   * @throws AppException(404, 'SUBJECT_NOT_FOUND')
   */
  async getSubject(
    userId: number,
    termId: number,
    subjectId: number,
  ): Promise<SubjectResponseDto | null> {
    const row = await this.subjectRepository
      .createQueryBuilder('s')
      .leftJoin('s.assignments', 'a')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .andWhere('s.id = :subjectId', { subjectId })
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('s.icon', 'icon')
      .addSelect('s.customName', 'customName')
      .addSelect("SUM(CASE WHEN a.status = 'TO_DO' THEN 1 ELSE 0 END)", 'todo')
      .addSelect(
        "SUM(CASE WHEN a.status = 'IN_PROGRESS' THEN 1 ELSE 0 END)",
        'inProgress',
      )
      .addSelect("SUM(CASE WHEN a.status = 'DONE' THEN 1 ELSE 0 END)", 'done')
      .addSelect('COUNT(a.id)', 'total')
      .groupBy('s.id')
      .getRawOne<{
        id: number;
        name: string;
        icon: string;
        customName: string | null;
        todo: string;
        inProgress: string;
        done: string;
        total: string;
      }>();

    if (!row) {
      return null;
    }

    const recentAssignments = await this.assignmentRepository
      .createQueryBuilder('a')
      .innerJoin('a.subject', 's')
      .where('s.id = :subjectId', { subjectId })
      .andWhere('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
      .orderBy('a.date', 'DESC')
      .take(5)
      .getMany();

    return SubjectResponseDto.fromRaw(row, recentAssignments);
  }

  /**
   * Updates icon and/or custom name for a subject owned by the current user.
   *
   * @throws AppException(403, 'SUBJECT_FORBIDDEN')
   * @throws AppException(404, 'SUBJECT_NOT_FOUND')
   */
  async updateSubject(
    userId: number,
    termId: number,
    subjectId: number,
    body: UpdateSubjectDto,
  ): Promise<SubjectResponseDto | null> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });
    if (!subject) {
      return null;
    }

    if (subject.dtUserId !== userId || subject.dtAcademicTermId !== termId) {
      throw AppException.forbidden('SUBJECT_FORBIDDEN', 'Not allowed');
    }

    if (body.icon !== undefined) {
      subject.icon = body.icon;
    }
    if (body.customName !== undefined) {
      subject.customName = body.customName;
    }

    await this.subjectRepository.save(subject);
    return this.getSubject(userId, termId, subjectId);
  }
}
