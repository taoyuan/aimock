import dotenv from 'dotenv';

import {createAppAndStart} from './app';

dotenv.config();
createAppAndStart().catch(err => {
  console.error('Cannot start AIMock', err);
  process.exit(1);
});
