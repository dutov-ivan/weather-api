import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  const mockFetch = jest.fn();
  const OLD_FETCH = global.fetch;

  beforeAll(() => {
    global.fetch = mockFetch;
  });
  afterAll(() => {
    global.fetch = OLD_FETCH;
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile();
    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCityData', () => {
    it('should return city data on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [{ latitude: 1, longitude: 2 }] }),
      });
      const res = await service.getCityData('Kyiv');
      expect(res).toEqual({ results: [{ latitude: 1, longitude: 2 }] });
      expect(mockFetch).toHaveBeenCalled();
    });
    it('should throw HttpException on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      await expect(service.getCityData('Nowhere')).rejects.toThrow(
        HttpException,
      );
    });
    it('should throw HttpException on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await expect(service.getCityData('Kyiv')).rejects.toThrow(HttpException);
    });
  });

  describe('getWeatherDataForCoords', () => {
    it('should return weather data on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 10,
            relative_humidity_2m: 50,
            weather_code: 0,
          },
        }),
      });
      const res = await service.getWeatherDataForCoords(1, 2);
      expect(res).toEqual({
        temperature: 10,
        humidity: 50,
        description: 'Clear sky',
      });
    });
    it('should return description Unknown for unknown code', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 10,
            relative_humidity_2m: 50,
            weather_code: 999,
          },
        }),
      });
      const res = await service.getWeatherDataForCoords(1, 2);
      expect(res.description).toBe('Unknown');
    });
    it('should throw NotFoundException on non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' });
      await expect(service.getWeatherDataForCoords(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw HttpException on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await expect(service.getWeatherDataForCoords(1, 2)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getCurrentWeather', () => {
    it('should return weather for a found city', async () => {
      jest
        .spyOn(service, 'getCityData')
        .mockResolvedValue({ results: [{ latitude: 1, longitude: 2 }] });
      jest
        .spyOn(service, 'getWeatherDataForCoords')
        .mockResolvedValue({
          temperature: 10,
          humidity: 50,
          description: 'Clear sky',
        });
      const res = await service.getCurrentWeather('Kyiv');
      expect(res).toEqual({
        temperature: 10,
        humidity: 50,
        description: 'Clear sky',
      });
    });
    it('should throw NotFoundException if city not found', async () => {
      jest.spyOn(service, 'getCityData').mockResolvedValue({ results: [] });
      await expect(service.getCurrentWeather('Nowhere')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
