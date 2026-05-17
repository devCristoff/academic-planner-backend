import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'student@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: '6-digit OTP code received via email',
    example: '482915',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
