import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/src/common/common.module';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { CalendarController } from '@/src/modules/calendar/calendar.controller';
import { CalendarService } from '@/src/modules/calendar/calendar.service';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([HtAssignment])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
