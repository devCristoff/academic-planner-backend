import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/src/modules/auth/auth.service';
import { AuthResponseDto } from '@/src/modules/auth/dto/auth-response.dto';
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
}
