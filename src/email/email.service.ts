import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Subscription } from 'src/subscription/subscription.model';
import { WeatherService } from 'src/weather/weather.service';
import { Repository } from 'typeorm';
import { isDue } from './lib';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly mailerService: MailerService,
    private readonly weatherService: WeatherService,
  ) {}

  @Cron('0 * * * *')
  async sendScheduledEmails() {
    const subscriptions = await this.subscriptionRepository.find({
      where: { confirmed: true },
    });
    const now = new Date();
    for (const sub of subscriptions) {
      if (isDue(sub, now)) {
        const weatherData = await this.weatherService.getWeather(sub.city);
        await this.mailerService.sendMail({
          to: sub.email,
          subject: `Your ${sub.frequency} weather for ${sub.city}`,
          template: './weather',
          context: {
            weather: weatherData,
            frequency: sub.frequency,
          },
        });
        this.logger.log(`Email sent to ${sub.email} for ${sub.city}`);
        await this.subscriptionRepository.update(sub.id, { lastSentAt: now });
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
