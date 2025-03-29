import { type Response, type Request } from 'express';
import { Controller, GET } from '../core/framework/express/hotspring';
import { HttpStatusCodes } from '../core';
import { DefaultService } from '../services';

@Controller('/user')
export class UserController {
  private readonly _defaultService: DefaultService;
  constructor (defaultService: DefaultService) {
    this._defaultService = defaultService;
  }

  @GET('/ok')
  public async default (_request: Request, response: Response): Promise<void> {
    try {
      // const html: string = this._defaultService.renderString();
      response.status(200).send('<div>USER</div>');
    } catch (error: any) {
      response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
