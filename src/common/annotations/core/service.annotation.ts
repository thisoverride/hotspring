export function Service(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('service:registered', true, target);
  };
};
