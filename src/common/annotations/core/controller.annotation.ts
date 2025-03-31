export function Controller(prefix?: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('controller:prefix', prefix ?? '', target);
  };
}
