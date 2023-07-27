import dotenv from 'dotenv';
import express, {Express, Request, Response} from 'express';

import chat from './routes/chat';
import image from './routes/image';
import text from './routes/text';
import {MockType} from './types';
import {MockRandoms} from './utils/randoms';

export {chat, image, text};

export interface MockApplicationOptions {
  type?: MockType;
  mockFile?: string;
  mockFileSeparator?: string;
}

export interface MockMainOptions extends MockApplicationOptions {
  port?: number;
  silent?: boolean;
}

export async function createApp(opts: MockApplicationOptions = {}) {
  opts = Object.assign(
    {
      type: process.env.MOCK_TYPE ?? 'random',
      mockFile: process.env.MOCK_FILE ?? 'data/contents.txt',
      mockFileSeparator: process.env.MOCK_FILE_SEPARATOR ?? '\n',
    },
    opts,
  );

  const app: Express = express();

  await MockRandoms.load(opts.mockFile, opts.mockFileSeparator);

  app.use(express.json());
  app.use(chat(opts));
  app.use(text(opts));
  app.use(image());

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World! This is AIMock.');
  });

  app.use(function (req: Request, res: Response) {
    res.status(404).send('Page not found');
  });

  return app;
}

export async function main(opts: MockMainOptions = {}) {
  const app = await createApp(opts);
  const port = opts.port ?? process.env.MOCK_PORT ?? 5001;
  const server = app.listen(port, () => {
    if (!opts.silent) {
      console.log(`AIMock server is running at http://localhost:${port}`);
    }
  });
  return [server, app];
}

if (require.main === module) {
  dotenv.config();
  main().catch(err => {
    console.error('Cannot start AIMock', err);
    process.exit(1);
  });
}
