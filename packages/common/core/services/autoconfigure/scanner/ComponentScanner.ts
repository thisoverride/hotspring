import fs from 'fs';
import type { Stats } from 'node:fs';
import path from 'node:path';
import { ClassType, ComponentInfo } from '../../../../../common/interfaces/Global';

/**
 * Classe responsable de scanner et gérer les composants de l'application
 */
export class ComponentScanner {
  private static components: Map<string, ComponentInfo> = new Map();
  private static loadedComponents = new Set<Function>();
  private static visitedPaths = new Set<string>();

  /**
   * Parcourt récursivement un répertoire pour traiter les fichiers
   * 
   * @param directoryPath - Chemin du répertoire à scanner
   */
  private static async scanDirectory(directoryPath: string): Promise<void> {
    try {
      const files: string[] = fs.readdirSync(directoryPath);

      for (const file of files) {
        const fullPath: string = path.join(directoryPath, file);
        const stat: Stats = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          await ComponentScanner.scanDirectory(fullPath);
        } else if (this.isValidSourceFile(file)) {
          await ComponentScanner.processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors du scan du dossier ${directoryPath}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier est un fichier source valide
   * 
   * @param fileName - Nom du fichier à vérifier
   * @returns Vrai si le fichier est un fichier source valide
   */
  private static isValidSourceFile(fileName: string): boolean {
    return (fileName.endsWith('.ts') || fileName.endsWith('.js')) && !fileName.endsWith('.d.ts');
  }

  /**
   * Recherche un composant dans le système de fichiers
   * 
   * @param targetPath - Chemin cible à rechercher
   * @param currentDir - Répertoire courant (optionnel)
   * @returns Le chemin complet du composant ou null s'il n'est pas trouvé
   */
  public static findComponentPath(targetPath: string, currentDir?: string): string | null {
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
    const normalizedTargetPath = this.normalizePath(targetPath);
    const isComposedPath = normalizedTargetPath.includes('/');
    
    // Cas 1: Le dossier actuel est celui qu'on cherche
    if (this.isTargetDirectory(startDir, normalizedTargetPath, isComposedPath)) {
      return startDir;
    }
    
    // Cas 2: Le chemin existe directement à partir du dossier actuel
    if (isComposedPath) {
      const directPathResult = this.checkDirectPath(startDir, normalizedTargetPath);
      if (directPathResult) {
        return directPathResult;
      }
    }
    
    // Cas 3: Explorer les sous-dossiers du dossier courant
    const subDirectoryResult = this.exploreSubdirectories(
      startDir, 
      normalizedTargetPath, 
      isComposedPath, 
      ignoreDirs
    );
    if (subDirectoryResult) {
      return subDirectoryResult;
    }
    
    // Cas 4: Remonter d'un niveau, mais seulement si on reste dans le dossier du projet
    return this.exploreParentDirectory(startDir, normalizedTargetPath, projectDir);
  }

  /**
   * Normalise un chemin en supprimant les barres obliques au début et à la fin
   * 
   * @param pathToNormalize - Chemin à normaliser
   * @returns Chemin normalisé
   */
  private static normalizePath(pathToNormalize: string): string {
    return pathToNormalize.replace(/^\/+|\/+$/g, '');
  }

  /**
   * Vérifie si le répertoire actuel est le répertoire cible
   * 
   * @param currentDir - Répertoire actuel
   * @param targetPath - Chemin cible normalisé
   * @param isComposedPath - Indique si le chemin cible est composé
   * @returns Vrai si le répertoire actuel est le répertoire cible
   */
  private static isTargetDirectory(
    currentDir: string, 
    targetPath: string, 
    isComposedPath: boolean
  ): boolean {
    if (!isComposedPath) {
      const baseName = path.basename(currentDir);
      if (baseName === targetPath) {
        return true;
      }
    }
    return false;
  }

  /**
   * Vérifie si le chemin cible existe directement à partir du répertoire actuel
   * 
   * @param currentDir - Répertoire actuel
   * @param targetPath - Chemin cible normalisé
   * @returns Le chemin complet du composant ou null s'il n'est pas trouvé
   */
  private static checkDirectPath(currentDir: string, targetPath: string): string | null {
    const potentialPath = path.join(currentDir, targetPath);
    try {
      if (fs.existsSync(potentialPath) && fs.statSync(potentialPath).isDirectory()) {
        return potentialPath;
      }
    } catch (error) {
      // Ignorer les erreurs
    }
    return null;
  }

  /**
   * Explore les sous-répertoires pour trouver le chemin cible
   * 
   * @param currentDir - Répertoire actuel
   * @param targetPath - Chemin cible normalisé
   * @param isComposedPath - Indique si le chemin cible est composé
   * @param ignoreDirs - Liste des répertoires à ignorer
   * @returns Le chemin complet du composant ou null s'il n'est pas trouvé
   */
  private static exploreSubdirectories(currentDir: string, targetPath: string, isComposedPath: boolean, ignoreDirs: string[]): string | null {
    try {
      const entries = fs.readdirSync(currentDir);

      // Vérifier d'abord si un dossier correspond directement au niveau actuel
      for (const entry of entries) {
        if (this.shouldIgnoreDirectory(entry, ignoreDirs)) {
          continue;
        }

        const fullPath = path.join(currentDir, entry);

        try {
          if (!this.isValidDirectory(fullPath)) {
            continue;
          }

          // Vérifier si ce dossier est celui recherché
          if (!isComposedPath && entry === targetPath) {
            return fullPath;
          }
        } catch (error) {
          continue;
        }
      }

      // Ensuite explorer récursivement les sous-dossiers
      for (const entry of entries) {
        if (this.shouldIgnoreDirectory(entry, ignoreDirs)) {
          continue;
        }

        const fullPath = path.join(currentDir, entry);

        try {
          if (!this.isValidDirectory(fullPath)) {
            continue;
          }

          // Explorer ce sous-dossier
          const result = this.findComponentPath(targetPath, fullPath);
          if (result) {
            return result;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error(`Erreur lors de l'exploration des sous-répertoires:`, error);
    }
    return null;
  }

  /**
   * Vérifie si un répertoire doit être ignoré
   *
   * @param dirName - Nom du répertoire
   * @param ignoreDirs - Liste des répertoires à ignorer
   * @returns Vrai si le répertoire doit être ignoré
   */
  private static shouldIgnoreDirectory (dirName: string, ignoreDirs: string[]): boolean {
    return dirName.startsWith('.') || ignoreDirs.includes(dirName);
  }

  /**
   * Vérifie si un chemin est un répertoire valide
   *
   * @param path - Chemin à vérifier
   * @returns Vrai si le chemin est un répertoire valide
   */
  private static isValidDirectory (path: string): boolean {
    const stat = fs.statSync(path);
    return stat.isDirectory();
  }

  /**
   * Explore le répertoire parent
   *
   * @param currentDir - Répertoire actuel
   * @param targetPath - Chemin cible normalisé
   * @param projectDir - Répertoire du projet
   * @returns Le chemin complet du composant ou null s'il n'est pas trouvé
   */
  private static exploreParentDirectory (currentDir: string, targetPath: string, projectDir: string): string | null {
    const parentDir = path.dirname(currentDir);
    if (parentDir !== currentDir && parentDir.startsWith(projectDir)) {
      return this.findComponentPath(targetPath, parentDir);
    }

    return null;
  }

  /**
   * Traite un fichier pour en extraire les composants
   *
   * @param filePath - Chemin du fichier à traiter
   */
  private static async processFile (filePath: string): Promise<void> {
    try {
      const modulePath = path.resolve(filePath);
      const module = await import(modulePath);

      for (const exportName in module) {
        const exportedItem = module[exportName];

        // Ignorer les éléments qui ne sont pas des fonctions ou déjà chargés
        if (typeof exportedItem !== 'function' || 
            ComponentScanner.loadedComponents.has(exportedItem)) {
          continue;
        }

        // Déterminer le type de composant
        const componentType = this.determineComponentType(exportedItem);
        if (!componentType) {
          continue;
        }

        // Enregistrer le composant
        this.registerComponent(exportName, exportedItem, componentType);
      }
    } catch (importError) {
      console.error(`❌ Erreur lors de l'importation de ${filePath}:`, importError);
    }
  }

  /**
   * Détermine le type d'un composant
   *
   * @param component - Composant à examiner
   * @returns Le type du composant ou undefined s'il n'est pas reconnu
   */
  private static determineComponentType (component: Function): ClassType | undefined {
    const isController: boolean = Reflect.hasMetadata('an_ctrl', component);
    const isService: boolean = Reflect.hasMetadata('an_svc', component);
    const isRepository: boolean = Reflect.hasMetadata('an_repo', component);

    if (isController) return 'controller';
    if (isService) return 'service';
    if (isRepository) return 'repository';

    return undefined;
  }

  /**
   * Enregistre un composant
   * 
   * @param exportName - Nom de l'export
   * @param component - Composant à enregistrer
   * @param type - Type du composant
   */
  private static registerComponent (exportName: string, component: Function, type: ClassType): void {
    const componentInfo: ComponentInfo = { component, type };

    ComponentScanner.components.set(exportName, componentInfo);
    ComponentScanner.loadedComponents.add(component);
  }

  /**
   * Scanner des répertoires pour y trouver des composants
   * 
   * @param directories - Liste des répertoires à scanner
   * @returns Liste des composants trouvés
   */
  public static async scanDirectories (directories: string[]): Promise<ComponentInfo[]> {
    // Réinitialiser les collections
    ComponentScanner.components.clear();
    ComponentScanner.loadedComponents.clear();
    // Scanner chaque répertoire
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Répertoire non trouvé: ${dir}`);
        continue;
      }
      await this.scanDirectory(dir);
    }
    // Retourner tous les composants trouvés
    return Array.from(ComponentScanner.components.values());
  }

  /**
   * Récupérer tous les composants
   *
   * @returns Map des composants
   */
  public static getAllComponents(): Map<string, ComponentInfo> {
    return ComponentScanner.components;
  }

  /**
   * Récupérer tous les contrôleurs
   *
   * @returns Liste des contrôleurs
   */
  public static getControllers(): ComponentInfo[] {
    return this.getComponentsByType('controller');
  }

  /**
   * Récupérer tous les services
   *
   * @returns Liste des services
   */
  public static getServices(): ComponentInfo[] {
    return this.getComponentsByType('service');
  }

  /**
   * Récupérer tous les dépôts
   *
   * @returns Liste des dépôts
   */
  public static getRepositories(): ComponentInfo[] {
    return this.getComponentsByType('repository');
  }

  /**
   * Récupérer les composants par type
   *
   * @param type - Type de composant à récupérer
   * @returns Liste des composants du type spécifié
   */
  private static getComponentsByType(type: ClassType): ComponentInfo[] {
    return Array.from(ComponentScanner.components.values())
      .filter(info => info.type === type);
  }
}