/**
 * Tenant-specific Statistics API
 * 
 * Endpoints per ottenere statistiche filtrate per singolo tenant
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseConnection } from '../database/connection.js';

// Semplice middleware auth per development
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Per ora passa sempre, in produzione verifica JWT
  (req as any).user = {
    id: '1',
    email: 'admin@pilotpro.com',
    role: 'admin',
    tenantId: 'default_tenant'
  };
  next();
};

const router = Router();
const db = DatabaseConnection.getInstance();

/**
 * @swagger
 * /api/tenant/{tenantId}/stats:
 *   get:
 *     summary: Statistiche per singolo tenant
 *     description: Ottieni statistiche complete per un tenant specifico
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Tenant statistics
 */
router.get('/tenant/:tenantId/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const user = (req as any).user;
    
    // Verifica che l'utente possa vedere questo tenant
    if (user.role !== 'admin' && user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }
    
    // Stats workflows - SOLO QUELLI ATTIVI!
    const workflowStats = await db.getOne(`
      SELECT 
        COUNT(*) as total_workflows,
        COUNT(*) as active_workflows,
        COUNT(*) FILTER (WHERE has_webhook = true) as webhook_workflows,
        COUNT(*) FILTER (WHERE is_archived = false) as production_workflows
      FROM tenant_workflows
      WHERE tenant_id = $1 AND active = true
    `, [tenantId]);
    
    // Stats executions (ultimi 30 giorni)
    const executionStats = await db.getOne(`
      SELECT 
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'success') as successful_executions,
        COUNT(*) FILTER (WHERE status = 'error') as failed_executions,
        COUNT(*) FILTER (WHERE status = 'running') as running_executions,
        AVG(CASE WHEN duration_ms IS NOT NULL THEN duration_ms ELSE 0 END) as avg_duration_ms
      FROM tenant_executions
      WHERE tenant_id = $1
        AND started_at > NOW() - INTERVAL '30 days'
    `, [tenantId]);
    
    // Activity per ore (ultime 24 ore)
    const hourlyActivity = await db.getMany(`
      SELECT 
        DATE_TRUNC('hour', started_at) as hour,
        COUNT(*) as executions,
        COUNT(DISTINCT workflow_id) as unique_workflows
      FROM tenant_executions
      WHERE tenant_id = $1
        AND started_at > NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', started_at)
      ORDER BY hour DESC
    `, [tenantId]);
    
    // Top workflows by executions
    const topWorkflows = await db.getMany(`
      SELECT 
        tw.name,
        tw.id,
        tw.active,
        COUNT(te.id) as execution_count,
        AVG(te.duration_ms) as avg_duration
      FROM tenant_workflows tw
      LEFT JOIN tenant_executions te ON tw.id = te.workflow_id
      WHERE tw.tenant_id = $1
        AND te.started_at > NOW() - INTERVAL '7 days'
      GROUP BY tw.id, tw.name, tw.active
      ORDER BY execution_count DESC
      LIMIT 5
    `, [tenantId]);
    
    // Success rate
    const successRate = executionStats.total_executions > 0
      ? ((executionStats.successful_executions / executionStats.total_executions) * 100).toFixed(1)
      : '100';
    
    res.json({
      tenantId,
      timestamp: new Date().toISOString(),
      workflows: {
        total: parseInt(workflowStats.total_workflows),
        active: parseInt(workflowStats.active_workflows),
        webhook: parseInt(workflowStats.webhook_workflows),
        production: parseInt(workflowStats.production_workflows),
      },
      executions: {
        total: parseInt(executionStats.total_executions),
        successful: parseInt(executionStats.successful_executions),
        failed: parseInt(executionStats.failed_executions),
        running: parseInt(executionStats.running_executions),
        avgDuration: Math.round(executionStats.avg_duration_ms || 0),
        successRate: parseFloat(successRate),
      },
      activity: {
        hourly: hourlyActivity,
        topWorkflows,
      },
    });
  } catch (error) {
    console.error('Error getting tenant stats:', error);
    res.status(500).json({ error: 'Failed to get tenant statistics' });
  }
});

/**
 * @swagger
 * /api/tenant/{tenantId}/workflows:
 *   get:
 *     summary: Lista workflows per tenant
 *     description: Ottieni lista workflows di un tenant specifico
 *     tags: [Tenants]
 */
router.get('/tenant/:tenantId/workflows', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const user = (req as any).user;
    
    // Verifica permessi
    if (user.role !== 'admin' && user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }
    
    const workflows = await db.getMany(`
      SELECT 
        id,
        name,
        active,
        has_webhook,
        is_archived,
        created_at,
        updated_at,
        node_count,
        (SELECT COUNT(*) FROM tenant_executions WHERE workflow_id = tw.id) as execution_count,
        (SELECT MAX(started_at) FROM tenant_executions WHERE workflow_id = tw.id) as last_execution
      FROM tenant_workflows tw
      WHERE tenant_id = $1
      ORDER BY 
        CASE 
          WHEN active = true THEN 1
          WHEN is_archived = true THEN 3
          ELSE 2
        END,
        name ASC
    `, [tenantId]);
    
    res.json({
      tenantId,
      workflows,
      total: workflows.length,
    });
  } catch (error) {
    console.error('Error getting tenant workflows:', error);
    res.status(500).json({ error: 'Failed to get workflows' });
  }
});

/**
 * @swagger
 * /api/tenant/{tenantId}/executions:
 *   get:
 *     summary: Lista esecuzioni per tenant
 *     description: Ottieni lista esecuzioni di un tenant specifico
 *     tags: [Tenants]
 */
router.get('/tenant/:tenantId/executions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const user = (req as any).user;
    
    // Verifica permessi
    if (user.role !== 'admin' && user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }
    
    const executions = await db.getMany(`
      SELECT 
        te.id,
        te.workflow_id,
        tw.name as workflow_name,
        CASE 
          WHEN te.stopped_at IS NULL THEN 'running'
          WHEN te.has_error = true THEN 'error' 
          WHEN te.stopped_at IS NOT NULL THEN 'success'
          ELSE 'waiting'
        END as status,
        te.mode,
        te.started_at,
        te.stopped_at,
        te.duration_ms,
        te.has_error
      FROM tenant_executions te
      JOIN tenant_workflows tw ON te.workflow_id = tw.id
      WHERE te.tenant_id = $1
      ORDER BY te.started_at DESC
      LIMIT $2 OFFSET $3
    `, [tenantId, limit, offset]);
    
    const total = await db.getOne(
      'SELECT COUNT(*) as count FROM tenant_executions WHERE tenant_id = $1',
      [tenantId]
    );
    
    res.json({
      tenantId,
      executions,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: parseInt(total.count),
      },
    });
  } catch (error) {
    console.error('Error getting tenant executions:', error);
    res.status(500).json({ error: 'Failed to get executions' });
  }
});

/**
 * @swagger
 * /api/tenant/{tenantId}/dashboard:
 *   get:
 *     summary: Dashboard data per tenant
 *     description: Tutti i dati necessari per la dashboard di un tenant
 *     tags: [Tenants]
 */
router.get('/tenant/:tenantId/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const user = (req as any).user;
    
    // Per utenti non admin, usa sempre il loro tenant
    const effectiveTenantId = user.role === 'admin' ? tenantId : user.tenantId || 'default_tenant';
    
    // Ottieni info tenant
    const tenant = await db.getOne(
      'SELECT * FROM tenants WHERE id = $1',
      [effectiveTenantId]
    );
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Raccogli tutte le stats in parallelo
    const [workflowStats, executionStats, recentExecutions, statusDistribution] = await Promise.all([
      // Workflow stats - SOLO ATTIVI!
      db.getOne(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) as active,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_this_week
        FROM tenant_workflows
        WHERE tenant_id = $1 AND active = true
      `, [effectiveTenantId]),
      
      // Execution stats
      db.getOne(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'success') as successful,
          COUNT(*) FILTER (WHERE status = 'error') as failed,
          COUNT(*) FILTER (WHERE started_at > NOW() - INTERVAL '24 hours') as last_24h
        FROM tenant_executions
        WHERE tenant_id = $1
      `, [effectiveTenantId]),
      
      // Recent executions - SOLO DA WORKFLOW ATTIVI!
      db.getMany(`
        SELECT 
          te.*, 
          tw.name as workflow_name
        FROM tenant_executions te
        JOIN tenant_workflows tw ON te.workflow_id = tw.id
        WHERE te.tenant_id = $1 AND tw.active = true
        ORDER BY te.started_at DESC
        LIMIT 10
      `, [effectiveTenantId]),
      
      // Status distribution
      db.getMany(`
        SELECT 
          status,
          COUNT(*) as count
        FROM tenant_executions
        WHERE tenant_id = $1
          AND started_at > NOW() - INTERVAL '7 days'
        GROUP BY status
      `, [effectiveTenantId]),
    ]);
    
    // Calcola metriche
    const successRate = executionStats.total > 0
      ? ((executionStats.successful / executionStats.total) * 100).toFixed(1)
      : '100';
    
    res.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
      stats: {
        workflows: {
          total: parseInt(workflowStats.total),
          active: parseInt(workflowStats.active),
          newThisWeek: parseInt(workflowStats.new_this_week),
        },
        executions: {
          total: parseInt(executionStats.total),
          successful: parseInt(executionStats.successful),
          failed: parseInt(executionStats.failed),
          last24h: parseInt(executionStats.last_24h),
          successRate: parseFloat(successRate),
        },
        statusDistribution: statusDistribution.reduce((acc: any, item: any) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
      },
      recentActivity: recentExecutions,
    });
  } catch (error) {
    console.error('Error getting tenant dashboard:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

export default router;