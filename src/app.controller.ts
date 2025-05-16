import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { WeatherQueryDto } from './types';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('weather')
  async getWeather(@Query() { city }: WeatherQueryDto) {
    return this.appService.getWeather(city);
  }
}
