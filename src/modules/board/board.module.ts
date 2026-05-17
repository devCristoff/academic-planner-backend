import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/src/common/common.module';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';
import { BoardController } from '@/src/modules/board/board.controller';
import { BoardService } from '@/src/modules/board/board.service';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([HtAssignment])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
