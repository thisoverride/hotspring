import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { LogLevel } from '../../../../common/interfaces/Global';

/**
 * Service de journalisation avec format personnalisé et support de couleurs
 */
export class LogService {
  /**
   * Instance Winston sous-jacente
   */
  private logger: WinstonLogger;
  
  /**
   * Codes ANSI pour les couleurs dans la console
   */
  private readonly COLORS = {
    info: '\x1b[32m',   // vert
    warn: '\x1b[33m',   // jaune
    error: '\x1b[31m',  // rouge
    debug: '\x1b[36m',  // cyan
    reset: '\x1b[0m',   // réinitialiser
    dim: '\x1b[2m',     // gris
    white: '\x1b[37m'   // blanc
  };
  
  /**
   * Crée une nouvelle instance de LogService
   * @param environment - L'environnement d'exécution (par défaut 'development')
   */
  constructor(environment: string = 'development') {
    this.logger = this.createLoggerInstance(environment);
  }
  
  /**
   * Crée et configure une instance de logger Winston
   * @param environment - L'environnement d'exécution
   * @returns Une instance configurée de WinstonLogger
   */
  private createLoggerInstance(environment: string): WinstonLogger {
    return createLogger({
      level: this.determineLogLevel(environment),
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true })
      ),
      transports: this.configureTransports(environment)
    });
  }
  
  /**
   * Détermine le niveau de log en fonction de l'environnement
   * @param environment - L'environnement d'exécution
   * @returns Le niveau de log approprié
   */
  private determineLogLevel(environment: string): string {
    return environment === 'production' ? 'info' : 'debug';
  }
  
  /**
   * Configure les transports pour le logger
   * @param environment - L'environnement d'exécution
   * @returns Un tableau de transports configurés
   */
  private configureTransports(environment: string): transports.TransportInstance[] {
    return [
      new transports.Console({
        level: environment === 'development' ? 'debug' : 'info',
        format: format.combine(
          format.timestamp(),
          this.createCustomFormat()
        )
      }),
      // Exemple de transport fichier (commenté)
      // new transports.File({
      //   filename: path.join(__dirname, 'logs', 'application.log'),
      //   level: 'info',
      //   format: format.combine(
      //     format.timestamp(),
      //     format.json()
      //   )
      // })
    ];
  }

  private createCustomFormat() {
    return format.printf(({ timestamp, level, message, ...meta }) => {
      // Formater le niveau de log en majuscules et padded
      const upperLevel = level.toUpperCase().padEnd(5);
      
      // Formater le timestamp ISO
      const date = new Date(timestamp as any).toISOString();
      
      // Obtenir la couleur correspondant au niveau de log
      const levelColor: string = this.COLORS[level as LogLevel] || this.COLORS.white;
      
      // Construire le message formaté avec couleurs
      // Format: 2024-01-22 10:15:32.123 INFO --- Message
      let logMessage: string = `${this.COLORS.dim}${date}${this.COLORS.reset} `;
      logMessage += `${levelColor}${upperLevel}${this.COLORS.reset} `;
      logMessage += `${this.COLORS.dim}---${this.COLORS.reset} `;
      logMessage += `${message}`;
      
      // Ajouter les métadonnées si présentes
      if (Object.keys(meta).length) {
        logMessage += ` ${this.COLORS.dim}${JSON.stringify(meta)}${this.COLORS.reset}`;
      }
      
      return logMessage;
    });
  }
  
  /**
   * Change l'environnement du logger
   * @param environment - Le nouvel environnement
   */
  public setEnvironment(environment: string): void {
    this.logger = this.createLoggerInstance(environment);
  }
  
  /**
   * Méthode générique pour écrire un log
   * @param level - Niveau de log
   * @param message - Message à journaliser
   * @param meta - Métadonnées optionnelles
   */
  private log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    this.logger.log(level, message, meta || {});
  }
  
  /**
   * Journalise un message de niveau INFO
   * @param message - Message à journaliser
   * @param meta - Métadonnées optionnelles
   */
  public info(message: string, meta?: Record<string, any>): void {
    this.log('info', message, meta);
  }
  
  /**
   * Journalise un message de niveau WARN
   * @param message - Message à journaliser
   * @param meta - Métadonnées optionnelles
   */
  public warn(message: string, meta?: Record<string, any>): void {
    this.log('warn', message, meta);
  }
  
  /**
   * Journalise un message de niveau ERROR
   * @param message - Message à journaliser
   * @param meta - Métadonnées optionnelles
   */
  public error(message: string, meta?: Record<string, any>): void {
    this.log('error', message, meta);
  }
  
  /**
   * Journalise un message de niveau DEBUG
   * @param message - Message à journaliser
   * @param meta - Métadonnées optionnelles
   */
  public debug(message: string, meta?: Record<string, any>): void {
    this.log('debug', message, meta);
  }
}