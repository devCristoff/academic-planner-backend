import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt, createHash } from 'crypto';
import { AppException } from '@/src/common/exceptions/app.exception';
import { MailService } from '@/src/common/services/mail.service';
import { RequestOtpDto } from '@/src/modules/auth/dto/request-otp.dto';
import { VerifyOtpDto } from '@/src/modules/auth/dto/verify-otp.dto';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';
import { DtUserOtp } from '@/src/modules/auth/entities/dt-user-otp.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DtUser)
    private readonly userRepository: Repository<DtUser>,
    @InjectRepository(DtUserOtp)
    private readonly otpRepository: Repository<DtUserOtp>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async requestOtp(body: RequestOtpDto): Promise<{ message: string } | null> {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!user) {
      return null;
    }

    const unpaddedOtp = randomInt(0, 1000000).toString();
    const otp = unpaddedOtp.padStart(6, '0');

    const hashedOtp = createHash('sha256').update(otp).digest('hex');

    const dtUserOtp = new DtUserOtp();
    dtUserOtp.dtUserId = user.id;
    dtUserOtp.code = hashedOtp;
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    dtUserOtp.expiresAt = expiresAt;

    await this.otpRepository.save(dtUserOtp);

    await this.mailService.sendOtp(user.email, otp);

    return {
      message: 'OTP sent to email',
    };
  }

  async verifyOtp(body: VerifyOtpDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!user) {
      throw AppException.unauthorized('INVALID_OTP', 'Invalid or expired OTP');
    }

    const now = new Date();

    const latestOtp = await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.dtUserId = :userId', { userId: user.id })
      .andWhere('otp.usedAt IS NULL')
      .andWhere('otp.expiresAt > :now', { now })
      .orderBy('otp.createdAt', 'DESC')
      .getOne();

    if (!latestOtp) {
      throw AppException.unauthorized('INVALID_OTP', 'Invalid or expired OTP');
    }

    const hashedInput = createHash('sha256').update(body.code).digest('hex');

    if (latestOtp.code !== hashedInput) {
      throw AppException.unauthorized('INVALID_OTP', 'Invalid or expired OTP');
    }

    latestOtp.usedAt = now;
    await this.otpRepository.save(latestOtp);

    const accessToken = await this.jwtService.signAsync({
      dt_user_id: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
