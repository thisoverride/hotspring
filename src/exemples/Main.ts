import { HotApplication, HotSpringApplication } from '../common';

@HotSpringApplication()
export class Main {
  public static async start (...args: string[]): Promise<void> {
    void HotApplication.run(Main, args);
  }
}
