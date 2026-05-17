import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'student@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
