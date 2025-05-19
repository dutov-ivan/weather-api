import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, city: string, frequency: string) {
    const confirmationLink = `http://example.com/confirm?email=${email}&city=${city}&frequency=${frequency}`;
    const res = await this.mailerService.sendMail({
      to: email,
      subject: 'Weather Subscription Confirmation',
      template: './subscription',
      context: {
        city,
        frequency,
        confirmationLink,
      },
    });

    this.logger.log('Email sent:', res);
  }
}
