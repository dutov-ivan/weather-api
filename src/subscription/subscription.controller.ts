import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { EmailService } from '../email/email.service';
import { SubscriptionDto } from './subscription.dto';
import { SubscriptionResult } from './subscription-result.enum';

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly emailService: EmailService,
  ) {}

  @Post('subscribe')
  @ApiOperation({
    summary: 'Subscribe to weather updates',
    description:
      'Subscribe an email to receive weather updates for a specific city with chosen frequency.',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: SubscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription successful. Confirmation email sent.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  @HttpCode(200)
  async subscribe(@Body() dto: SubscriptionDto) {
    const subscription = await this.subscriptionService.initiateSubscription(
      dto.email,
      dto.city,
      dto.frequency,
    );

    if (!subscription) {
      throw new ConflictException('Email already subscribed');
    }

    await this.emailService.sendConfirmationEmail(subscription);
  }

  @Get('confirm/:token')
  @ApiOperation({
    summary: 'Confirm email subscription',
    description:
      'Confirms a subscription using the token sent in the confirmation email.',
  })
  @ApiParam({ name: 'token', description: 'Confirmation token' })
  @ApiResponse({
    status: 200,
    description: 'Subscription confirmed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async confirm(@Param('token') token: string) {
    const result = await this.subscriptionService.confirmToken(token);

    if (result === SubscriptionResult.Invalid)
      throw new BadRequestException('Invalid token');
    if (result === SubscriptionResult.NotFound)
      throw new NotFoundException('Token not found');

    return { message: 'Subscription confirmed successfully' };
  }

  @Get('unsubscribe/:token')
  @ApiOperation({
    summary: 'Unsubscribe from weather updates',
    description:
      'Unsubscribes an email from weather updates using the token sent in emails.',
  })
  @ApiParam({ name: 'token', description: 'Unsubscribe token' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async unsubscribe(@Param('token') token: string) {
    const result = await this.subscriptionService.unsubscribeToken(token);

    if (result === SubscriptionResult.Invalid)
      throw new BadRequestException('Invalid token');
    if (result === SubscriptionResult.NotFound)
      throw new NotFoundException('Token not found');

    return { message: 'Unsubscribed successfully' };
  }
}
