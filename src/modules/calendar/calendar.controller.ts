import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { CalendarQueryDto } from '@/src/modules/calendar/dto/calendar-query.dto';
import { CalendarResponseDto } from '@/src/modules/calendar/dto/calendar-response.dto';
import { CalendarService } from '@/src/modules/calendar/calendar.service';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiTags('Calendar')
@ApiBearerAuth('access-token')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiOperation({ summary: 'Get calendar entries grouped by date for a given month' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ description: 'Calendar mapping' })
  @Get()
  async getCalendar(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: CalendarQueryDto,
  ): Promise<CalendarResponseDto> {
    return this.calendarService.getCalendar(user.userId, user.termId, query);
  }
}
