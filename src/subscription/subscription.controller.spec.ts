import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { EmailService } from '../email/email.service';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionResult } from './subscription-result.enum';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let subscriptionService: any;
  let emailService: any;

  beforeEach(async () => {
    subscriptionService = {
      initiateSubscription: jest.fn(),
      confirmToken: jest.fn(),
      unsubscribeToken: jest.fn(),
    };
    emailService = {
      sendConfirmationEmail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        { provide: SubscriptionService, useValue: subscriptionService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should call service and send confirmation email', async () => {
      const dto = { email: 'a@b.com', city: 'Kyiv', frequency: 'daily' };
      const sub = { ...dto, id: 1 };
      subscriptionService.initiateSubscription.mockResolvedValue(sub);
      await controller.subscribe(dto as any);
      expect(subscriptionService.initiateSubscription).toHaveBeenCalledWith(
        'a@b.com',
        'Kyiv',
        'daily',
      );
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(sub);
    });
    it('should throw ConflictException if already subscribed', async () => {
      subscriptionService.initiateSubscription.mockResolvedValue(null);
      await expect(
        controller.subscribe({
          email: 'a@b.com',
          city: 'Kyiv',
          frequency: 'daily',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('confirm', () => {
    it('should return success message', async () => {
      subscriptionService.confirmToken.mockResolvedValue(
        SubscriptionResult.Success,
      );
      const result = await controller.confirm('token');
      expect(result).toEqual({
        message: 'Subscription confirmed successfully',
      });
    });
    it('should throw BadRequestException for invalid token', async () => {
      subscriptionService.confirmToken.mockResolvedValue(
        SubscriptionResult.Invalid,
      );
      await expect(controller.confirm('token')).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw NotFoundException for not found token', async () => {
      subscriptionService.confirmToken.mockResolvedValue(
        SubscriptionResult.NotFound,
      );
      await expect(controller.confirm('token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unsubscribe', () => {
    it('should return success message', async () => {
      subscriptionService.unsubscribeToken.mockResolvedValue(
        SubscriptionResult.Success,
      );
      const result = await controller.unsubscribe('token');
      expect(result).toEqual({ message: 'Unsubscribed successfully' });
    });
    it('should throw BadRequestException for invalid token', async () => {
      subscriptionService.unsubscribeToken.mockResolvedValue(
        SubscriptionResult.Invalid,
      );
      await expect(controller.unsubscribe('token')).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw NotFoundException for not found token', async () => {
      subscriptionService.unsubscribeToken.mockResolvedValue(
        SubscriptionResult.NotFound,
      );
      await expect(controller.unsubscribe('token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
