import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { DashboardResponseDto } from '@/src/modules/dashboard/dto/dashboard-response.dto';
import { DashboardService } from '@/src/modules/dashboard/dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard summary' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Dashboard payload', type: DashboardResponseDto })
  @Get()
  async getDashboard(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(user.userId, user.termId);
  }
}
