import 'reflect-metadata';
import type { Application, RequestHandler } from 'express';
import { injectable, type Container } from 'inversify';
import { Constructor, DependecyComponentInfo } from '../../../../../@type/Global';

interface RouteMetadata {
  method: string;
  path: string;
  handler: Function;
  middlewares: RequestHandler[];
}


export default class HotSpring {
  public static bind(app: Application, ioContainer: Container, classRef: DependecyComponentInfo): void {
    
    const controllerInstance = ioContainer.get(classRef.component);
    injectable()(controllerInstance);
    if (classRef.type === 'controller') {
      const basePath: string = Reflect.getMetadata('an_ctrl', classRef.component) || '';

      const routes: RouteMetadata[] = Reflect.getMetadata('routes', classRef.component) || [];
      
      if (routes.length === 0) {
        console.warn(`Aucune route trouvée pour le contrôleur ${classRef.component.name}`);
        return;
      }
      // Normaliser le chemin de base
      const normalizedBasePath: string = basePath
        ? (basePath.startsWith('/') ? basePath : `/${basePath}`)
        : '';
        
        routes.forEach((route: RouteMetadata) => {
          const handler = route.handler.bind(controllerInstance);
          const middlewares = route.middlewares || [];
          const method = route.method as keyof Application;
          const routePath: string = route.path.startsWith('/') ? route.path : `/${route.path}`;
          const fullPath: string = `${normalizedBasePath}${routePath}`;
    
          if (typeof app[method] === 'function') {    
            (app[method])(fullPath, ...middlewares, handler);
          } else {
            throw new Error(`La méthode HTTP '${String(method)}' n'est pas valide pour Express`);
          }
        });
    }
}
}