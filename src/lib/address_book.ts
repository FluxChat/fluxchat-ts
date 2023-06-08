
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

  private _clientsById: Map<string, Client> = new Map<string, Client>();
  private _clientsByAddrPort: Map<string, Client> = new Map<string, Client>();

  constructor(_filePath: string) {
    super(_filePath);

    this._logger = LoggerFactory.getInstance().createLogger('address_book');
    this._logger.debug(f('constructor(%s)', this._filePath));
  }

  protected postLoad(): void {
    this._logger.debug('postLoad()');

    const raw = Array.from(this._data.values());

    // Clients by ID
    this._clientsById = raw
      .filter((client: Client): boolean => client.id !== undefined && client.id !== null)
      .reduce((map: Map<string, Client>, client: Client) => {
        map.set(client.id as string, client);
        return map;
      }, new Map<string, Client>());

    // Clients by Address:Port
    this._clientsByAddrPort = raw
      .filter((client: Client): boolean => client.hasContact())
      .reduce((map: Map<string, Client>, client: Client) => {
        map.set(`${client.address}:${client.port}`, client);
        return map;
      }, new Map<string, Client>());
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
        client.debugAdd = 'bootstrap';
        client.isBootstrap = true;
        if (contact.address) {
          client.address = contact.address;
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

    this._clientsById.set(client.id as string, client);
    this._clientsByAddrPort.set(`${client.address}:${client.port}`, client);
  }

  // TODO: tests
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
      // TODO withContactInfos
      if (withContactInfos) {}
      else {}
    }

    return [];
  }

  public getClientById(id: string): Client | null {
    return this._clientsById.get(id) || null;
  }

  public getClientByAddrPort(address: string, port: number): Client | null {
    return this._clientsByAddrPort.get(`${address}:${port}`) || null;
  }
}
