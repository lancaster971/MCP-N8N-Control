/**
 * Change Detector Service
 * 
 * Sistema intelligente per rilevare modifiche e ottimizzare sync
 * Processing solo workflow/executions modificati per performance
 */

import { DatabaseConnection } from '../database/connection.js';

export interface ChangeDetectionResult {
  workflowsToSync: string[];
  executionsToSync: string[];
  totalChanges: number;
}

export interface SyncTimestamps {
  lastIncrementalSync?: Date;
  lastEnhancedSync?: Date;
  lastUltraSync?: Date;
}

export class ChangeDetector {
  private db: DatabaseConnection;
  
  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * DETECT INCREMENTAL CHANGES - Solo workflow/executions modificati di recente
   */
  async detectIncrementalChanges(): Promise<ChangeDetectionResult> {
    try {
      console.log('🔍 CHANGE DETECTION: Analyzing incremental changes...');
      
      const lastSync = await this.getLastSyncTimestamp('incremental');
      console.log(`📅 Last incremental sync: ${lastSync}`);
      
      // Workflow modificati dopo last sync
      const workflowsResult = await this.db.query(`
        SELECT w.id, w.updated_at 
        FROM workflows w
        LEFT JOIN workflow_changes wc ON w.id = wc.workflow_id
        WHERE (
          -- Workflow aggiornati dopo last sync
          w.updated_at > $1
          -- OR mark per incremental sync
          OR wc.needs_incremental_sync = true
          -- OR nuovi workflow senza change tracking
          OR wc.workflow_id IS NULL
        )
        ORDER BY w.updated_at DESC
        LIMIT 100
      `, [lastSync]);
      
      // Executions nuove dopo last sync
      const executionsResult = await this.db.query(`
        SELECT e.id, e.started_at
        FROM executions e
        LEFT JOIN execution_changes ec ON e.id = ec.execution_id
        WHERE (
          -- Execution dopo last sync
          e.started_at > $1
          -- OR mark per sync
          OR ec.needs_sync = true
          -- OR nuove execution senza tracking
          OR ec.execution_id IS NULL
        )
        ORDER BY e.started_at DESC
        LIMIT 500
      `, [lastSync]);
      
      const workflowsToSync = workflowsResult.rows.map(r => r.id);
      const executionsToSync = executionsResult.rows.map(r => r.id);
      
      console.log(`✅ CHANGE DETECTION: Found ${workflowsToSync.length} workflows, ${executionsToSync.length} executions to sync`);
      
      return {
        workflowsToSync,
        executionsToSync,
        totalChanges: workflowsToSync.length + executionsToSync.length
      };
      
    } catch (error) {
      console.error('❌ Change detection failed:', error);
      // Fallback: sync tutti i workflow recent (safe fallback)
      return this.getFallbackChanges();
    }
  }

  /**
   * DETECT ENHANCED CHANGES - Workflow che necessitano enhanced sync
   */
  async detectEnhancedChanges(): Promise<ChangeDetectionResult> {
    try {
      console.log('🔍 ENHANCED CHANGE DETECTION: Analyzing enhanced changes...');
      
      const lastSync = await this.getLastSyncTimestamp('enhanced');
      
      const workflowsResult = await this.db.query(`
        SELECT DISTINCT w.id
        FROM workflows w
        LEFT JOIN workflow_changes wc ON w.id = wc.workflow_id
        WHERE (
          w.updated_at > $1
          OR wc.needs_enhanced_sync = true
          OR wc.workflow_id IS NULL
        )
        ORDER BY w.updated_at DESC
      `, [lastSync]);
      
      const executionsResult = await this.db.query(`
        SELECT DISTINCT e.id
        FROM executions e
        WHERE e.started_at > $1
        ORDER BY e.started_at DESC
        LIMIT 1000
      `, [lastSync]);
      
      const workflowsToSync = workflowsResult.rows.map(r => r.id);
      const executionsToSync = executionsResult.rows.map(r => r.id);
      
      console.log(`✅ ENHANCED CHANGE DETECTION: Found ${workflowsToSync.length} workflows, ${executionsToSync.length} executions`);
      
      return {
        workflowsToSync,
        executionsToSync,
        totalChanges: workflowsToSync.length + executionsToSync.length
      };
      
    } catch (error) {
      console.error('❌ Enhanced change detection failed:', error);
      return this.getFallbackChanges();
    }
  }

  /**
   * DETECT ULTRA CHANGES - Workflow che necessitano ultra sync
   */
  async detectUltraChanges(): Promise<ChangeDetectionResult> {
    try {
      console.log('🔍 ULTRA CHANGE DETECTION: Analyzing ultra changes...');
      
      const lastSync = await this.getLastSyncTimestamp('ultra');
      
      const workflowsResult = await this.db.query(`
        SELECT DISTINCT w.id
        FROM workflows w
        LEFT JOIN workflow_changes wc ON w.id = wc.workflow_id
        WHERE (
          w.updated_at > $1
          OR wc.needs_ultra_sync = true
          OR wc.workflow_id IS NULL
        )
        ORDER BY w.updated_at DESC
      `, [lastSync]);
      
      const executionsResult = await this.db.query(`
        SELECT DISTINCT e.id
        FROM executions e
        WHERE e.started_at > $1
        ORDER BY e.started_at DESC
      `, [lastSync]);
      
      const workflowsToSync = workflowsResult.rows.map(r => r.id);
      const executionsToSync = executionsResult.rows.map(r => r.id);
      
      console.log(`✅ ULTRA CHANGE DETECTION: Found ${workflowsToSync.length} workflows, ${executionsToSync.length} executions`);
      
      return {
        workflowsToSync,
        executionsToSync,
        totalChanges: workflowsToSync.length + executionsToSync.length
      };
      
    } catch (error) {
      console.error('❌ Ultra change detection failed:', error);
      return this.getFallbackChanges();
    }
  }

  /**
   * MARK SYNC COMPLETED - Aggiorna change tracking dopo sync success
   */
  async markSyncCompleted(
    syncType: 'incremental' | 'enhanced' | 'ultra',
    workflowIds: string[],
    executionIds: string[]
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      if (workflowIds.length > 0) {
        // Update workflow_changes
        await this.db.query(`
          UPDATE workflow_changes 
          SET 
            ${syncType === 'incremental' ? 'last_incremental_sync = $1, needs_incremental_sync = false' : ''}
            ${syncType === 'enhanced' ? 'last_enhanced_sync = $1, needs_enhanced_sync = false' : ''}
            ${syncType === 'ultra' ? 'last_ultra_sync = $1, needs_ultra_sync = false' : ''}
            ${syncType === 'incremental' ? '' : syncType === 'enhanced' ? ', needs_incremental_sync = false' : ', needs_incremental_sync = false, needs_enhanced_sync = false'}
          WHERE workflow_id = ANY($2)
        `, [now, workflowIds]);
      }
      
      if (executionIds.length > 0) {
        // Update execution_changes
        await this.db.query(`
          UPDATE execution_changes 
          SET 
            last_sync = $1,
            needs_sync = false
          WHERE execution_id = ANY($2)
        `, [now, executionIds]);
      }
      
      console.log(`✅ CHANGE TRACKING: Marked ${workflowIds.length} workflows, ${executionIds.length} executions as synced (${syncType})`);
      
    } catch (error) {
      console.error(`❌ Failed to mark sync completed (${syncType}):`, error);
    }
  }

  /**
   * CONTENT HASH VERIFICATION - Verifica se content è effettivamente cambiato
   */
  async verifyContentChanges(workflowIds: string[]): Promise<{
    changedWorkflows: string[];
    unchangedWorkflows: string[];
  }> {
    try {
      const result = await this.db.query(`
        SELECT 
          w.id,
          wc.content_hash as old_hash,
          MD5(COALESCE(w.raw_data::text, '')) as new_hash
        FROM workflows w
        LEFT JOIN workflow_changes wc ON w.id = wc.workflow_id
        WHERE w.id = ANY($1)
      `, [workflowIds]);
      
      const changedWorkflows: string[] = [];
      const unchangedWorkflows: string[] = [];
      
      for (const row of result.rows) {
        if (row.old_hash !== row.new_hash) {
          changedWorkflows.push(row.id);
        } else {
          unchangedWorkflows.push(row.id);
        }
      }
      
      console.log(`🔍 CONTENT VERIFICATION: ${changedWorkflows.length} actually changed, ${unchangedWorkflows.length} unchanged`);
      
      return { changedWorkflows, unchangedWorkflows };
      
    } catch (error) {
      console.error('❌ Content hash verification failed:', error);
      // Fallback: assume tutti changed per sicurezza
      return { changedWorkflows: workflowIds, unchangedWorkflows: [] };
    }
  }

  /**
   * CLEANUP OLD CHANGE TRACKING - Rimuovi tracking per workflow/executions eliminati
   */
  async cleanupOldTracking(): Promise<void> {
    try {
      // Remove tracking per workflow eliminati
      const workflowCleanup = await this.db.query(`
        DELETE FROM workflow_changes 
        WHERE workflow_id NOT IN (SELECT id FROM workflows)
      `);
      
      // Remove tracking per executions eliminati  
      const executionCleanup = await this.db.query(`
        DELETE FROM execution_changes
        WHERE execution_id NOT IN (SELECT id FROM executions)
      `);
      
      console.log(`🧹 CLEANUP: Removed ${workflowCleanup.rowCount} workflow changes, ${executionCleanup.rowCount} execution changes`);
      
    } catch (error) {
      console.error('❌ Cleanup old tracking failed:', error);
    }
  }

  /**
   * GET SYNC STATISTICS - Info sui pending changes
   */
  async getSyncStatistics(): Promise<{
    pendingIncrementalWorkflows: number;
    pendingEnhancedWorkflows: number;
    pendingUltraWorkflows: number;
    pendingExecutions: number;
    lastSyncTimestamps: SyncTimestamps;
  }> {
    try {
      const stats = await this.db.query(`
        SELECT 
          COUNT(CASE WHEN wc.needs_incremental_sync = true THEN 1 END) as pending_incremental,
          COUNT(CASE WHEN wc.needs_enhanced_sync = true THEN 1 END) as pending_enhanced,
          COUNT(CASE WHEN wc.needs_ultra_sync = true THEN 1 END) as pending_ultra
        FROM workflow_changes wc
      `);
      
      const executionStats = await this.db.query(`
        SELECT COUNT(*) as pending_executions
        FROM execution_changes
        WHERE needs_sync = true
      `);
      
      const timestamps = await this.getSyncTimestamps();
      
      const result = {
        pendingIncrementalWorkflows: parseInt(stats.rows[0]?.pending_incremental || '0'),
        pendingEnhancedWorkflows: parseInt(stats.rows[0]?.pending_enhanced || '0'),
        pendingUltraWorkflows: parseInt(stats.rows[0]?.pending_ultra || '0'),
        pendingExecutions: parseInt(executionStats.rows[0]?.pending_executions || '0'),
        lastSyncTimestamps: timestamps
      };
      
      console.log(`📊 SYNC STATISTICS:`, result);
      return result;
      
    } catch (error) {
      console.error('❌ Get sync statistics failed:', error);
      return {
        pendingIncrementalWorkflows: 0,
        pendingEnhancedWorkflows: 0,
        pendingUltraWorkflows: 0,
        pendingExecutions: 0,
        lastSyncTimestamps: {}
      };
    }
  }

  /**
   * PRIVATE METHODS
   */

  private async getLastSyncTimestamp(syncType: string): Promise<Date> {
    try {
      const result = await this.db.query(`
        SELECT last_sync_at 
        FROM sync_status 
        WHERE sync_type = $1
      `, [syncType]);
      
      return result.rows[0]?.last_sync_at || new Date(0); // Epoch se non trovato
    } catch (error) {
      console.warn(`⚠️ Cannot get last sync timestamp for ${syncType}, using epoch`);
      return new Date(0);
    }
  }

  private async getSyncTimestamps(): Promise<SyncTimestamps> {
    try {
      const result = await this.db.query(`
        SELECT sync_type, last_sync_at
        FROM sync_status
      `);
      
      const timestamps: SyncTimestamps = {};
      for (const row of result.rows) {
        switch (row.sync_type) {
          case 'incremental':
            timestamps.lastIncrementalSync = row.last_sync_at;
            break;
          case 'enhanced':
            timestamps.lastEnhancedSync = row.last_sync_at;
            break;
          case 'ultra':
            timestamps.lastUltraSync = row.last_sync_at;
            break;
        }
      }
      
      return timestamps;
    } catch (error) {
      console.warn('⚠️ Cannot get sync timestamps:', error);
      return {};
    }
  }

  private async getFallbackChanges(): Promise<ChangeDetectionResult> {
    console.log('⚠️ Using fallback change detection (recent workflows/executions)');
    
    try {
      // Fallback: workflow modificati nelle ultime 24 ore
      const workflowsResult = await this.db.query(`
        SELECT id FROM workflows 
        WHERE updated_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        ORDER BY updated_at DESC
        LIMIT 50
      `);
      
      // Fallback: executions delle ultime 6 ore
      const executionsResult = await this.db.query(`
        SELECT id FROM executions
        WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '6 hours'
        ORDER BY started_at DESC
        LIMIT 100
      `);
      
      return {
        workflowsToSync: workflowsResult.rows.map(r => r.id),
        executionsToSync: executionsResult.rows.map(r => r.id),
        totalChanges: workflowsResult.rows.length + executionsResult.rows.length
      };
    } catch (error) {
      console.error('❌ Even fallback change detection failed:', error);
      return { workflowsToSync: [], executionsToSync: [], totalChanges: 0 };
    }
  }
}