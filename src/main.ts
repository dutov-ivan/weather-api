import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Weather Forecast API')
    .setDescription(
      'Weather API application that allows users to subscribe to weather updates for their city.',
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/reference',
    apiReference({
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
