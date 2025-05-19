import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getConfirmationTokenByEmail } from './db-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Subscription (e2e)', () => {
    let confirmationToken: string;
    const email = `test${Date.now()}@example.com`;
    const city = 'Kyiv';
    const frequency = 'daily';

    it('/subscribe (POST) - success', async () => {
      await request(app.getHttpServer())
        .post('/subscribe')
        .send({ email, city, frequency })
        .expect(200);
      // Fetch the confirmation token directly from the DB
      confirmationToken = await getConfirmationTokenByEmail(email);
      expect(confirmationToken).toBeDefined();
    });

    it('/subscribe (POST) - already subscribed', async () => {
      await request(app.getHttpServer())
        .post('/subscribe')
        .send({ email, city, frequency })
        .expect(409);
    });

    it('/confirm/:token (GET) - success', async () => {
      await request(app.getHttpServer())
        .get(`/confirm/${confirmationToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Subscription confirmed successfully');
        });
    });

    it('/confirm/:token (GET) - already confirmed', async () => {
      await request(app.getHttpServer())
        .get(`/confirm/${confirmationToken}`)
        .expect(400);
    });

    it('/confirm/:token (GET) - invalid token', async () => {
      await request(app.getHttpServer())
        .get('/confirm/invalidtoken')
        .expect(404);
    });

    it('/unsubscribe/:token (GET) - success', async () => {
      // Re-subscribe to get a new token
      const newEmail = email + '2';
      await request(app.getHttpServer())
        .post('/subscribe')
        .send({ email: newEmail, city, frequency })
        .expect(200);
      const unsubToken = await getConfirmationTokenByEmail(newEmail);
      await request(app.getHttpServer())
        .get(`/confirm/${unsubToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/unsubscribe/${unsubToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Unsubscribed successfully');
        });
    });

    it('/unsubscribe/:token (GET) - already unsubscribed', async () => {
      await request(app.getHttpServer())
        .get(`/unsubscribe/${confirmationToken}`)
        .expect(400);
    });

    it('/unsubscribe/:token (GET) - invalid token', async () => {
      await request(app.getHttpServer())
        .get('/unsubscribe/invalidtoken')
        .expect(404);
    });
  });

  describe('Weather (e2e)', () => {
    it('/weather (GET) - missing city param', async () => {
      await request(app.getHttpServer()).get('/weather').expect(404); // Should be 404 because route expects a param
    });

    it('/weather/:city (GET) - valid city', async () => {
      await request(app.getHttpServer())
        .get('/weather?city=Kyiv')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('temperature');
          expect(res.body).toHaveProperty('humidity');
          expect(res.body).toHaveProperty('description');
        });
    });

    it('/weather/:city (GET) - invalid city', async () => {
      await request(app.getHttpServer())
        .get('/weather/NowhereLand')
        .expect(404);
    });
  });
});
