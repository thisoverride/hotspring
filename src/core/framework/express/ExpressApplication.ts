import express, { type Application } from 'express';
import { Container } from 'inversify';
import { configureMiddleware } from './config/middleware';
import { configureErrorHandling } from './config/errorHandling';
import { HotSpring } from './hotspring';
import { DefaultController } from '../../../controller';

export class ExpressApplication {
  private readonly app: Application;
  private readonly IoCContainer: Container;

  constructor () {
    this.app = express();
    this.IoCContainer = new Container();
    this._initializeIoCContainer();
    this._configureApp();
  }

  private _initializeIoCContainer (): void {
    this.IoCContainer.bind<DefaultController>(DefaultController).toSelf();
  }

  private _configureApp (): void {
    configureMiddleware(this.app);
    HotSpring.bind(this.app, this.IoCContainer, DefaultController);
    configureErrorHandling(this.app);
  }

  public async run (port: number): Promise<void> {
    try {
      this.app.listen(port, () => {
        console.info('\x1b[1m\x1b[36m%s\x1b[0m', '${app_name} running'+` on http://localhost:${port}`);
      });
    } catch (error) {
      throw new Error(`Connection to database failed: ${String(error)}`);
    }
  }
}
