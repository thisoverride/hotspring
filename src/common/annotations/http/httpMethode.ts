import 'reflect-metadata';
import type { RequestHandler } from 'express';
import { HttpMethod } from '../../enums';

function createMethodDecorator (method: HttpMethod) {
  return (path?: string): MethodDecorator => {
    path = path ?? '/';
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const existingRoutes = Reflect.getMetadata('routes', target.constructor) || [];
      existingRoutes.push({
        method,
        path,
        handler: target[propertyKey] as RequestHandler,
        middlewares: Reflect.getMetadata('middlewares', target, propertyKey) || []
      });
      Reflect.defineMetadata('routes', existingRoutes, target.constructor);
    };
  };
}

export const Post = createMethodDecorator(HttpMethod.POST);
export const Get = createMethodDecorator(HttpMethod.GET);
export const Put = createMethodDecorator(HttpMethod.PUT);
export const Delete = createMethodDecorator(HttpMethod.DELETE);
export const Patch = createMethodDecorator(HttpMethod.PATCH);
export const Head = createMethodDecorator(HttpMethod.HEAD);
export const Option = createMethodDecorator(HttpMethod.OPTIONS);
