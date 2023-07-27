import express, {Express} from 'express';
import request from 'supertest';

import {AIMockDS} from '../../../ds';
import {chat} from '../../../routes/chat';

describe('chat router', () => {
  let app: Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(chat(await AIMockDS.load()));
  });

  it('should return 400 if "messages" is missing or not an array', async () => {
    const response = await request(app).post('/v1/chat/completions').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: 'Missing or invalid "messages" in request body'});
  });

  it('should return 400 if "stream" is not a boolean', async () => {
    const response = await request(app)
      .post('/v1/chat/completions')
      .send({messages: [{content: 'Hello'}], stream: 'not_a_boolean'});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: 'Invalid "stream" in request body'});
  });

  it('should return a mock response with "random" mock type', async () => {
    const response = await request(app)
      .post('/v1/chat/completions')
      .send({messages: [{content: 'Hello'}], mockType: 'random'});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
  });

  it('should return an echo response with "echo" mock type', async () => {
    const response = await request(app)
      .post('/v1/chat/completions')
      .send({messages: [{content: 'Hello'}], mockType: 'echo'});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
    expect(response.body.choices).toHaveLength(1);
    expect(response.body.choices[0].message).toHaveProperty('role', 'assistant');
    expect(response.body.choices[0].message).toHaveProperty('content', 'Hello');
    expect(response.body.choices[0]).toHaveProperty('finish_reason', 'stop');
  });

  it('should return a fixed response with "fixed" mock type', async () => {
    const fixedContents = 'This is a fixed response.';
    const response = await request(app)
      .post('/v1/chat/completions')
      .send({messages: [{content: 'Hello'}], mockType: 'fixed', mockFixedContents: fixedContents});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
    expect(response.body.choices).toHaveLength(1);
    expect(response.body.choices[0].message).toHaveProperty('role', 'assistant');
    expect(response.body.choices[0].message).toHaveProperty('content', fixedContents);
    expect(response.body.choices[0]).toHaveProperty('finish_reason', 'stop');
  });

  it('should return a mock response with streaming', async () => {
    const response = request(app)
      .post('/v1/chat/completions')
      .send({messages: [{content: 'Hello'}], stream: true});

    await response
      .expect('Content-Type', 'text/event-stream')
      .expect('Cache-Control', 'no-cache')
      .expect('Connection', 'keep-alive')
      .expect(200);

    await response.expect(res => {
      expect(res.text).toContain('data: {');
      expect(res.text).toContain('"role":"assistant","content":');
    });
  });

  it('should return a mock response with "n" completions', async () => {
    const n = 3;
    const response = await request(app)
      .post('/v1/chat/completions')
      .send({messages: [{content: 'Hello'}], n});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('object', 'chat.completion');
    expect(response.body).toHaveProperty('model');
    expect(response.body).toHaveProperty('usage');
    expect(response.body).toHaveProperty('choices');
    expect(response.body.choices).toHaveLength(n);

    // Ensure each choice has the same content for the given message
    const content = response.body.choices[0].message.content;
    for (const choice of response.body.choices) {
      expect(choice.message.content).toBe(content);
      expect(choice).toHaveProperty('finish_reason', 'stop');
    }
  });

  // Add more test cases here as needed.
});
