import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ExternalForecastApiResponse,
  ExternalGeocodeApiResponse,
  WeatherDto,
} from '../types';
import { WEATHER_CODES } from '../constants';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  async getCityData(name: string): Promise<ExternalGeocodeApiResponse> {
    try {
      const nameResponse = await fetch(
        `${process.env.GEOCODE_API}?name=${name}&count=1&language=en&format=json`,
      );

      if (!nameResponse.ok) {
        this.logger.error(
          `Error fetching city data: ${nameResponse.statusText}`,
        );
        throw new HttpException(
          'Error fetching city data',
          nameResponse.status,
        );
      }
      return (await nameResponse.json()) as ExternalGeocodeApiResponse;
    } catch (error) {
      this.logger.error(`Error fetching city data: ${error.message}`);
      throw new HttpException('Error fetching city data', 500);
    }
  }

  async getWeatherDataForCoords(lat: number, lon: number): Promise<WeatherDto> {
    try {
      const weatherResponse = await fetch(
        `${process.env.FORECAST_API}?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,temperature_2m,weather_code`,
      );

      if (!weatherResponse.ok) {
        this.logger.error(
          `Error fetching weather data: ${weatherResponse.statusText}`,
        );
        throw new NotFoundException('Weather data not found');
      }

      const weatherData =
        (await weatherResponse.json()) as ExternalForecastApiResponse;

      const weatherCode = weatherData.current.weather_code;
      const weatherDescriptions =
        WEATHER_CODES[weatherCode] === undefined
          ? 'Unknown'
          : WEATHER_CODES[weatherCode];

      return {
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        description: weatherDescriptions,
      };
    } catch (error) {
      this.logger.error(`Error fetching weather data: ${error.message}`);
      throw new HttpException('Error fetching weather data', 500);
    }
  }

  async getCurrentWeather(city: string): Promise<WeatherDto> {
    const cityData = await this.getCityData(city);

    if (!cityData.results || cityData.results.length === 0) {
      throw new NotFoundException('City not found');
    }

    const { latitude, longitude } = cityData.results[0];
    return this.getWeatherDataForCoords(latitude, longitude);
  }
}
