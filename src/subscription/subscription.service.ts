import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './subscription.model';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async initiateSubscription(email: string, city: string, frequency: string) {
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { email, city, frequency },
    });
    if (existingSubscription) {
      this.logger.warn('Subscription already exists:', existingSubscription);
      return null;
    }

    const token = randomBytes(32).toString('hex');

    const subscription = await this.subscriptionRepository.save({
      email,
      city,
      frequency,
      confirmed: false,
      confirmationCode: token,
    });

    return subscription;
  }

  async confirmSubscription(token: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { confirmationCode: token },
    });

    if (!subscription) {
      this.logger.warn('Invalid confirmation token:', token);
      return false;
    }

    subscription.confirmed = true;
    await this.subscriptionRepository.save(subscription);

    return true;
  }

  async unsubscribe(token: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { confirmationCode: token },
    });

    if (!subscription) {
      this.logger.warn('Invalid unsubscribe token:', token);
      return false;
    }

    await this.subscriptionRepository.remove(subscription);

    return true;
  }
}
