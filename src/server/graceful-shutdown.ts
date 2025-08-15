/**
 * Graceful Shutdown Manager - Sistema Shutdown Orchestrato per Produzione
 * 
 * Gestisce shutdown ordinato di tutti i servizi con timeout, logging e cleanup completo
 */

import { ExpressServer } from './express-server.js';
import { ProductionMonitor } from '../monitoring/production-monitor.js';
import { ProductionPool } from '../database/production-pool.js';
import { AlertSystem } from '../monitoring/alert-system.js';
import { BackupManager } from '../backup/backup-manager.js';

export interface ShutdownConfig {
  timeout: number;           // Timeout totale shutdown (ms)
  componentTimeout: number;  // Timeout per singolo componente (ms)
  forceKillTimeout: number; // Timeout prima di force kill (ms)
  saveState: boolean;       // Salva stato applicazione
  finalBackup: boolean;     // Esegui backup finale
}

const defaultShutdownConfig: ShutdownConfig = {
  timeout: 30000,           // 30 secondi totali
  componentTimeout: 10000,  // 10 secondi per componente
  forceKillTimeout: 5000,   // 5 secondi prima del force kill
  saveState: true,
  finalBackup: false        // Solo in production
};

export interface ShutdownComponent {
  name: string;
  priority: number;         // Ordine shutdown (1 = primo)
  shutdown: () => Promise<void>;
  timeout?: number;
  critical?: boolean;       // Se true, il fallimento blocca lo shutdown
}

export interface ShutdownResult {
  success: boolean;
  duration: number;
  componentsShutdown: string[];
  componentsFailed: string[];
  errors: Array<{
    component: string;
    error: string;
  }>;
}

/**
 * Graceful Shutdown Manager
 */
export class GracefulShutdownManager {
  private config: ShutdownConfig;
  private components: Map<string, ShutdownComponent> = new Map();
  private shutdownInProgress = false;
  private shutdownStartTime?: number;
  private shutdownResult?: ShutdownResult;

  // Services references
  private server?: ExpressServer;
  private productionMonitor?: ProductionMonitor;
  private productionPool?: ProductionPool;
  private alertSystem?: AlertSystem;
  private backupManager?: BackupManager;

  constructor(config?: Partial<ShutdownConfig>) {
    this.config = { ...defaultShutdownConfig, ...config };
    
    // Enable final backup in production
    if (process.env.NODE_ENV === 'production') {
      this.config.finalBackup = true;
    }
  }

  /**
   * Registra servizi per graceful shutdown
   */
  registerServices(services: {
    server?: ExpressServer;
    productionMonitor?: ProductionMonitor;
    productionPool?: ProductionPool;
    alertSystem?: AlertSystem;
    backupManager?: BackupManager;
  }): void {
    this.server = services.server;
    this.productionMonitor = services.productionMonitor;
    this.productionPool = services.productionPool;
    this.alertSystem = services.alertSystem;
    this.backupManager = services.backupManager;

    this.registerShutdownComponents();
  }

  /**
   * Registra componenti per shutdown ordinato
   */
  private registerShutdownComponents(): void {
    // Priority 1: Stop accettazione nuove richieste
    if (this.server) {
      this.registerComponent({
        name: 'HTTP Server',
        priority: 1,
        shutdown: async () => {
          console.log('🌐 Stopping HTTP server (new connections)...');
          // Il server Express non ha un metodo specifico per questo,
          // ma possiamo chiudere il server listener
          await this.server!.stop();
        },
        timeout: 5000,
        critical: true
      });
    }

    // Priority 2: Final backup se configurato
    if (this.backupManager && this.config.finalBackup) {
      this.registerComponent({
        name: 'Final Backup',
        priority: 2,
        shutdown: async () => {
          console.log('💾 Performing final backup...');
          try {
            await this.backupManager!.triggerManualBackup('incremental');
          } catch (error) {
            console.warn('⚠️ Final backup failed, continuing shutdown');
          }
        },
        timeout: 15000
      });
    }

    // Priority 3: Production monitoring
    if (this.productionMonitor) {
      this.registerComponent({
        name: 'Production Monitor',
        priority: 3,
        shutdown: async () => {
          console.log('📊 Stopping production monitor...');
          this.productionMonitor!.stopMonitoring();
        },
        timeout: 3000
      });
    }

    // Priority 4: Backup manager
    if (this.backupManager) {
      this.registerComponent({
        name: 'Backup Manager',
        priority: 4,
        shutdown: async () => {
          console.log('💾 Stopping backup manager...');
          await this.backupManager!.stop();
        },
        timeout: 10000
      });
    }

    // Priority 5: Alert system (dopo backup per eventuali alert finali)
    if (this.alertSystem) {
      this.registerComponent({
        name: 'Alert System',
        priority: 5,
        shutdown: async () => {
          console.log('🚨 Stopping alert system...');
          await this.alertSystem!.cleanup();
        },
        timeout: 5000
      });
    }

    // Priority 6: Connection pool (ultimo per permettere queries finali)
    if (this.productionPool) {
      this.registerComponent({
        name: 'Database Pool',
        priority: 6,
        shutdown: async () => {
          console.log('🏊‍♂️ Draining database connection pool...');
          await this.productionPool!.drain();
        },
        timeout: 8000,
        critical: true
      });
    }

    // Priority 7: State saving
    if (this.config.saveState) {
      this.registerComponent({
        name: 'State Persistence',
        priority: 7,
        shutdown: async () => {
          console.log('💾 Saving application state...');
          await this.saveApplicationState();
        },
        timeout: 3000
      });
    }

    console.log(`📋 Registered ${this.components.size} components for graceful shutdown`);
  }

  /**
   * Registra singolo componente
   */
  private registerComponent(component: ShutdownComponent): void {
    this.components.set(component.name, component);
  }

  /**
   * Setup signal handlers per graceful shutdown
   */
  setupSignalHandlers(): void {
    // SIGTERM - Graceful shutdown (Docker, PM2, etc.)
    process.on('SIGTERM', () => {
      console.log('📛 SIGTERM received');
      this.initiateShutdown('SIGTERM');
    });

    // SIGINT - Ctrl+C
    process.on('SIGINT', () => {
      console.log('📛 SIGINT received (Ctrl+C)');
      this.initiateShutdown('SIGINT');
    });

    // SIGUSR2 - PM2 graceful reload
    process.on('SIGUSR2', () => {
      console.log('📛 SIGUSR2 received (PM2 reload)');
      this.initiateShutdown('SIGUSR2');
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💀 UNCAUGHT EXCEPTION:', error);
      this.emergencyShutdown('uncaughtException', error);
    });

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 UNHANDLED PROMISE REJECTION:', { reason, promise });
      // Non fare shutdown per promise rejection, solo log
    });

    console.log('✅ Signal handlers registered for graceful shutdown');
  }

  /**
   * Inizia shutdown graceful
   */
  async initiateShutdown(signal: string): Promise<void> {
    if (this.shutdownInProgress) {
      console.log('⚠️ Shutdown already in progress, ignoring signal');
      return;
    }

    this.shutdownInProgress = true;
    this.shutdownStartTime = Date.now();

    console.log('');
    console.log('='.repeat(60));
    console.log('🛑 INITIATING GRACEFUL SHUTDOWN');
    console.log('='.repeat(60));
    console.log(`📡 Signal: ${signal}`);
    console.log(`⏰ Timeout: ${this.config.timeout / 1000}s`);
    console.log(`📦 Components: ${this.components.size}`);
    console.log('='.repeat(60));

    try {
      // Setup overall timeout
      const overallTimeout = setTimeout(() => {
        console.error('⏰ Overall shutdown timeout reached, forcing exit');
        this.forceShutdown();
      }, this.config.timeout);

      // Esegui shutdown ordinato
      await this.performOrderedShutdown();

      // Clear timeout se completato in tempo
      clearTimeout(overallTimeout);

      // Risultato finale
      const duration = Date.now() - this.shutdownStartTime!;
      console.log('');
      console.log('='.repeat(60));
      console.log('✅ GRACEFUL SHUTDOWN COMPLETED');
      console.log('='.repeat(60));
      console.log(`⏱️ Duration: ${duration}ms`);
      console.log(`✅ Success: ${this.shutdownResult?.success}`);
      console.log(`📦 Components shutdown: ${this.shutdownResult?.componentsShutdown.length}/${this.components.size}`);
      if (this.shutdownResult?.componentsFailed.length) {
        console.log(`❌ Failed components: ${this.shutdownResult.componentsFailed.join(', ')}`);
      }
      console.log('='.repeat(60));

      // Exit con codice appropriato
      process.exit(this.shutdownResult?.success ? 0 : 1);

    } catch (error) {
      console.error('❌ Shutdown failed:', error);
      this.forceShutdown();
    }
  }

  /**
   * Esegue shutdown ordinato per priorità
   */
  private async performOrderedShutdown(): Promise<void> {
    const componentsShutdown: string[] = [];
    const componentsFailed: string[] = [];
    const errors: Array<{ component: string; error: string }> = [];

    // Ordina componenti per priorità
    const sortedComponents = Array.from(this.components.values())
      .sort((a, b) => a.priority - b.priority);

    // Shutdown sequenziale per priorità
    for (const component of sortedComponents) {
      const startTime = Date.now();
      
      try {
        console.log(`🔄 Shutting down: ${component.name}`);
        
        // Setup timeout per singolo componente
        const componentTimeout = component.timeout || this.config.componentTimeout;
        
        await Promise.race([
          component.shutdown(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Component timeout (${componentTimeout}ms)`)), componentTimeout)
          )
        ]);

        const duration = Date.now() - startTime;
        console.log(`✅ ${component.name} shutdown completed (${duration}ms)`);
        componentsShutdown.push(component.name);

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`❌ ${component.name} shutdown failed (${duration}ms): ${errorMessage}`);
        
        componentsFailed.push(component.name);
        errors.push({
          component: component.name,
          error: errorMessage
        });

        // Se il componente è critico e fallisce, considera l'intero shutdown fallito
        if (component.critical) {
          console.error(`🚨 Critical component ${component.name} failed, shutdown may be incomplete`);
        }
      }
    }

    // Salva risultato
    this.shutdownResult = {
      success: componentsFailed.length === 0,
      duration: Date.now() - this.shutdownStartTime!,
      componentsShutdown,
      componentsFailed,
      errors
    };
  }

  /**
   * Emergency shutdown per eccezioni non gestite
   */
  private async emergencyShutdown(reason: string, error?: Error): Promise<void> {
    console.error('🚨 EMERGENCY SHUTDOWN INITIATED');
    console.error(`Reason: ${reason}`);
    if (error) {
      console.error('Error:', error.stack || error.message);
    }

    // Salva crash report se possibile
    try {
      await this.saveCrashReport(reason, error);
    } catch (saveError) {
      console.error('Failed to save crash report:', saveError);
    }

    // Alert critico se disponibile
    if (this.alertSystem && !this.shutdownInProgress) {
      try {
        await this.alertSystem.createAlert({
          level: 'emergency',
          category: 'system',
          source: 'shutdown-manager',
          title: 'Emergency Shutdown',
          message: `Emergency shutdown initiated: ${reason}`,
          metadata: { error: error?.message, stack: error?.stack }
        });
      } catch (alertError) {
        console.error('Failed to send emergency alert:', alertError);
      }
    }

    // Force shutdown dopo breve pausa per I/O
    setTimeout(() => {
      console.error('💀 FORCING PROCESS EXIT');
      process.exit(1);
    }, 2000);
  }

  /**
   * Force shutdown quando timeout è scaduto
   */
  private forceShutdown(): void {
    console.error('');
    console.error('⚡'.repeat(60));
    console.error('💀 FORCING IMMEDIATE SHUTDOWN');
    console.error('⚡'.repeat(60));
    console.error('⏰ Graceful shutdown timeout exceeded');
    console.error('🔪 Terminating process forcefully');
    console.error('⚡'.repeat(60));

    // Final timeout prima del force kill
    setTimeout(() => {
      process.exit(1);
    }, this.config.forceKillTimeout);
  }

  /**
   * Salva stato applicazione
   */
  private async saveApplicationState(): Promise<void> {
    try {
      const state = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        shutdown: {
          reason: 'graceful',
          componentsRegistered: Array.from(this.components.keys())
        }
      };

      // Salva in file temporaneo (in produzione si potrebbe salvare in DB)
      const stateFile = '/tmp/app-state.json';
      await require('fs/promises').writeFile(stateFile, JSON.stringify(state, null, 2));
      
      console.log(`💾 Application state saved to ${stateFile}`);

    } catch (error) {
      console.warn('⚠️ Failed to save application state:', error);
    }
  }

  /**
   * Salva crash report
   */
  private async saveCrashReport(reason: string, error?: Error): Promise<void> {
    try {
      const crashReport = {
        timestamp: new Date().toISOString(),
        reason,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : null,
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          argv: process.argv
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV
        }
      };

      const crashFile = `/tmp/crash-report-${Date.now()}.json`;
      await require('fs/promises').writeFile(crashFile, JSON.stringify(crashReport, null, 2));
      
      console.log(`💾 Crash report saved to ${crashFile}`);

    } catch (saveError) {
      console.error('❌ Failed to save crash report:', saveError);
    }
  }

  /**
   * Test graceful shutdown (per development)
   */
  async testShutdown(): Promise<ShutdownResult> {
    console.log('🧪 Testing graceful shutdown...');
    
    const originalInProgress = this.shutdownInProgress;
    this.shutdownInProgress = true;
    this.shutdownStartTime = Date.now();

    try {
      await this.performOrderedShutdown();
      return this.shutdownResult || {
        success: false,
        duration: 0,
        componentsShutdown: [],
        componentsFailed: [],
        errors: []
      };
    } finally {
      this.shutdownInProgress = originalInProgress;
    }
  }

  /**
   * Ottieni status shutdown manager
   */
  getStatus(): {
    registered: number;
    shutdownInProgress: boolean;
    components: string[];
    config: ShutdownConfig;
  } {
    return {
      registered: this.components.size,
      shutdownInProgress: this.shutdownInProgress,
      components: Array.from(this.components.keys()),
      config: this.config
    };
  }

  /**
   * Check se tutti i servizi sono registrati
   */
  isFullyConfigured(): boolean {
    return this.components.size > 0;
  }
}

/**
 * Istanza singleton del graceful shutdown manager
 */
let shutdownManagerInstance: GracefulShutdownManager | null = null;

/**
 * Ottieni istanza singleton del graceful shutdown manager
 */
export function getShutdownManager(config?: Partial<ShutdownConfig>): GracefulShutdownManager {
  if (!shutdownManagerInstance) {
    shutdownManagerInstance = new GracefulShutdownManager(config);
  }
  return shutdownManagerInstance;
}

/**
 * Setup graceful shutdown per applicazione
 */
export function setupGracefulShutdown(services: {
  server?: ExpressServer;
  productionMonitor?: ProductionMonitor;
  productionPool?: ProductionPool;
  alertSystem?: AlertSystem;
  backupManager?: BackupManager;
}): GracefulShutdownManager {
  
  const shutdownManager = getShutdownManager();
  
  // Registra servizi
  shutdownManager.registerServices(services);
  
  // Setup signal handlers
  shutdownManager.setupSignalHandlers();
  
  console.log('✅ Graceful shutdown system initialized');
  
  return shutdownManager;
}