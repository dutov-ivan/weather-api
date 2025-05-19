import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiResponse({
    status: 200,
    description: 'Returns current weather data for a city',
  })
  getWeather(@Param('city') city: string) {
    return this.weatherService.getCurrentWeather(city);
  }
}
