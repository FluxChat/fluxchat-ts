
export abstract class App {
  constructor(
    protected readonly _args: any,
  ) {
  }

  public abstract run(): void;
}
