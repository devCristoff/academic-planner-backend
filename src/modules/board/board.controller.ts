import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/src/common/guards/roles.guard';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { BoardResponseDto } from '@/src/modules/board/dto/board-response.dto';
import { BoardQueryDto } from '@/src/modules/board/dto/board-query.dto';
import { BoardService } from '@/src/modules/board/board.service';

@Controller('board')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@ApiTags('Board')
@ApiBearerAuth('access-token')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiOperation({ summary: 'Get Kanban board columns (todo/inProgress/done), optionally filtered by subjects' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Board payload', type: BoardResponseDto })
  @Get()
  async getBoard(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: BoardQueryDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.getBoard(
      user.userId,
      user.termId,
      query.subjectIds,
    );
  }
}
