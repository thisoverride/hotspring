import { type Response, type Request } from 'express';
import { Controller, Get, HttpStatusCodes } from '../../common';
import { DefaultService } from '../services';

@Controller('/user')
export class UserController {
  private readonly _defaultService: DefaultService;
  constructor (defaultService: DefaultService) {
    this._defaultService = defaultService;
  }

  @Get('/all')
  public async default (_request: Request, response: Response): Promise<void> {
    try {
      response.status(200).send('<div>USER</div>');
    } catch (error: any) {
      response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
