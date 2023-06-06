
import { strict as assert } from 'assert';
import { networkInterfaces, NetworkInterfaceInfo } from 'os';

export function isIPv6Enabled(): boolean {
  const interfaces = networkInterfaces();

  // console.log('interfaces', interfaces);

  for (const [name, ifaces] of Object.entries(interfaces)) {
    // console.log('name', name);

    if (ifaces === undefined) {
      continue;
    }

    const found = ifaces.find((iface: NetworkInterfaceInfo) => {
      // console.log('iface', iface.address, iface.family);
      return iface.address[0] == '2' && iface.family === 'IPv6';
    });

    // console.log('found', found);
    if (found !== undefined) {
      return true;
    }
  }

  return false;
}

export class Argument {
  public readonly length: number = 0;

  constructor(
    public readonly value: string | number,
  ) {
    switch (typeof value) {
      case 'string':
        this.length = value.length;
        break;

      case 'number':
        this.length = 4;
        break;
    }
  }

  public asInt(): number {
    switch (typeof this.value) {
      case 'string':
        const buf = Buffer.alloc(4);
        buf.write(this.value);
        return buf.readUInt32LE();

      case 'number':
        return this.value;
    }
  }

  public asBytes(): Buffer {
    switch (typeof this.value) {
      case 'string':
        return Buffer.from(this.value);

      case 'number':
        const buf = Buffer.alloc(4);
        buf.writeUInt32LE(this.value);
        return buf;
    }
  }
}

export class Command {
  public readonly args: Array<Argument> = [];

  constructor(
    public readonly group: number = 0,
    public readonly command: number = 0,
    data: Array<string | number> = [],
  ) {
    this.args = data.map((item: string | number) => new Argument(item));
  }

  public asInt(index: number): number {
    const arg = this.args[index];
    if (arg === undefined) {
      throw new Error(`Argument ${index} is undefined`);
    }

    return arg.asInt();
  }

  public asBytes(index: number): Buffer {
    const arg = this.args[index];
    if (arg === undefined) {
      throw new Error(`Argument ${index} is undefined`);
    }

    return arg.asBytes();
  }

  public asString(index: number): string {
    const arg = this.args[index];
    if (arg === undefined) {
      throw new Error(`Argument ${index} is undefined`);
    }

    return arg.asBytes().toString();
  }
}

export abstract class Network {
  protected _parseRaw(data: Buffer): Array<Command> {
    let commands: Array<Command> = [];

    // console.log('data', data.length, data);

    let pos = 0;
    while (pos < data.length) {
      // console.log('pos', pos);

      const flags_i: number = data[pos];
      // console.log('flags_i', flags_i);

      const flagLengthsAreFourBytes = (flags_i & 0x01) === 0x01;
      const argSizeLen = flagLengthsAreFourBytes ? 4 : 1;
      const payloadLen_i: number = data.subarray(pos + 3, pos + 7).readUInt32LE();
      const command = new Command(data[pos + 1], data[pos + 2]);

      // console.log('flagLengthsAreFourBytes', flagLengthsAreFourBytes);
      // console.log('argSizeLen', argSizeLen);
      // console.log('payloadLen_i', payloadLen_i);
      // console.log('command', command);

      if (payloadLen_i > 0) {
        const payload_b: Buffer = data.subarray(pos + 7, pos + 7 + payloadLen_i);
        // console.log('payload_b', payload_b);

        let payloadPos = 0;
        while (payloadPos < payloadLen_i) {
          // console.log('payloadPos', payloadPos);

          const argLen_b: Buffer = payload_b.subarray(payloadPos, payloadPos + argSizeLen);
          const argLen_i: number = flagLengthsAreFourBytes ? argLen_b.readUInt32LE() : argLen_b.readUInt8();

          // console.log('argLen_b', argLen_b);
          // console.log('argLen_i', argLen_i);

          const argVal: string  = payload_b.subarray(payloadPos + argSizeLen, payloadPos + argSizeLen + argLen_i).toString();
          assert.equal(argLen_i, argVal.length);

          // console.log('argVal', argVal.length, argVal);

          payloadPos += argLen_i + argSizeLen;
          // console.log('payloadPos', payloadPos);

          command.args.push(new Argument(argVal));
        }
      }

      commands.push(command);

      pos += 1 + 1 + 1 + 4 + payloadLen_i + 1;
    }

    return commands;
  }

  protected _serializeCommand(command: Command): Buffer {
    // console.log('command', command);

    // Flags
    const flagLengthsAreFourBytes = command
      .args
      .map((item: Argument) => item.length)
      .find((l: number) => l > 0xff) !== undefined;

    const flags_i = 0x00 | (flagLengthsAreFourBytes ? 0x01 : 0x00);
    const flags_b = Buffer.alloc(1);
    flags_b.writeUInt8(flags_i);
    const argSizeLen = flagLengthsAreFourBytes ? 4 : 1;

    // Group
    const group_b = Buffer.alloc(1);
    group_b.writeUInt8(command.group);

    // Command
    const command_b = Buffer.alloc(1);
    command_b.writeUInt8(command.command);

    // Payload
    let payloadLen_i = 0;
    let payload = Buffer.alloc(0);
    for (let arg of command.args) {
      payloadLen_i += argSizeLen + arg.length;

      const argLen_b = Buffer.alloc(argSizeLen);
      if (flagLengthsAreFourBytes) {
        argLen_b.writeUInt32LE(arg.length);
      } else {
        argLen_b.writeUInt8(arg.length);
      }

      let arg_b: Buffer;
      switch (typeof arg.value) {
        case 'string':
          arg_b = Buffer.from(arg.value);
          break;

        case 'number':
          arg_b = Buffer.alloc(4);
          arg_b.writeUInt32LE(arg.value);
          break;

        default:
          throw new Error(`Unknown type ${typeof arg.value}`);
      }

      payload = Buffer.concat([payload, argLen_b, arg_b]);
    }

    const payloadLen_b = Buffer.alloc(4);
    payloadLen_b.writeUInt32LE(payloadLen_i);

    // End
    const delemiter_b = Buffer.alloc(1);
    delemiter_b.writeUInt8(0);

    return Buffer.concat([
      flags_b,
      group_b, command_b,
      payloadLen_b, payload,
      delemiter_b,
    ]);
  }
}
