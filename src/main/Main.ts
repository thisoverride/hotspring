import { HotSpringApplication } from '../core/framework/express/hotspring';
import { HotApplication } from '../services/HotApplication';

@HotSpringApplication({ scanBasePackages: ['controllers', 'src/services'] })
export default class Main {
  public static start (...args: string[]): void {
    void HotApplication.run(Main, args);
  }
}
