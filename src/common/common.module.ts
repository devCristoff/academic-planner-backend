import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { HtAssignmentHasDefType } from '@/src/modules/assignments/entities/ht-assignment-has-def-type.entity';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/src/common/guards/roles.guard';
import { TermContextService } from '@/src/common/services/term-context.service';
import { MailService } from '@/src/common/services/mail.service';
import { GeminiService } from '@/src/common/services/gemini.service';
import { TemplateService } from '@/src/common/services/template.service';
import {
  AssignmentRepository,
  SubjectRepository,
  AcademicTermRepository,
  DashboardQueryRepository,
} from '@/src/common/repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DtAcademicTerm,
      HtAssignment,
      HtAssignmentHasDefType,
      HtSubject,
    ]),
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    {
      provide: TermContextService,
      useClass: TermContextService,
      scope: Scope.REQUEST,
    },
    MailService,
    GeminiService,
    TemplateService,
    AssignmentRepository,
    SubjectRepository,
    AcademicTermRepository,
    DashboardQueryRepository,
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    MailService,
    GeminiService,
    TemplateService,
    TermContextService,
    TypeOrmModule,
    AssignmentRepository,
    SubjectRepository,
    AcademicTermRepository,
    DashboardQueryRepository,
  ],
})
export class CommonModule {}
