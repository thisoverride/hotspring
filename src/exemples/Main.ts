import { HotSpringApplication } from '../common';
import { HotApplication } from './services/HotApplication';

@HotSpringApplication()
export class Main {
  public static async start (...args: string[]): Promise<void> {
    void HotApplication.run(Main, args);
  }
}
