import { HotSpringApplication } from './core/framework/express/hotspring';
import { HotApplication } from './services/HotApplication';

@HotSpringApplication()
export class Main {
  public static async start (...args: string[]): Promise<void> {
    void HotApplication.run(Main, args);
  }
}
void (async () => {
  await Main.start();
})();
