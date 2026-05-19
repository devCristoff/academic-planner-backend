import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { DatatableQueryDto } from '@/src/modules/datatable/dto/datatable-query.dto';
import { DatatableResponseDto } from '@/src/modules/datatable/dto/datatable-response.dto';
import { DatatableService } from '@/src/modules/datatable/datatable.service';

@Controller('datatable')
@UseGuards(JwtAuthGuard)
@ApiTags('Datatable')
@ApiBearerAuth('access-token')
export class DatatableController {
  constructor(private readonly datatableService: DatatableService) {}

  @ApiOperation({ summary: 'Get paginated/sorted datatable rows' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Datatable payload', type: DatatableResponseDto })
  @Get()
  async getDatatable(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: DatatableQueryDto,
  ): Promise<DatatableResponseDto> {
    return this.datatableService.getDatatable(user.userId, user.termId, query);
  }
}
