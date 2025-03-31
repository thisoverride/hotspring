import 'reflect-metadata';
import { ClassType, HotSpringConfig } from '../../../../../../@type/Global';

export function HotSpringApplication(config?: HotSpringConfig) {
  return function (target: Function) {
    Reflect.defineMetadata("main", config, target);
  };
}

export function Repository() {
  return function (target: Function) {
    Reflect.defineMetadata("an_repo", true, target);
  };
}

export function Service() {
  return function (target: Function) {
    Reflect.defineMetadata("an_svc", true, target);
  };
}

export function Controller(prefix: string = '') {
  return function (target: Function) {
    Reflect.defineMetadata('an_ctrl', prefix, target);
  };
}


export function getComponentsByType(type: ClassType, modules: any[]) {
  return modules.filter(module => Reflect.getMetadata('componentType', module) === type);
}
