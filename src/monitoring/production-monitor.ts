/**
 * Production Monitor - Monitoring Avanzato per Production Stability
 * 
 * Sistema di monitoraggio enterprise-grade con alerting, metriche avanzate e auto-healing
 */

import { DatabaseConnection } from '../database/connection.js';
import { EnvConfig } from '../config/environment.js';
import { HealthMonitor } from './health-monitor.js';

export interface ProductionMetrics {
  timestamp: string;
  environment: string;
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
      heap: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    connections: {
      active: number;
      idle: number;
      waiting: number;
      pool_size: number;
    };
  };
  performance: {
    averageResponseTime: number;
    throughput: number; // requests per second
    errorRate: number;  // percentage
    slowQueryCount: number;
    cacheHitRate: number;
  };
  business: {
    totalWorkflows: number;
    activeWorkflows: number;
    executionsToday: number;
    successRate: number;
    avgExecutionTime: number;
  };
  alerts: ProductionAlert[];
}

export interface ProductionAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  category: 'system' | 'performance' | 'business' | 'security';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  autoHealingAttempted?: boolean;
  metadata?: any;
}

export interface ProductionConfig {
  environment: 'development' | 'staging' | 'production';
  monitoringInterval: number;
  alertingEnabled: boolean;
  autoHealingEnabled: boolean;
  thresholds: {
    memory: number;        // % critical
    responseTime: number;  // ms critical  
    errorRate: number;     // % critical
    throughput: number;    // min req/s
    successRate: number;   // % critical
  };
  retention: {
    metrics: number;       // days
    alerts: number;        // days
  };
}

const defaultProductionConfig: ProductionConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  monitoringInterval: 60000, // 1 minuto
  alertingEnabled: true,
  autoHealingEnabled: process.env.NODE_ENV === 'production',
  thresholds: {
    memory: 85,       // 85% memoria = critico
    responseTime: 1500, // 1.5s = critico
    errorRate: 3,     // 3% error rate = critico
    throughput: 1,    // min 1 req/s
    successRate: 95   // min 95% success rate
  },
  retention: {
    metrics: 30,   // 30 giorni
    alerts: 90     // 90 giorni
  }
};

/**
 * Production Monitor per stabilità enterprise
 */
export class ProductionMonitor {
  private db: DatabaseConnection;
  private healthMonitor: HealthMonitor;
  private config: ProductionConfig;
  private monitoringInterval?: NodeJS.Timeout;
  private alerts: ProductionAlert[] = [];
  
  // Performance tracking
  private performanceStats = {
    requestCount: 0,
    errorCount: 0,
    responseTimes: [] as number[],
    slowQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    startTime: Date.now()
  };

  constructor(config?: Partial<ProductionConfig>) {
    this.db = DatabaseConnection.getInstance();
    this.healthMonitor = new HealthMonitor();
    this.config = { ...defaultProductionConfig, ...config };
  }

  /**
   * Avvia monitoraggio produzione
   */
  async startMonitoring(): Promise<void> {
    console.log(`🏭 Starting Production Monitor (${this.config.environment})...`);
    
    // Setup database per production monitoring
    await this.setupProductionTables();
    
    // Prima raccolta metriche
    await this.collectProductionMetrics();
    
    // Avvia monitoraggio periodico
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectProductionMetrics();
        await this.evaluateProductionAlerts();
        
        if (this.config.autoHealingEnabled) {
          await this.attemptAutoHealing();
        }
        
        await this.persistProductionMetrics();
        await this.cleanupOldData();
        
      } catch (error) {
        console.error('❌ Production Monitor error:', error);
        this.addAlert({
          level: 'critical',
          category: 'system',
          title: 'Monitoring System Error',
          message: `Production monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }, this.config.monitoringInterval);
    
    console.log(`✅ Production Monitor started (${this.config.monitoringInterval/1000}s interval)`);
  }

  /**
   * Ferma monitoraggio
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    console.log('🛑 Production Monitor stopped');
  }

  /**
   * Setup tabelle database per production monitoring
   */
  private async setupProductionTables(): Promise<void> {
    // Tabella metriche produzione
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS production_metrics (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        environment VARCHAR(20) NOT NULL,
        metrics JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (timestamp),
        INDEX (environment)
      );
    `);

    // Tabella alert produzione
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS production_alerts (
        id VARCHAR(255) PRIMARY KEY,
        level VARCHAR(20) NOT NULL,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        auto_healing_attempted BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}'::jsonb,
        environment VARCHAR(20) DEFAULT '${this.config.environment}',
        INDEX (level, resolved),
        INDEX (category),
        INDEX (timestamp)
      );
    `);

    // Tabella storico performance
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS performance_history (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,4) NOT NULL,
        environment VARCHAR(20) DEFAULT '${this.config.environment}',
        metadata JSONB DEFAULT '{}'::jsonb,
        INDEX (timestamp, metric_name),
        INDEX (environment)
      );
    `);
  }

  /**
   * Raccoglie metriche complete di produzione
   */
  private async collectProductionMetrics(): Promise<ProductionMetrics> {
    const timestamp = new Date().toISOString();
    
    // System metrics base
    const healthCheck = await this.healthMonitor.performHealthCheck();
    
    // Performance metrics avanzate
    const performanceMetrics = this.calculatePerformanceMetrics();
    
    // Business metrics
    const businessMetrics = await this.collectBusinessMetrics();
    
    // Connection pool metrics
    const connectionMetrics = await this.collectConnectionMetrics();

    const metrics: ProductionMetrics = {
      timestamp,
      environment: this.config.environment,
      system: {
        uptime: process.uptime(),
        memory: {
          used: healthCheck.metrics.process.memory_rss_mb,
          total: healthCheck.metrics.memory.total_mb,
          percentage: healthCheck.metrics.memory.percentage,
          heap: healthCheck.metrics.process.memory_heap_mb
        },
        cpu: {
          usage: healthCheck.metrics.process.cpu_percentage,
          loadAverage: [
            healthCheck.metrics.cpu.load_1m,
            healthCheck.metrics.cpu.load_5m,
            healthCheck.metrics.cpu.load_15m
          ]
        },
        connections: connectionMetrics
      },
      performance: performanceMetrics,
      business: businessMetrics,
      alerts: this.alerts.filter(a => !a.resolved)
    };

    return metrics;
  }

  /**
   * Calcola metriche performance avanzate
   */
  private calculatePerformanceMetrics(): ProductionMetrics['performance'] {
    const now = Date.now();
    const uptimeSeconds = (now - this.performanceStats.startTime) / 1000;
    
    const throughput = this.performanceStats.requestCount / uptimeSeconds;
    const errorRate = this.performanceStats.requestCount > 0 
      ? (this.performanceStats.errorCount / this.performanceStats.requestCount) * 100 
      : 0;
    
    const averageResponseTime = this.performanceStats.responseTimes.length > 0
      ? this.performanceStats.responseTimes.reduce((a, b) => a + b, 0) / this.performanceStats.responseTimes.length
      : 0;

    const cacheHitRate = (this.performanceStats.cacheHits + this.performanceStats.cacheMisses) > 0
      ? (this.performanceStats.cacheHits / (this.performanceStats.cacheHits + this.performanceStats.cacheMisses)) * 100
      : 0;

    return {
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      throughput: Math.round(throughput * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      slowQueryCount: this.performanceStats.slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Raccoglie metriche business
   */
  private async collectBusinessMetrics(): Promise<ProductionMetrics['business']> {
    try {
      // Total workflows
      const totalWorkflows = await this.db.getOne(`
        SELECT COUNT(*) as count FROM workflows
      `);

      // Active workflows
      const activeWorkflows = await this.db.getOne(`
        SELECT COUNT(*) as count FROM workflows WHERE active = true
      `);

      // Executions today
      const executionsToday = await this.db.getOne(`
        SELECT COUNT(*) as count 
        FROM executions 
        WHERE DATE(started_at) = CURRENT_DATE
      `);

      // Success rate today
      const successRateData = await this.db.getOne(`
        SELECT 
          COUNT(*) as total_executions,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions
        FROM executions 
        WHERE DATE(started_at) = CURRENT_DATE
      `);

      const successRate = parseInt(successRateData.total_executions) > 0
        ? (parseInt(successRateData.successful_executions) / parseInt(successRateData.total_executions)) * 100
        : 100;

      // Average execution time today
      const avgExecutionTime = await this.db.getOne(`
        SELECT AVG(duration_ms) as avg_duration 
        FROM executions 
        WHERE DATE(started_at) = CURRENT_DATE 
        AND duration_ms IS NOT NULL
      `);

      return {
        totalWorkflows: parseInt(totalWorkflows.count),
        activeWorkflows: parseInt(activeWorkflows.count),
        executionsToday: parseInt(executionsToday.count),
        successRate: Math.round(successRate * 100) / 100,
        avgExecutionTime: Math.round((parseFloat(avgExecutionTime.avg_duration) || 0) * 100) / 100
      };

    } catch (error) {
      console.error('❌ Error collecting business metrics:', error);
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        executionsToday: 0,
        successRate: 0,
        avgExecutionTime: 0
      };
    }
  }

  /**
   * Raccoglie metriche connection pool
   */
  private async collectConnectionMetrics(): Promise<ProductionMetrics['system']['connections']> {
    try {
      // PostgreSQL connection info
      const connectionInfo = await this.db.getOne(`
        SELECT 
          COUNT(*) FILTER (WHERE state = 'active') as active_connections,
          COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
          COUNT(*) FILTER (WHERE state = 'idle in transaction') as waiting_connections,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections')::int as max_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      return {
        active: parseInt(connectionInfo.active_connections) || 0,
        idle: parseInt(connectionInfo.idle_connections) || 0,
        waiting: parseInt(connectionInfo.waiting_connections) || 0,
        pool_size: parseInt(connectionInfo.max_connections) || 100
      };

    } catch (error) {
      console.error('❌ Error collecting connection metrics:', error);
      return {
        active: 0,
        idle: 0,
        waiting: 0,
        pool_size: 100
      };
    }
  }

  /**
   * Valuta condizioni per production alerts
   */
  private async evaluateProductionAlerts(): Promise<void> {
    const metrics = await this.collectProductionMetrics();
    
    // Memory pressure alert
    if (metrics.system.memory.percentage > this.config.thresholds.memory) {
      this.addAlert({
        level: 'critical',
        category: 'system',
        title: 'High Memory Usage',
        message: `Memory usage ${metrics.system.memory.percentage.toFixed(1)}% exceeds threshold ${this.config.thresholds.memory}%`,
        metadata: { memory_percentage: metrics.system.memory.percentage }
      });
    }

    // Response time alert
    if (metrics.performance.averageResponseTime > this.config.thresholds.responseTime) {
      this.addAlert({
        level: 'warning',
        category: 'performance',
        title: 'Slow Response Time',
        message: `Average response time ${metrics.performance.averageResponseTime}ms exceeds threshold ${this.config.thresholds.responseTime}ms`,
        metadata: { response_time: metrics.performance.averageResponseTime }
      });
    }

    // Error rate alert
    if (metrics.performance.errorRate > this.config.thresholds.errorRate) {
      this.addAlert({
        level: 'critical',
        category: 'performance',
        title: 'High Error Rate',
        message: `Error rate ${metrics.performance.errorRate.toFixed(1)}% exceeds threshold ${this.config.thresholds.errorRate}%`,
        metadata: { error_rate: metrics.performance.errorRate }
      });
    }

    // Low throughput alert
    if (metrics.performance.throughput < this.config.thresholds.throughput && process.uptime() > 300) { // Solo dopo 5 minuti di uptime
      this.addAlert({
        level: 'warning',
        category: 'performance',
        title: 'Low Throughput',
        message: `Throughput ${metrics.performance.throughput.toFixed(2)} req/s below threshold ${this.config.thresholds.throughput} req/s`,
        metadata: { throughput: metrics.performance.throughput }
      });
    }

    // Success rate alert  
    if (metrics.business.successRate < this.config.thresholds.successRate && metrics.business.executionsToday > 10) {
      this.addAlert({
        level: 'critical',
        category: 'business',
        title: 'Low Success Rate',
        message: `Success rate ${metrics.business.successRate.toFixed(1)}% below threshold ${this.config.thresholds.successRate}%`,
        metadata: { 
          success_rate: metrics.business.successRate,
          executions_today: metrics.business.executionsToday 
        }
      });
    }

    // Connection pool saturation alert
    const connectionUsage = metrics.system.connections.active / metrics.system.connections.pool_size * 100;
    if (connectionUsage > 80) {
      this.addAlert({
        level: 'warning',
        category: 'system',
        title: 'High Connection Pool Usage',
        message: `Connection pool ${connectionUsage.toFixed(1)}% utilized (${metrics.system.connections.active}/${metrics.system.connections.pool_size})`,
        metadata: { 
          connection_usage: connectionUsage,
          active_connections: metrics.system.connections.active,
          pool_size: metrics.system.connections.pool_size
        }
      });
    }
  }

  /**
   * Tentativi auto-healing
   */
  private async attemptAutoHealing(): Promise<void> {
    if (!this.config.autoHealingEnabled) return;

    const criticalAlerts = this.alerts.filter(a => !a.resolved && a.level === 'critical' && !a.autoHealingAttempted);
    
    for (const alert of criticalAlerts) {
      console.log(`🔧 Attempting auto-healing for alert: ${alert.title}`);
      
      let healed = false;
      
      try {
        switch (alert.category) {
          case 'system':
            if (alert.title.includes('Memory')) {
              healed = await this.healMemoryIssue();
            }
            break;
            
          case 'performance':
            if (alert.title.includes('Error Rate')) {
              healed = await this.healErrorRateIssue();
            }
            break;
        }
        
        // Marca tentativo auto-healing
        alert.autoHealingAttempted = true;
        await this.updateAlert(alert);
        
        if (healed) {
          console.log(`✅ Auto-healing successful for: ${alert.title}`);
          alert.resolved = true;
          await this.updateAlert(alert);
        } else {
          console.log(`⚠️ Auto-healing attempted but not successful for: ${alert.title}`);
        }
        
      } catch (error) {
        console.error(`❌ Auto-healing failed for ${alert.title}:`, error);
        alert.autoHealingAttempted = true;
        await this.updateAlert(alert);
      }
    }
  }

  /**
   * Healing per problemi memoria
   */
  private async healMemoryIssue(): Promise<boolean> {
    try {
      // Force garbage collection
      if (global.gc) {
        global.gc();
        console.log('🧹 Forced garbage collection');
        return true;
      }
      
      // Clear internal caches if any
      this.performanceStats.responseTimes = this.performanceStats.responseTimes.slice(-100);
      
      return true;
    } catch (error) {
      console.error('❌ Memory healing failed:', error);
      return false;
    }
  }

  /**
   * Healing per alto error rate
   */
  private async healErrorRateIssue(): Promise<boolean> {
    try {
      // Reset error counter (potrebbe essere temporaneo)
      const currentErrors = this.performanceStats.errorCount;
      await new Promise(resolve => setTimeout(resolve, 30000)); // Aspetta 30s
      
      // Check se error rate è migliorato
      const newErrorRate = this.performanceStats.requestCount > 0 
        ? (this.performanceStats.errorCount / this.performanceStats.requestCount) * 100 
        : 0;
        
      return newErrorRate < this.config.thresholds.errorRate;
      
    } catch (error) {
      console.error('❌ Error rate healing failed:', error);
      return false;
    }
  }

  /**
   * Aggiunge production alert
   */
  private addAlert(alertData: Omit<ProductionAlert, 'id' | 'timestamp' | 'resolved'>): void {
    if (!this.config.alertingEnabled) return;
    
    const alertId = `prod-${alertData.category}-${Date.now()}`;
    
    // Evita duplicati recenti
    const recentDuplicate = this.alerts.find(alert => 
      alert.title === alertData.title &&
      alert.category === alertData.category &&
      !alert.resolved &&
      (Date.now() - new Date(alert.timestamp).getTime()) < 10 * 60 * 1000 // 10 minuti
    );

    if (recentDuplicate) return;

    const alert: ProductionAlert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);
    this.persistAlert(alert);
    
    // Log alert con emoji appropriato
    const emoji = alertData.level === 'critical' ? '🚨' : alertData.level === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} PRODUCTION ALERT [${alertData.category.toUpperCase()}]: ${alertData.title} - ${alertData.message}`);
  }

  /**
   * Salva alert nel database
   */
  private async persistAlert(alert: ProductionAlert): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO production_alerts (
          id, level, category, title, message, timestamp, resolved, 
          auto_healing_attempted, metadata, environment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          resolved = EXCLUDED.resolved,
          resolved_at = CASE WHEN EXCLUDED.resolved THEN CURRENT_TIMESTAMP ELSE NULL END,
          auto_healing_attempted = EXCLUDED.auto_healing_attempted,
          metadata = EXCLUDED.metadata
      `, [
        alert.id,
        alert.level,
        alert.category,
        alert.title,
        alert.message,
        alert.timestamp,
        alert.resolved,
        alert.autoHealingAttempted || false,
        JSON.stringify(alert.metadata || {}),
        this.config.environment
      ]);
    } catch (error) {
      console.error('❌ Error persisting production alert:', error);
    }
  }

  /**
   * Aggiorna alert esistente
   */
  private async updateAlert(alert: ProductionAlert): Promise<void> {
    await this.persistAlert(alert);
  }

  /**
   * Salva metriche produzione nel database
   */
  private async persistProductionMetrics(): Promise<void> {
    const metrics = await this.collectProductionMetrics();
    
    try {
      await this.db.query(`
        INSERT INTO production_metrics (timestamp, environment, metrics)
        VALUES ($1, $2, $3)
      `, [
        metrics.timestamp,
        metrics.environment,
        JSON.stringify(metrics)
      ]);

      // Salva metriche individuali per analisi storiche
      await this.saveIndividualMetrics(metrics);

    } catch (error) {
      console.error('❌ Error persisting production metrics:', error);
    }
  }

  /**
   * Salva metriche individuali per trend analysis
   */
  private async saveIndividualMetrics(metrics: ProductionMetrics): Promise<void> {
    const metricsToSave = [
      { name: 'memory_percentage', value: metrics.system.memory.percentage },
      { name: 'response_time_avg', value: metrics.performance.averageResponseTime },
      { name: 'throughput', value: metrics.performance.throughput },
      { name: 'error_rate', value: metrics.performance.errorRate },
      { name: 'success_rate', value: metrics.business.successRate },
      { name: 'active_connections', value: metrics.system.connections.active },
      { name: 'executions_today', value: metrics.business.executionsToday }
    ];

    for (const metric of metricsToSave) {
      try {
        await this.db.query(`
          INSERT INTO performance_history (timestamp, metric_name, metric_value, environment)
          VALUES (CURRENT_TIMESTAMP, $1, $2, $3)
        `, [metric.name, metric.value, this.config.environment]);
      } catch (error) {
        console.error(`❌ Error saving metric ${metric.name}:`, error);
      }
    }
  }

  /**
   * Cleanup dati vecchi
   */
  private async cleanupOldData(): Promise<void> {
    try {
      // Cleanup metriche vecchie
      await this.db.query(`
        DELETE FROM production_metrics 
        WHERE timestamp < NOW() - INTERVAL '${this.config.retention.metrics} days'
      `);

      // Cleanup alert risolti vecchi
      await this.db.query(`
        DELETE FROM production_alerts 
        WHERE resolved = true 
        AND resolved_at < NOW() - INTERVAL '${this.config.retention.alerts} days'
      `);

      // Cleanup performance history
      await this.db.query(`
        DELETE FROM performance_history 
        WHERE timestamp < NOW() - INTERVAL '${this.config.retention.metrics} days'
      `);

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * Registra performance request
   */
  recordRequest(responseTime: number, isError: boolean = false, isSlowQuery: boolean = false): void {
    this.performanceStats.requestCount++;
    this.performanceStats.responseTimes.push(responseTime);
    
    if (isError) {
      this.performanceStats.errorCount++;
    }
    
    if (isSlowQuery) {
      this.performanceStats.slowQueries++;
    }
    
    // Mantieni array response times gestibile
    if (this.performanceStats.responseTimes.length > 1000) {
      this.performanceStats.responseTimes = this.performanceStats.responseTimes.slice(-500);
    }
  }

  /**
   * Registra cache hit/miss
   */
  recordCache(isHit: boolean): void {
    if (isHit) {
      this.performanceStats.cacheHits++;
    } else {
      this.performanceStats.cacheMisses++;
    }
  }

  /**
   * Ottieni metriche correnti
   */
  async getCurrentMetrics(): Promise<ProductionMetrics> {
    return this.collectProductionMetrics();
  }

  /**
   * Ottieni alert attivi
   */
  getActiveAlerts(): ProductionAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Ottieni storico metriche
   */
  async getMetricsHistory(hours: number = 24): Promise<any[]> {
    try {
      const results = await this.db.getMany(`
        SELECT timestamp, metrics 
        FROM production_metrics 
        WHERE timestamp > NOW() - INTERVAL '${hours} hours'
        AND environment = $1
        ORDER BY timestamp DESC
        LIMIT 100
      `, [this.config.environment]);
      
      return results.map(row => ({
        timestamp: row.timestamp,
        ...JSON.parse(row.metrics)
      }));

    } catch (error) {
      console.error('❌ Error fetching metrics history:', error);
      return [];
    }
  }

  /**
   * Production dashboard summary
   */
  async getDashboardSummary(): Promise<any> {
    const metrics = await this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    
    return {
      status: activeAlerts.some(a => a.level === 'critical') ? 'critical' : 
              activeAlerts.some(a => a.level === 'warning') ? 'warning' : 'healthy',
      environment: this.config.environment,
      uptime: metrics.system.uptime,
      alerts: {
        critical: activeAlerts.filter(a => a.level === 'critical').length,
        warning: activeAlerts.filter(a => a.level === 'warning').length,
        total: activeAlerts.length
      },
      performance: {
        responseTime: metrics.performance.averageResponseTime,
        throughput: metrics.performance.throughput,
        errorRate: metrics.performance.errorRate,
        successRate: metrics.business.successRate
      },
      system: {
        memoryUsage: metrics.system.memory.percentage,
        activeConnections: metrics.system.connections.active,
        poolUtilization: (metrics.system.connections.active / metrics.system.connections.pool_size) * 100
      },
      business: {
        totalWorkflows: metrics.business.totalWorkflows,
        executionsToday: metrics.business.executionsToday,
        avgExecutionTime: metrics.business.avgExecutionTime
      }
    };
  }
}

/**
 * Istanza singleton del production monitor
 */
let productionMonitorInstance: ProductionMonitor | null = null;

/**
 * Ottieni istanza singleton del production monitor
 */
export function getProductionMonitor(config?: Partial<ProductionConfig>): ProductionMonitor {
  if (!productionMonitorInstance) {
    productionMonitorInstance = new ProductionMonitor(config);
  }
  return productionMonitorInstance;
}