import express, { type Application } from 'express';
import { Container } from 'inversify';
import { configureMiddleware } from './config/middleware';
import { configureErrorHandling } from './config/errorHandling';
import { Logger } from '../utils/logger/Logger'
import { HotSpring } from './hotspring';
import { ComponentInfo, DependecyComponentInfo } from '../../../@type/Global';

export class Bootstrap {
  private readonly _app: Application;
  private readonly _IoCContainer: Container;
  private readonly _logger: Logger;
  private _isInitialized: boolean = false;

  constructor(components: ComponentInfo[], logger?: Logger) {
    this._logger = logger ?? new Logger();
    this._app = express();
    this._IoCContainer = new Container();
    this._initialize(components);
  }

  private async _initialize(components: ComponentInfo[]): Promise<void> {
    try {
      this._injectComponents(components);
      this._configureApp(components);
      this._isInitialized = true;
      this._logger.info('Application initialization completed');
      await this._start(8000);
    } catch (error: unknown) {
      console.log(error)
      this._logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private _injectComponents(components: ComponentInfo[]): void {
    if (components.length === 0) {
      this._logger.warn('No components to inject');
      return;
    }
    
    this._logger.info(`Injecting ${components.length} components into IoC container`);
    
    components.forEach((classRef: DependecyComponentInfo) => {
      this._IoCContainer.bind(classRef.component).toSelf();
      
      if (classRef.type === 'controller') {
        this._logger.debug(`Injected controller: ${classRef.component.name}`);
      } else if (classRef.type === 'service') {
        this._logger.debug(`Injected service: ${classRef.component.name}`);
      } else if (classRef.type === 'repository') {
        this._logger.debug(`Injected repository: ${classRef.component.name}`);
      } else {
        this._logger.debug(`Injected component of type ${classRef.type}: ${classRef.component.name}`);
      }
    });
  }

  private _configureApp(components: ComponentInfo[]): void {
    this._logger.info('Configuring Express application...');
    
    configureMiddleware(this._app, this._logger);
    
    const controllers = components.filter(c => (c as DependecyComponentInfo).type === 'controller');
    
    if (controllers.length > 0) {
      this._logger.info(`Binding routes for ${controllers.length} controllers`);
      
      components.forEach((classRef: DependecyComponentInfo) => {
        if (classRef.type === 'controller') {
          this._logger.info(`Binding routes for controller: ${classRef.component.name}`);
        }
        
        HotSpring.bind(this._app, this._IoCContainer, classRef);
      });
    } else {
      this._logger.warn('No controllers to bind to routes');
    }
    
    // Configure error handling (should be last)
    configureErrorHandling(this._app);
    this._logger.info('Express application configuration completed');
  }

  private async _start(port: number): Promise<void> {
    if (!this._isInitialized) {
      this._logger.info('Application not initialized, initializing now...');
      await this._initialize([]);
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        const server = this._app.listen(port, () => {
          this._logger.info(`Server running on http://localhost:${port}`);
          resolve();
        });
        
        server.on('error', (error) => {
          this._logger.error(`Failed to start server: ${error.message}`);
          reject(error);
        });
        
        // Handle graceful shutdown
        process.on('SIGTERM', () => {
          this._logger.info('SIGTERM received, shutting down gracefully');
          server.close(() => {
            this._logger.info('Server closed');
            process.exit(0);
          });
        });
      } catch (error: unknown) {
        this._logger.error(`Fatal error starting server: ${error}`);
        reject(new Error(`Failed to start server: ${String(error)}`));
      }
    });
  }
}