import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { CalendarQueryDto } from '@/src/modules/calendar/dto/calendar-query.dto';
import { CalendarEntryDto, CalendarResponseDto } from '@/src/modules/calendar/dto/calendar-response.dto';
import { CalendarService } from '@/src/modules/calendar/calendar.service';

@ApiExtraModels(CalendarEntryDto)
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiTags('Calendar')
@ApiBearerAuth('access-token')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiOperation({ summary: 'Get calendar entries grouped by date for a given month' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Calendar mapping — keys are ISO date strings (YYYY-MM-DD)',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { $ref: getSchemaPath(CalendarEntryDto) },
      },
      example: {
        '2024-10-15': [
          {
            id: 156,
            title: 'Implement QuickSort Algorithm',
            status: 'TO_DO',
            isOverdue: false,
            isManual: false,
            types: ['QUIZ'],
            subject: { id: 42, name: 'Advanced Algorithms', icon: '📚', customName: 'Algo II' },
          },
        ],
      },
    },
  })
  @Get()
  async getCalendar(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: CalendarQueryDto,
  ): Promise<CalendarResponseDto> {
    return this.calendarService.getCalendar(user.userId, user.termId, query);
  }
}
