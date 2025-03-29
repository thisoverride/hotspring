import path from 'path';
import 'reflect-metadata';
import { Configurator } from '../../core/Configurator';
import { HotSpringConfig } from '../../../../../../@type/Global';

type ClassType = 'controller' | 'service' | 'repository';

function Component(type: ClassType, path?: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('componentType', {type , path}, target);
  };
}


// Autowired

export function HotSpringApplication(config?: HotSpringConfig) {
  return function (target: Function) {
    Reflect.defineMetadata("main", config, target);
  };
}



export function Service() {
  return function (target: Function) {
    Reflect.defineMetadata("service", true, target);
  };
}

export function Controller(prefix: string = '') {
  return function (target: Function) {
    Reflect.defineMetadata('prefix', prefix, target);
  };
}





export function getComponentsByType(type: ClassType, modules: any[]) {
  return modules.filter(module => Reflect.getMetadata('componentType', module) === type);
}
