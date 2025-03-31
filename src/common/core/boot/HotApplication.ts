import type { ComponentInfo, Constructor, HotSpringConfig } from '../@type/Global';
import { Configurator } from '../core';
import { Bootstrap } from '../core/framework/express/Bootstrap';

export class HotApplication {
  public static async run (classReference: Constructor, args: string[]): Promise<void> {
    try {
      const className: string = classReference.name;
      const stack: string | undefined = new Error().stack;
      if (!stack) throw new Error('Faild to initialize application.');
      const stackLines = stack.split('\n');
      const filePath = stackLines.find(line =>
        line.includes(`/${className}.`) || line.includes(`\\${className}.`)
      );

      const match = filePath?.match(/\((.+?):\d+:\d+\)/) ??
      filePath?.match(/at\s+(.+?):\d+:\d+/);

      const dirPath: string | null = match ? match[1] : null;
      if (!dirPath) {
        throw new Error('Faild to initialize application.');
      }
      const module = await import(dirPath);
      for (const exportName in module) {
        const exportedItem: unknown = module[exportName];
        if (typeof exportedItem === 'function' && Reflect.hasMetadata('main', exportedItem)) {
          const applicationParams: HotSpringConfig = Reflect.getMetadata('main', exportedItem);
          const i: number = dirPath.lastIndexOf('/');
          let rootDir: string[] = new Array(dirPath.substring(0, i));

          if (applicationParams) {
            if (applicationParams.scanBasePackages) {
              rootDir = applicationParams.scanBasePackages.length > 0 ? applicationParams.scanBasePackages : rootDir;

              const pathScan: string[] = [];
              for (const componantPath of rootDir) {
                const cmptPath: string | null = Configurator.componantResolver(componantPath);
                if (cmptPath) {
                  pathScan.push(cmptPath);
                } else {
                  throw new Error('Scan Directory not found error');
                }
              }
              rootDir = pathScan;
            }
          }

          const controller: ComponentInfo[] = await Configurator.scanDir(rootDir);
          // eslint-disable-next-line no-new
          new Bootstrap(controller);
        }
      }
    } catch (e: any) {
      console.error(e);
      if (e instanceof Error) {
        console.error(e.message);
        throw e;
      }
    }
  }
}
