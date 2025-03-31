export function Repository (): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('repository:registered', true, target);
  };
};
