/**
 * Production Controller - API Endpoints per Production Stability
 * 
 * Controller REST per gestione production monitoring, backup, alerting e health
 */

import express, { Request, Response } from 'express';
import { getProductionMonitor } from '../monitoring/production-monitor.js';
import { getProductionPool } from '../database/production-pool.js';
import { getAlertSystem } from '../monitoring/alert-system.js';
import { getBackupManager } from '../backup/backup-manager.js';
import { getShutdownManager } from '../server/graceful-shutdown.js';
import { getHealthMonitor } from '../monitoring/health-monitor.js';

const router = express.Router();

/**
 * @swagger
 * /api/production/dashboard:
 *   get:
 *     summary: Production Dashboard
 *     description: Dashboard completo per monitoring produzione
 *     tags: [Production]
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/production/dashboard', async (req: Request, res: Response) => {
  try {
    const productionMonitor = getProductionMonitor();
    const productionPool = getProductionPool();
    const alertSystem = getAlertSystem();
    const backupManager = getBackupManager();
    const healthMonitor = getHealthMonitor();

    // Ottieni metriche da tutti i servizi
    const [
      dashboardSummary,
      poolMetrics,
      alertStats,
      backupStats,
      healthCheck
    ] = await Promise.all([
      productionMonitor.getDashboardSummary(),
      productionPool.getMetrics(),
      alertSystem.getAlertStats(),
      backupManager.getBackupStats(),
      healthMonitor.performHealthCheck()
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      status: dashboardSummary.status,
      
      // Sistema generale
      system: {
        uptime: dashboardSummary.uptime,
        status: healthCheck.status,
        memory: {
          usage: dashboardSummary.system.memoryUsage,
          used: `${healthCheck.metrics.process.memory_rss_mb.toFixed(1)}MB`,
          heap: `${healthCheck.metrics.process.memory_heap_mb.toFixed(1)}MB`
        }
      },

      // Performance
      performance: {
        responseTime: `${dashboardSummary.performance.responseTime}ms`,
        throughput: `${dashboardSummary.performance.throughput} req/s`,
        errorRate: `${dashboardSummary.performance.errorRate}%`,
        successRate: `${dashboardSummary.performance.successRate}%`
      },

      // Database
      database: {
        status: healthCheck.checks.database.status,
        connections: {
          active: poolMetrics.activeConnections,
          idle: poolMetrics.idleConnections,
          total: poolMetrics.totalConnections,
          utilization: `${poolMetrics.poolUtilization.toFixed(1)}%`
        },
        performance: {
          averageQueryTime: `${poolMetrics.averageQueryTime.toFixed(2)}ms`,
          slowQueries: poolMetrics.slowQueries,
          failedQueries: poolMetrics.failedQueries
        }
      },

      // Business metrics
      business: {
        workflows: dashboardSummary.business.totalWorkflows,
        executions: dashboardSummary.business.executionsToday,
        avgExecutionTime: `${dashboardSummary.business.avgExecutionTime}ms`
      },

      // Alerts
      alerts: {
        active: alertStats.current.activeAlerts,
        critical: alertStats.last24Hours.critical,
        warning: alertStats.last24Hours.warning,
        resolved: alertStats.last24Hours.resolved
      },

      // Backups
      backup: {
        status: backupManager.isHealthy() ? 'healthy' : 'unhealthy',
        totalBackups: backupStats.totalBackups,
        successRate: backupStats.totalBackups > 0 ? 
          `${((backupStats.successfulBackups / backupStats.totalBackups) * 100).toFixed(1)}%` : 'N/A',
        totalSize: formatBytes(backupStats.totalSize),
        lastBackup: backupStats.lastBackup ? {
          type: backupStats.lastBackup.type,
          date: backupStats.lastBackup.startedAt.toISOString(),
          size: formatBytes(backupStats.lastBackup.size || 0)
        } : null,
        nextScheduled: {
          full: backupStats.nextScheduled.full.toISOString(),
          incremental: backupStats.nextScheduled.incremental.toISOString()
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get production dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/health:
 *   get:
 *     summary: Production Health Check
 *     description: Health check completo di tutti i componenti
 *     tags: [Production]
 */
router.get('/production/health', async (req: Request, res: Response) => {
  try {
    const healthMonitor = getHealthMonitor();
    const productionPool = getProductionPool();
    const alertSystem = getAlertSystem();
    const backupManager = getBackupManager();

    const healthCheck = await healthMonitor.performHealthCheck();
    const poolMetrics = productionPool.getMetrics();
    
    // Status aggregato
    const components = [
      { name: 'database', status: healthCheck.checks.database.status },
      { name: 'scheduler', status: healthCheck.checks.scheduler.status },
      { name: 'memory', status: healthCheck.checks.memory.status },
      { name: 'pool', status: poolMetrics.healthStatus },
      { name: 'backup', status: backupManager.isHealthy() ? 'healthy' : 'unhealthy' }
    ];

    const unhealthyCount = components.filter(c => c.status === 'unhealthy').length;
    const degradedCount = components.filter(c => c.status === 'degraded').length;

    let overallStatus: string;
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components: components.reduce((acc, comp) => {
        acc[comp.name] = comp.status;
        return acc;
      }, {} as any),
      details: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      },
      checks: healthCheck.checks,
      metrics: healthCheck.metrics
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/production/metrics:
 *   get:
 *     summary: Production Metrics
 *     description: Metriche dettagliate di produzione
 *     tags: [Production]
 */
router.get('/production/metrics', async (req: Request, res: Response) => {
  try {
    const productionMonitor = getProductionMonitor();
    const currentMetrics = await productionMonitor.getCurrentMetrics();
    
    res.json(currentMetrics);

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get production metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/metrics/history:
 *   get:
 *     summary: Production Metrics History
 *     description: Storico metriche produzione
 *     tags: [Production]
 */
router.get('/production/metrics/history', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const productionMonitor = getProductionMonitor();
    
    const history = await productionMonitor.getMetricsHistory(hours);
    
    res.json({
      timeRange: `${hours} hours`,
      dataPoints: history.length,
      metrics: history
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/alerts:
 *   get:
 *     summary: Active Alerts
 *     description: Lista alert attivi di produzione
 *     tags: [Production]
 */
router.get('/production/alerts', async (req: Request, res: Response) => {
  try {
    const alertSystem = getAlertSystem();
    const activeAlerts = alertSystem.getActiveAlerts();
    const stats = await alertSystem.getAlertStats();

    res.json({
      active: activeAlerts,
      stats: stats,
      summary: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.level === 'critical').length,
        warning: activeAlerts.filter(a => a.level === 'warning').length
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/alerts/{alertId}/acknowledge:
 *   post:
 *     summary: Acknowledge Alert
 *     description: Riconosci un alert attivo
 *     tags: [Production]
 */
router.post('/production/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    if (!acknowledgedBy) {
      return res.status(400).json({
        error: 'Missing acknowledgedBy field'
      });
    }

    const alertSystem = getAlertSystem();
    await alertSystem.acknowledgeAlert(alertId, acknowledgedBy);

    res.json({
      success: true,
      message: `Alert ${alertId} acknowledged by ${acknowledgedBy}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to acknowledge alert',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/database/pool:
 *   get:
 *     summary: Database Pool Status
 *     description: Status dettagliato del connection pool
 *     tags: [Production]
 */
router.get('/production/database/pool', async (req: Request, res: Response) => {
  try {
    const productionPool = getProductionPool();
    const metrics = productionPool.getMetrics();
    const detailedStats = productionPool.getDetailedStats();

    res.json({
      metrics,
      detailed: detailedStats,
      health: {
        status: metrics.healthStatus,
        lastCheck: metrics.lastHealthCheck,
        isHealthy: productionPool.isHealthy()
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get database pool status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/database/pool/refresh:
 *   post:
 *     summary: Refresh Database Pool
 *     description: Force refresh del connection pool
 *     tags: [Production]
 */
router.post('/production/database/pool/refresh', async (req: Request, res: Response) => {
  try {
    const productionPool = getProductionPool();
    await productionPool.refreshPool();

    res.json({
      success: true,
      message: 'Database pool refreshed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to refresh database pool',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/backup:
 *   get:
 *     summary: Backup Status
 *     description: Status sistema backup e storico
 *     tags: [Production]
 */
router.get('/production/backup', async (req: Request, res: Response) => {
  try {
    const backupManager = getBackupManager();
    const stats = await backupManager.getBackupStats();
    const recent = await backupManager.getRecentBackups(10);

    res.json({
      stats,
      recentBackups: recent,
      health: {
        status: backupManager.isHealthy() ? 'healthy' : 'unhealthy',
        enabled: true // TODO: Get from config
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get backup status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/backup/trigger:
 *   post:
 *     summary: Trigger Manual Backup
 *     description: Avvia backup manuale
 *     tags: [Production]
 */
router.post('/production/backup/trigger', async (req: Request, res: Response) => {
  try {
    const { type = 'full' } = req.body;

    if (!['full', 'incremental'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid backup type',
        message: 'Type must be "full" or "incremental"'
      });
    }

    const backupManager = getBackupManager();
    const job = await backupManager.triggerManualBackup(type);

    res.json({
      success: true,
      message: `${type} backup triggered`,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        startedAt: job.startedAt.toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to trigger backup',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/shutdown/status:
 *   get:
 *     summary: Shutdown Manager Status
 *     description: Status del graceful shutdown system
 *     tags: [Production]
 */
router.get('/production/shutdown/status', async (req: Request, res: Response) => {
  try {
    const shutdownManager = getShutdownManager();
    const status = shutdownManager.getStatus();

    res.json(status);

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get shutdown status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/production/shutdown/test:
 *   post:
 *     summary: Test Graceful Shutdown
 *     description: Test del graceful shutdown (development only)
 *     tags: [Production]
 */
router.post('/production/shutdown/test', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Shutdown test not allowed in production'
      });
    }

    const shutdownManager = getShutdownManager();
    const result = await shutdownManager.testShutdown();

    res.json({
      testResult: result,
      message: 'Shutdown test completed (services not actually stopped)'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to test shutdown',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper function per formattare bytes
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;