import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@/src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { AuthService } from '@/src/modules/auth/auth.service';
import { AuthResponseDto, AuthUserDto } from '@/src/modules/auth/dto/auth-response.dto';
import { RequestOtpDto } from '@/src/modules/auth/dto/request-otp.dto';
import { VerifyOtpDto } from '@/src/modules/auth/dto/verify-otp.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Start passwordless login with email' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP sent to john.doe@example.com' },
      },
    },
  })
  @Post('request-otp')
  async requestOtp(
    @Body() body: RequestOtpDto,
  ): Promise<{ message: string } | null> {
    return this.authService.requestOtp(body);
  }

  @ApiOperation({ summary: 'Verify OTP and obtain JWT' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'OTP verified successfully, returns JWT', type: AuthResponseDto })
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<{ accessToken: string }> {
    return this.authService.verifyOtp(body);
  }

  @ApiOperation({ summary: 'Get profile information for the currently authenticated user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Current user profile', type: AuthUserDto })
  @Get('me')
  async getMe(@CurrentUser() user: CurrentUserPayload): Promise<AuthUserDto> {
    return this.authService.getMe(user.userId);
  }
}
