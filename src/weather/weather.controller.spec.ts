import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [WeatherService],
    }).compile();

    weatherController = moduleRef.get(WeatherController);
    weatherService = moduleRef.get(WeatherService);
  });

  describe('root', () => {
    it('should return weather data for a city', async () => {
      const result = {
        temperature: 20,
        humidity: 50,
        description: 'Clear',
      };
      jest.spyOn(weatherService, 'getWeather').mockResolvedValue(result);

      expect(await weatherController.getWeather('London')).toBe(result);
    });
  });
});
