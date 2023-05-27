
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
      const payload_len_i: number = data.subarray(pos + 3, pos + 7).readUInt32LE();
      const command = new Command(data[pos + 1], data[pos + 2]);

      // console.log('flags_i', flags_i);
      // console.log('group', command.group);
      // console.log('command', command.command);
      // console.log('payload_len_i', payload_len_i);

      if (payload_len_i > 0) {
        const payload_b: Buffer = data.subarray(pos + 7, pos + 7 + payload_len_i);
        // console.log('payload_b', payload_b);

        let payload_pos = 0;
        while (payload_pos < payload_len_i) {
          const arg_len: number = payload_b.subarray(payload_pos, payload_pos + 1).readUInt8();
          // console.log('arg_len', arg_len);

          const arg_val: string  = payload_b.subarray(payload_pos + 1, payload_pos + 1 + arg_len).toString();
          // console.log('arg_val', arg_val);

          payload_pos += arg_len + 1;
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
}
