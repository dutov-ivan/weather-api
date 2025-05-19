import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionService } from './subscription/subscription.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherController } from './weather/weather.controller';
import { WeatherService } from './weather/weather.service';
import { EmailService } from './email/email.service';
import { Subscription } from './subscription/subscription.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: `smtps://${process.env.SMTP_USER}:${process.env.SMTP_PASS}@${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`,
      defaults: {
        from: '"weather-api" <weather-api@localhost>',
      },
      template: {
        dir: `${process.cwd()}/templates`,
        adapter: new EjsAdapter(),
        options: {
          strict: false,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),

    TypeOrmModule.forFeature([Subscription]),
  ],
  controllers: [SubscriptionController, WeatherController],
  providers: [WeatherService, SubscriptionService, EmailService],
})
export class AppModule {}
