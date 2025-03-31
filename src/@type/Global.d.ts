export type Constructor<T = any> = new (...args: any[]) => T;

export type BaseConfig = HotSpringConfig;
export type ComponentInfo = DependecyComponentInfo;
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type ClassType = 'controller' | 'service' | 'repository';

interface HotSpringConfig {
  scanBasePackages?: string[];
  exclude?: string[];
  excludeName?: string[];
};

interface DependecyComponentInfo {
  component: Constructor;
  type: ClassType;
}
