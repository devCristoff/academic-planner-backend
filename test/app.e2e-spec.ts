import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';

const runE2E = process.env.RUN_E2E === 'true';

(runE2E ? describe : describe.skip)('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /academic-terms', async () => {
    const res = await request(app.getHttpServer())
      .get('/academic-terms')
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('timestamp');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
