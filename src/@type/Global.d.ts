export type Constructor<T = any> = new (...args: any[]) => T;

export type BaseConfig = HotSpringConfig;
export type ComponentInfo = DependecyComponentInfo;

interface HotSpringConfig {
  scanBasePackages?: string[];
  exclude?: string[];
  excludeName?: string[];
};

interface DependecyComponentInfo {
  component: Constructor;
  type: 'controller' | 'service';
}
