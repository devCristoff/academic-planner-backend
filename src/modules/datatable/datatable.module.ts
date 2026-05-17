import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/src/common/common.module';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { DatatableController } from '@/src/modules/datatable/datatable.controller';
import { DatatableService } from '@/src/modules/datatable/datatable.service';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([HtAssignment])],
  controllers: [DatatableController],
  providers: [DatatableService],
})
export class DatatableModule {}
