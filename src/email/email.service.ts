import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Subscription } from '../subscription/subscription.model';
import { WeatherService } from '../weather/weather.service';
import { isDue } from './lib';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly mailerService: MailerService,
    private readonly weatherService: WeatherService,
  ) {}

  @Cron('* * * * *')
  async sendScheduledEmails() {
    const subscriptions =
      await this.subscriptionService.findConfirmedSubscriptions();
    const now = new Date();
    for (const sub of subscriptions) {
      if (isDue(sub, now)) {
        const weatherData = await this.weatherService.getCurrentWeather(
          sub.city,
        );
        await this.mailerService.sendMail({
          to: sub.email,
          subject: `Your ${sub.frequency} weather for ${sub.city}`,
          template: './weather',
          context: {
            weather: weatherData,
            frequency: sub.frequency,
            unsubscribeLink: `${process.env.APP_URL}/unsubscribe/${sub.confirmationCode}`,
          },
        });
        this.logger.log(`Email sent to ${sub.email} for ${sub.city}`);
        await this.subscriptionService.updateLastSent(sub.id, now);
      }
    }
  }

  async sendConfirmationEmail(subscription: Subscription) {
    const confirmationLink = `${process.env.APP_URL}/confirm/${subscription.confirmationCode}`;
    const res = await this.mailerService.sendMail({
      to: subscription.email,
      subject: 'Weather Subscription Confirmation',
      template: './subscription',
      context: {
        city: subscription.city,
        frequency: subscription.frequency,
        confirmationLink,
      },
    });

    this.logger.log('Email sent:', res);
  }
}
