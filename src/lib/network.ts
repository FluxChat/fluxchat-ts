
import { networkInterfaces, NetworkInterfaceInfo } from 'os';

export function isIPv6Enabled(): boolean {
  const interfaces = networkInterfaces();

  // console.log('interfaces', interfaces);

  for (const [, ifaces] of Object.entries(interfaces)) {
    // console.log('name', name);

    if (ifaces === undefined) {
      continue;
    }

    const found = ifaces.find((iface: NetworkInterfaceInfo): boolean => {
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
  constructor(
    public readonly value: Buffer,
    public readonly length: number,
  ) {
  }

  public asInt(): number {
    if (this.value.length < 4) {
      const buf = Buffer.alloc(4);
      this.value.copy(buf, 0, 0, this.value.length);
      return buf.readUInt32LE();
    }

    return this.value.readUInt32LE();
  }

  public asString(): string {
    return this.value.toString('binary');
  }
}

export class Command {
  public readonly args: Array<Argument> = [];

  constructor(
    public readonly group: number = 0,
    public readonly command: number = 0,
    data: Array<Buffer | string | number> = [],
  ) {
    this.args = data.map((item: Buffer | string | number) => {
      switch (typeof item) {
        case 'number':
          const buf = Buffer.alloc(4);
          buf.writeUInt32LE(item);
          return new Argument(buf, 4);

        case 'string':
          return new Argument(Buffer.from(item), item.length);

        default:
          return new Argument(item, item.length);
      }
    });
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

    return arg.value;
  }

  public asString(index: number): string {
    const arg = this.args[index];
    if (arg === undefined) {
      throw new Error(`Argument ${index} is undefined`);
    }

    return arg.asString();
  }
}

export abstract class Network {
  protected _parseRaw(data: Buffer): Array<Command> {
    const commands: Array<Command> = [];

    let pos = 0;
    while (pos < data.length) {

      const flags_i: number = data[pos];

      const flagLengthsAreFourBytes = (flags_i & 0x01) === 0x01;
      const argSizeLen = flagLengthsAreFourBytes ? 4 : 1;
      const payloadLen_i: number = data.subarray(pos + 3, pos + 7).readUInt32LE();
      const command = new Command(data[pos + 1], data[pos + 2]);

      if (payloadLen_i > 0) {
        const payload_b: Buffer = data.subarray(pos + 7, pos + 7 + payloadLen_i);

        let payloadPos = 0;
        while (payloadPos < payloadLen_i) {

          const argLen_b: Buffer = payload_b.subarray(payloadPos, payloadPos + argSizeLen);
          const argLen_i: number = flagLengthsAreFourBytes ? argLen_b.readUInt32LE() : argLen_b.readUInt8();

          const argVal: Buffer = payload_b.subarray(payloadPos + argSizeLen, payloadPos + argSizeLen + argLen_i);
          if (argVal.length !== argLen_i) {
            throw new Error(`Argument length mismatch: ${argLen_i} != ${argVal.length}`);
          }

          payloadPos += argLen_i + argSizeLen;

          const arg = new Argument(argVal, argLen_i);
          command.args.push(arg);
        }
      }

      commands.push(command);

      pos += 1 + 1 + 1 + 4 + payloadLen_i + 1;
    }

    return commands;
  }

  protected _serializeCommand(command: Command): Buffer {
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
    for (const arg of command.args) {
      payloadLen_i += argSizeLen + arg.length;

      const argLen_b = Buffer.alloc(argSizeLen);
      if (flagLengthsAreFourBytes) {
        argLen_b.writeUInt32LE(arg.length);
      } else {
        argLen_b.writeUInt8(arg.length);
      }

      payload = Buffer.concat([payload, argLen_b, arg.value]);
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
