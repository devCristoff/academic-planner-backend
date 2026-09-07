import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/src/common/guards/roles.guard';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { AcademicTermsService } from '@/src/modules/academic-terms/academic-terms.service';
import { AcademicTermResponseDto } from '@/src/modules/academic-terms/dto/academic-term-response.dto';
import { CreateAcademicTermDto } from '@/src/modules/academic-terms/dto/create-academic-term.dto';

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

  @ApiOperation({ summary: 'Create a new academic term (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Created term', type: AcademicTermResponseDto })
  @Post()
  async create(
    @Body() body: CreateAcademicTermDto,
  ): Promise<AcademicTermResponseDto> {
    return this.academicTermsService.create(body);
  }
}
