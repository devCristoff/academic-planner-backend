import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicTermsController } from '@/src/modules/academic-terms/academic-terms.controller';
import { AcademicTermsService } from '@/src/modules/academic-terms/academic-terms.service';
import { DefAcademicTerm } from '@/src/modules/academic-terms/entities/def-academic-term.entity';
import { DtAcademicTerm } from '@/src/modules/academic-terms/entities/dt-academic-term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DtAcademicTerm, DefAcademicTerm])],
  controllers: [AcademicTermsController],
  providers: [AcademicTermsService],
  exports: [AcademicTermsService, TypeOrmModule],
})
export class AcademicTermsModule {}
