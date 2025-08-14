/**
 * Mono-Tenant Scheduler Controller 
 * 
 * REST API endpoints per sync diretto n8n -> PostgreSQL
 * SEMPLICE E FUNZIONANTE
 */

import express, { Request, Response } from 'express';
import { DatabaseConnection } from '../database/connection.js';
import { MonoSyncService } from './mono-sync.js';

const router = express.Router();
const db = DatabaseConnection.getInstance();
let monoSync: MonoSyncService;

// Initialize mono sync service
try {
  monoSync = new MonoSyncService(db);
  console.log('✅ MonoSyncService initialized');
} catch (error) {
  console.error('❌ Failed to initialize MonoSyncService:', error);
}

/**
 * Status mono-tenant sync
 */
router.get('/scheduler/status', async (req: Request, res: Response) => {
  try {
    // Get basic stats from database
    const workflowCount = await db.query('SELECT COUNT(*) as count FROM workflows');
    const executionCount = await db.query('SELECT COUNT(*) as count FROM executions');
    const lastSync = await db.query('SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 1');
    
    res.json({
      timestamp: new Date().toISOString(),
      scheduler: {
        isRunning: true,
        type: 'mono-tenant',
        config: {
          apiUrl: process.env.N8N_API_URL,
          hasApiKey: !!process.env.N8N_API_KEY
        }
      },
      stats: {
        totalWorkflows: parseInt(workflowCount.rows[0]?.count || '0'),
        totalExecutions: parseInt(executionCount.rows[0]?.count || '0'),
        lastSync: lastSync.rows[0] || null
      },
      health: {
        status: monoSync ? 'healthy' : 'degraded',
        checks: {
          database: true,
          monoSync: !!monoSync,
          apiConnection: !!process.env.N8N_API_KEY
        }
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    });

  } catch (error) {
    console.error('❌ Status error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Sync mono-tenant da n8n
 */
router.post('/scheduler/sync', async (req: Request, res: Response) => {
  try {
    if (!monoSync) {
      return res.status(500).json({
        error: 'MonoSyncService not initialized',
        message: 'Check N8N_API_URL and N8N_API_KEY configuration'
      });
    }

    console.log('🚀 MONO-SYNC: Starting sync...');
    
    // Log sync start
    const syncLogResult = await db.query(`
      INSERT INTO sync_logs (started_at, success, workflows_processed, executions_processed)
      VALUES (CURRENT_TIMESTAMP, false, 0, 0)
      RETURNING id
    `);
    const syncLogId = syncLogResult.rows[0].id;
    
    // Execute sync with different levels
    const enhanced = req.query.enhanced === 'true';
    const ultra = req.query.ultra === 'true';
    
    const result = ultra 
      ? await monoSync.syncAllUltraEnhanced()
      : (enhanced ? await monoSync.syncAllEnhanced() : await monoSync.syncAll());
    
    // Update sync log
    await db.query(`
      UPDATE sync_logs 
      SET completed_at = CURRENT_TIMESTAMP,
          success = $2,
          workflows_processed = $3,
          executions_processed = $4,
          duration_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000,
          error_message = $5
      WHERE id = $1
    `, [syncLogId, result.errors.length === 0, result.workflowsSynced, result.executionsSynced, result.errors.join('; ') || null]);
    
    res.json({
      message: 'Robust mono-tenant sync completed',
      timestamp: new Date().toISOString(),
      result: {
        workflowsSynced: result.workflowsSynced,
        workflowsUpdated: result.workflowsUpdated,
        executionsSynced: result.executionsSynced,
        executionsUpdated: result.executionsUpdated,
        errors: result.errors,
        warnings: result.warnings,
        duration: result.duration,
        success: result.errors.length === 0
      }
    });

  } catch (error) {
    console.error('❌ MONO-SYNC failed:', error);
    res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get all workflows (mono-tenant)
 */
router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const workflows = await db.query(`
      SELECT 
        id, name, active, created_at, updated_at,
        CASE WHEN nodes IS NOT NULL THEN jsonb_array_length(nodes) ELSE 0 END as node_count,
        CASE WHEN raw_data->>'isArchived' = 'true' THEN true ELSE false END as is_archived
      FROM workflows 
      ORDER BY updated_at DESC
    `);

    res.json({
      workflows: workflows.rows,
      total: workflows.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting workflows:', error);
    res.status(500).json({
      error: 'Failed to get workflows',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all executions (mono-tenant)  
 */
router.get('/executions', async (req: Request, res: Response) => {
  try {
    const executions = await db.query(`
      SELECT 
        id, workflow_id, status, mode, started_at, stopped_at, duration_ms,
        (SELECT name FROM workflows WHERE id = executions.workflow_id) as workflow_name
      FROM executions 
      ORDER BY started_at DESC
      LIMIT 100
    `);

    res.json({
      executions: executions.rows,
      total: executions.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting executions:', error);
    res.status(500).json({
      error: 'Failed to get executions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get system stats (mono-tenant)
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM workflows) as total_workflows,
        (SELECT COUNT(*) FROM workflows WHERE active = true) as active_workflows,
        (SELECT COUNT(*) FROM executions) as total_executions,
        (SELECT COUNT(*) FROM executions WHERE status = 'success') as successful_executions,
        (SELECT COUNT(*) FROM executions WHERE status = 'error') as failed_executions,
        (SELECT AVG(duration_ms) FROM executions WHERE duration_ms IS NOT NULL) as avg_duration_ms
    `);

    const result = stats.rows[0];
    const successRate = result.total_executions > 0 
      ? parseFloat((result.successful_executions / result.total_executions * 100).toFixed(1))
      : 0;

    res.json({
      timestamp: new Date().toISOString(),
      database: {
        totalWorkflows: parseInt(result.total_workflows),
        activeWorkflows: parseInt(result.active_workflows),  
        totalExecutions: parseInt(result.total_executions),
        successfulExecutions: parseInt(result.successful_executions),
        failedExecutions: parseInt(result.failed_executions),
        successRate: successRate,
        avgDurationMs: result.avg_duration_ms ? parseFloat(result.avg_duration_ms) : 0
      }
    });

  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get stats', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get workflow nodes with show-N detection (UNIVERSALE - AI e Non-AI)
 */
router.get('/workflows/:workflowId/nodes', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    
    const nodes = await db.query(`
      SELECT 
        node_id, node_name, node_type, notes, show_order,
        position, parameters, execution_count, success_count,
        created_at, updated_at
      FROM workflow_nodes 
      WHERE workflow_id = $1
      ORDER BY 
        CASE WHEN show_order IS NOT NULL THEN show_order ELSE 999 END,
        node_name
    `, [workflowId]);

    res.json({
      workflowId,
      nodes: nodes.rows,
      total: nodes.rows.length,
      showOrderedNodes: nodes.rows.filter(n => n.show_order !== null).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting workflow nodes:', error);
    res.status(500).json({
      error: 'Failed to get workflow nodes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get show-N sequence for workflow (UNIVERSALE - AI e Non-AI)
 */
router.get('/workflows/:workflowId/show-sequence', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    
    const showNodes = await db.query(`
      SELECT 
        node_id, node_name, node_type, notes, show_order,
        position, parameters, success_count, execution_count
      FROM workflow_nodes 
      WHERE workflow_id = $1 AND show_order IS NOT NULL
      ORDER BY show_order
    `, [workflowId]);

    const workflowInfo = await db.query(`
      SELECT name, ai_node_count FROM workflows WHERE id = $1
    `, [workflowId]);

    res.json({
      workflowId,
      workflowName: workflowInfo.rows[0]?.name || 'Unknown',
      hasAI: (workflowInfo.rows[0]?.ai_node_count || 0) > 0,
      showSequence: showNodes.rows,
      totalShowSteps: showNodes.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting show sequence:', error);
    res.status(500).json({
      error: 'Failed to get show sequence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get show-N usage statistics (tutti i workflow)
 */
router.get('/stats/show-usage', async (req: Request, res: Response) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(DISTINCT workflow_id) as workflows_with_show_notes,
        COUNT(*) as total_show_nodes,
        MAX(show_order) as max_show_order,
        AVG(show_order::numeric) as avg_show_order,
        COUNT(DISTINCT show_order) as unique_show_orders
      FROM workflow_nodes 
      WHERE show_order IS NOT NULL
    `);

    const topWorkflows = await db.query(`
      SELECT 
        w.name as workflow_name,
        w.id as workflow_id,
        w.ai_node_count,
        COUNT(wn.show_order) as show_nodes_count,
        MAX(wn.show_order) as max_show_order
      FROM workflows w
      JOIN workflow_nodes wn ON w.id = wn.workflow_id
      WHERE wn.show_order IS NOT NULL
      GROUP BY w.id, w.name, w.ai_node_count
      ORDER BY show_nodes_count DESC, max_show_order DESC
      LIMIT 10
    `);

    res.json({
      timestamp: new Date().toISOString(),
      summary: stats.rows[0],
      topWorkflowsUsingShow: topWorkflows.rows
    });

  } catch (error) {
    console.error('❌ Error getting show usage stats:', error);
    res.status(500).json({
      error: 'Failed to get show usage statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * =====================================================
 * ENHANCED API ENDPOINTS - Maximum Data Exposure
 * =====================================================
 */

/**
 * Get workflow complete data with tags, settings, complexity
 */
router.get('/workflows/:workflowId/complete', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    
    const workflowData = await db.query(`
      SELECT 
        w.*,
        -- Tags aggregation
        COALESCE(t.tag_count, 0) as tag_count,
        t.tag_names,
        t.tags_array,
        -- Settings
        s.execution_timeout,
        s.timezone,
        s.save_execution_progress,
        s.static_data,
        -- Complexity metrics
        c.complexity_score,
        c.has_error_handling,
        c.has_conditional_logic,
        c.has_manual_triggers,
        c.has_webhook_triggers,
        c.credential_count,
        -- Show-N system
        COALESCE(sn.show_nodes_count, 0) as show_nodes_count,
        sn.max_show_order,
        -- Performance metrics
        CASE 
          WHEN COALESCE(w.execution_count, 0) > 0 
          THEN ROUND((w.success_count::decimal / w.execution_count) * 100, 2)
          ELSE 0 
        END as success_rate
      FROM workflows w
      LEFT JOIN (
        SELECT 
          workflow_id,
          COUNT(*) as tag_count,
          STRING_AGG(COALESCE(tag_name, 'Unknown'), ', ' ORDER BY tag_name) as tag_names,
          JSON_AGG(
            JSON_BUILD_OBJECT('id', tag_id, 'name', tag_name)
            ORDER BY tag_name
          ) as tags_array
        FROM workflow_tags 
        WHERE workflow_id = $1
        GROUP BY workflow_id
      ) t ON w.id = t.workflow_id
      LEFT JOIN workflow_settings s ON w.id = s.workflow_id
      LEFT JOIN workflow_complexity c ON w.id = c.workflow_id
      LEFT JOIN (
        SELECT 
          workflow_id,
          COUNT(*) as show_nodes_count,
          MAX(show_order) as max_show_order
        FROM workflow_nodes 
        WHERE workflow_id = $1 AND show_order IS NOT NULL
        GROUP BY workflow_id
      ) sn ON w.id = sn.workflow_id
      WHERE w.id = $1
    `, [workflowId]);

    if (workflowData.rows.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        workflowId
      });
    }

    // Remove raw_data per performance (troppo pesante per frontend)
    const workflow = workflowData.rows[0];
    delete workflow.raw_data;

    res.json({
      workflow,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting complete workflow:', error);
    res.status(500).json({
      error: 'Failed to get complete workflow data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get workflow execution statistics dettagliate  
 */
router.get('/workflows/:workflowId/execution-stats', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const stats = await db.query(`
      SELECT 
        -- Basic stats
        COUNT(*) as total_executions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_executions,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running_executions,
        
        -- Performance stats
        ROUND(AVG(duration_ms), 2) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median_duration_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
        
        -- Timeline stats
        MAX(started_at) as last_execution,
        MIN(started_at) as first_execution,
        
        -- Success rate
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND((COUNT(CASE WHEN status = 'success' THEN 1 END)::decimal / COUNT(*)) * 100, 2)
          ELSE 0 
        END as success_rate
        
      FROM executions 
      WHERE workflow_id = $1 
      AND started_at >= CURRENT_DATE - INTERVAL '$2 days'
    `, [workflowId, days]);

    // Execution trend per day
    const trend = await db.query(`
      SELECT 
        DATE(started_at) as execution_date,
        COUNT(*) as executions_count,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
        ROUND(AVG(duration_ms), 2) as avg_duration
      FROM executions 
      WHERE workflow_id = $1 
      AND started_at >= CURRENT_DATE - INTERVAL '$2 days'
      GROUP BY DATE(started_at)
      ORDER BY execution_date DESC
      LIMIT 30
    `, [workflowId, days]);

    res.json({
      workflowId,
      period: `${days} days`,
      stats: stats.rows[0],
      daily_trend: trend.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting execution stats:', error);
    res.status(500).json({
      error: 'Failed to get execution statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get workflow tags system
 */
router.get('/workflows/:workflowId/tags', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    
    const tags = await db.query(`
      SELECT 
        wt.tag_id,
        wt.tag_name,
        t.color,
        t.description,
        t.usage_count,
        wt.created_at
      FROM workflow_tags wt
      LEFT JOIN tags t ON wt.tag_id = t.id
      WHERE wt.workflow_id = $1
      ORDER BY wt.tag_name
    `, [workflowId]);

    res.json({
      workflowId,
      tags: tags.rows,
      total: tags.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting workflow tags:', error);
    res.status(500).json({
      error: 'Failed to get workflow tags',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all tags with usage statistics
 */
router.get('/tags/usage', async (req: Request, res: Response) => {
  try {
    const tagStats = await db.query(`
      SELECT 
        t.id,
        t.name,
        t.color,
        t.description,
        COUNT(wt.workflow_id) as workflow_count,
        -- Workflow names using this tag
        STRING_AGG(w.name, ', ' ORDER BY w.name) as workflow_names
      FROM tags t
      LEFT JOIN workflow_tags wt ON t.id = wt.tag_id
      LEFT JOIN workflows w ON wt.workflow_id = w.id
      GROUP BY t.id, t.name, t.color, t.description
      ORDER BY workflow_count DESC, t.name
    `);

    // Most used tags
    const topTags = await db.query(`
      SELECT 
        tag_name,
        COUNT(*) as usage_count
      FROM workflow_tags 
      GROUP BY tag_name
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    res.json({
      tags: tagStats.rows,
      top_tags: topTags.rows,
      total_tags: tagStats.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting tag usage:', error);
    res.status(500).json({
      error: 'Failed to get tag usage statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get complete workflow statistics with all metrics
 */
router.get('/stats/workflows-complete', async (req: Request, res: Response) => {
  try {
    const stats = await db.query(`
      SELECT 
        -- Basic counts
        COUNT(*) as total_workflows,
        COUNT(CASE WHEN active = true THEN 1 END) as active_workflows,
        COUNT(CASE WHEN ai_node_count > 0 THEN 1 END) as ai_workflows,
        
        -- Node analysis
        SUM(COALESCE(node_count, 0)) as total_nodes,
        ROUND(AVG(COALESCE(node_count, 0)), 2) as avg_nodes_per_workflow,
        SUM(COALESCE(ai_node_count, 0)) as total_ai_nodes,
        
        -- Complexity analysis
        ROUND(AVG(COALESCE(c.complexity_score, 0)), 2) as avg_complexity_score,
        COUNT(CASE WHEN c.has_error_handling = true THEN 1 END) as workflows_with_error_handling,
        COUNT(CASE WHEN c.has_conditional_logic = true THEN 1 END) as workflows_with_conditional_logic,
        
        -- Tags analysis
        (SELECT COUNT(DISTINCT tag_name) FROM workflow_tags) as unique_tags,
        (SELECT COUNT(*) FROM workflow_tags) as total_tag_associations,
        
        -- Show-N system
        (SELECT COUNT(DISTINCT workflow_id) FROM workflow_nodes WHERE show_order IS NOT NULL) as workflows_with_show_system,
        (SELECT COUNT(*) FROM workflow_nodes WHERE show_order IS NOT NULL) as total_show_nodes,
        
        -- Execution analysis
        SUM(COALESCE(execution_count, 0)) as total_executions,
        SUM(COALESCE(success_count, 0)) as total_successful_executions,
        CASE 
          WHEN SUM(COALESCE(execution_count, 0)) > 0 
          THEN ROUND((SUM(COALESCE(success_count, 0))::decimal / SUM(COALESCE(execution_count, 0))) * 100, 2)
          ELSE 0 
        END as overall_success_rate
        
      FROM workflows w
      LEFT JOIN workflow_complexity c ON w.id = c.workflow_id
    `);

    // Top workflows by different metrics
    const topByComplexity = await db.query(`
      SELECT w.name, w.id, c.complexity_score, w.node_count
      FROM workflows w
      JOIN workflow_complexity c ON w.id = c.workflow_id
      ORDER BY c.complexity_score DESC NULLS LAST
      LIMIT 5
    `);

    const topByExecutions = await db.query(`
      SELECT name, id, execution_count, success_count
      FROM workflows 
      WHERE execution_count > 0
      ORDER BY execution_count DESC
      LIMIT 5
    `);

    res.json({
      summary: stats.rows[0],
      top_by_complexity: topByComplexity.rows,
      top_by_executions: topByExecutions.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting complete workflow stats:', error);
    res.status(500).json({
      error: 'Failed to get complete workflow statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * =====================================================
 * AUTOMATIC SCHEDULING API ENDPOINTS
 * Sistema di scheduling automatico con monitoring
 * =====================================================
 */

// Import scheduler services
import { SchedulerService } from '../services/scheduler-service.js';
import { SyncMonitor } from '../services/sync-monitor.js';

// Initialize services (singleton pattern)
let schedulerService: SchedulerService | null = null;
let syncMonitor: SyncMonitor | null = null;

const getSchedulerService = () => {
  if (!schedulerService) {
    schedulerService = new SchedulerService(db);
  }
  return schedulerService;
};

const getSyncMonitor = () => {
  if (!syncMonitor) {
    syncMonitor = new SyncMonitor(db);
  }
  return syncMonitor;
};

/**
 * START AUTOMATIC SCHEDULING - Avvia scheduler automatico
 */
router.post('/scheduler/start-automatic', async (req: Request, res: Response) => {
  try {
    console.log('🚀 API: Starting automatic scheduler...');
    
    const scheduler = getSchedulerService();
    await scheduler.start();
    
    const status = await scheduler.getStatus();
    
    res.json({
      message: 'Automatic scheduler started successfully',
      timestamp: new Date().toISOString(),
      status: status
    });
    
  } catch (error) {
    console.error('❌ Failed to start automatic scheduler:', error);
    res.status(500).json({
      error: 'Failed to start automatic scheduler',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * STOP AUTOMATIC SCHEDULING - Ferma scheduler automatico
 */
router.post('/scheduler/stop-automatic', async (req: Request, res: Response) => {
  try {
    console.log('🛑 API: Stopping automatic scheduler...');
    
    const scheduler = getSchedulerService();
    await scheduler.stop();
    
    res.json({
      message: 'Automatic scheduler stopped successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to stop automatic scheduler:', error);
    res.status(500).json({
      error: 'Failed to stop automatic scheduler',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET SCHEDULER STATUS - Stato scheduler e next run times
 */
router.get('/scheduler/automatic-status', async (req: Request, res: Response) => {
  try {
    const scheduler = getSchedulerService();
    const status = await scheduler.getStatus();
    
    const monitor = getSyncMonitor();
    const healthStatus = await monitor.getSyncHealthStatus();
    
    res.json({
      scheduler: status,
      health: healthStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to get scheduler status:', error);
    res.status(500).json({
      error: 'Failed to get scheduler status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * TRIGGER MANUAL SYNC - Triggera sync job manualmente
 */
router.post('/scheduler/trigger/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['incremental', 'enhanced', 'ultra'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid sync type',
        message: 'Sync type must be one of: incremental, enhanced, ultra'
      });
    }
    
    console.log(`🎯 API: Triggering manual ${type} sync...`);
    
    const scheduler = getSchedulerService();
    const jobId = await scheduler.triggerManualSync(type as any);
    
    res.json({
      message: `Manual ${type} sync triggered successfully`,
      jobId: jobId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Failed to trigger manual ${req.params.type} sync:`, error);
    res.status(500).json({
      error: `Failed to trigger manual ${req.params.type} sync`,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET SYNC METRICS - Performance e statistiche sync
 */
router.get('/sync/metrics', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as '24h' | '7d' | '30d') || '24h';
    
    if (!['24h', '7d', '30d'].includes(period)) {
      return res.status(400).json({
        error: 'Invalid period',
        message: 'Period must be one of: 24h, 7d, 30d'
      });
    }
    
    const monitor = getSyncMonitor();
    const metrics = await monitor.getSyncMetrics(period);
    
    res.json({
      metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Failed to get sync metrics:`, error);
    res.status(500).json({
      error: 'Failed to get sync metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET SYNC HEALTH - Health check completo
 */
router.get('/sync/health', async (req: Request, res: Response) => {
  try {
    const monitor = getSyncMonitor();
    const healthStatus = await monitor.getSyncHealthStatus();
    const dataFreshness = await monitor.checkDataFreshness();
    const alerts = await monitor.getActiveAlerts();
    
    res.json({
      health: healthStatus,
      dataFreshness,
      alerts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to get sync health:', error);
    res.status(500).json({
      error: 'Failed to get sync health',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET SYNC JOBS HISTORY - Storia jobs recenti
 */
router.get('/sync/jobs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;
    
    let whereClause = '';
    const params: any[] = [limit, offset];
    
    if (status && ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(status)) {
      whereClause = 'WHERE status = $3';
      params.push(status);
    }
    
    const jobs = await db.query(`
      SELECT 
        id, sync_type, status, started_at, completed_at, duration_ms,
        workflows_synced, workflows_updated, executions_synced, executions_updated,
        errors, warnings
      FROM sync_jobs
      ${whereClause}
      ORDER BY started_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    const totalResult = await db.query(`
      SELECT COUNT(*) as total FROM sync_jobs ${whereClause}
    `, whereClause ? [status] : []);
    
    res.json({
      jobs: jobs.rows,
      total: parseInt(totalResult.rows[0].total),
      limit,
      offset,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to get sync jobs:', error);
    res.status(500).json({
      error: 'Failed to get sync jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET SYNC DASHBOARD DATA - Tutti i dati per dashboard
 */
router.get('/sync/dashboard', async (req: Request, res: Response) => {
  try {
    const monitor = getSyncMonitor();
    const scheduler = getSchedulerService();
    
    const [healthStatus, metrics24h, schedulerStatus, alerts] = await Promise.all([
      monitor.getSyncHealthStatus(),
      monitor.getSyncMetrics('24h'),
      scheduler.getStatus(),
      monitor.getActiveAlerts()
    ]);
    
    // Recent jobs summary
    const recentJobs = await db.query(`
      SELECT 
        sync_type, status, COUNT(*) as count
      FROM sync_jobs
      WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      GROUP BY sync_type, status
      ORDER BY sync_type, status
    `);
    
    res.json({
      health: healthStatus,
      scheduler: schedulerStatus,
      metrics: metrics24h,
      alerts: alerts.slice(0, 10), // Last 10 alerts
      recentJobsSummary: recentJobs.rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to get dashboard data:', error);
    res.status(500).json({
      error: 'Failed to get dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * =====================================================
 * DATA-FIRST READ-ONLY API ENDPOINTS
 * Search e filtering avanzato basato solo su PostgreSQL
 * =====================================================
 */

/**
 * SEARCH WORKFLOWS - Ricerca intelligente workflows (DATA-FIRST)
 */
router.get('/search/workflows', async (req: Request, res: Response) => {
  try {
    const { 
      q,                    // Query testuale
      tags,                 // Filtro tags (comma-separated)
      active,              // Filtro stato attivo
      hasAI,               // Filtro presenza AI nodes
      complexity,          // Filtro complexity level (low/medium/high)
      limit = 20,          // Limite risultati
      offset = 0           // Paginazione
    } = req.query;

    console.log(`🔍 SEARCH: Workflows search - q="${q}", tags="${tags}", active="${active}", hasAI="${hasAI}"`);

    // BUILD dynamic query con PostgreSQL full-text search
    let baseQuery = `
      SELECT DISTINCT
        w.id,
        w.name,
        w.active,
        w.created_at,
        w.updated_at,
        w.node_count,
        w.ai_node_count,
        w.execution_count,
        w.success_count,
        CASE 
          WHEN w.execution_count > 0 
          THEN ROUND((w.success_count::decimal / w.execution_count) * 100, 1)
          ELSE 0 
        END as success_rate,
        -- Tags aggregation
        COALESCE(STRING_AGG(DISTINCT wt.tag_name, ', '), '') as tags,
        -- Complexity indication
        CASE 
          WHEN wc.complexity_score > 8 THEN 'high'
          WHEN wc.complexity_score > 4 THEN 'medium'
          ELSE 'low'
        END as complexity_level,
        -- Show-N presence
        CASE WHEN sn.show_nodes_count > 0 THEN true ELSE false END as has_show_sequence
      FROM workflows w
      LEFT JOIN workflow_tags wt ON w.id = wt.workflow_id
      LEFT JOIN workflow_complexity wc ON w.id = wc.workflow_id
      LEFT JOIN (
        SELECT workflow_id, COUNT(*) as show_nodes_count
        FROM workflow_nodes 
        WHERE show_order IS NOT NULL
        GROUP BY workflow_id
      ) sn ON w.id = sn.workflow_id
    `;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // TEXT search su nome e raw_data
    if (q && q.toString().trim()) {
      paramCount++;
      whereConditions.push(`(
        w.name ILIKE $${paramCount} 
        OR w.raw_data::text ILIKE $${paramCount}
      )`);
      queryParams.push(`%${q.toString().trim()}%`);
    }

    // TAGS filter
    if (tags && tags.toString().trim()) {
      const tagList = tags.toString().split(',').map(t => t.trim());
      paramCount++;
      whereConditions.push(`wt.tag_name = ANY($${paramCount})`);
      queryParams.push(tagList);
    }

    // ACTIVE filter
    if (active !== undefined) {
      paramCount++;
      whereConditions.push(`w.active = $${paramCount}`);
      queryParams.push(active === 'true');
    }

    // AI nodes filter
    if (hasAI !== undefined) {
      if (hasAI === 'true') {
        whereConditions.push(`w.ai_node_count > 0`);
      } else {
        whereConditions.push(`(w.ai_node_count = 0 OR w.ai_node_count IS NULL)`);
      }
    }

    // COMPLEXITY filter
    if (complexity && ['low', 'medium', 'high'].includes(complexity.toString())) {
      if (complexity === 'low') {
        whereConditions.push(`(wc.complexity_score <= 4 OR wc.complexity_score IS NULL)`);
      } else if (complexity === 'medium') {
        whereConditions.push(`wc.complexity_score > 4 AND wc.complexity_score <= 8`);
      } else if (complexity === 'high') {
        whereConditions.push(`wc.complexity_score > 8`);
      }
    }

    // BUILD final query
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += `
      GROUP BY w.id, w.name, w.active, w.created_at, w.updated_at, w.node_count, 
               w.ai_node_count, w.execution_count, w.success_count, 
               wc.complexity_score, sn.show_nodes_count
      ORDER BY w.updated_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit.toString()), parseInt(offset.toString()));

    // EXECUTE search query
    const searchResult = await db.query(baseQuery, queryParams);
    
    // COUNT total results per paginazione
    let countQuery = `
      SELECT COUNT(DISTINCT w.id) as total
      FROM workflows w
      LEFT JOIN workflow_tags wt ON w.id = wt.workflow_id
      LEFT JOIN workflow_complexity wc ON w.id = wc.workflow_id
    `;
    
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    const countResult = await db.query(countQuery, queryParams.slice(0, -2)); // Remove limit/offset

    res.json({
      query: q || '',
      filters: { tags, active, hasAI, complexity },
      results: searchResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit.toString()),
        offset: parseInt(offset.toString()),
        hasMore: parseInt(countResult.rows[0].total) > parseInt(offset.toString()) + parseInt(limit.toString())
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in workflows search:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * SEARCH EXECUTIONS - Ricerca e filtering executions (DATA-FIRST)
 */
router.get('/search/executions', async (req: Request, res: Response) => {
  try {
    const {
      workflowId,          // Filtro workflow specifico
      status,              // Filtro status (success/error/running/waiting)
      dateFrom,            // Filtro data inizio (ISO string)
      dateTo,              // Filtro data fine (ISO string)  
      duration,            // Filtro durata (fast/normal/slow)
      limit = 50,          // Limite risultati
      offset = 0           // Paginazione
    } = req.query;

    console.log(`🔍 SEARCH: Executions search - workflowId="${workflowId}", status="${status}", dateFrom="${dateFrom}"`);

    // BUILD dynamic query
    let baseQuery = `
      SELECT 
        e.id,
        e.workflow_id,
        e.status,
        e.mode,
        e.started_at,
        e.finished_at,
        e.stopped_at,
        e.duration_ms,
        e.finished,
        e.error_message,
        e.nodes_executed,
        -- Workflow info
        w.name as workflow_name,
        w.ai_node_count as workflow_has_ai,
        -- Performance indicators
        CASE 
          WHEN e.duration_ms < 5000 THEN 'fast'
          WHEN e.duration_ms < 30000 THEN 'normal'
          ELSE 'slow'
        END as performance_category
      FROM executions e
      LEFT JOIN workflows w ON e.workflow_id = w.id
    `;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // WORKFLOW filter
    if (workflowId && workflowId.toString().trim()) {
      paramCount++;
      whereConditions.push(`e.workflow_id = $${paramCount}`);
      queryParams.push(workflowId.toString().trim());
    }

    // STATUS filter
    if (status && ['success', 'error', 'running', 'waiting', 'canceled'].includes(status.toString())) {
      paramCount++;
      whereConditions.push(`e.status = $${paramCount}`);
      queryParams.push(status.toString());
    }

    // DATE range filter
    if (dateFrom) {
      paramCount++;
      whereConditions.push(`e.started_at >= $${paramCount}`);
      queryParams.push(new Date(dateFrom.toString()));
    }

    if (dateTo) {
      paramCount++;
      whereConditions.push(`e.started_at <= $${paramCount}`);
      queryParams.push(new Date(dateTo.toString()));
    }

    // DURATION filter  
    if (duration && ['fast', 'normal', 'slow'].includes(duration.toString())) {
      if (duration === 'fast') {
        whereConditions.push(`e.duration_ms < 5000`);
      } else if (duration === 'normal') {
        whereConditions.push(`e.duration_ms >= 5000 AND e.duration_ms < 30000`);
      } else if (duration === 'slow') {
        whereConditions.push(`e.duration_ms >= 30000`);
      }
    }

    // BUILD final query
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += `
      ORDER BY e.started_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit.toString()), parseInt(offset.toString()));

    // EXECUTE search query
    const searchResult = await db.query(baseQuery, queryParams);
    
    // COUNT total results
    let countQuery = `
      SELECT COUNT(*) as total
      FROM executions e
      LEFT JOIN workflows w ON e.workflow_id = w.id
    `;
    
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    const countResult = await db.query(countQuery, queryParams.slice(0, -2));

    res.json({
      filters: { workflowId, status, dateFrom, dateTo, duration },
      results: searchResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit.toString()),
        offset: parseInt(offset.toString()),
        hasMore: parseInt(countResult.rows[0].total) > parseInt(offset.toString()) + parseInt(limit.toString())
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in executions search:', error);
    res.status(500).json({
      error: 'Executions search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * EXECUTION DETAILS - Dettagli completi execution con dati raw (DATA-FIRST)
 */
router.get('/executions/:executionId/details', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    
    console.log(`🔍 EXECUTION DETAILS: Fetching complete data for ${executionId}`);

    // MAIN execution data con workflow info
    const executionResult = await db.query(`
      SELECT 
        e.*,
        -- Workflow information
        w.name as workflow_name,
        w.active as workflow_active,
        w.ai_node_count as workflow_has_ai,
        w.node_count as workflow_total_nodes,
        -- Performance metrics
        CASE 
          WHEN e.duration_ms < 5000 THEN 'fast'
          WHEN e.duration_ms < 30000 THEN 'normal'
          WHEN e.duration_ms >= 30000 THEN 'slow'
          ELSE 'unknown'
        END as performance_category,
        -- Status classification
        CASE 
          WHEN e.status = 'success' AND e.error_message IS NULL THEN 'completed_successfully'
          WHEN e.status = 'success' AND e.error_message IS NOT NULL THEN 'completed_with_warnings'
          WHEN e.status = 'error' THEN 'failed'
          WHEN e.status = 'running' THEN 'in_progress'
          ELSE e.status
        END as execution_status_detailed
      FROM executions e
      LEFT JOIN workflows w ON e.workflow_id = w.id
      WHERE e.id = $1
    `, [executionId]);

    if (executionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        executionId
      });
    }

    const execution = executionResult.rows[0];

    // PARSE raw_data se disponibile per extraire node execution details
    let nodeExecutions = [];
    let executionMetadata = {};
    
    if (execution.raw_data) {
      try {
        const rawData = typeof execution.raw_data === 'string' 
          ? JSON.parse(execution.raw_data) 
          : execution.raw_data;
        
        // Extract node executions da raw data
        if (rawData.data?.main && Array.isArray(rawData.data.main)) {
          nodeExecutions = rawData.data.main.map((nodeData: any, index: number) => ({
            stepIndex: index,
            nodeName: nodeData.node || `step_${index}`,
            nodeType: nodeData.type || 'unknown',
            inputData: nodeData.input ? Object.keys(nodeData.input).length : 0,
            outputData: nodeData.output ? Object.keys(nodeData.output).length : 0,
            executionTime: nodeData.executionTime || null,
            status: nodeData.error ? 'error' : 'success',
            error: nodeData.error || null
          }));
        }

        // Extract metadata
        executionMetadata = {
          startTime: rawData.startedAt || execution.started_at,
          endTime: rawData.stoppedAt || execution.stopped_at,
          mode: rawData.mode || execution.mode,
          timezone: rawData.timezone || null,
          totalSteps: nodeExecutions.length,
          successfulSteps: nodeExecutions.filter((n: any) => n.status === 'success').length,
          failedSteps: nodeExecutions.filter((n: any) => n.status === 'error').length
        };
        
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse raw_data for execution ${executionId}:`, parseError);
      }
    }

    // GET related executions (stesso workflow, recent)
    const relatedExecutions = await db.query(`
      SELECT 
        id, status, started_at, duration_ms,
        CASE 
          WHEN id = $1 THEN true 
          ELSE false 
        END as is_current
      FROM executions 
      WHERE workflow_id = $2 
      AND started_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY started_at DESC
      LIMIT 10
    `, [executionId, execution.workflow_id]);

    // WORKFLOW nodes con show-N order se disponibile
    const workflowNodes = await db.query(`
      SELECT 
        node_id, node_name, node_type, notes, show_order,
        position, execution_count, success_count
      FROM workflow_nodes
      WHERE workflow_id = $1
      ORDER BY 
        CASE WHEN show_order IS NOT NULL THEN show_order ELSE 999 END,
        node_name
    `, [execution.workflow_id]);

    res.json({
      execution: {
        ...execution,
        // Remove raw_data da response per performance (troppo pesante)
        raw_data: undefined
      },
      nodeExecutions,
      metadata: executionMetadata,
      relatedExecutions: relatedExecutions.rows,
      workflowNodes: workflowNodes.rows,
      analytics: {
        performanceCategory: execution.performance_category,
        statusDetailed: execution.execution_status_detailed,
        isWorkflowActive: execution.workflow_active,
        hasAINodes: (execution.workflow_has_ai || 0) > 0,
        nodeExecutionRate: execution.nodes_executed > 0 
          ? Math.round((nodeExecutions.filter((n: any) => n.status === 'success').length / execution.nodes_executed) * 100)
          : 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error getting execution details for ${req.params.executionId}:`, error);
    res.status(500).json({
      error: 'Failed to get execution details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * WORKFLOW CONTROL - Controllo minimale workflow (READ-ONLY system)
 */
router.post('/workflows/:workflowId/activate', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Field "active" must be boolean'
      });
    }

    console.log(`🎯 WORKFLOW CONTROL: ${active ? 'Activating' : 'Deactivating'} workflow ${workflowId}`);

    // UPDATE solo lo stato active nel database locale
    // NON fa chiamate a n8n API (read-only system)
    const updateResult = await db.query(`
      UPDATE workflows 
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, active
    `, [active, workflowId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        workflowId
      });
    }

    const workflow = updateResult.rows[0];

    res.json({
      message: `Workflow ${active ? 'activated' : 'deactivated'} successfully`,
      workflow: workflow,
      note: 'This is a local status change only. Use n8n interface for actual workflow control.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error controlling workflow ${req.params.workflowId}:`, error);
    res.status(500).json({
      error: 'Workflow control failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;