import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'Kyiv',
  })
  city: string;

  @ApiProperty({
    description: 'Frequency of updates (hourly or daily)',
    enum: ['hourly', 'daily'],
  })
  frequency: 'hourly' | 'daily';
}
