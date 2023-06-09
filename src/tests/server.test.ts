
import { describe, expect, test } from '@jest/globals';
import { Config } from '../lib/config';
import { Server } from '../lib/server';
import { Command } from '../lib/network';

function createConfig(): Config {
  return {
    address: 'placeholder',
    port: 1337,
    contact: 'private',
    id: 'FC_A7TEBrLHA8vTAtEpAct17brztRGTZwdAmQZSpAio1qcj',
    data_dir: '',
    challenge: {
      min: 10,
      max: 12,
    },
    log: {
      level: 'error',
      file: '/dev/null',
    },
  };
}

class TestServer extends Server {
  public parseRaw(data: Buffer): Array<Command> {
    return this._parseRaw(data);
  }
  public serializeCommand(command: Command): Buffer {
    return this._serializeCommand(command);
  }
}

describe('Server', () => {
  test('basics', () => {
    const config = createConfig();
    const server = new TestServer(config);

    expect(server).not.toBeNull();
  });

  const config = createConfig();
  const server = new TestServer(config);
  test.each([
    {
      tes: [0, 0, 0, 0, 0, 0, 0, 0],
      exp: [
        new Command(),
      ],
    },
    {
      tes: [0, 1, 2, 0, 0, 0, 0, 0],
      exp: [
        new Command(1, 2),
      ],
    },
    {
      tes: [0, 3, 4, 0, 0, 0, 0, 0],
      exp: [
        new Command(3, 4),
      ],
    },
    {
      tes: [0, 3, 4, 2, 0, 0, 0, 1, 65, 0],
      exp: [
        new Command(3, 4, ['A']),
      ],
    },
    {
      tes: [0, 5, 6, 9, 0, 0, 0, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0],
      exp: [
        new Command(5, 6, ['ABC', 'AB', 'A']),
      ],
    },
    {
      tes: [
        0, 7, 8, 9, 0, 0, 0, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0,
        0, 9, 10, 14, 0, 0, 0, 4, 65, 66, 67, 68, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0,
      ],
      exp: [
        new Command(7, 8, ['ABC', 'AB', 'A']),
        new Command(9, 10, ['ABCD', 'ABC', 'AB', 'A']),
      ],
    },
    {
      tes: [
        1, 11, 12, 6, 0, 0, 0, 2, 0, 0, 0, 65, 66, 0,
      ],
      exp: [
        new Command(11, 12, ['AB']),
      ],
    },
    {
      tes: [
        1, 12, 13, 14, 0, 0, 0, 2, 0, 0, 0, 65, 66, 4, 0, 0, 0, 65, 66, 67, 68, 0,
      ],
      exp: [
        new Command(12, 13, ['AB', 'ABCD']),
      ],
    },
    {
      tes: [
        1, 14, 15, 14, 0, 0, 0, 2, 0, 0, 0, 65, 66, 4, 0, 0, 0, 65, 66, 67, 68, 0,
        1, 16, 17, 14, 0, 0, 0, 2, 0, 0, 0, 65, 66, 4, 0, 0, 0, 65, 66, 67, 68, 0,
      ],
      exp: [
        new Command(14, 15, ['AB', 'ABCD']),
        new Command(16, 17, ['AB', 'ABCD']),
      ],
    },
  ])('client read raw $#', ({tes, exp}) => {
    const raw = Buffer.from(tes);
    const commands = server.parseRaw(raw);

    expect(commands).toHaveLength(exp.length);
    expect(commands).toEqual(exp);
  });

  test.each([
    {
      tes: [
        new Command(),
      ],
      exp: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      tes: [
        new Command(1, 2),
      ],
      exp: [0, 1, 2, 0, 0, 0, 0, 0],
    },
    {
      tes: [
        new Command(3, 4),
      ],
      exp: [0, 3, 4, 0, 0, 0, 0, 0],
    },
    {
      tes: [
        new Command(3, 4, ['A']),
      ],
      exp: [0, 3, 4, 2, 0, 0, 0, 1, 65, 0],
    },
    {
      tes: [
        new Command(5, 6, ['ABC', 'AB', 'A']),
      ],
      exp: [0, 5, 6, 9, 0, 0, 0, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0],
    },
    {
      tes: [
        new Command(7, 8, ['ABC', 'AB', 'A']),
        new Command(9, 10, ['ABCD', 'ABC', 'AB', 'A']),
      ],
      exp: [
        0, 7, 8, 9, 0, 0, 0, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0,
        0, 9, 10, 14, 0, 0, 0, 4, 65, 66, 67, 68, 3, 65, 66, 67, 2, 65, 66, 1, 65, 0,
      ],
    },
    {
      tes: [
        new Command(11, 12, ['ABCDEFGH'.repeat(31)]),
      ],
      exp: [
        0,
        11, 12,
        249, 0, 0, 0,
        248,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        0,
      ],
    },
    {
      tes: [
        new Command(13, 14, ['ABCDEFGH'.repeat(32)]),
      ],
      exp: [
        1, // Flags
        13, 14, // Group, Command
        4, 1, 0, 0, // Payload Len
        0, 1, 0, 0, // Arg Len
        65, 66, 67, 68, 69, 70, 71, 72, // Arg Payload Start
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72,
        65, 66, 67, 68, 69, 70, 71, 72, // Arg Payload End
        0, // End Delemiter
      ],
    },
  ])('serialize command $#', ({tes, exp}) => {
    let payload = Buffer.alloc(0);
    for (const command of tes) {
      const raw = server.serializeCommand(command);
      payload = Buffer.concat([payload, raw]);
    }

    expect(payload).toEqual(Buffer.from(exp));
  });
});
