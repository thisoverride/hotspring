export type Constructor<T = any> = new (...args: any[]) => T;

export type ApplicationConfig = BaseConfig;
export type ComponentInfo = DependecyComponentInfo;
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type ClassType = 'controller' | 'service' | 'repository';

interface BaseConfig {
  scanBasePackages?: string[];
  exclude?: string[];
  excludeName?: string[];
};

interface DependecyComponentInfo {
  component: Constructor;
  type: ClassType;
}
