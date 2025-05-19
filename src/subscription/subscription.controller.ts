import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubscriptionDto } from './subscription.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { EmailService } from 'src/email/email.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly emailService: EmailService,
  ) {}

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description:
      'Subscribe an email to receive weather updates for a specific city with chosen frequency.',
    type: SubscriptionDto,
  })
  @Post('subscribe')
  async subscribe(@Body() subscriptionDto: SubscriptionDto) {
    const subscription = await this.subscriptionService.initiateSubscription(
      subscriptionDto.email,
      subscriptionDto.city,
      subscriptionDto.frequency,
    );

    if (!subscription) {
      return { message: 'Subscription already exists' };
    }

    await this.emailService.sendConfirmationEmail(subscription);
  }

  @Get('confirm/:token')
  async confirm(@Param('token') token: string) {
    await this.subscriptionService.confirmSubscription(token);
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string) {
    await this.subscriptionService.unsubscribe(token);
  }
}
