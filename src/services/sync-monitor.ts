/**
 * Sync Monitor Service
 * 
 * Sistema di monitoring per sync health, performance e alerting
 */

import { DatabaseConnection } from '../database/connection.js';

export interface SyncHealthStatus {
  overall: 'healthy' | 'warning' | 'error';
  services: {
    incremental: ServiceHealth;
    enhanced: ServiceHealth;
    ultra: ServiceHealth;
    queue: ServiceHealth;
  };
  lastUpdated: Date;
}

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'error';
  lastRun: Date | null;
  lastSuccess: boolean;
  consecutiveFailures: number;
  avgDuration: number;
  message: string;
}

export interface SyncMetrics {
  period: '24h' | '7d' | '30d';
  summary: {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    successRate: number;
    avgDuration: number;
  };
  breakdown: {
    incremental: SyncTypeMetrics;
    enhanced: SyncTypeMetrics;
    ultra: SyncTypeMetrics;
  };
  trends: MetricsTrend[];
}

export interface SyncTypeMetrics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  successRate: number;
  avgDuration: number;
  dataProcessed: {
    workflows: number;
    executions: number;
  };
}

export interface MetricsTrend {
  date: string;
  totalJobs: number;
  successfulJobs: number;
  avgDuration: number;
}

export interface SyncAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details: any;
  createdAt: Date;
  resolved: boolean;
}

export class SyncMonitor {
  private db: DatabaseConnection;
  private alerts: SyncAlert[] = [];

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * GET SYNC HEALTH STATUS - Health check completo di tutti i servizi
   */
  async getSyncHealthStatus(): Promise<SyncHealthStatus> {
    try {
      console.log('🩺 MONITOR: Checking sync health status...');
      
      const [incremental, enhanced, ultra, queue] = await Promise.all([
        this.checkServiceHealth('incremental'),
        this.checkServiceHealth('enhanced'), 
        this.checkServiceHealth('ultra'),
        this.checkQueueHealth()
      ]);
      
      // Determine overall status
      const services = { incremental, enhanced, ultra, queue };
      const statuses = Object.values(services).map(s => s.status);
      
      let overall: 'healthy' | 'warning' | 'error' = 'healthy';
      if (statuses.includes('error')) {
        overall = 'error';
      } else if (statuses.includes('warning')) {
        overall = 'warning';
      }
      
      return {
        overall,
        services,
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error('❌ MONITOR: Failed to get health status:', error);
      
      return {
        overall: 'error',
        services: {
          incremental: this.createErrorHealth('Failed to check incremental health'),
          enhanced: this.createErrorHealth('Failed to check enhanced health'),
          ultra: this.createErrorHealth('Failed to check ultra health'),
          queue: this.createErrorHealth('Failed to check queue health')
        },
        lastUpdated: new Date()
      };
    }
  }

  /**
   * GET SYNC METRICS - Performance metrics per period
   */
  async getSyncMetrics(period: '24h' | '7d' | '30d' = '24h'): Promise<SyncMetrics> {
    try {
      const intervalMap = {
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days'
      };
      
      const interval = intervalMap[period];
      
      // Summary metrics
      const summaryResult = await this.db.query(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_jobs,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
          ROUND(AVG(duration_ms), 0) as avg_duration
        FROM sync_jobs
        WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '${interval}'
      `);
      
      const summary = summaryResult.rows[0];
      const successRate = summary.total_jobs > 0 
        ? Math.round((summary.successful_jobs / summary.total_jobs) * 100) 
        : 0;
      
      // Breakdown per sync type
      const breakdownResult = await this.db.query(`
        SELECT 
          sync_type,
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_jobs,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
          ROUND(AVG(duration_ms), 0) as avg_duration,
          SUM(workflows_synced + workflows_updated) as total_workflows,
          SUM(executions_synced + executions_updated) as total_executions
        FROM sync_jobs
        WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '${interval}'
        GROUP BY sync_type
      `);
      
      const breakdown = {
        incremental: this.createEmptyMetrics(),
        enhanced: this.createEmptyMetrics(),
        ultra: this.createEmptyMetrics()
      };
      
      for (const row of breakdownResult.rows) {
        const type = row.sync_type as keyof typeof breakdown;
        if (type in breakdown) {
          breakdown[type] = {
            totalJobs: parseInt(row.total_jobs),
            successfulJobs: parseInt(row.successful_jobs),
            failedJobs: parseInt(row.failed_jobs),
            successRate: row.total_jobs > 0 ? Math.round((row.successful_jobs / row.total_jobs) * 100) : 0,
            avgDuration: parseInt(row.avg_duration) || 0,
            dataProcessed: {
              workflows: parseInt(row.total_workflows) || 0,
              executions: parseInt(row.total_executions) || 0
            }
          };
        }
      }
      
      // Trends (daily breakdown)
      const trendsResult = await this.db.query(`
        SELECT 
          DATE(started_at) as date,
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_jobs,
          ROUND(AVG(duration_ms), 0) as avg_duration
        FROM sync_jobs
        WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '${interval}'
        GROUP BY DATE(started_at)
        ORDER BY date DESC
        LIMIT 30
      `);
      
      const trends = trendsResult.rows.map(row => ({
        date: row.date,
        totalJobs: parseInt(row.total_jobs),
        successfulJobs: parseInt(row.successful_jobs),
        avgDuration: parseInt(row.avg_duration) || 0
      }));
      
      return {
        period,
        summary: {
          totalJobs: parseInt(summary.total_jobs),
          successfulJobs: parseInt(summary.successful_jobs),
          failedJobs: parseInt(summary.failed_jobs),
          successRate,
          avgDuration: parseInt(summary.avg_duration) || 0
        },
        breakdown,
        trends
      };
      
    } catch (error) {
      console.error(`❌ MONITOR: Failed to get metrics for ${period}:`, error);
      return this.createEmptyMetricsResponse(period);
    }
  }

  /**
   * GET ACTIVE ALERTS - Alert correnti non risolti
   */
  async getActiveAlerts(): Promise<SyncAlert[]> {
    // Per ora return in-memory alerts, in futuro potrebbe essere database-based
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * CHECK DATA FRESHNESS - Verifica freshness dei dati
   */
  async checkDataFreshness(): Promise<{
    workflows: { lastUpdate: Date; freshnessMinutes: number; status: string };
    executions: { lastUpdate: Date; freshnessMinutes: number; status: string };
    overall: string;
  }> {
    try {
      const freshnessResult = await this.db.query(`
        SELECT 
          'workflows' as data_type,
          MAX(updated_at) as last_update
        FROM workflows
        WHERE updated_at IS NOT NULL
        UNION ALL
        SELECT 
          'executions' as data_type,
          MAX(started_at) as last_update
        FROM executions
        WHERE started_at IS NOT NULL
      `);
      
      const now = new Date();
      const results = {
        workflows: { lastUpdate: new Date(0), freshnessMinutes: 0, status: 'unknown' },
        executions: { lastUpdate: new Date(0), freshnessMinutes: 0, status: 'unknown' },
        overall: 'unknown'
      };
      
      for (const row of freshnessResult.rows) {
        if (row.last_update) {
          const lastUpdate = new Date(row.last_update);
          const freshnessMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
          
          let status = 'fresh';
          if (row.data_type === 'workflows') {
            // Workflows: fresh < 1h, stale > 6h
            if (freshnessMinutes > 360) status = 'stale';
            else if (freshnessMinutes > 60) status = 'warning';
          } else {
            // Executions: fresh < 30min, stale > 2h
            if (freshnessMinutes > 120) status = 'stale';
            else if (freshnessMinutes > 30) status = 'warning';
          }
          
          (results as any)[row.data_type] = {
            lastUpdate,
            freshnessMinutes,
            status
          };
        }
      }
      
      // Overall status
      const statuses = [results.workflows.status, results.executions.status];
      if (statuses.includes('stale')) {
        results.overall = 'stale';
      } else if (statuses.includes('warning')) {
        results.overall = 'warning';
      } else {
        results.overall = 'fresh';
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ MONITOR: Failed to check data freshness:', error);
      return {
        workflows: { lastUpdate: new Date(0), freshnessMinutes: 0, status: 'error' },
        executions: { lastUpdate: new Date(0), freshnessMinutes: 0, status: 'error' },
        overall: 'error'
      };
    }
  }

  /**
   * GENERATE ALERT - Crea nuovo alert
   */
  generateAlert(
    type: 'error' | 'warning' | 'info',
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    details?: any
  ): void {
    const alert: SyncAlert = {
      id: this.generateAlertId(),
      type,
      severity,
      message,
      details,
      createdAt: new Date(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts in memory
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`);
  }

  /**
   * RESOLVE ALERT - Marca alert come risolto
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ ALERT RESOLVED: ${alert.message}`);
      return true;
    }
    return false;
  }

  /**
   * PRIVATE METHODS
   */

  private async checkServiceHealth(syncType: 'incremental' | 'enhanced' | 'ultra'): Promise<ServiceHealth> {
    try {
      const result = await this.db.query(`
        SELECT 
          last_sync_at,
          last_sync_success,
          last_sync_duration_ms,
          errors_count
        FROM sync_status
        WHERE sync_type = $1
      `, [syncType]);
      
      if (result.rows.length === 0) {
        return {
          status: 'warning',
          lastRun: null,
          lastSuccess: false,
          consecutiveFailures: 0,
          avgDuration: 0,
          message: `No ${syncType} sync status found`
        };
      }
      
      const row = result.rows[0];
      const lastRun = row.last_sync_at ? new Date(row.last_sync_at) : null;
      const lastSuccess = row.last_sync_success;
      const consecutiveFailures = row.errors_count || 0;
      const avgDuration = row.last_sync_duration_ms || 0;
      
      // Determine health status
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let message = `${syncType} sync is healthy`;
      
      if (!lastSuccess) {
        status = 'error';
        message = `Last ${syncType} sync failed`;
      } else if (consecutiveFailures > 3) {
        status = 'warning';
        message = `${syncType} sync has ${consecutiveFailures} recent failures`;
      } else if (lastRun) {
        const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
        const expectedInterval = syncType === 'incremental' ? 0.1 : syncType === 'enhanced' ? 1 : 6;
        
        if (hoursSinceLastRun > expectedInterval * 2) {
          status = 'warning';
          message = `${syncType} sync is overdue (${Math.round(hoursSinceLastRun)}h since last run)`;
        }
      }
      
      return {
        status,
        lastRun,
        lastSuccess,
        consecutiveFailures,
        avgDuration,
        message
      };
      
    } catch (error) {
      console.error(`❌ MONITOR: Failed to check ${syncType} health:`, error);
      return this.createErrorHealth(`Failed to check ${syncType} health`);
    }
  }

  private async checkQueueHealth(): Promise<ServiceHealth> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_jobs,
          COUNT(CASE WHEN status = 'running' THEN 1 END) as running_jobs,
          COUNT(CASE WHEN status = 'failed' AND started_at > CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1 END) as recent_failures
        FROM sync_jobs
        WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `);
      
      const row = result.rows[0];
      const pendingJobs = parseInt(row.pending_jobs);
      const runningJobs = parseInt(row.running_jobs);
      const recentFailures = parseInt(row.recent_failures);
      
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let message = 'Queue is healthy';
      
      if (pendingJobs > 10) {
        status = 'warning';
        message = `Queue has ${pendingJobs} pending jobs`;
      } else if (recentFailures > 5) {
        status = 'warning';
        message = `Queue has ${recentFailures} recent failures`;
      } else if (runningJobs > 5) {
        status = 'warning';
        message = `Queue has ${runningJobs} running jobs (possible bottleneck)`;
      }
      
      return {
        status,
        lastRun: new Date(),
        lastSuccess: true,
        consecutiveFailures: recentFailures,
        avgDuration: 0,
        message
      };
      
    } catch (error) {
      console.error('❌ MONITOR: Failed to check queue health:', error);
      return this.createErrorHealth('Failed to check queue health');
    }
  }

  private createErrorHealth(message: string): ServiceHealth {
    return {
      status: 'error',
      lastRun: null,
      lastSuccess: false,
      consecutiveFailures: 1,
      avgDuration: 0,
      message
    };
  }

  private createEmptyMetrics(): SyncTypeMetrics {
    return {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      successRate: 0,
      avgDuration: 0,
      dataProcessed: {
        workflows: 0,
        executions: 0
      }
    };
  }

  private createEmptyMetricsResponse(period: '24h' | '7d' | '30d'): SyncMetrics {
    return {
      period,
      summary: {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        successRate: 0,
        avgDuration: 0
      },
      breakdown: {
        incremental: this.createEmptyMetrics(),
        enhanced: this.createEmptyMetrics(),
        ultra: this.createEmptyMetrics()
      },
      trends: []
    };
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}