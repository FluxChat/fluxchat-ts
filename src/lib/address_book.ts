
import * as fs from 'fs';
import * as winston from 'winston';
import { format as f } from 'util';
import { LoggerFactory } from './logger';
import { Client } from './client';
import { Database } from './database';
import { Contact } from './contact';

export class AddressBook extends Database<string, Client> {
  private readonly _logger: winston.Logger;
  protected readonly _typex: new () => Client = Client;

  constructor(_filePath: string) {
    super(_filePath);

    this._logger = LoggerFactory.getInstance().createLogger('address_book');
    this._logger.debug(f('constructor(%s)', this._filePath));
  }

  public async loadBootstrap(path: string, clean: boolean = true): Promise<void> {
    this._logger.debug(f('loadBootstrap(%s)', path));

    if (!fs.existsSync(path)) {
      return;
    }
    const data: Array<string> = JSON.parse(fs.readFileSync(path, 'utf8')) as Array<string>;
    // console.log('loadBootstrap', data);

    for (const _contact of data) {
      const contact = await Contact.resolve(_contact);
      if (contact.is_valid) {
        const client = new Client();
        if (contact.addr) {
          client.address = contact.addr;
        }
        if (contact.port) {
          client.port = contact.port;
        }
        this.addClient(client);
      }
    }

    if (clean) {
      fs.writeFileSync(path, '[]', 'utf8');
    }
  }

  public addClient(client: Client): void {
    this._logger.debug(f('addClient(%s)', client));

    this.add(client.uuid, client);
  }
}
