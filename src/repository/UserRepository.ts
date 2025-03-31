import { Repository } from '../core/framework/express/hotspring';

@Repository()
export class DefaultRepository {
  public findByAppName (strName: string): string {
    return strName;
  }
}
