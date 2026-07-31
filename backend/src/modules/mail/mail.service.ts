import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Console-logging stand-in for the real email provider. The notifications
 * module (see spec §12) will replace this with an SES/SendGrid-backed
 * implementation behind the same interface; nothing in the auth module
 * should need to change when that lands.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  private async send(to: string, subject: string, body: string): Promise<void> {
    const from = this.configService.get<string>('mail.from');
    this.logger.log(`[mail:stub] from="${from}" to="${to}" subject="${subject}"\n${body}`);
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

  async sendProfileApproved(to: string, role: string): Promise<void> {
    await this.send(
      to,
      'Your JobLinxs profile was approved',
      `Good news — your ${role} profile has been approved. You now have full access.`,
    );
  }

  async sendProfileRejected(to: string, role: string, reason: string): Promise<void> {
    await this.send(
      to,
      'Your JobLinxs profile needs changes',
      `Your ${role} profile submission was not approved. Reason: ${reason}\nPlease update your profile and resubmit.`,
    );
  }
}
