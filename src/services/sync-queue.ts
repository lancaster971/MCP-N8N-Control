/**
 * Sync Queue Service
 * 
 * Sistema di code per processing background sync jobs
 * Priority queues, rate limiting, concurrent processing
 */

import { DatabaseConnection } from '../database/connection.js';
import { MonoSyncService } from '../api/mono-sync.js';
import { ChangeDetector, ChangeDetectionResult } from './change-detector.js';

export interface SyncJob {
  id: string;
  type: 'incremental' | 'enhanced' | 'ultra';
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  changes?: ChangeDetectionResult;
  result?: any;
  error?: string;
}

export interface QueueStats {
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalJobs: number;
}

export class SyncQueue {
  private db: DatabaseConnection;
  private monoSync: MonoSyncService;
  private changeDetector: ChangeDetector;
  
  private runningJobs: Map<string, SyncJob> = new Map();
  private maxConcurrentJobs: number = 3;
  private isProcessing: boolean = false;
  
  constructor(db: DatabaseConnection) {
    this.db = db;
    this.monoSync = new MonoSyncService(db);
    this.changeDetector = new ChangeDetector(db);
    
    // Load configuration
    this.loadConfiguration();
  }

  /**
   * QUEUE SYNC JOB - Aggiunge job alla queue con priority
   */
  async queueSyncJob(
    type: 'incremental' | 'enhanced' | 'ultra',
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    try {
      // Check se job dello stesso tipo è già in running
      const runningJobsOfType = Array.from(this.runningJobs.values())
        .filter(job => job.type === type && job.status === 'running');
      
      if (runningJobsOfType.length > 0) {
        console.log(`⚠️ QUEUE: ${type} sync job already running, skipping`);
        return runningJobsOfType[0].id;
      }
      
      // Create job record nel database
      const result = await this.db.query(`
        INSERT INTO sync_jobs (
          sync_type, status, started_at
        ) VALUES ($1, 'pending', NULL)
        RETURNING id
      `, [type]);
      
      const jobId = result.rows[0].id.toString();
      
      console.log(`📋 QUEUE: Queued ${type} sync job (ID: ${jobId}, Priority: ${priority})`);
      
      // Start processing se non già in corso
      if (!this.isProcessing) {
        this.startProcessing();
      }
      
      return jobId;
      
    } catch (error) {
      console.error(`❌ Failed to queue ${type} sync job:`, error);
      throw error;
    }
  }

  /**
   * START PROCESSING - Avvia il loop di processing delle queue
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    console.log('🚀 QUEUE: Starting sync job processing...');
    
    while (this.isProcessing) {
      try {
        // Check se possiamo processare più jobs
        if (this.runningJobs.size < this.maxConcurrentJobs) {
          const nextJob = await this.getNextPendingJob();
          
          if (nextJob) {
            await this.executeJob(nextJob);
          } else {
            // Nessun job pending, pausa breve
            await this.sleep(5000); // 5 secondi
          }
        } else {
          // Max concurrent jobs reached, attendi
          await this.sleep(2000); // 2 secondi
        }
        
      } catch (error) {
        console.error('❌ Queue processing error:', error);
        await this.sleep(10000); // 10 secondi su errore
      }
    }
  }

  /**
   * STOP PROCESSING - Ferma il processing delle queue
   */
  stopProcessing(): void {
    console.log('🛑 QUEUE: Stopping sync job processing...');
    this.isProcessing = false;
  }

  /**
   * EXECUTE JOB - Esegue un singolo sync job
   */
  private async executeJob(jobId: string): Promise<void> {
    let job: SyncJob | undefined;
    
    try {
      // Get job details dal database
      const jobResult = await this.db.query(`
        SELECT * FROM sync_jobs WHERE id = $1
      `, [jobId]);
      
      if (jobResult.rows.length === 0) {
        console.warn(`⚠️ Job ${jobId} not found, skipping`);
        return;
      }
      
      const jobData = jobResult.rows[0];
      job = {
        id: jobId,
        type: jobData.sync_type,
        priority: 'normal', // TODO: add priority to DB
        status: 'running',
        createdAt: jobData.created_at,
        startedAt: new Date()
      };
      
      this.runningJobs.set(jobId, job);
      
      // Update job status nel database
      await this.db.query(`
        UPDATE sync_jobs 
        SET status = 'running', started_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [jobId]);
      
      console.log(`🔄 QUEUE: Starting ${job.type} sync job (ID: ${jobId})`);
      
      // Detect changes prima del sync
      let changes: ChangeDetectionResult;
      switch (job.type) {
        case 'incremental':
          changes = await this.changeDetector.detectIncrementalChanges();
          break;
        case 'enhanced':
          changes = await this.changeDetector.detectEnhancedChanges();
          break;
        case 'ultra':
          changes = await this.changeDetector.detectUltraChanges();
          break;
      }
      
      job.changes = changes;
      
      // Skip se nessuna modifica
      if (changes.totalChanges === 0) {
        console.log(`⏭️ QUEUE: No changes detected for ${job.type} sync, marking as completed`);
        await this.completeJob(job, { message: 'No changes detected', skipped: true });
        return;
      }
      
      // Execute sync based on type
      let result: any;
      switch (job.type) {
        case 'incremental':
          result = await this.executeIncrementalSync(changes);
          break;
        case 'enhanced':
          result = await this.monoSync.syncAllEnhanced();
          break;
        case 'ultra':
          result = await this.monoSync.syncAllUltraEnhanced();
          break;
      }
      
      // Complete job con success
      await this.completeJob(job, result);
      console.log(`✅ QUEUE: Completed ${job.type} sync job (ID: ${jobId}) in ${Date.now() - job.startedAt!.getTime()}ms`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ QUEUE: Job ${jobId} failed:`, message);
      
      if (job) {
        await this.failJob(job, message);
      }
    } finally {
      if (job) {
        this.runningJobs.delete(jobId);
      }
    }
  }

  /**
   * EXECUTE INCREMENTAL SYNC - Sync ottimizzato solo per dati modificati
   */
  private async executeIncrementalSync(changes: ChangeDetectionResult): Promise<any> {
    const startTime = Date.now();
    
    console.log(`🏃 INCREMENTAL SYNC: Processing ${changes.workflowsToSync.length} workflows, ${changes.executionsToSync.length} executions`);
    
    // TODO: Implement incremental sync logic
    // Per ora usa il sync normale ma in futuro sarà ottimizzato per sync solo changed items
    const result = await this.monoSync.syncAll({ forceRefresh: false });
    
    // Mark changes as synced
    await this.changeDetector.markSyncCompleted(
      'incremental', 
      changes.workflowsToSync, 
      changes.executionsToSync
    );
    
    return {
      ...result,
      syncType: 'incremental',
      changesProcessed: changes.totalChanges,
      duration: Date.now() - startTime
    };
  }

  /**
   * GET NEXT PENDING JOB - Prioritized job selection
   */
  private async getNextPendingJob(): Promise<string | null> {
    try {
      // Get next job con priority ordering
      const result = await this.db.query(`
        SELECT id FROM sync_jobs
        WHERE status = 'pending'
        ORDER BY 
          CASE sync_type 
            WHEN 'incremental' THEN 1
            WHEN 'enhanced' THEN 2 
            WHEN 'ultra' THEN 3
          END,
          created_at ASC
        LIMIT 1
      `);
      
      return result.rows[0]?.id.toString() || null;
      
    } catch (error) {
      console.error('❌ Failed to get next pending job:', error);
      return null;
    }
  }

  /**
   * COMPLETE JOB - Marca job come completato con success
   */
  private async completeJob(job: SyncJob, result: any): Promise<void> {
    try {
      const completedAt = new Date();
      const duration = completedAt.getTime() - (job.startedAt?.getTime() || Date.now());
      
      await this.db.query(`
        UPDATE sync_jobs 
        SET 
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          duration_ms = $2,
          workflows_synced = $3,
          workflows_updated = $4,
          executions_synced = $5,
          executions_updated = $6
        WHERE id = $1
      `, [
        job.id,
        duration,
        result.workflowsSynced || 0,
        result.workflowsUpdated || 0,
        result.executionsSynced || 0,
        result.executionsUpdated || 0
      ]);
      
      // Update sync_status
      await this.db.query(`
        UPDATE sync_status
        SET 
          last_sync_at = CURRENT_TIMESTAMP,
          last_sync_success = true,
          last_sync_duration_ms = $2,
          workflows_processed = $3,
          executions_processed = $4,
          errors_count = 0,
          next_sync_at = CURRENT_TIMESTAMP + 
            CASE sync_type
              WHEN 'incremental' THEN INTERVAL '5 minutes'
              WHEN 'enhanced' THEN INTERVAL '1 hour'
              WHEN 'ultra' THEN INTERVAL '6 hours'
            END
        WHERE sync_type = $1
      `, [job.type, duration, result.workflowsSynced || 0, result.executionsSynced || 0]);
      
    } catch (error) {
      console.error(`❌ Failed to complete job ${job.id}:`, error);
    }
  }

  /**
   * FAIL JOB - Marca job come fallito
   */
  private async failJob(job: SyncJob, errorMessage: string): Promise<void> {
    try {
      const completedAt = new Date();
      const duration = completedAt.getTime() - (job.startedAt?.getTime() || Date.now());
      
      await this.db.query(`
        UPDATE sync_jobs 
        SET 
          status = 'failed',
          completed_at = CURRENT_TIMESTAMP,
          duration_ms = $2,
          errors = ARRAY[$3]
        WHERE id = $1
      `, [job.id, duration, errorMessage]);
      
      // Update sync_status
      await this.db.query(`
        UPDATE sync_status
        SET 
          last_sync_at = CURRENT_TIMESTAMP,
          last_sync_success = false,
          errors_count = errors_count + 1
        WHERE sync_type = $1
      `, [job.type]);
      
    } catch (error) {
      console.error(`❌ Failed to mark job ${job.id} as failed:`, error);
    }
  }

  /**
   * GET QUEUE STATS - Statistiche queue
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const result = await this.db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM sync_jobs
        WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        GROUP BY status
      `);
      
      const stats: QueueStats = {
        pendingJobs: 0,
        runningJobs: this.runningJobs.size,
        completedJobs: 0,
        failedJobs: 0,
        totalJobs: 0
      };
      
      for (const row of result.rows) {
        const count = parseInt(row.count);
        stats.totalJobs += count;
        
        switch (row.status) {
          case 'pending':
            stats.pendingJobs = count;
            break;
          case 'completed':
            stats.completedJobs = count;
            break;
          case 'failed':
            stats.failedJobs = count;
            break;
        }
      }
      
      return stats;
      
    } catch (error) {
      console.error('❌ Failed to get queue stats:', error);
      return {
        pendingJobs: 0,
        runningJobs: this.runningJobs.size,
        completedJobs: 0,
        failedJobs: 0,
        totalJobs: 0
      };
    }
  }

  /**
   * CANCEL JOB - Cancella job pending
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const result = await this.db.query(`
        UPDATE sync_jobs 
        SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'pending'
      `, [jobId]);
      
      const cancelled = (result.rowCount || 0) > 0;
      if (cancelled) {
        console.log(`🚫 QUEUE: Cancelled job ${jobId}`);
      }
      
      return cancelled;
      
    } catch (error) {
      console.error(`❌ Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * PRIVATE HELPERS
   */

  private async loadConfiguration(): Promise<void> {
    try {
      const result = await this.db.query(`
        SELECT key, value, value_type 
        FROM sync_configuration 
        WHERE category = 'performance'
      `);
      
      for (const row of result.rows) {
        switch (row.key) {
          case 'max_concurrent_jobs':
            this.maxConcurrentJobs = parseInt(row.value);
            break;
        }
      }
      
      console.log(`⚙️ QUEUE: Loaded configuration - max concurrent jobs: ${this.maxConcurrentJobs}`);
      
    } catch (error) {
      console.warn('⚠️ Failed to load queue configuration, using defaults');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}