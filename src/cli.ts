import dotenv from 'dotenv';

import {main} from './index';

dotenv.config();
main().catch(err => {
  console.error('Cannot start AIMock', err);
  process.exit(1);
});
