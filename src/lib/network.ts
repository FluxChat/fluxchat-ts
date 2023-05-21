
export class Command {}

export abstract class Network {
  protected _clientReadRaw(data: Buffer): Array<Command> {
    let commands: Array<Command> = [];
    // TODO
    return commands;
  }
}
