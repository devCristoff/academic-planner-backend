import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/src/common/common.module';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';
import { DashboardController } from '@/src/modules/dashboard/dashboard.controller';
import { DashboardService } from '@/src/modules/dashboard/dashboard.service';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([DtAcademicTerm, HtSubject, HtAssignment]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
