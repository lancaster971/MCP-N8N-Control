/**
 * Scheduler Service
 * 
 * Sistema automatico di scheduling per sync jobs
 * Cron-based scheduling con multiple strategie di sync
 */

import cron from 'node-cron';
import { DatabaseConnection } from '../database/connection.js';
import { SyncQueue } from './sync-queue.js';
import { ChangeDetector } from './change-detector.js';

export interface SchedulerConfig {
  incremental: {
    enabled: boolean;
    interval: string;
    description: string;
  };
  enhanced: {
    enabled: boolean;
    interval: string;
    description: string;
  };
  ultra: {
    enabled: boolean;
    interval: string;
    description: string;
  };
  cleanup: {
    enabled: boolean;
    interval: string;
    description: string;
  };
}

export interface SchedulerStatus {
  isRunning: boolean;
  scheduledJobs: {
    incremental: boolean;
    enhanced: boolean;
    ultra: boolean;
    cleanup: boolean;
  };
  nextRuns: {
    incremental?: Date;
    enhanced?: Date;
    ultra?: Date;
    cleanup?: Date;
  };
  lastActivity: Date;
}

export class SchedulerService {
  private db: DatabaseConnection;
  private syncQueue: SyncQueue;
  private changeDetector: ChangeDetector;
  
  private isRunning: boolean = false;
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private config: SchedulerConfig;
  private lastActivity: Date = new Date();
  
  // Health monitoring e auto-restart
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private crashCount: number = 0;
  private maxCrashes: number = 3;
  private autoRestartEnabled: boolean = true;

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.syncQueue = new SyncQueue(db);
    this.changeDetector = new ChangeDetector(db);
    
    // Default configuration
    this.config = {
      incremental: {
        enabled: true,
        interval: '*/5 * * * *', // Ogni 5 minuti
        description: 'Incremental sync every 5 minutes'
      },
      enhanced: {
        enabled: true,
        interval: '0 * * * *', // Ogni ora
        description: 'Enhanced sync every hour'
      },
      ultra: {
        enabled: false, // Disabilitato di default per performance
        interval: '0 */6 * * *', // Ogni 6 ore
        description: 'Ultra sync every 6 hours'
      },
      cleanup: {
        enabled: true,
        interval: '0 2 * * *', // Alle 2 AM ogni giorno
        description: 'Cleanup old data every day at 2 AM'
      }
    };
  }

  /**
   * START SCHEDULER - Avvia tutti i scheduled jobs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ SCHEDULER: Already running, skipping start');
      return;
    }

    console.log('🚀 SCHEDULER: Starting automatic sync scheduling...');
    
    try {
      // Load configuration from database
      await this.loadConfiguration();
      
      // Start sync queue processing
      // Note: SyncQueue starts processing automatically when jobs are queued
      
      // Schedule cron jobs
      await this.scheduleIncrementalSync();
      await this.scheduleEnhancedSync();
      await this.scheduleUltraSync();
      await this.scheduleCleanupJobs();
      
      this.isRunning = true;
      this.lastActivity = new Date();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ SCHEDULER: Started successfully');
      console.log('📅 SCHEDULED JOBS:');
      console.log(`  • Incremental: ${this.config.incremental.enabled ? this.config.incremental.interval : 'DISABLED'}`);
      console.log(`  • Enhanced: ${this.config.enhanced.enabled ? this.config.enhanced.interval : 'DISABLED'}`);
      console.log(`  • Ultra: ${this.config.ultra.enabled ? this.config.ultra.interval : 'DISABLED'}`);
      console.log(`  • Cleanup: ${this.config.cleanup.enabled ? this.config.cleanup.interval : 'DISABLED'}`);
      
    } catch (error) {
      console.error('❌ SCHEDULER: Failed to start:', error);
      throw error;
    }
  }

  /**
   * STOP SCHEDULER - Ferma tutti i scheduled jobs
   */
  async stop(): Promise<void> {
    console.log('🛑 SCHEDULER: Stopping automatic sync scheduling...');
    
    // Stop all cron jobs
    for (const [name, task] of this.scheduledTasks) {
      task.stop();
      console.log(`  ✅ Stopped ${name} scheduled job`);
    }
    
    this.scheduledTasks.clear();
    
    // Stop sync queue processing
    this.syncQueue.stopProcessing();
    
    // Stop health monitoring
    this.stopHealthMonitoring();
    
    this.isRunning = false;
    console.log('✅ SCHEDULER: Stopped successfully');
  }

  /**
   * RESTART SCHEDULER - Riavvia con nuova configurazione
   */
  async restart(): Promise<void> {
    console.log('🔄 SCHEDULER: Restarting...');
    await this.stop();
    await this.start();
  }

  /**
   * GET STATUS - Stato corrente dello scheduler
   */
  async getStatus(): Promise<SchedulerStatus> {
    const scheduledJobs = {
      incremental: this.scheduledTasks.has('incremental'),
      enhanced: this.scheduledTasks.has('enhanced'),
      ultra: this.scheduledTasks.has('ultra'),
      cleanup: this.scheduledTasks.has('cleanup')
    };
    
    // Get next run times dal database
    const nextRuns = await this.getNextRunTimes();
    
    return {
      isRunning: this.isRunning,
      scheduledJobs,
      nextRuns,
      lastActivity: this.lastActivity
    };
  }

  /**
   * TRIGGER MANUAL SYNC - Triggera sync job manualmente
   */
  async triggerManualSync(type: 'incremental' | 'enhanced' | 'ultra'): Promise<string> {
    console.log(`🎯 SCHEDULER: Triggering manual ${type} sync...`);
    
    this.lastActivity = new Date();
    return await this.syncQueue.queueSyncJob(type, 'high');
  }

  /**
   * UPDATE CONFIGURATION - Aggiorna configurazione runtime
   */
  async updateConfiguration(newConfig: Partial<SchedulerConfig>): Promise<void> {
    console.log('⚙️ SCHEDULER: Updating configuration...');
    
    // Merge con configuration esistente
    this.config = { ...this.config, ...newConfig };
    
    // Save to database
    await this.saveConfiguration();
    
    // Restart per applicare nuova configurazione
    if (this.isRunning) {
      await this.restart();
    }
  }

  /**
   * PRIVATE SCHEDULING METHODS
   */

  private async scheduleIncrementalSync(): Promise<void> {
    if (!this.config.incremental.enabled) {
      console.log('⏭️ SCHEDULER: Incremental sync disabled');
      return;
    }

    const task = cron.schedule(this.config.incremental.interval, async () => {
      try {
        this.lastActivity = new Date();
        console.log('⏰ SCHEDULER: Triggering incremental sync (cron)...');
        
        // Check se ci sono effettivamente modifiche
        const changes = await this.changeDetector.detectIncrementalChanges();
        
        if (changes.totalChanges === 0) {
          console.log('⏭️ SCHEDULER: No incremental changes detected, skipping sync');
          return;
        }
        
        await this.syncQueue.queueSyncJob('incremental', 'normal');
        
      } catch (error) {
        console.error('❌ SCHEDULER: Incremental sync cron failed:', error);
        this.handleSchedulerError('incremental', error);
      }
    }, {
      scheduled: false // Non avviare automaticamente
    });

    this.scheduledTasks.set('incremental', task);
    task.start();
    
    console.log(`📅 SCHEDULER: Incremental sync scheduled (${this.config.incremental.interval})`);
  }

  private async scheduleEnhancedSync(): Promise<void> {
    if (!this.config.enhanced.enabled) {
      console.log('⏭️ SCHEDULER: Enhanced sync disabled');
      return;
    }

    const task = cron.schedule(this.config.enhanced.interval, async () => {
      try {
        this.lastActivity = new Date();
        console.log('⏰ SCHEDULER: Triggering enhanced sync (cron)...');
        await this.syncQueue.queueSyncJob('enhanced', 'normal');
        
      } catch (error) {
        console.error('❌ SCHEDULER: Enhanced sync cron failed:', error);
        this.handleSchedulerError('enhanced', error);
      }
    }, {
      scheduled: false
    });

    this.scheduledTasks.set('enhanced', task);
    task.start();
    
    console.log(`📅 SCHEDULER: Enhanced sync scheduled (${this.config.enhanced.interval})`);
  }

  private async scheduleUltraSync(): Promise<void> {
    if (!this.config.ultra.enabled) {
      console.log('⏭️ SCHEDULER: Ultra sync disabled');
      return;
    }

    const task = cron.schedule(this.config.ultra.interval, async () => {
      try {
        this.lastActivity = new Date();
        console.log('⏰ SCHEDULER: Triggering ultra sync (cron)...');
        await this.syncQueue.queueSyncJob('ultra', 'low');
        
      } catch (error) {
        console.error('❌ SCHEDULER: Ultra sync cron failed:', error);
        this.handleSchedulerError('ultra', error);
      }
    }, {
      scheduled: false
    });

    this.scheduledTasks.set('ultra', task);
    task.start();
    
    console.log(`📅 SCHEDULER: Ultra sync scheduled (${this.config.ultra.interval})`);
  }

  private async scheduleCleanupJobs(): Promise<void> {
    if (!this.config.cleanup.enabled) {
      console.log('⏭️ SCHEDULER: Cleanup jobs disabled');
      return;
    }

    const task = cron.schedule(this.config.cleanup.interval, async () => {
      try {
        this.lastActivity = new Date();
        console.log('⏰ SCHEDULER: Running cleanup jobs (cron)...');
        
        // Cleanup change tracking
        await this.changeDetector.cleanupOldTracking();
        
        // Cleanup old sync jobs (keep 30 days)
        await this.cleanupOldSyncJobs();
        
        // Calculate daily metrics per ieri
        await this.calculateDailyMetrics();
        
        console.log('✅ SCHEDULER: Cleanup jobs completed');
        
      } catch (error) {
        console.error('❌ SCHEDULER: Cleanup jobs failed:', error);
      }
    }, {
      scheduled: false
    });

    this.scheduledTasks.set('cleanup', task);
    task.start();
    
    console.log(`📅 SCHEDULER: Cleanup jobs scheduled (${this.config.cleanup.interval})`);
  }

  /**
   * CONFIGURATION MANAGEMENT
   */

  private async loadConfiguration(): Promise<void> {
    try {
      const result = await this.db.query(`
        SELECT key, value, value_type 
        FROM sync_configuration 
        WHERE category = 'scheduling'
      `);
      
      for (const row of result.rows) {
        const value = row.value_type === 'boolean' ? row.value === 'true' : row.value;
        
        switch (row.key) {
          case 'incremental_enabled':
            this.config.incremental.enabled = value as boolean;
            break;
          case 'incremental_interval':
            this.config.incremental.interval = value as string;
            break;
          case 'enhanced_enabled':
            this.config.enhanced.enabled = value as boolean;
            break;
          case 'enhanced_interval':
            this.config.enhanced.interval = value as string;
            break;
          case 'ultra_enabled':
            this.config.ultra.enabled = value as boolean;
            break;
          case 'ultra_interval':
            this.config.ultra.interval = value as string;
            break;
        }
      }
      
      console.log('⚙️ SCHEDULER: Configuration loaded from database');
      
    } catch (error) {
      console.warn('⚠️ SCHEDULER: Failed to load configuration, using defaults:', error);
    }
  }

  private async saveConfiguration(): Promise<void> {
    try {
      const updates = [
        ['incremental_enabled', this.config.incremental.enabled.toString(), 'boolean'],
        ['incremental_interval', this.config.incremental.interval, 'string'],
        ['enhanced_enabled', this.config.enhanced.enabled.toString(), 'boolean'],
        ['enhanced_interval', this.config.enhanced.interval, 'string'],
        ['ultra_enabled', this.config.ultra.enabled.toString(), 'boolean'],
        ['ultra_interval', this.config.ultra.interval, 'string']
      ];
      
      for (const [key, value, type] of updates) {
        await this.db.query(`
          UPDATE sync_configuration 
          SET value = $2, value_type = $3, updated_at = CURRENT_TIMESTAMP
          WHERE key = $1
        `, [key, value, type]);
      }
      
      console.log('💾 SCHEDULER: Configuration saved to database');
      
    } catch (error) {
      console.error('❌ SCHEDULER: Failed to save configuration:', error);
    }
  }

  /**
   * ERROR HANDLING & AUTO-RESTART METHODS
   */

  /**
   * Gestisce errori dello scheduler con auto-restart intelligente
   */
  private async handleSchedulerError(jobType: string, error: any): Promise<void> {
    console.error(`🔥 SCHEDULER ERROR [${jobType}]:`, error);
    
    this.crashCount++;
    
    // Log error nel database
    try {
      await this.db.query(`
        INSERT INTO sync_logs (started_at, success, error_message, sync_type)
        VALUES (CURRENT_TIMESTAMP, false, $1, $2)
      `, [error.message || 'Unknown scheduler error', `${jobType}_cron_error`]);
    } catch (logError) {
      console.error('❌ Failed to log scheduler error:', logError);
    }
    
    // Se troppi crash, ferma scheduler per sicurezza
    if (this.crashCount >= this.maxCrashes) {
      console.error(`🚨 SCHEDULER: Too many crashes (${this.crashCount}), stopping for safety`);
      await this.stop();
      return;
    }
    
    // Auto-restart se abilitato
    if (this.autoRestartEnabled && this.isRunning) {
      console.log(`🔄 SCHEDULER: Auto-restarting after ${jobType} error...`);
      setTimeout(async () => {
        try {
          await this.restart();
          console.log('✅ SCHEDULER: Auto-restart successful');
        } catch (restartError) {
          console.error('❌ SCHEDULER: Auto-restart failed:', restartError);
        }
      }, 5000); // Wait 5 seconds before restart
    }
  }

  /**
   * Avvia health monitoring per controllare stato scheduler
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ SCHEDULER: Health check failed:', error);
      }
    }, 60000); // Check ogni minuto
    
    console.log('💓 SCHEDULER: Health monitoring started');
  }

  /**
   * Ferma health monitoring
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('💓 SCHEDULER: Health monitoring stopped');
    }
  }

  /**
   * Esegue health check del scheduler
   */
  private async performHealthCheck(): Promise<void> {
    // Check se i task sono ancora attivi
    let activeTasksCount = 0;
    for (const [name, task] of this.scheduledTasks) {
      try {
        // ScheduledTask ha solo start/stop/destroy, non 'running'
        // Controlla se task esiste ed è valido
        if (task && typeof task.start === 'function') {
          activeTasksCount++;
        }
      } catch (error) {
        console.warn(`⚠️ SCHEDULER: Task ${name} check failed:`, error);
      }
    }
    
    // Se nessun task è attivo ma scheduler dovrebbe essere running
    if (this.isRunning && activeTasksCount === 0) {
      console.error('🚨 SCHEDULER: No active tasks but scheduler marked as running!');
      if (this.autoRestartEnabled) {
        console.log('🔄 SCHEDULER: Auto-restarting due to health check failure...');
        await this.restart();
      }
    }
    
    // Reset crash count se tutto ok
    if (activeTasksCount > 0) {
      this.crashCount = 0;
    }
    
    // Update last activity
    this.lastActivity = new Date();
  }

  /**
   * UTILITY METHODS
   */

  private async getNextRunTimes(): Promise<SchedulerStatus['nextRuns']> {
    try {
      const result = await this.db.query(`
        SELECT sync_type, next_sync_at
        FROM sync_status
      `);
      
      const nextRuns: SchedulerStatus['nextRuns'] = {};
      
      for (const row of result.rows) {
        if (row.next_sync_at) {
          switch (row.sync_type) {
            case 'incremental':
              nextRuns.incremental = row.next_sync_at;
              break;
            case 'enhanced':
              nextRuns.enhanced = row.next_sync_at;
              break;
            case 'ultra':
              nextRuns.ultra = row.next_sync_at;
              break;
          }
        }
      }
      
      return nextRuns;
      
    } catch (error) {
      console.warn('⚠️ SCHEDULER: Failed to get next run times:', error);
      return {};
    }
  }

  private async cleanupOldSyncJobs(): Promise<void> {
    try {
      const result = await this.db.query(`
        DELETE FROM sync_jobs 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
      `);
      
      console.log(`🧹 SCHEDULER: Cleaned up ${result.rowCount} old sync jobs`);
      
    } catch (error) {
      console.error('❌ SCHEDULER: Failed to cleanup old sync jobs:', error);
    }
  }

  private async calculateDailyMetrics(): Promise<void> {
    try {
      // Calculate metrics per yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      await this.db.query(`SELECT calculate_daily_sync_metrics($1)`, [dateStr]);
      
      console.log(`📊 SCHEDULER: Calculated daily metrics for ${dateStr}`);
      
    } catch (error) {
      console.error('❌ SCHEDULER: Failed to calculate daily metrics:', error);
    }
  }
}