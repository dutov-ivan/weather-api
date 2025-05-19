import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './subscription.model';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { SubscriptionResult } from './subscription-result.enum';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async initiateSubscription(email: string, city: string, frequency: string) {
    this.logger.log(
      `Initiating subscription for ${email} to receive ${frequency} updates for ${city}`,
    );
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

  async confirmToken(token: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { confirmationCode: token },
    });

    if (!subscription) {
      this.logger.warn('Invalid confirmation token:', token);
      return SubscriptionResult.NotFound;
    }

    if (subscription.confirmed) {
      this.logger.warn('Subscription already confirmed:', subscription);
      return SubscriptionResult.Invalid;
    }

    subscription.confirmed = true;
    await this.subscriptionRepository.save(subscription);

    return SubscriptionResult.Success;
  }

  async unsubscribeToken(token: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { confirmationCode: token },
    });

    if (!subscription) {
      this.logger.warn('Not found unsubscribe token:', token);
      return SubscriptionResult.NotFound;
    }

    if (!subscription.confirmed) {
      this.logger.warn(
        'Subscription not confirmed or already unsubscribed:',
        subscription,
      );
      return SubscriptionResult.Invalid;
    }

    subscription.confirmed = false;
    await this.subscriptionRepository.save(subscription);
    this.logger.log('Unsubscribed successfully:', subscription);

    return SubscriptionResult.Success;
  }

  findConfirmedSubscriptions() {
    return this.subscriptionRepository.find({ where: { confirmed: true } });
  }

  updateLastSent(id: number, date: Date) {
    return this.subscriptionRepository.update(id, { lastSentAt: date });
  }
}
