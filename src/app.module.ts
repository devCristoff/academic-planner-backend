import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@/src/config/database.config';
import { CommonModule } from '@/src/common/common.module';
import { AcademicTermsModule } from '@/src/modules/academic-terms/academic-terms.module';
import { AssignmentsModule } from '@/src/modules/assignments/assignments.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { BoardModule } from '@/src/modules/board/board.module';
import { CalendarModule } from '@/src/modules/calendar/calendar.module';
import { DashboardModule } from '@/src/modules/dashboard/dashboard.module';
import { SubjectsModule } from '@/src/modules/subjects/subjects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'local'}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({ useFactory: getDatabaseConfig }),
    CommonModule,
    AuthModule,
    AcademicTermsModule,
    SubjectsModule,
    AssignmentsModule,
    BoardModule,
    CalendarModule,
    DashboardModule,
  ],
})
export class AppModule { }
