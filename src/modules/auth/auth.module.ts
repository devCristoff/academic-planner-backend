import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import { CommonModule } from '@/src/common/common.module';
import { AcademicTermsModule } from '@/src/modules/academic-terms/academic-terms.module';
import { AuthController } from '@/src/modules/auth/auth.controller';
import { AuthService } from '@/src/modules/auth/auth.service';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';
import { DtUserOtp } from '@/src/modules/auth/entities/dt-user-otp.entity';
import { JwtStrategy } from '@/src/modules/auth/strategies/jwt.strategy';

/**
 * Auth Module
 * Handles user authentication via JWT and Passport
 * 
 * Does NOT re-export framework modules (JwtModule, PassportModule, TypeOrmModule)
 * to maintain clean module boundaries - consumers should import these directly if needed
 */
@Module({
  imports: [
    CommonModule,
    AcademicTermsModule,
    TypeOrmModule.forFeature([DtUser, DtUserOtp]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'change_me',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ??
            '7d') as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
