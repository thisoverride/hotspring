import fs from 'fs';
import type { Stats } from 'node:fs';
import path from 'node:path';
import { ComponentInfo } from '../../../../../@type/Global';
import 'reflect-metadata';

// Type pour stocker les informations de composant (contrôleur ou service)

export class Configurator {
  private static components: Map<string, ComponentInfo> = new Map();
  private static loadedComponents = new Set<Function>();

  /**
   * Analyse récursivement un répertoire pour trouver des contrôleurs et services
   */
  private static async _resourceResolver(directoryPath: string): Promise<void> {
    try {
      const files: string[] = fs.readdirSync(directoryPath);
      
      for (const file of files) {
        const fullPath: string = path.join(directoryPath, file);
        const stat: Stats = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          await Configurator._resourceResolver(fullPath); // Récursion dans les sous-dossiers
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
          await Configurator._processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors du scan du dossier ${directoryPath}:`, error);
      throw error;
    }
  }

  /**
   * Traite un fichier pour extraire les contrôleurs et services
   */
  private static async _processFile(filePath: string): Promise<void> {
    try {
      const modulePath = path.resolve(filePath);
      const module = await import(modulePath);
      
      for (const exportName in module) {
        const exportedItem = module[exportName];
        
        if (typeof exportedItem !== 'function') continue;
        
        // Éviter de traiter à nouveau les classes déjà chargées
        if (Configurator.loadedComponents.has(exportedItem)) continue;
        
        const isController: boolean = Reflect.hasMetadata('prefix', exportedItem);
        const isService: boolean = Reflect.hasMetadata('service', exportedItem);
        
        // Si ce n'est ni un contrôleur ni un service, ignorer
        if (!isController && !isService) continue;
        
        // Déterminer le type de composant
        let componentType: 'controller' | 'service';
        
        if (isController) {
          componentType = 'controller';
          console.log(`✅ Contrôleur découvert: ${exportName} dans ${filePath}`);
        } else {
          componentType = 'service';
          console.log(`✅ Service découvert: ${exportName} dans ${filePath}`);
        }
        
        // Créer un objet info pour stocker les métadonnées
        const componentInfo: ComponentInfo = {
          component: exportedItem,
          type: componentType
        };
        
        // Ajouter aux collections
        Configurator.components.set(exportName, componentInfo);
        Configurator.loadedComponents.add(exportedItem);
      }
    } catch (importError) {
      console.error(`❌ Erreur lors de l'importation de ${filePath}:`, importError);
      // Ne pas propager l'erreur pour permettre au scan de continuer
    }
  }

  /**
   * Analyse plusieurs répertoires pour trouver les contrôleurs et services
   */
  public static async scanDir(directories: string[]): Promise<ComponentInfo[]> {
    // Réinitialiser les collections pour éviter les problèmes avec des appels multiples
    Configurator.components.clear();
    Configurator.loadedComponents.clear();
    
    // Analyser tous les répertoires fournis
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Répertoire non trouvé: ${dir}`);
        continue;
      }
      await this._resourceResolver(dir);
    }
    
    // Convertir la Map en Array pour le retour
    return Array.from(Configurator.components.values());
  }

  /**
   * Récupérer tous les composants découverts
   */
  public static getComponents(): Map<string, ComponentInfo> {
    return Configurator.components;
  }

  /**
   * Récupérer uniquement les contrôleurs
   */
  public static getControllers(): ComponentInfo[] {
    return Array.from(Configurator.components.values())
      .filter(info => info.type === 'controller');
  }

  /**
   * Récupérer uniquement les services
   */
  public static getServices(): ComponentInfo[] {
    return Array.from(Configurator.components.values())
      .filter(info => info.type === 'service');
  }
}