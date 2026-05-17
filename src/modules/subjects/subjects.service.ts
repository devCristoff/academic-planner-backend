import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/src/common/exceptions/app.exception';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { SubjectResponseDto } from '@/src/modules/subjects/dto/subject-response.dto';
import { UpdateSubjectDto } from '@/src/modules/subjects/dto/update-subject.dto';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(HtSubject)
    private readonly subjectRepository: Repository<HtSubject>,
    @InjectRepository(HtAssignment)
    private readonly assignmentRepository: Repository<HtAssignment>,
  ) {}

  /**
   * Returns subjects for a user and term, including assignment counts grouped by status.
   */
  async listSubjects(
    userId: number,
    termId: number,
  ): Promise<SubjectResponseDto[]> {
    const rows = await this.subjectRepository
      .createQueryBuilder('s')
      .leftJoin('s.assignments', 'a')
      .where('s.dtUserId = :userId', { userId })
      .andWhere('s.dtAcademicTermId = :termId', { termId })
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

    return rows.map((r) => SubjectResponseDto.fromRaw(r));
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
