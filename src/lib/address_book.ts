
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { format as f } from 'util';
import { Logger } from 'winston';
import { LoggerFactory } from './logger';
import { Client } from './client';
import { Database } from './database';
import { Contact } from './contact';
import { Node } from './overlay';

export class AddressBook extends Database<string, Client> {
  private readonly _logger: Logger;
  protected readonly _typex: new () => Client = Client;

  constructor(_filePath: string) {
    super(_filePath);

    this._logger = LoggerFactory.getInstance().createLogger('address_book');
    this._logger.debug(f('constructor(%s)', this._filePath));
  }

  public async loadBootstrap(path: string, clean: boolean = true): Promise<void> {
    this._logger.debug(f('loadBootstrap(%s)', path));

    if (!existsSync(path)) {
      return;
    }
    const data: Array<string> = JSON.parse(readFileSync(path, 'utf8')) as Array<string>;
    // console.log('loadBootstrap', data);

    for (const _contact of data) {
      const contact = await Contact.resolve(_contact);
      if (contact.is_valid) {
        const client = new Client();
        client.debug_add = 'bootstrap';
        client.is_bootstrap = true;
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
      writeFileSync(path, '[]', 'utf8');
    }
  }

  public addClient(client: Client): void {
    this._logger.debug(f('addClient(%s)', client));

    this.add(client.uuid, client);
  }

  public getNearestTo(node: Node, limit: number = 20, withContactInfos: boolean | null = null): Array<Client> {

    const sorted = [...this._data.values()]
      .filter((client: Client): boolean => {
        return client.node !== null;
      })
      .sort((a: Client, b: Client): number => {
        const aNode = a.node as Node;
        const bNode = b.node as Node;

        const aDistance = aNode.distance(node);
        const bDistance = bNode.distance(node);

        return aDistance.distance - bDistance.distance;
      })
      .slice(0, limit);

    if (withContactInfos !== null) {
      //TODO
      if (withContactInfos) {}
      else {}
    }

    return [];
  }
}
