import {Application} from 'express';
import request from 'supertest';

import {createApp} from '../..';

describe('Test the root path', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp();
  });

  test('It should response the GET method', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello World! This is AIMock.');
  });
});
