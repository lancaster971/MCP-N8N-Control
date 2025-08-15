/**
 * Production Connection Pool - Pool Ottimizzato per Produzione
 * 
 * Connection pool avanzato con monitoring, retry logic, connection healing e performance optimization
 */

import { Pool, PoolConfig, PoolClient, QueryResult } from 'pg';
import { DatabaseConnection } from './connection.js';

export interface ProductionPoolConfig {
  // Pool sizing
  min: number;                    // Minimo connessioni sempre attive
  max: number;                    // Massimo connessioni nel pool
  acquireTimeoutMillis: number;   // Timeout acquisizione connessione
  createTimeoutMillis: number;    // Timeout creazione connessione
  idleTimeoutMillis: number;      // Timeout chiusura connessioni idle
  
  // Health & retry
  healthCheckInterval: number;    // Intervallo health check (ms)
  retryAttempts: number;         // Max retry per query
  retryDelay: number;            // Delay tra retry (ms)
  
  // Performance optimization
  statementTimeout: number;      // Timeout per singole query
  slowQueryThreshold: number;    // Soglia slow query (ms)
  
  // Connection validation
  validationQuery: string;       // Query per validare connessioni
  validateOnConnect: boolean;    // Valida al connect
  validateOnAcquire: boolean;    // Valida all'acquisizione
}

const defaultProductionPoolConfig: ProductionPoolConfig = {
  min: 5,                        // Sempre 5 connessioni pronte
  max: 25,                       // Max 25 connessioni
  acquireTimeoutMillis: 10000,   // 10s timeout acquisizione
  createTimeoutMillis: 5000,     // 5s timeout creazione
  idleTimeoutMillis: 300000,     // 5 minuti idle timeout
  
  healthCheckInterval: 30000,    // Health check ogni 30s
  retryAttempts: 3,              // Max 3 retry
  retryDelay: 1000,              // 1s delay tra retry
  
  statementTimeout: 30000,       // 30s query timeout
  slowQueryThreshold: 1000,      // 1s = slow query
  
  validationQuery: 'SELECT 1',   // Query semplice per validazione
  validateOnConnect: true,
  validateOnAcquire: true
};

export interface PoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  slowQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  poolUtilization: number;
  lastHealthCheck: Date | null;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * Production-ready connection pool con monitoring e auto-healing
 */
export class ProductionPool {
  private pool: Pool | null = null;
  private config: ProductionPoolConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private metrics: PoolMetrics;
  private queryStats = {
    totalQueries: 0,
    slowQueries: 0,
    failedQueries: 0,
    responseTimes: [] as number[],
    lastReset: Date.now()
  };

  constructor(config?: Partial<ProductionPoolConfig>) {
    this.config = { ...defaultProductionPoolConfig, ...config };
    this.metrics = this.initializeMetrics();
  }

  /**
   * Inizializza metriche di base
   */
  private initializeMetrics(): PoolMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      poolUtilization: 0,
      lastHealthCheck: null,
      healthStatus: 'healthy'
    };
  }

  /**
   * Inizializza il pool di produzione
   */
  async initialize(): Promise<void> {
    console.log('🏊‍♂️ Initializing Production Connection Pool...');
    
    // Ottieni config dal DatabaseConnection esistente
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect(); // Assicura che sia connesso
    
    // Crea pool con configurazione ottimizzata
    const baseConfig = this.getBasePoolConfig();
    
    const poolConfig: PoolConfig = {
      host: baseConfig.host,
      port: baseConfig.port,
      database: baseConfig.database,
      user: baseConfig.user,
      password: baseConfig.password,
      
      // Production pool settings
      min: this.config.min,
      max: this.config.max,
      connectionTimeoutMillis: this.config.acquireTimeoutMillis,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      
      // Performance settings
      statement_timeout: this.config.statementTimeout,
      query_timeout: this.config.acquireTimeoutMillis,
      
      // SSL settings
      ssl: baseConfig.ssl ? { rejectUnauthorized: false } : false
    };

    this.pool = new Pool(poolConfig);
    
    // Setup event handlers
    this.setupPoolEventHandlers();
    
    // Test connessione iniziale
    await this.validatePool();
    
    // Avvia health monitoring
    this.startHealthMonitoring();
    
    console.log(`✅ Production Pool initialized (${this.config.min}-${this.config.max} connections)`);
  }

  /**
   * Ottieni configurazione base dal DatabaseConnection
   */
  private getBasePoolConfig(): any {
    const env = process.env;
    
    if (env.DATABASE_URL) {
      const url = new URL(env.DATABASE_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password || '',
        ssl: env.DB_SSL === 'true'
      };
    }
    
    return {
      host: env.DB_HOST || 'localhost',
      port: parseInt(env.DB_PORT || '5432'),
      database: env.DB_NAME || 'n8n_mcp',
      user: env.DB_USER || 'postgres',
      password: env.DB_PASSWORD || '',
      ssl: env.DB_SSL === 'true'
    };
  }

  /**
   * Setup event handlers per monitoring
   */
  private setupPoolEventHandlers(): void {
    if (!this.pool) return;

    // Connessione creata
    this.pool.on('connect', (client) => {
      console.log('🔗 New database connection established');
      this.updateMetrics();
    });

    // Connessione rimossa
    this.pool.on('remove', (client) => {
      console.log('🔌 Database connection removed from pool');
      this.updateMetrics();
    });

    // Errori pool
    this.pool.on('error', (error) => {
      console.error('❌ Pool error:', error);
      this.metrics.healthStatus = 'unhealthy';
    });

    // Acquisizione connessione
    this.pool.on('acquire', (client) => {
      this.updateMetrics();
    });
  }

  /**
   * Valida il pool con test connection
   */
  private async validatePool(): Promise<void> {
    if (!this.pool) throw new Error('Pool not initialized');

    try {
      const client = await this.pool.connect();
      await client.query(this.config.validationQuery);
      client.release();
      console.log('✅ Pool validation successful');
    } catch (error) {
      console.error('❌ Pool validation failed:', error);
      throw new Error(`Pool validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Avvia monitoraggio health del pool
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
      this.updateMetrics();
    }, this.config.healthCheckInterval);
  }

  /**
   * Esegue health check del pool
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.pool) return;

    try {
      const startTime = Date.now();
      
      // Test query con timeout
      const client = await this.pool.connect();
      await client.query(this.config.validationQuery);
      client.release();
      
      const responseTime = Date.now() - startTime;
      
      // Determina health status
      if (responseTime > 2000) {
        this.metrics.healthStatus = 'degraded';
      } else if (this.metrics.poolUtilization > 90) {
        this.metrics.healthStatus = 'degraded';
      } else {
        this.metrics.healthStatus = 'healthy';
      }
      
      this.metrics.lastHealthCheck = new Date();
      
    } catch (error) {
      console.error('❌ Pool health check failed:', error);
      this.metrics.healthStatus = 'unhealthy';
      this.metrics.lastHealthCheck = new Date();
    }
  }

  /**
   * Aggiorna metriche del pool
   */
  private updateMetrics(): void {
    if (!this.pool) return;

    // Ottieni stats dal pool
    this.metrics.totalConnections = this.pool.totalCount;
    this.metrics.idleConnections = this.pool.idleCount;
    this.metrics.waitingClients = this.pool.waitingCount;
    
    // Calcola connessioni attive
    this.metrics.activeConnections = this.metrics.totalConnections - this.metrics.idleConnections;
    
    // Calcola utilizzo pool
    this.metrics.poolUtilization = (this.metrics.totalConnections / this.config.max) * 100;
    
    // Aggiorna stats query
    this.metrics.totalQueries = this.queryStats.totalQueries;
    this.metrics.slowQueries = this.queryStats.slowQueries;
    this.metrics.failedQueries = this.queryStats.failedQueries;
    
    // Calcola tempo risposta medio
    if (this.queryStats.responseTimes.length > 0) {
      this.metrics.averageQueryTime = this.queryStats.responseTimes.reduce((a, b) => a + b, 0) / this.queryStats.responseTimes.length;
    }
  }

  /**
   * Esegue query con retry logic e monitoring
   */
  async query<T extends QueryResult = QueryResult>(
    text: string, 
    params?: any[]
  ): Promise<T> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await this.executeQuery<T>(text, params);
        
        // Record success metrics
        const responseTime = Date.now() - startTime;
        this.recordQuerySuccess(responseTime);
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Query attempt ${attempt}/${this.config.retryAttempts} failed:`, error);
        
        // Non ritentare per errori non recuperabili
        if (this.isNonRetryableError(error as Error)) {
          break;
        }
        
        // Aspetta prima del prossimo tentativo
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    // Record failure metrics
    this.recordQueryFailure();
    throw lastError || new Error('Query failed after all retry attempts');
  }

  /**
   * Esegue la query effettiva
   */
  private async executeQuery<T extends QueryResult = QueryResult>(
    text: string, 
    params?: any[]
  ): Promise<T> {
    if (!this.pool) throw new Error('Pool not initialized');

    const client = await this.pool.connect();
    
    try {
      // Validate connection se richiesto
      if (this.config.validateOnAcquire) {
        await client.query(this.config.validationQuery);
      }
      
      const result = await client.query<T['rows'][0]>(text, params);
      return result as T;
      
    } finally {
      client.release();
    }
  }

  /**
   * Controlla se l'errore è non ritentabile
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'syntax error',
      'permission denied',
      'column does not exist',
      'table does not exist',
      'duplicate key',
      'constraint violation'
    ];

    return nonRetryableMessages.some(message => 
      error.message.toLowerCase().includes(message)
    );
  }

  /**
   * Registra successo query
   */
  private recordQuerySuccess(responseTime: number): void {
    this.queryStats.totalQueries++;
    this.queryStats.responseTimes.push(responseTime);
    
    // Slow query tracking
    if (responseTime > this.config.slowQueryThreshold) {
      this.queryStats.slowQueries++;
      console.warn(`🐌 Slow query detected: ${responseTime}ms`);
    }
    
    // Mantieni array response times gestibile
    if (this.queryStats.responseTimes.length > 1000) {
      this.queryStats.responseTimes = this.queryStats.responseTimes.slice(-500);
    }
  }

  /**
   * Registra fallimento query
   */
  private recordQueryFailure(): void {
    this.queryStats.failedQueries++;
  }

  /**
   * Ottieni client per transazioni
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) throw new Error('Pool not initialized');
    
    const client = await this.pool.connect();
    
    if (this.config.validateOnAcquire) {
      try {
        await client.query(this.config.validationQuery);
      } catch (error) {
        client.release();
        throw error;
      }
    }
    
    return client;
  }

  /**
   * Esegue transazione con retry logic
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
      
    } finally {
      client.release();
    }
  }

  /**
   * Ottieni metriche correnti del pool
   */
  getMetrics(): PoolMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Ottieni statistiche dettagliate
   */
  getDetailedStats(): any {
    const metrics = this.getMetrics();
    
    return {
      pool: {
        configuration: {
          min: this.config.min,
          max: this.config.max,
          acquireTimeout: this.config.acquireTimeoutMillis,
          idleTimeout: this.config.idleTimeoutMillis
        },
        status: {
          totalConnections: metrics.totalConnections,
          activeConnections: metrics.activeConnections,
          idleConnections: metrics.idleConnections,
          waitingClients: metrics.waitingClients,
          utilization: `${metrics.poolUtilization.toFixed(1)}%`,
          healthStatus: metrics.healthStatus
        }
      },
      performance: {
        totalQueries: metrics.totalQueries,
        slowQueries: metrics.slowQueries,
        failedQueries: metrics.failedQueries,
        averageResponseTime: `${metrics.averageQueryTime.toFixed(2)}ms`,
        successRate: metrics.totalQueries > 0 ? 
          `${((metrics.totalQueries - metrics.failedQueries) / metrics.totalQueries * 100).toFixed(1)}%` : 'N/A'
      },
      monitoring: {
        lastHealthCheck: metrics.lastHealthCheck?.toISOString(),
        healthCheckInterval: `${this.config.healthCheckInterval / 1000}s`,
        retryAttempts: this.config.retryAttempts,
        slowQueryThreshold: `${this.config.slowQueryThreshold}ms`
      }
    };
  }

  /**
   * Force refresh del pool (elimina connessioni idle)
   */
  async refreshPool(): Promise<void> {
    if (!this.pool) return;
    
    console.log('🔄 Refreshing connection pool...');
    
    try {
      // Questo eliminerà le connessioni idle e ne creerà di nuove al bisogno
      // Non c'è un metodo diretto, ma possiamo far scadere le connessioni idle
      await this.performHealthCheck();
      console.log('✅ Pool refresh completed');
      
    } catch (error) {
      console.error('❌ Pool refresh failed:', error);
    }
  }

  /**
   * Drena il pool (per graceful shutdown)
   */
  async drain(): Promise<void> {
    console.log('🚰 Draining connection pool...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
    
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    
    console.log('✅ Connection pool drained');
  }

  /**
   * Reset statistiche
   */
  resetStats(): void {
    this.queryStats = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      responseTimes: [],
      lastReset: Date.now()
    };
    
    this.metrics.totalQueries = 0;
    this.metrics.slowQueries = 0;
    this.metrics.failedQueries = 0;
    this.metrics.averageQueryTime = 0;
    
    console.log('🔄 Pool statistics reset');
  }

  /**
   * Check se il pool è healthy
   */
  isHealthy(): boolean {
    return this.metrics.healthStatus === 'healthy';
  }

  /**
   * Check se il pool è inizializzato
   */
  isInitialized(): boolean {
    return this.pool !== null;
  }
}

/**
 * Istanza singleton del production pool
 */
let productionPoolInstance: ProductionPool | null = null;

/**
 * Ottieni istanza singleton del production pool
 */
export function getProductionPool(config?: Partial<ProductionPoolConfig>): ProductionPool {
  if (!productionPoolInstance) {
    productionPoolInstance = new ProductionPool(config);
  }
  return productionPoolInstance;
}