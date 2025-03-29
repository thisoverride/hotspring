import express, { type Application } from 'express';
import { Container } from 'inversify';
import { configureMiddleware } from './config/middleware';
import { configureErrorHandling } from './config/errorHandling';
import { Logger } from '../utils/logger/Logger'
import { HotSpring } from './hotspring';
import { ComponentInfo, Constructor, DependecyComponentInfo } from '../../../@type/Global';

export class Bootstrap {
  private readonly _app: Application;
  private readonly _IoCContainer: Container;
  private readonly _logger: Logger;
  private _isInitialized: boolean = false;

  constructor(controllerClasses: ComponentInfo[], logger?: Logger) {
    this._logger = logger ?? new Logger();
    this._app = express();
    this._IoCContainer = new Container();
    this._initialize(controllerClasses);
  }

  private async _initialize(controllerClasses: ComponentInfo[]): Promise<void> {
    try {
      this._injectControllers(controllerClasses);
      this._configureApp(controllerClasses);
      this._isInitialized = true;
      this._logger.info('Application initialization completed');
      await this._start(3000);
    } catch (error: unknown) {
      console.log(error)
      this._logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private _injectControllers(controllerClasses: ComponentInfo[]): void {
    if (controllerClasses.length === 0) {
      this._logger.warn('No controllers to inject');
      return;
    }

    this._logger.info(`Injecting ${controllerClasses.length} controllers into IoC container`);
    controllerClasses.forEach((classRef: DependecyComponentInfo) => {
      this._IoCContainer.bind(classRef.component).toSelf();
      this._logger.debug(`Injected controller: ${classRef.component.name}`);
    });
  }

  private _configureApp(controllerClasses: ComponentInfo[]): void {
    this._logger.info('Configuring Express application...');
    
    // Configure middleware
    configureMiddleware(this._app, this._logger);
    
    // Bind controllers to routes
    if (controllerClasses.length > 0) {
      this._logger.info(`Binding routes for ${controllerClasses.length} controllers`);
      
      controllerClasses.forEach((classRef: DependecyComponentInfo) => {
        this._logger.info(`Binding routes for controller: ${classRef.component.name}`);
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