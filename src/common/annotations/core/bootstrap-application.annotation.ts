export function HotSpringApplication(config?: ApplicationConfig): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('application:config', config, target);
    // TODO ADDING AUTO CONFIGURATION
  };
}
