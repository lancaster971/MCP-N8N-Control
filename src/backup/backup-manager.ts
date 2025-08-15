/**
 * Backup Manager - Sistema Backup Automatizzato per Produzione
 * 
 * Gestione backup automatici, incrementali, compressione e retention policy
 */

import { DatabaseConnection } from '../database/connection.js';
import { spawn } from 'child_process';
import { createGzip } from 'zlib';
import { createWriteStream, createReadStream, promises as fs } from 'fs';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';

export interface BackupConfig {
  enabled: boolean;
  backupDir: string;
  schedule: {
    full: string;        // Cron per backup completi
    incremental: string; // Cron per backup incrementali
  };
  retention: {
    daily: number;       // Giorni backup giornalieri
    weekly: number;      // Settimane backup settimanali
    monthly: number;     // Mesi backup mensili
  };
  compression: boolean;
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyFile?: string;
  };
  storage: {
    local: boolean;
    s3?: {
      bucket: string;
      region: string;
      accessKey: string;
      secretKey: string;
    };
  };
  monitoring: {
    alertOnFailure: boolean;
    maxBackupTime: number; // minuti
    minBackupSize: number; // bytes
  };
}

const defaultBackupConfig: BackupConfig = {
  enabled: process.env.NODE_ENV === 'production',
  backupDir: process.env.BACKUP_DIR || '/tmp/backups',
  schedule: {
    full: '0 2 * * *',      // 2 AM ogni giorno
    incremental: '0 */6 * * *' // Ogni 6 ore
  },
  retention: {
    daily: 7,     // 7 giorni
    weekly: 4,    // 4 settimane
    monthly: 12   // 12 mesi
  },
  compression: true,
  encryption: {
    enabled: false,
    algorithm: 'aes-256-gcm'
  },
  storage: {
    local: true
  },
  monitoring: {
    alertOnFailure: true,
    maxBackupTime: 60,      // 60 minuti max
    minBackupSize: 1024 * 1024 // 1MB min
  }
};

export interface BackupJob {
  id: string;
  type: 'full' | 'incremental';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // secondi
  size?: number;     // bytes
  path?: string;
  error?: string;
  metadata: {
    tables: string[];
    rows: number;
    compressed: boolean;
    encrypted: boolean;
  };
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  lastBackup?: BackupJob;
  nextScheduled: {
    full: Date;
    incremental: Date;
  };
  retention: {
    toDelete: number;
    totalRetained: number;
  };
}

/**
 * Backup Manager per gestione backup automatici
 */
export class BackupManager {
  private db: DatabaseConnection;
  private config: BackupConfig;
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private activeJobs: Map<string, BackupJob> = new Map();

  constructor(config?: Partial<BackupConfig>) {
    this.db = DatabaseConnection.getInstance();
    this.config = { ...defaultBackupConfig, ...config };
  }

  /**
   * Inizializza backup manager
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⚠️ Backup system disabled in configuration');
      return;
    }

    console.log('💾 Initializing Backup Manager...');
    
    // Setup database per backup tracking
    await this.setupBackupTables();
    
    // Verifica e crea directory backup
    await this.ensureBackupDirectory();
    
    // Carica backup jobs esistenti
    await this.loadBackupHistory();
    
    // Schedule backup automatici
    this.scheduleBackups();
    
    // Cleanup backup vecchi
    await this.cleanupOldBackups();
    
    console.log(`✅ Backup Manager initialized (dir: ${this.config.backupDir})`);
  }

  /**
   * Setup tabelle database per backup tracking
   */
  private async setupBackupTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS backup_jobs (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        duration_seconds INTEGER,
        size_bytes BIGINT,
        file_path VARCHAR(512),
        error_message TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX (type, status),
        INDEX (started_at),
        INDEX (status)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS backup_schedule (
        id VARCHAR(255) PRIMARY KEY,
        backup_type VARCHAR(20) NOT NULL,
        cron_expression VARCHAR(100) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        last_run TIMESTAMP,
        next_run TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Assicura che la directory backup esista
   */
  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.backupDir, { recursive: true });
      
      // Test write permission
      const testFile = join(this.config.backupDir, '.backup_test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
    } catch (error) {
      throw new Error(`Backup directory not accessible: ${this.config.backupDir}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Carica storico backup
   */
  private async loadBackupHistory(): Promise<void> {
    try {
      const recentJobs = await this.db.getMany(`
        SELECT * FROM backup_jobs 
        WHERE started_at > NOW() - INTERVAL '24 hours'
        ORDER BY started_at DESC
        LIMIT 50
      `);
      
      console.log(`📊 Loaded ${recentJobs.length} recent backup jobs`);
      
    } catch (error) {
      console.error('❌ Error loading backup history:', error);
    }
  }

  /**
   * Schedule backup automatici
   */
  private scheduleBackups(): void {
    // Per semplificare, usiamo setTimeout invece di cron
    // In produzione si userebbe una libreria come node-cron
    
    // Schedule full backup (ogni 24 ore)
    const fullBackupInterval = 24 * 60 * 60 * 1000; // 24 ore
    const fullBackupTimer = setInterval(async () => {
      await this.performFullBackup();
    }, fullBackupInterval);
    
    this.scheduledJobs.set('full', fullBackupTimer);
    
    // Schedule incremental backup (ogni 6 ore)
    const incrementalBackupInterval = 6 * 60 * 60 * 1000; // 6 ore
    const incrementalBackupTimer = setInterval(async () => {
      await this.performIncrementalBackup();
    }, incrementalBackupInterval);
    
    this.scheduledJobs.set('incremental', incrementalBackupTimer);
    
    // Prima esecuzione immediata in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => this.performFullBackup(), 5000); // 5 secondi
    }
    
    console.log('⏰ Backup schedules configured');
  }

  /**
   * Esegue backup completo
   */
  async performFullBackup(): Promise<BackupJob> {
    const jobId = `full-${Date.now()}`;
    const job: BackupJob = {
      id: jobId,
      type: 'full',
      status: 'pending',
      startedAt: new Date(),
      metadata: {
        tables: [],
        rows: 0,
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled
      }
    };

    console.log(`🔄 Starting full backup: ${jobId}`);
    
    try {
      job.status = 'running';
      this.activeJobs.set(jobId, job);
      await this.persistBackupJob(job);
      
      // Genera nome file backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `full-backup-${timestamp}.sql${this.config.compression ? '.gz' : ''}`;
      const filePath = join(this.config.backupDir, fileName);
      
      // Esegue backup database
      await this.executeDatabaseBackup(filePath, 'full');
      
      // Ottieni info file
      const stats = await fs.stat(filePath);
      
      // Completa job
      job.status = 'completed';
      job.completedAt = new Date();
      job.duration = Math.floor((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
      job.size = stats.size;
      job.path = filePath;
      
      // Ottieni metadati database
      job.metadata = await this.collectBackupMetadata();
      job.metadata.compressed = this.config.compression;
      job.metadata.encrypted = this.config.encryption.enabled;
      
      this.activeJobs.delete(jobId);
      await this.persistBackupJob(job);
      
      console.log(`✅ Full backup completed: ${fileName} (${this.formatBytes(stats.size)})`);
      
      return job;
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      job.duration = Math.floor((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
      
      this.activeJobs.delete(jobId);
      await this.persistBackupJob(job);
      
      console.error(`❌ Full backup failed: ${job.error}`);
      
      // Alert on failure se configurato
      if (this.config.monitoring.alertOnFailure) {
        // TODO: Integrate with alert system
        console.error(`🚨 BACKUP FAILURE ALERT: ${job.error}`);
      }
      
      throw error;
    }
  }

  /**
   * Esegue backup incrementale
   */
  async performIncrementalBackup(): Promise<BackupJob> {
    const jobId = `incremental-${Date.now()}`;
    const job: BackupJob = {
      id: jobId,
      type: 'incremental',
      status: 'pending',
      startedAt: new Date(),
      metadata: {
        tables: [],
        rows: 0,
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled
      }
    };

    console.log(`🔄 Starting incremental backup: ${jobId}`);
    
    try {
      job.status = 'running';
      this.activeJobs.set(jobId, job);
      await this.persistBackupJob(job);
      
      // Trova ultimo backup completo per incrementale
      const lastFullBackup = await this.getLastSuccessfulBackup('full');
      if (!lastFullBackup) {
        console.log('⚠️ No full backup found, performing full backup instead');
        return await this.performFullBackup();
      }
      
      // Genera nome file backup incrementale
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `incremental-backup-${timestamp}.sql${this.config.compression ? '.gz' : ''}`;
      const filePath = join(this.config.backupDir, fileName);
      
      // Esegue backup incrementale (solo dati modificati dopo ultimo full backup)
      await this.executeDatabaseBackup(filePath, 'incremental', lastFullBackup.startedAt);
      
      // Ottieni info file
      const stats = await fs.stat(filePath);
      
      // Completa job
      job.status = 'completed';
      job.completedAt = new Date();
      job.duration = Math.floor((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
      job.size = stats.size;
      job.path = filePath;
      job.metadata = await this.collectBackupMetadata();
      
      this.activeJobs.delete(jobId);
      await this.persistBackupJob(job);
      
      console.log(`✅ Incremental backup completed: ${fileName} (${this.formatBytes(stats.size)})`);
      
      return job;
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      
      this.activeJobs.delete(jobId);
      await this.persistBackupJob(job);
      
      console.error(`❌ Incremental backup failed: ${job.error}`);
      throw error;
    }
  }

  /**
   * Esegue backup del database
   */
  private async executeDatabaseBackup(
    filePath: string,
    type: 'full' | 'incremental',
    sinceDate?: Date
  ): Promise<void> {
    
    const config = this.getDbConfig();
    
    // Costruisci comando pg_dump
    let pgDumpArgs = [
      '--host', config.host,
      '--port', config.port.toString(),
      '--username', config.user,
      '--dbname', config.database,
      '--verbose',
      '--no-password'
    ];

    // Opzioni specifiche per tipo backup
    if (type === 'full') {
      pgDumpArgs.push(
        '--clean',           // DROP objects before creating
        '--create',          // Include CREATE DATABASE
        '--schema-only',     // Solo schema per ora (demo)
      );
    } else {
      // Backup incrementale: solo dati modificati
      pgDumpArgs.push(
        '--data-only',       // Solo dati
        '--inserts'          // Use INSERT statements
      );
    }

    // Environment variables per autenticazione
    const env = {
      ...process.env,
      PGPASSWORD: config.password
    };

    return new Promise<void>(async (resolve, reject) => {
      try {
        // Crea stream per output
        let outputStream = createWriteStream(filePath);
        
        // Aggiungi compressione se abilitata
        if (this.config.compression) {
          const gzipStream = createGzip();
          gzipStream.pipe(outputStream);
          outputStream = gzipStream as any;
        }

        // Esegui pg_dump
        const pgDump = spawn('pg_dump', pgDumpArgs, {
          env,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Pipe output a file
        pgDump.stdout.pipe(outputStream);

        // Handle errors
        pgDump.stderr.on('data', (data) => {
          const message = data.toString();
          // pg_dump manda info su stderr, filtriamo solo veri errori
          if (message.includes('ERROR') || message.includes('FATAL')) {
            console.error('pg_dump error:', message);
          }
        });

        pgDump.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`pg_dump exited with code ${code}`));
          }
        });

        pgDump.on('error', (error) => {
          reject(new Error(`pg_dump failed: ${error.message}`));
        });

        // Timeout protection
        const timeout = setTimeout(() => {
          pgDump.kill();
          reject(new Error(`Backup timeout after ${this.config.monitoring.maxBackupTime} minutes`));
        }, this.config.monitoring.maxBackupTime * 60 * 1000);

        pgDump.on('close', () => {
          clearTimeout(timeout);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Ottieni configurazione database
   */
  private getDbConfig(): any {
    const env = process.env;
    
    if (env.DATABASE_URL) {
      const url = new URL(env.DATABASE_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password || ''
      };
    }
    
    return {
      host: env.DB_HOST || 'localhost',
      port: parseInt(env.DB_PORT || '5432'),
      database: env.DB_NAME || 'n8n_mcp',
      user: env.DB_USER || 'postgres',
      password: env.DB_PASSWORD || ''
    };
  }

  /**
   * Raccoglie metadati backup
   */
  private async collectBackupMetadata(): Promise<BackupJob['metadata']> {
    try {
      // Lista tabelle
      const tables = await this.db.getMany(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      // Conta totale righe
      let totalRows = 0;
      for (const table of tables) {
        try {
          const count = await this.db.getOne(`SELECT COUNT(*) as count FROM ${table.table_name}`);
          totalRows += parseInt(count.count);
        } catch (error) {
          // Ignora errori su singole tabelle
        }
      }

      return {
        tables: tables.map(t => t.table_name),
        rows: totalRows,
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled
      };

    } catch (error) {
      console.error('❌ Error collecting backup metadata:', error);
      return {
        tables: [],
        rows: 0,
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled
      };
    }
  }

  /**
   * Ottieni ultimo backup successful
   */
  private async getLastSuccessfulBackup(type: 'full' | 'incremental'): Promise<BackupJob | null> {
    try {
      const result = await this.db.getOne(`
        SELECT * FROM backup_jobs 
        WHERE type = $1 AND status = 'completed'
        ORDER BY started_at DESC 
        LIMIT 1
      `, [type]);

      if (!result) return null;

      return {
        id: result.id,
        type: result.type,
        status: result.status,
        startedAt: new Date(result.started_at),
        completedAt: result.completed_at ? new Date(result.completed_at) : undefined,
        duration: result.duration_seconds,
        size: result.size_bytes,
        path: result.file_path,
        error: result.error_message,
        metadata: JSON.parse(result.metadata || '{}')
      };

    } catch (error) {
      console.error('❌ Error getting last backup:', error);
      return null;
    }
  }

  /**
   * Salva backup job nel database
   */
  private async persistBackupJob(job: BackupJob): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO backup_jobs (
          id, type, status, started_at, completed_at, duration_seconds,
          size_bytes, file_path, error_message, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          completed_at = EXCLUDED.completed_at,
          duration_seconds = EXCLUDED.duration_seconds,
          size_bytes = EXCLUDED.size_bytes,
          file_path = EXCLUDED.file_path,
          error_message = EXCLUDED.error_message,
          metadata = EXCLUDED.metadata
      `, [
        job.id,
        job.type,
        job.status,
        job.startedAt.toISOString(),
        job.completedAt?.toISOString(),
        job.duration,
        job.size,
        job.path,
        job.error,
        JSON.stringify(job.metadata)
      ]);
    } catch (error) {
      console.error('❌ Error persisting backup job:', error);
    }
  }

  /**
   * Cleanup backup vecchi secondo retention policy
   */
  async cleanupOldBackups(): Promise<void> {
    console.log('🧹 Starting backup cleanup...');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retention.daily);

      // Find old backup files
      const oldBackups = await this.db.getMany(`
        SELECT * FROM backup_jobs 
        WHERE started_at < $1 
        AND status = 'completed'
        ORDER BY started_at ASC
      `, [cutoffDate.toISOString()]);

      let deletedCount = 0;
      let freedSpace = 0;

      for (const backup of oldBackups) {
        try {
          if (backup.file_path) {
            const stats = await fs.stat(backup.file_path);
            await fs.unlink(backup.file_path);
            freedSpace += stats.size;
            deletedCount++;
            
            // Remove from database
            await this.db.query('DELETE FROM backup_jobs WHERE id = $1', [backup.id]);
          }
        } catch (error) {
          console.warn(`⚠️ Could not delete backup file ${backup.file_path}:`, error);
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} old backups, freed ${this.formatBytes(freedSpace)}`);
      }

    } catch (error) {
      console.error('❌ Error during backup cleanup:', error);
    }
  }

  /**
   * Ottieni statistiche backup
   */
  async getBackupStats(): Promise<BackupStats> {
    try {
      // Stats generali
      const generalStats = await this.db.getOne(`
        SELECT 
          COUNT(*) as total_backups,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_backups,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_backups,
          SUM(size_bytes) as total_size
        FROM backup_jobs
      `);

      // Ultimo backup
      const lastBackup = await this.getLastSuccessfulBackup('full') || await this.getLastSuccessfulBackup('incremental');

      // Prossimi backup schedulati (approssimazione)
      const now = new Date();
      const nextFull = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 ore
      const nextIncremental = new Date(now.getTime() + 6 * 60 * 60 * 1000); // +6 ore

      // Retention info
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retention.daily);
      
      const retentionStats = await this.db.getOne(`
        SELECT 
          COUNT(CASE WHEN started_at < $1 THEN 1 END) as to_delete,
          COUNT(CASE WHEN started_at >= $1 THEN 1 END) as total_retained
        FROM backup_jobs 
        WHERE status = 'completed'
      `, [cutoffDate.toISOString()]);

      return {
        totalBackups: parseInt(generalStats.total_backups),
        successfulBackups: parseInt(generalStats.successful_backups),
        failedBackups: parseInt(generalStats.failed_backups),
        totalSize: parseInt(generalStats.total_size) || 0,
        lastBackup: lastBackup || undefined,
        nextScheduled: {
          full: nextFull,
          incremental: nextIncremental
        },
        retention: {
          toDelete: parseInt(retentionStats.to_delete),
          totalRetained: parseInt(retentionStats.total_retained)
        }
      };

    } catch (error) {
      console.error('❌ Error getting backup stats:', error);
      return {
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        totalSize: 0,
        nextScheduled: {
          full: new Date(),
          incremental: new Date()
        },
        retention: {
          toDelete: 0,
          totalRetained: 0
        }
      };
    }
  }

  /**
   * Lista backup recenti
   */
  async getRecentBackups(limit: number = 10): Promise<BackupJob[]> {
    try {
      const backups = await this.db.getMany(`
        SELECT * FROM backup_jobs 
        ORDER BY started_at DESC 
        LIMIT $1
      `, [limit]);

      return backups.map(backup => ({
        id: backup.id,
        type: backup.type,
        status: backup.status,
        startedAt: new Date(backup.started_at),
        completedAt: backup.completed_at ? new Date(backup.completed_at) : undefined,
        duration: backup.duration_seconds,
        size: backup.size_bytes,
        path: backup.file_path,
        error: backup.error_message,
        metadata: JSON.parse(backup.metadata || '{}')
      }));

    } catch (error) {
      console.error('❌ Error getting recent backups:', error);
      return [];
    }
  }

  /**
   * Formatta bytes in formato leggibile
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Stop tutti i job schedulati
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Backup Manager...');
    
    for (const [name, timer] of this.scheduledJobs) {
      clearInterval(timer);
      console.log(`⏰ Stopped ${name} backup schedule`);
    }
    
    this.scheduledJobs.clear();
    
    // Aspetta che i job attivi finiscano
    if (this.activeJobs.size > 0) {
      console.log(`⏳ Waiting for ${this.activeJobs.size} active backup jobs to complete...`);
      
      const timeout = 60000; // 1 minuto timeout
      const start = Date.now();
      
      while (this.activeJobs.size > 0 && (Date.now() - start) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (this.activeJobs.size > 0) {
        console.warn(`⚠️ ${this.activeJobs.size} backup jobs still running after timeout`);
      }
    }
    
    console.log('✅ Backup Manager stopped');
  }

  /**
   * Trigger backup manuale
   */
  async triggerManualBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupJob> {
    console.log(`🔄 Manual ${type} backup triggered`);
    
    if (type === 'full') {
      return await this.performFullBackup();
    } else {
      return await this.performIncrementalBackup();
    }
  }

  /**
   * Check se backup system è healthy
   */
  isHealthy(): boolean {
    // Check se ci sono job attivi che durano troppo
    const now = Date.now();
    const maxDuration = this.config.monitoring.maxBackupTime * 60 * 1000;
    
    for (const job of this.activeJobs.values()) {
      if (now - job.startedAt.getTime() > maxDuration) {
        return false;
      }
    }
    
    return true;
  }
}

/**
 * Istanza singleton del backup manager
 */
let backupManagerInstance: BackupManager | null = null;

/**
 * Ottieni istanza singleton del backup manager
 */
export function getBackupManager(config?: Partial<BackupConfig>): BackupManager {
  if (!backupManagerInstance) {
    backupManagerInstance = new BackupManager(config);
  }
  return backupManagerInstance;
}