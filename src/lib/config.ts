
export interface Challenge {
  readonly min: number;
  readonly max: number;
}

export interface AddressBook {
}

export interface Client {
  readonly auth_timeout: number;
}

export interface Discovery {
}

export interface Mail {
}

export interface Log {
  readonly level: string;
  readonly file: string;
}

export interface Config {
  readonly address: string;
  readonly port: number;
  readonly contact: string;
  readonly id: string;
  readonly data_dir: string;
  readonly challenge: Challenge;
  // readonly address_book: AddressBook;
  readonly client: Client;
  // readonly discovery: Discovery;
  // readonly bootstrap: string;
  // readonly mail: Mail;
  readonly log: Log;
}
