
import {describe, expect, jest, test, it} from '@jest/globals';
import { Config } from '../lib/config';
import { Server } from '../lib/server';
import { Client } from '../lib/client';
import { Command } from '../lib/network';

function createConfig(): Config {
  return {
    address: '',
    port: 0,
    contact: '',
    id: '',
    data_dir: '',
    log: {
      level: '',
      file: '',
    },
  };
}

function createClient(): Client {
  return new Client('uuid1');
}

function createCommand(): Command {
  return new Command();
}

class TestServer extends Server {
  public clientHandleCommand() {
    const client = createClient();
    const command = createCommand();

    this._clientHandleCommand(client, command);
  }
}

describe('Server', () => {
  test('basics', () => {
    const config = createConfig();
    const server = new TestServer(config);

    expect(server).not.toBeNull();
  });

  test('clientHandleCommand', () => {
    const config = createConfig();
    const server = new TestServer(config);

    server.clientHandleCommand();
  });
});
