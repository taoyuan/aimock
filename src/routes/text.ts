import express, {Request, Response, Router} from 'express';
import {generate} from 'randomstring';

import {AIMockDS} from '../ds';
import {tokenize} from '../tokenize';
import {MockType} from '../types';

interface RequestBody {
  model?: string;
  prompt?: string;
  stream?: boolean;
  mockType?: string;
  mockFixedContents?: string;
  n?: number;
}

interface Choice {
  index: number;
  text: string;
  logprobs: null;
  finish_reason: string | null;
}

interface ResponseData {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function text(ds: AIMockDS, opts: {type?: MockType} = {}) {
  const router: Router = express.Router();
  router.post('/v1/completions', (req: Request<{}, {}, RequestBody>, res: Response) => {
    const defaultMockType: string = opts.type || 'random';
    const {model, prompt, stream, mockType = defaultMockType, mockFixedContents} = req.body;
    const randomResponses: string[] = ds.data;

    // Check if 'prompt' is provided and is an array
    if (!prompt) {
      return res.status(400).json({error: 'Missing or invalid "prompt" in request body'});
    }
    if (!model) {
      return res.status(400).json({error: 'Missing or invalid "model" in request body'});
    }

    // Check if 'stream' is a boolean
    if (stream !== undefined && typeof stream !== 'boolean') {
      return res.status(400).json({error: 'Invalid "stream" in request body'});
    }

    // Get response content
    let content = '';
    switch (mockType) {
      case 'echo':
        content = prompt;
        break;
      case 'random':
        content = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        break;
      case 'fixed':
        content = mockFixedContents || '';
        break;
    }

    // Generate a mock response
    // If 'stream' is true, set up a Server-Sent Events stream
    if (stream) {
      // Set the headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const data: ResponseData = {
        id: `cmpl-${generate(30)}`,
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: model,
        choices: [
          {
            index: 0,
            text: '',
            logprobs: null,
            finish_reason: null,
          },
        ],
      };

      const intervalTime = 100;
      let chunkIndex = 0;
      const tokens: string[] = tokenize(content); // Tokenize the content
      const intervalId = setInterval(() => {
        if (chunkIndex < tokens.length) {
          data.choices[0].text = tokens[chunkIndex];
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          chunkIndex++;
        } else {
          clearInterval(intervalId);
          data.choices[0] = {
            index: chunkIndex,
            text: '',
            logprobs: null,
            finish_reason: 'stop',
          };
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          res.write(`data: [DONE]\n\n`);
          res.end();
        }
      }, intervalTime);
    } else {
      const n: number = req.body.n || 1; // Get 'n' from request body, default to 1 if not provided
      const choices: Choice[] = [];

      for (let i = 0; i < n; i++) {
        choices.push({
          text: content,
          finish_reason: 'stop',
          logprobs: null,
          index: i,
        });
      }

      const response: ResponseData = {
        id: `cmpl-${generate(30)}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        usage: {
          prompt_tokens: 10,
          completion_tokens: 50,
          total_tokens: 60,
        },
        choices: choices,
      };
      // Send the response
      res.json(response);
    }
  });

  return router;
}

export default text;
