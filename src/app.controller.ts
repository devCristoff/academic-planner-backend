import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from '@/src/app.service';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ description: 'Service is up' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
