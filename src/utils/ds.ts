import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import {Readable} from 'stream';

export class AIMockDS {
  protected _data: string[] = [];

  get data(): string[] {
    return this._data;
  }

  static async load(filePath?: string, separator = '\n'): Promise<AIMockDS> {
    const ds = new AIMockDS();
    await ds.load(filePath, separator);
    return ds;
  }

  clear() {
    this._data = [];
  }

  async load(filePath?: string, separator = '\n'): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const rootDir = path.resolve(__dirname, '../..');
      filePath = filePath ?? '';

      if (filePath === '') {
        this._data = ['This is a random response 1.', 'This is a random response 2.', 'This is a random response 3.'];
        resolve();
      } else {
        const fPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
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
            this._data.push(currentLine);
            currentLine = '';
          } else {
            currentLine += line + '\n\n';
          }
        });

        rl.on('close', () => {
          if (currentLine !== '') {
            this._data.push(currentLine);
          }
          resolve();
        });

        rl.on('error', (err: Error) => {
          reject(err);
        });
      }
    });
  }
}
