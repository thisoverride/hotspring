import { Main } from '../Main';

export const start = (arg?: string): void => {
  void Main.start(arg ?? '');
};

start(process.argv[2]);
