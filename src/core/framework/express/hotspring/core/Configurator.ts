import fs from 'fs';
import path from 'node:path';


export interface HotSpringConfig {
  _controllerFiles: string[],
  _serviceFiles: string[]
}

export interface Ioc {
  controllers: string
  dependencies: string[]
}

export interface UserConfig {
  ioc: Ioc
  // repositoryDir?: string;
  // logging?: Logging;
}

interface Logging {
  enableFileLogging: boolean,
  logDirectory: string,
  logLevel: string
}
export class Configurator {
  public static defineConfig(config: UserConfig): HotSpringConfig {
    const enhancedConfig = this.scanDirectories(config);
    return enhancedConfig;
  }

  private static scanDirectories(config: UserConfig): HotSpringConfig {
    const basePath: string = process.cwd();

    let controllerFiles: string[] = config.ioc.controllers ?
      this.getAllFiles(path.join(basePath, config.ioc.controllers)) : [];
    
    let serviceFiles: string[] = [];
    if (config.ioc.dependencies && config.ioc.dependencies.length > 0) {
      serviceFiles = config.ioc.dependencies.flatMap((el) => 
        this.getAllFiles(path.join(basePath, el))
      );
    }
    
    
    controllerFiles = controllerFiles.filter(file => {
      const fileName = path.basename(file, path.extname(file));
      return fileName.endsWith('Controller');
    });

    
    serviceFiles = serviceFiles.filter(file => {
      const fileName = path.basename(file, path.extname(file));
      return fileName.endsWith('Service');
    });
    
    const enhancedConfig: HotSpringConfig = {
      _controllerFiles: controllerFiles.map(file => path.relative(basePath, file)),
      _serviceFiles: serviceFiles.map(file => path.relative(basePath, file))
    };
    
    return enhancedConfig;
  }

  private static getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    // Vérifier si le répertoire existe
    if (!fs.existsSync(dirPath)) {
      console.warn(`Le répertoire ${dirPath} n'existe pas.`);
      return arrayOfFiles;
    }
    
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });
    
    return arrayOfFiles;
  }
}