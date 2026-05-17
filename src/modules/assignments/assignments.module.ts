import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/src/common/common.module';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';
import { AssignmentsController } from '@/src/modules/assignments/assignments.controller';
import { AssignmentsService } from '@/src/modules/assignments/assignments.service';
import { HtAssignmentHasDefType } from '@/src/modules/assignments/entities/ht-assignment-has-def-type.entity';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([HtAssignment, HtAssignmentHasDefType, HtSubject]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
