import express, {Express, Request, Response} from 'express';
import {Server} from 'net';

import chat from './routes/chat';
import image from './routes/image';
import text from './routes/text';
import {MockType} from './types';
import {AIMockDS} from './utils/ds';

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

  const ds = await AIMockDS.load(opts.mockFile, opts.mockFileSeparator);

  app.use(express.json());
  app.use(chat(ds, opts));
  app.use(text(ds, opts));
  app.use(image());

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World! This is AIMock.');
  });

  app.use(function (req: Request, res: Response) {
    res.status(404).send('Page not found');
  });

  return app;
}

export async function createAppAndStart(opts: MockMainOptions = {}): Promise<[Server, Express]> {
  const app = await createApp(opts);
  const port = opts.port ?? process.env.MOCK_PORT ?? 5001;
  const server = app.listen(port, () => {
    if (!opts.silent) {
      console.log(`AIMock server is running at http://localhost:${port}`);
    }
  });
  return [server, app];
}
