
export class Command {
  public group: number = 0;
  public command: number = 0;
  public payload: any = null;
}

export abstract class Network {
  // TODO
  protected _clientReadRaw(data: Buffer): Array<Command> {
    let commands: Array<Command> = [];

    const command = new Command();
    const flags_i: number = data[0];
    command.group = data[1];
    command.command = data[2];
    const payload_len_i: number = data[3];

    if (payload_len_i > 0) {
      const payload_b: Buffer = data.subarray(4, 4 + payload_len_i);
      const payload_s: string = payload_b.toString('utf8');
    }

    return commands;
  }
}
