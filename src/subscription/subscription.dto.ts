import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty({ description: 'Email address to subscribe' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'City for weather updates' })
  city: string;

  @ApiProperty({
    description: 'Frequency of updates (hourly or daily)',
    enum: ['hourly', 'daily'],
  })
  frequency: 'hourly' | 'daily';
}
