
export interface Challenge {
  readonly min: number;
  readonly max: number;
}

export interface ConfigLog {
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
  readonly log: ConfigLog;
};
