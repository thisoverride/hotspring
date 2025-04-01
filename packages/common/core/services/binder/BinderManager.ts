import 'reflect-metadata';
import type { Application, RequestHandler } from 'express';
import { injectable, type Container } from 'inversify';
import { Constructor, DependecyComponentInfo } from '../../../../../common/interfaces/Global';

/**
 * Classe responsable de lier les contrôleurs Express à l'application
 */
@injectable()
export default class BinderManager {
  /**
   * Enregistre un composant comme contrôleur dans l'application Express
   *
   * @param app - L'application Express
   * @param container - Le conteneur IoC
   * @param classInfo - Les informations sur le composant à lier
   */
  public static bind (app: Application, container: Container, classInfo: DependecyComponentInfo): void {
    // Vérifie si le composant est un contrôleur
    if (classInfo.type !== 'controller') {
      return;
    }

    // Récupère l'instance du contrôleur depuis le conteneur IoC
    const controllerInstance = container.get(classInfo.component);

    // Récupère les métadonnées
    const basePath: string = Reflect.getMetadata('an_ctrl', classInfo.component) || '';
    const routes: RouteMetadata[] = Reflect.getMetadata('routes', classInfo.component) || [];

    // Vérifie si des routes sont définies
    if (routes.length === 0) {
      console.warn(`Aucune route trouvée pour le contrôleur ${classInfo.component.name}`);
      return;
    }

    // Normalise le chemin de base
    const normalizedBasePath = BinderManager.normalizePath(basePath);

    // Enregistre chaque route
    routes.forEach((route: RouteMetadata) => {
      BinderManager.registerRoute(
        app,
        controllerInstance,
        route,
        normalizedBasePath
      );
    });
  }

  /**
   * Normalise un chemin en s'assurant qu'il commence par '/'
   *
   * @param path - Le chemin à normaliser
   * @returns Le chemin normalisé
   */
  private static normalizePath(path: string): string {
    if (!path) return '';
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * Enregistre une route dans l'application Express
   * 
   * @param app - L'application Express
   * @param controller - L'instance du contrôleur
   * @param route - Les métadonnées de la route
   * @param basePath - Le chemin de base du contrôleur
   */
  private static registerRoute(
    app: Application, 
    controller: any, 
    route: RouteMetadata, 
    basePath: string
  ): void {
    const { method, path, middlewares = [], handler } = route;

    // Lie le gestionnaire au contrôleur
    const boundHandler = handler.bind(controller);

    // Normalise le chemin de la route
    const routePath = this.normalizePath(path);

    // Construit le chemin complet
    const fullPath = `${basePath}${routePath}`;

    // Enregistre la route dans l'application Express
    const httpMethod = method as keyof Application;

    if (typeof app[httpMethod] === 'function') {
      (app[httpMethod])(fullPath, ...middlewares, boundHandler);
    } else {
      throw new Error(`La méthode HTTP '${String(httpMethod)}' n'est pas valide pour Express`);
    }
  }
}