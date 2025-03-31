import fs from 'fs';
import type { Stats } from 'node:fs';
import path from 'node:path';
import { ClassType, ComponentInfo } from '../../../../../@type/Global';

export class Configurator {
  private static components: Map<string, ComponentInfo> = new Map();
  private static loadedComponents = new Set<Function>();
  private static visitedPaths = new Set<string>();


  private static async _resourceResolver(directoryPath: string): Promise<void> {
    try {
      const files: string[] = fs.readdirSync(directoryPath);
      
      for (const file of files) {
        const fullPath: string = path.join(directoryPath, file);
        const stat: Stats = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          await Configurator._resourceResolver(fullPath);
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
          await Configurator._processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors du scan du dossier ${directoryPath}:`, error);
      throw error;
    }
  }

  public static componantResolver(targetPath: string, currentDir?: string): string | null {
    // Réinitialiser le cache des chemins visités à chaque appel initial
    if (!currentDir) {
      this.visitedPaths.clear();
    }
    
    // Déterminer le dossier du projet et le dossier de départ
    const projectDir = process.cwd();
    const startDir = currentDir || projectDir;
    
    // Ne pas explorer en dehors du dossier du projet
    if (!startDir.startsWith(projectDir)) {
      return null;
    }
    
    // Éviter de visiter le même chemin plusieurs fois
    if (this.visitedPaths.has(startDir)) {
      return null;
    }
    this.visitedPaths.add(startDir);
    
    // Dossiers à ignorer
    const ignoreDirs: string[] = ['.git', 'node_modules', 'dist', 'build', '.vscode'];
    
    // Normaliser le chemin cible
    const normalizedTargetPath = targetPath.replace(/^\/+|\/+$/g, '');
    const isComposedPath = normalizedTargetPath.includes('/');
    
    // Cas 1: Le dossier actuel est celui qu'on cherche
    if (!isComposedPath) {
      const baseName = path.basename(startDir);
      if (baseName === normalizedTargetPath) {
        return startDir;
      }
    }
    
    // Cas 2: Le chemin existe directement à partir du dossier actuel
    if (isComposedPath) {
      const potentialPath = path.join(startDir, normalizedTargetPath);
      try {
        if (fs.existsSync(potentialPath) && fs.statSync(potentialPath).isDirectory()) {
          return potentialPath;
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Cas 3: Explorer les sous-dossiers du dossier courant
    try {
      const entries = fs.readdirSync(startDir);
      
      // Vérifier d'abord si un dossier correspond directement au niveau actuel
      for (const entry of entries) {
        if (entry.startsWith('.') || ignoreDirs.includes(entry)) {
          continue;
        }
        
        const fullPath = path.join(startDir, entry);
        
        try {
          const stat = fs.statSync(fullPath);
          if (!stat.isDirectory()) {
            continue;
          }
          
          // Vérifier si ce dossier est celui recherché
          if (!isComposedPath && entry === normalizedTargetPath) {
            return fullPath;
          }
        } catch (error) {
          continue;
        }
      }
      
      // Ensuite explorer récursivement les sous-dossiers
      for (const entry of entries) {
        if (entry.startsWith('.') || ignoreDirs.includes(entry)) {
          continue;
        }
        
        const fullPath = path.join(startDir, entry);
        
        try {
          const stat = fs.statSync(fullPath);
          if (!stat.isDirectory()) {
            continue;
          }
          
          // Explorer ce sous-dossier
          const result = this.componantResolver(normalizedTargetPath, fullPath);
          if (result) {
            return result;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      throw error;
    }
    
    // Cas 4: Remonter d'un niveau, mais seulement si on reste dans le dossier du projet
    const parentDir = path.dirname(startDir);
    if (parentDir !== startDir && parentDir.startsWith(projectDir)) {
      return this.componantResolver(normalizedTargetPath, parentDir);
    }
    
    // Rien trouvé
    return null;
  }


  private static async _processFile(filePath: string): Promise<void> {
    try {
      const modulePath = path.resolve(filePath);
      const module = await import(modulePath);
      
      for (const exportName in module) {
        const exportedItem = module[exportName];
        
        if (typeof exportedItem !== 'function') continue;        
        if (Configurator.loadedComponents.has(exportedItem)) continue;

        
        const isController: boolean = Reflect.hasMetadata('an_ctrl', exportedItem);
        const isService: boolean = Reflect.hasMetadata('an_svc', exportedItem);
        const isRepository: boolean = Reflect.hasMetadata('an_repo', exportedItem);
        
        if (!isController && !isService &&! isRepository) continue;
        
        let componentType: ClassType;
        if (isController) {
          componentType = 'controller';
        } else if(isService) {
          componentType = 'service';
        } else if(isRepository) {
          componentType = 'repository';
        } else {
          continue;
        }
        
        const componentInfo: ComponentInfo = {
          component: exportedItem,
          type: componentType
        };
        
        Configurator.components.set(exportName, componentInfo);
        Configurator.loadedComponents.add(exportedItem);
      }
    } catch (importError) {
      console.error(`❌ Erreur lors de l'importation de ${filePath}:`, importError);

    }
  }


  public static async scanDir(directories: string[]): Promise<ComponentInfo[]> {

    Configurator.components.clear();
    Configurator.loadedComponents.clear();
    

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Répertoire non trouvé: ${dir}`);
        continue;
      }
      await this._resourceResolver(dir);
    }
    
  
    return Array.from(Configurator.components.values());
  }


  public static getComponents(): Map<string, ComponentInfo> {
    return Configurator.components;
  }


  public static getControllers(): ComponentInfo[] {
    return Array.from(Configurator.components.values())
      .filter(info => info.type === 'controller');
  }

  public static getServices(): ComponentInfo[] {
    return Array.from(Configurator.components.values())
      .filter(info => info.type === 'service');
  }
}
