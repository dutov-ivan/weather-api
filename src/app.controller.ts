import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  ExternalGeocodeApiResponse,
  ExternalForecastApiResponse,
} from './types';

const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear, partly cloudy, and overcast',
  2: 'Mainly clear, partly cloudy, and overcast',
  3: 'Mainly clear, partly cloudy, and overcast',
  45: 'Fog and depositing rime fog',
  48: 'Fog and depositing rime fog',
  51: 'Drizzle: Light, moderate, and dense intensity',
  53: 'Drizzle: Light, moderate, and dense intensity',
  55: 'Drizzle: Light, moderate, and dense intensity',
  56: 'Freezing Drizzle: Light and dense intensity',
  57: 'Freezing Drizzle: Light and dense intensity',
  61: 'Rain: Slight, moderate and heavy intensity',
  63: 'Rain: Slight, moderate and heavy intensity',
  65: 'Rain: Slight, moderate and heavy intensity',
  66: 'Freezing Rain: Light and heavy intensity',
  67: 'Freezing Rain: Light and heavy intensity',
  71: 'Snow fall: Slight, moderate, and heavy intensity',
  73: 'Snow fall: Slight, moderate, and heavy intensity',
  75: 'Snow fall: Slight, moderate, and heavy intensity',
  77: 'Snow grains',
  80: 'Rain showers: Slight, moderate, and violent',
  81: 'Rain showers: Slight, moderate, and violent',
  82: 'Rain showers: Slight, moderate, and violent',
  85: 'Snow showers slight and heavy',
  86: 'Snow showers slight and heavy',
  95: 'Thunderstorm: Slight or moderate',
  96: 'Thunderstorm with slight and heavy hail',
  99: 'Thunderstorm with slight and heavy hail',
};

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('weather')
  async getWeather(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('City is required');
    }

    this.logger.log(`Getting weather for city: ${city}`);

    const nameResponse = await fetch(
      `${process.env.GEOCODE_API}?name=${city}&count=1&language=en&format=json`,
    );

    if (!nameResponse.ok) {
      this.logger.error(`Error fetching city data: ${nameResponse.statusText}`);
      throw new HttpException('Error fetching city data', nameResponse.status);
    }

    const cityData = (await nameResponse.json()) as ExternalGeocodeApiResponse;

    if (!cityData.results || cityData.results.length === 0) {
      this.logger.error(`City not found: ${city}`);
      throw new NotFoundException('City not found');
    }

    const weatherResponse = await fetch(
      `${process.env.FORECAST_API}?latitude=${cityData.results[0].latitude}&longitude=${cityData.results[0].longitude}&current=relative_humidity_2m,temperature_2m,weather_code`,
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
      weatherCodeMap[weatherCode] === undefined
        ? 'Unknown'
        : weatherCodeMap[weatherCode];

    return {
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      description: weatherDescriptions,
    };
  }
}
