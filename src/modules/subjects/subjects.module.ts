import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/src/common/common.module';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { SubjectsController } from '@/src/modules/subjects/subjects.controller';
import { SubjectsService } from '@/src/modules/subjects/subjects.service';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([HtSubject, HtAssignment])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
