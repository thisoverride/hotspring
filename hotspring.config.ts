import { Configurator } from './src/core';

export default Configurator.defineConfig({
  ioc: {
    controllers: 'src/controllers',
    dependencies: ['src/services']
  }
});
