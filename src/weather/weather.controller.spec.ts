import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [WeatherService],
    }).compile();

    weatherController = app.get<WeatherController>(WeatherController);
    weatherService = app.get<WeatherService>(WeatherService);
  });

  describe('root', () => {
    it('should return weather data for a city', async () => {
      const result = {
        temperature: 20,
        humidity: 50,
        description: 'Clear',
      };
      jest.spyOn(weatherService, 'getWeather').mockResolvedValue(result);

      expect(await weatherController.getWeather({ city: 'London' })).toBe(
        result,
      );
    });
  });
});
