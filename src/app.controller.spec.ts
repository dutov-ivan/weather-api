import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return weather data for a city', async () => {
      const result = {
        temperature: 20,
        humidity: 50,
        description: 'Clear',
      };
      jest.spyOn(appService, 'getWeather').mockResolvedValue(result);

      expect(await appController.getWeather({ city: 'London' })).toBe(result);
    });
  });
});
