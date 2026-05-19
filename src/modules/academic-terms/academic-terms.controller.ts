import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AcademicTermsService } from '@/src/modules/academic-terms/academic-terms.service';
import { AcademicTermResponseDto } from '@/src/modules/academic-terms/dto/academic-term-response.dto';

@Controller('academic-terms')
@ApiTags('Academic Terms')
export class AcademicTermsController {
  constructor(private readonly academicTermsService: AcademicTermsService) {}

  @ApiOperation({ summary: 'List all academic terms (joined with definition)' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Academic terms list', type: AcademicTermResponseDto, isArray: true })
  @Get()
  async listAll(): Promise<AcademicTermResponseDto[]> {
    return this.academicTermsService.listAll();
  }

  @ApiOperation({ summary: 'Get current active academic term' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Current term', type: AcademicTermResponseDto })
  @Get('current')
  async getCurrent(): Promise<AcademicTermResponseDto> {
    return this.academicTermsService.getCurrent();
  }
}
