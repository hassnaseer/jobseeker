import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * SMTP-backed email sender (nodemailer). Falls back to console logging when
 * MAIL_HOST isn't configured, so the app still boots and other modules
 * don't need to know which mode is active.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('mail.smtpHost');
    if (!host) {
      this.logger.warn('MAIL_HOST not set — emails will be logged to the console instead of sent.');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('mail.smtpPort'),
      secure: this.configService.get<number>('mail.smtpPort') === 465,
      auth: {
        user: this.configService.get<string>('mail.smtpUser'),
        pass: this.configService.get<string>('mail.smtpPass'),
      },
      // Fail fast on a blocked/unreachable network rather than hanging the
      // request that triggered the email for minutes on the OS-level
      // TCP timeout.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    const from = this.configService.get<string>('mail.from');
    if (!this.transporter) {
      this.logger.log(`[mail:stub] from="${from}" to="${to}" subject="${subject}"\n${body}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from, to, subject, text: body });
    } catch (error) {
      this.logger.warn(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }

  async sendEmailVerification(to: string, token: string): Promise<void> {
    const webAppUrl = this.configService.get<string>('webAppUrl');
    const link = `${webAppUrl}/verify-email?token=${token}`;
    await this.send(
      to,
      'Verify your JobLinxs email',
      `Welcome to JobLinxs! Verify your email: ${link}`,
    );
  }

  async sendPasswordResetInstructions(to: string, token: string): Promise<void> {
    const webAppUrl = this.configService.get<string>('webAppUrl');
    const link = `${webAppUrl}/reset-password?token=${token}`;
    await this.send(
      to,
      'Reset your JobLinxs password',
      `Reset your password (link expires shortly): ${link}`,
    );
  }

  async sendPasswordResetConfirmation(to: string): Promise<void> {
    await this.send(
      to,
      'Your JobLinxs password was reset',
      'Your password was just reset. If this wasn’t you, contact support immediately.',
    );
  }

  async sendPasswordChangedAlert(to: string): Promise<void> {
    await this.send(
      to,
      'Your JobLinxs password was changed',
      'Your password was just changed. If this wasn’t you, contact support immediately.',
    );
  }
}
