import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './subscription.model';
import { SubscriptionResult } from './subscription-result.enum';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: jest.Mocked<Repository<Subscription>>;

  beforeEach(async () => {
    const repoMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repo = module.get(getRepositoryToken(Subscription));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateSubscription', () => {
    it('should return null if subscription exists', async () => {
      repo.findOne.mockResolvedValue({ id: 1 } as Subscription);
      const result = await service.initiateSubscription(
        'a@b.com',
        'Kyiv',
        'daily',
      );
      expect(result).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: 'a@b.com', city: 'Kyiv', frequency: 'daily' },
      });
    });

    it('should create and return subscription if not exists', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.save.mockResolvedValue({
        id: 2,
        email: 'a@b.com',
        city: 'Kyiv',
        frequency: 'daily',
        confirmed: false,
      } as Subscription);
      const result = await service.initiateSubscription(
        'a@b.com',
        'Kyiv',
        'daily',
      );
      expect(result).toMatchObject({
        id: 2,
        email: 'a@b.com',
        city: 'Kyiv',
        frequency: 'daily',
        confirmed: false,
      });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          city: 'Kyiv',
          frequency: 'daily',
          confirmed: false,
        }),
      );
    });
  });

  describe('confirmToken', () => {
    it('should return NotFound if token not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.confirmToken('token');
      expect(result).toBe(SubscriptionResult.NotFound);
    });
    it('should return Invalid if already confirmed', async () => {
      repo.findOne.mockResolvedValue({ confirmed: true } as Subscription);
      const result = await service.confirmToken('token');
      expect(result).toBe(SubscriptionResult.Invalid);
    });
    it('should confirm and return Success', async () => {
      const sub = { confirmed: false } as Subscription;
      repo.findOne.mockResolvedValue(sub);
      repo.save.mockResolvedValue({ ...sub, confirmed: true });
      const result = await service.confirmToken('token');
      expect(result).toBe(SubscriptionResult.Success);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ confirmed: true }),
      );
    });
  });

  describe('unsubscribeToken', () => {
    it('should return NotFound if token not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.unsubscribeToken('token');
      expect(result).toBe(SubscriptionResult.NotFound);
    });
    it('should return Invalid if not confirmed', async () => {
      repo.findOne.mockResolvedValue({ confirmed: false } as Subscription);
      const result = await service.unsubscribeToken('token');
      expect(result).toBe(SubscriptionResult.Invalid);
    });
    it('should remove and return Success', async () => {
      const sub = { confirmed: true } as Subscription;
      repo.findOne.mockResolvedValue(sub);
      repo.remove.mockResolvedValue(sub);
      const result = await service.unsubscribeToken('token');
      expect(result).toBe(SubscriptionResult.Success);
      expect(repo.remove).toHaveBeenCalledWith(sub);
    });
  });

  describe('findConfirmedSubscriptions', () => {
    it('should call find with confirmed true', async () => {
      repo.find.mockResolvedValue([{ id: 1 }] as Subscription[]);
      const result = await service.findConfirmedSubscriptions();
      expect(repo.find).toHaveBeenCalledWith({ where: { confirmed: true } });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('updateLastSent', () => {
    it('should call update with id and date', async () => {
      const now = new Date();
      repo.update.mockResolvedValue({
        raw: {},
        affected: 1,
        generatedMaps: [],
      });
      await service.updateLastSent(1, now);
      expect(repo.update).toHaveBeenCalledWith(1, { lastSentAt: now });
    });
  });
});
