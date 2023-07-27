import dotenv from 'dotenv';

import {createAppAndStart} from './app';
import chat from './routes/chat';
import image from './routes/image';
import text from './routes/text';

export {chat, image, text};

export const routes = {
  chat,
  image,
  text,
};

export * from './app';

if (require.main === module) {
  dotenv.config();
  createAppAndStart().catch(err => {
    console.error('Cannot start AIMock', err);
    process.exit(1);
  });
}
