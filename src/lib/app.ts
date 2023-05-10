
export abstract class App {
  constructor(
    protected readonly _args: any,
  ) {
    console.log('-> App');
  }

  public abstract run(): void;
}
