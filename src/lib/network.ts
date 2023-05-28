
import { Socket } from 'net';
import { strict as assert } from 'assert';

export class Command {
  constructor(
    public readonly group: number = 0,
    public readonly command: number = 0,
    public readonly args: Array<string> = [],
  ) {
  }
}

export abstract class Network {
  protected _parseRaw(data: Buffer): Array<Command> {
    // console.log('length', data.length);
    // console.log('data', data);

    let commands: Array<Command> = [];

    let pos = 0;
    while (pos < data.length) {
      const flags_i: number = data[pos];

      const flag_lengths_are_4_bytes = (flags_i & 0x01) === 0x01;
      const arg_size_len = flag_lengths_are_4_bytes ? 4 : 1;

      const payload_len_i: number = data.subarray(pos + 3, pos + 7).readUInt32LE();
      const command = new Command(data[pos + 1], data[pos + 2]);

      // console.log('flags_i', flags_i);
      // console.log('flag_lengths_are_4_bytes', flag_lengths_are_4_bytes);
      // console.log('group', command.group);
      // console.log('command', command.command);
      // console.log('payload_len_i', payload_len_i);

      if (payload_len_i > 0) {
        const payload_b: Buffer = data.subarray(pos + 7, pos + 7 + payload_len_i);
        // console.log('payload_b', payload_b);

        let payload_pos = 0;
        while (payload_pos < payload_len_i) {
          const arg_len_b: Buffer = payload_b.subarray(payload_pos, payload_pos + arg_size_len);
          // console.log('arg_len_b', arg_len_b);

          const arg_len_i: number = flag_lengths_are_4_bytes ? arg_len_b.readUInt32LE() : arg_len_b.readUInt8();
          // console.log('arg_len_i', arg_len_i);

          const arg_val: string  = payload_b.subarray(payload_pos + arg_size_len, payload_pos + arg_size_len + arg_len_i).toString();
          // console.log('arg_val', arg_val, arg_val.length);
          assert.equal(arg_len_i, arg_val.length);

          payload_pos += arg_len_i + arg_size_len;
          // console.log('payload_pos', payload_pos);

          command.args.push(arg_val);
        }
      }

      commands.push(command);

      pos += 1 + 1 + 1 + 4 + payload_len_i + 1;
      // console.log('pos', pos);
    }

    // console.log('commands', commands.length);

    return commands;
  }

  protected _serializeCommand(command: Command): Buffer {
    // console.log('command', command);

    // Flags
    const flag_lengths_are_4_bytes = command.args.map(i => i.length).find(i => i > 0xff) !== undefined;
    const flags_i = 0x00 | (flag_lengths_are_4_bytes ? 0x01 : 0x00);
    const flags_b = Buffer.alloc(1);
    flags_b.writeUInt8(flags_i);
    const arg_size_len = flag_lengths_are_4_bytes ? 4 : 1;

    // Group
    const group_b = Buffer.alloc(1);
    group_b.writeUInt8(command.group);

    // Command
    const command_b = Buffer.alloc(1);
    command_b.writeUInt8(command.command);

    // Payload
    let payload_len_i = 0;
    let payload = Buffer.alloc(0);
    for (let arg of command.args) {
      payload_len_i += arg_size_len + arg.length;

      const arg_len_b = Buffer.alloc(arg_size_len);
      if (flag_lengths_are_4_bytes) {
        arg_len_b.writeUInt32LE(arg.length);
      } else {
        arg_len_b.writeUInt8(arg.length);
      }

      const arg_b = Buffer.from(arg);
      payload = Buffer.concat([payload, arg_len_b, arg_b]);
    }

    const payload_len_b = Buffer.alloc(4);
    payload_len_b.writeUInt32LE(payload_len_i);

    // End
    const delemiter_b = Buffer.alloc(1);
    delemiter_b.writeUInt8(0);

    return Buffer.concat([
      flags_b,
      group_b, command_b,
      payload_len_b, payload,
      delemiter_b,
    ]);
  }
}
