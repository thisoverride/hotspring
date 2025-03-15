import { type Response, type Request } from 'express';
import { inject, injectable } from 'inversify';
import { GET } from '../core/framework/express/hotspring';
import { HttpStatusCodes } from '../core';
import { DefaultService } from '../services';

@injectable()
export class DefaultController {
  private readonly _defaultService: DefaultService;

  constructor (@inject(DefaultService) defaultService: DefaultService) {
    this._defaultService = defaultService;
  }

  @GET('/')
  public async default (_request: Request, response: Response): Promise<void> {
    try {
      const html: string = this._defaultService.renderString();
      response.status(200).send(html);
    } catch (error: any) {
      response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
