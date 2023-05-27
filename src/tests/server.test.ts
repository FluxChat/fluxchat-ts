
import {describe, expect, jest, test, it} from '@jest/globals';
import { Config } from '../lib/config';
import { Server } from '../lib/server';
import { Client } from '../lib/client';
import { Command } from '../lib/network';

interface RawData {
  test: Array<number>;
  expect: Array<Command>;
};

function createConfig(): Config {
  return {
    address: '',
    port: 0,
    contact: '',
    id: '',
    data_dir: '',
    log: {
      level: '',
      file: '',
    },
  };
}

function createClient(): Client {
  return new Client('uuid1');
}

function createCommand(): Command {
  return new Command();
}

class TestServer extends Server {
  public parseRaw(data: Buffer): Array<Command> {
    return this._parseRaw(data);
  }
}

describe('Server', () => {
  test('basics', () => {
    const config = createConfig();
    const server = new TestServer(config);

    expect(server).not.toBeNull();
  });

  test('clientReadRaw', () => {
    const config = createConfig();
    const server = new TestServer(config);

    const testData: Array<RawData> = [
      {
        test: [0, 0, 0, 0, 0, 0, 0, 0],
        expect: [
          new Command(),
        ],
      },
      {
        test: [0, 1, 2, 0, 0, 0, 0, 0],
        expect: [
          new Command(1, 2),
        ],
      },
      {
        test: [0, 3, 4, 0, 0, 0, 0, 0],
        expect: [
          new Command(3, 4),
        ],
      },
      {
        test: [0, 3, 4, 2, 0, 0, 0, 1, 65, 0],
        expect: [
          new Command(3, 4, ['A']),
        ],
      },
      {
        test: [0, 5, 6, 9, 0, 0, 0, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0],
        expect: [
          new Command(5, 6, ['ABC', 'AB', 'A']),
        ],
      },
      {
        test: [
          0, 7, 8, 9, 0, 0, 0, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0,
          0, 9, 10, 14, 0, 0, 0, 4, 65, 66, 67, 68, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0,
        ],
        expect: [
          new Command(7, 8, ['ABC', 'AB', 'A']),
          new Command(9, 10, ['ABCD', 'ABC', 'AB', 'A']),
        ],
      },
      {
        test: [
          1, 11, 12, 6, 0, 0, 0, 2, 0, 0, 0, 65, 66, 0,
        ],
        expect: [
          new Command(11, 12, ['AB']),
        ],
      },
      {
        test: [
          1, 11, 12, 14, 0, 0, 0, 2, 0, 0, 0, 65, 66, 4, 0, 0, 0, 65, 66, 67, 68, 0,
        ],
        expect: [
          new Command(11, 12, ['AB', 'ABC']),
        ],
      },
      {
        test: [
          1, 11, 12, 14, 0, 0, 0, 2, 0, 0, 0, 65, 66, 4, 0, 0, 0, 65, 66, 67, 68, 0,
          1, 13, 14, 14, 0, 0, 0, 2, 0, 0, 0, 65, 66, 4, 0, 0, 0, 65, 66, 67, 68, 0,
        ],
        expect: [
          new Command(11, 12, ['AB', 'ABC']),
          new Command(13, 14, ['AB', 'ABC']),
        ],
      },
    ];

    for (let row of testData) {
      const raw = Buffer.from(row.test);
      // console.log('raw', raw);

      const commands = server.parseRaw(raw);

      expect(commands).not.toBeNull();
      expect(commands).toHaveLength(row.expect.length);
    }
  });
});
