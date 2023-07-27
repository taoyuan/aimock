import express, {Express} from 'express';
import request from 'supertest';

import image from '../../../routes/image';
import {MockRandoms} from '../../../utils/randoms';

describe('image router', () => {
  let app: Express;

  beforeAll(async () => {
    await MockRandoms.load();
    app = express();
    app.use(express.json());
    app.use(image());
  });

  it('should return 400 if "prompt" is missing', async () => {
    const response = await request(app).post('/v1/images/generations').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: 'Missing or invalid "prompt" in request body'});
  });

  it('should return generated images URLs', async () => {
    const prompt = 'Generate 3 images';
    const response = await request(app).post('/v1/images/generations').send({prompt, n: 3});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('created');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(3);

    // Ensure each URL is a valid string
    for (const url of response.body.data) {
      expect(typeof url).toBe('string');
      expect(url).toContain('https://images.unsplash.com/');
    }
  });

  it('should return at most 10 generated images URLs', async () => {
    const prompt = 'Generate 15 images';
    const response = await request(app).post('/v1/images/generations').send({prompt, n: 15});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('created');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(10); // Should be limited to 10 URLs
  });
});
