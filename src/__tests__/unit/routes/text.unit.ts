import express, {Express} from 'express';
import request from 'supertest';

import {text} from '../../../routes/text';
import {AIMockDS} from '../../../utils/ds';

describe('text router', () => {
  let app: Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(text(await AIMockDS.load()));
  });

  it('should return 400 if "prompt" is missing', async () => {
    const response = await request(app).post('/v1/completions').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: 'Missing or invalid "prompt" in request body'});
  });

  it('should return 400 if "model" is missing', async () => {
    const response = await request(app).post('/v1/completions').send({prompt: 'Hello'});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: 'Missing or invalid "model" in request body'});
  });

  it('should return 400 if "stream" is not a boolean', async () => {
    const response = await request(app)
      .post('/v1/completions')
      .send({prompt: 'Hello', model: 'gpt-3.5-turbo', stream: 'not_a_boolean'});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: 'Invalid "stream" in request body'});
  });

  it('should return a mock response with "random" mock type', async () => {
    const response = await request(app)
      .post('/v1/completions')
      .send({prompt: 'Hello', model: 'gpt-3.5-turbo', mockType: 'random'});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
  });

  it('should return an echo response with "echo" mock type', async () => {
    const response = await request(app)
      .post('/v1/completions')
      .send({prompt: 'Hello', model: 'gpt-3.5-turbo', mockType: 'echo'});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
    expect(response.body.choices).toHaveLength(1);
    expect(response.body.choices[0]).toHaveProperty('text', 'Hello');
    expect(response.body.choices[0]).toHaveProperty('finish_reason', 'stop');
  });

  it('should return a fixed response with "fixed" mock type', async () => {
    const fixedContents = 'This is a fixed response.';
    const response = await request(app)
      .post('/v1/completions')
      .send({prompt: 'Hello', model: 'gpt-3.5-turbo', mockType: 'fixed', mockFixedContents: fixedContents});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
    expect(response.body.choices).toHaveLength(1);
    expect(response.body.choices[0]).toHaveProperty('text', fixedContents);
    expect(response.body.choices[0]).toHaveProperty('finish_reason', 'stop');
  });

  it('should return a mock response with streaming', async () => {
    const response = request(app).post('/v1/completions').send({prompt: 'Hello', model: 'gpt-3.5-turbo', stream: true});

    await response
      .expect('Content-Type', 'text/event-stream')
      .expect('Cache-Control', 'no-cache')
      .expect('Connection', 'keep-alive')
      .expect(200);

    await response.expect(res => {
      expect(res.text).toContain('data: {');
      expect(res.text).toContain('"text":');
    });
  });

  it('should return a mock response with "n" completions', async () => {
    const n = 3;
    const response = await request(app).post('/v1/completions').send({prompt: 'Hello', model: 'gpt-3.5-turbo', n});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
    expect(response.body.choices).toHaveLength(n);

    // Ensure each choice has the same text for the given prompt
    const txt = response.body.choices[0].text;
    for (const choice of response.body.choices) {
      expect(choice.text).toBe(txt);
      expect(choice).toHaveProperty('finish_reason', 'stop');
    }
  });
});
