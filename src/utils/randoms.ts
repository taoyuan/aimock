import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import {Readable} from 'stream';

export namespace MockRandoms {
  let randomResponses: string[] = [];

  export async function load(filePath?: string, separator = '\n'): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const rootDir = path.resolve(__dirname, '../..');
      filePath = filePath ?? '';

      if (filePath === '') {
        randomResponses = [
          'This is a random response 1.',
          'This is a random response 2.',
          'This is a random response 3.',
        ];
        resolve();
      } else {
        const fPath = path.join(rootDir, filePath);
        if (!fs.existsSync(fPath)) {
          resolve();
          return;
        }
        const fileStream: Readable = fs.createReadStream(fPath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let currentLine = '';
        rl.on('line', (line: string) => {
          if (line.trim() === separator) {
            randomResponses.push(currentLine);
            currentLine = '';
          } else {
            currentLine += line + '\n\n';
          }
        });

        rl.on('close', () => {
          if (currentLine !== '') {
            randomResponses.push(currentLine);
          }
          resolve();
        });

        rl.on('error', (err: Error) => {
          reject(err);
        });
      }
    });
  }

  export const clear = () => (randomResponses = []);

  export const getRandomContents = () => randomResponses;
}
