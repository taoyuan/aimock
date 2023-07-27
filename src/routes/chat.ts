import express, {Request, Response} from 'express';

import {MockType, openai} from '../types';
import {AIMockDS} from '../utils/ds';
import {tokenize} from '../utils/tokenize';

interface Message {
  content: string;
}

interface ReqBody {
  messages: Message[];
  stream?: any;
  mockType?: string;
  mockFixedContents?: string;
  model?: string;
  n?: number;
}

export function chat(ds: AIMockDS, opts: {type?: MockType} = {}) {
  const router = express.Router();
  router.post('/v1/chat/completions', (req: Request<{}, {}, ReqBody>, res: Response) => {
    const defaultMockType: string = opts.type ?? 'random';
    const {messages, stream, mockType = defaultMockType, mockFixedContents, model = 'gpt-3.5-turbo'} = req.body;
    const randomResponses: string[] = ds.data;

    // Check if 'messages' is provided and is an array
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({error: 'Missing or invalid "messages" in request body'});
    }

    // Check if 'stream' is a boolean
    if (stream !== undefined && typeof stream !== 'boolean') {
      return res.status(400).json({error: 'Invalid "stream" in request body'});
    }

    // Get response content
    let content = '';
    switch (mockType) {
      case 'echo':
        content = messages[messages.length - 1].content;
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

      const data: openai.CreateChatCompletionDeltaResponse = {
        id: 'chatcmpl-7UR4UcvmeD79Xva3UxkKkL2es6b5W',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model,
        choices: [
          {
            index: 0,
            delta: {
              role: 'assistant',
              content: '',
            },
            finish_reason: null,
          },
        ],
      };

      const intervalTime = 100;
      let chunkIndex = 0;
      const tokens: string[] = tokenize(content); // Tokenize the content
      const intervalId = setInterval(() => {
        if (chunkIndex < tokens.length) {
          data.choices[0].delta.content = tokens[chunkIndex];
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          chunkIndex++;
        } else {
          clearInterval(intervalId);
          data.choices[0] = {
            index: 0,
            delta: {
              role: 'assistant',
            },
            finish_reason: 'stop',
          };
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          res.write(`data: [DONE]\n\n`);
          res.end();
        }
      }, intervalTime);
    } else {
      const n: number = req.body.n || 1; // Get 'n' from request body, default to 1 if not provided
      const choices: any[] = [];

      for (let i = 0; i < n; i++) {
        choices.push({
          message: {
            role: 'assistant',
            content: content,
          },
          finish_reason: 'stop',
          index: i,
        });
      }

      const response = {
        id: 'chatcmpl-2nYZXNHxx1PeK1u8xXcE1Fqr1U6Ve',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
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

export default chat;
