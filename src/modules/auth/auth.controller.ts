import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/src/modules/auth/auth.service';
import { RequestOtpDto } from '@/src/modules/auth/dto/request-otp.dto';
import { VerifyOtpDto } from '@/src/modules/auth/dto/verify-otp.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Start passwordless login with email' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @Post('request-otp')
  async requestOtp(
    @Body() body: RequestOtpDto,
  ): Promise<{ message: string } | null> {
    return this.authService.requestOtp(body);
  }

  @ApiOperation({ summary: 'Verify OTP and obtain JWT' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'OTP verified successfully, returns JWT' })
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<{ accessToken: string }> {
    return this.authService.verifyOtp(body);
  }
}
