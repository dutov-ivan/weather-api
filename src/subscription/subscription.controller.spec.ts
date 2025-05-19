import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { EmailService } from '../email/email.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: {
            initiateSubscription: jest.fn(),
            confirmSubscription: jest.fn(),
            unsubscribe: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
