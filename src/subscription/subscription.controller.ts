import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscriptionDto } from './subscription.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description:
      'Subscribe an email to receive weather updates for a specific city with chosen frequency.',
    type: SubscriptionDto,
  })
  @Post('subscribe')
  subscribe(@Body() subscriptionDto: SubscriptionDto) {
    this.subscriptionService.sendConfirmationEmail(
      subscriptionDto.email,
      subscriptionDto.city,
      subscriptionDto.frequency,
    );
  }
}
