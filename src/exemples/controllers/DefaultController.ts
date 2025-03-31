import { type Response, type Request } from 'express';
import { Controller, Get, HttpStatusCodes } from '../../common';
import { DefaultService } from '../services';

@Controller()
export class DefaultController {
  private readonly _defaultService: DefaultService;
  constructor (defaultService: DefaultService) {
    this._defaultService = defaultService;
  }

  @Get()
  public async default (_request: Request, response: Response): Promise<void> {
    try {
      const html: string = this._defaultService.renderString();
      response.status(HttpStatusCodes.OK).send(html);
    } catch (error: any) {
      response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
