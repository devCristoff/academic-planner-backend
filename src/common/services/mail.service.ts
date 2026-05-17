import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const port = this.configService.get<number>('SMTP_PORT');
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: port,
      secure: false,
      family: 4,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    } as nodemailer.TransportOptions);
  }

  async sendOtp(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: '"Academic Planner"',
        to: email,
        subject: 'Your Authentication Code',
        text: `Your one-time authentication code is: ${code}\n\nThis code will expire in 10 minutes.`,
        html: `<p>Your one-time authentication code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
      });
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error instanceof Error ? error.stack : 'Unknown error');
      throw error;
    }
  }
}
