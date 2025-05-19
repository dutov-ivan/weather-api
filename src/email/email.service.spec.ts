import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { WeatherService } from '../weather/weather.service';
import { SubscriptionService } from '../subscription/subscription.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: WeatherService,
          useValue: {
            getWeather: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: SubscriptionService,
          useValue: {
            getSubscriptions: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send scheduled emails to due subscriptions', async () => {
    const mockSub = {
      id: 1,
      email: 'test@example.com',
      city: 'London',
      frequency: 'daily',
      confirmationCode: 'abc123',
    };
    const mockWeather = { temp: 20 };
    const now = new Date();
    // Mock dependencies
    service['subscriptionService'].findConfirmedSubscriptions = jest
      .fn()
      .mockResolvedValue([mockSub]);
    service['weatherService'].getCurrentWeather = jest
      .fn()
      .mockResolvedValue(mockWeather);
    service['mailerService'].sendMail = jest.fn().mockResolvedValue({});
    service['subscriptionService'].updateLastSent = jest
      .fn()
      .mockResolvedValue({});
    jest.spyOn(require('./lib'), 'isDue').mockReturnValue(true);

    await service.sendScheduledEmails();

    expect(
      service['subscriptionService'].findConfirmedSubscriptions,
    ).toHaveBeenCalled();
    expect(service['weatherService'].getCurrentWeather).toHaveBeenCalledWith(
      'London',
    );
    expect(service['mailerService'].sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('weather for London'),
        template: './weather',
        context: expect.objectContaining({
          weather: mockWeather,
          frequency: 'daily',
        }),
      }),
    );
    expect(service['subscriptionService'].updateLastSent).toHaveBeenCalledWith(
      1,
      expect.any(Date),
    );
  });

  it('should send confirmation email', async () => {
    const mockSub = {
      email: 'test@example.com',
      city: 'London',
      frequency: 'daily',
      confirmationCode: 'abc123',
    };
    process.env.APP_URL = 'http://localhost';
    service['mailerService'].sendMail = jest.fn().mockResolvedValue({});
    const loggerSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

    await service.sendConfirmationEmail(mockSub as any);

    expect(service['mailerService'].sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Weather Subscription Confirmation',
        template: './subscription',
        context: expect.objectContaining({
          city: 'London',
          frequency: 'daily',
          confirmationLink: 'http://localhost/confirm/abc123',
        }),
      }),
    );
    expect(loggerSpy).toHaveBeenCalled();
  });
});
