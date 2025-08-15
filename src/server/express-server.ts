/**
 * Express Server
 * 
 * Server REST API per controllo multi-tenant scheduler
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import schedulerController from '../api/scheduler-controller.js';
import authController from '../api/auth-controller.js';
import healthController from '../api/health-controller.js';
import backupController from '../api/backup-controller.js';
import tenantStatsRouter from '../api/tenant-stats.js';
import securityRoutes from '../api/security-routes.js';
import aiAgentsController from '../api/ai-agents-controller.js';
import executionImportRoutes from '../api/execution-import-routes.js';
import executionEnrichmentRoutes from '../api/execution-enrichment-routes.js';
import productionController from '../api/production-controller.js';
import { DatabaseConnection } from '../database/connection.js';
import { setupSwagger } from '../api/swagger-config.js';
import { EnvConfig } from '../config/environment.js';
import { getAuthService } from '../auth/jwt-auth.js';
import { logTenantMode } from '../config/tenant-config.js';

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  enableHelmet: boolean;
}

export const defaultServerConfig: ServerConfig = {
  port: parseInt(process.env.API_PORT || '3001'),
  host: process.env.API_HOST || '0.0.0.0',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minuti
  rateLimitMaxRequests: 100, // max 100 richieste per finestra
  enableHelmet: process.env.NODE_ENV === 'production'
};

/**
 * Server Express per API REST
 */
export class ExpressServer {
  private app: express.Application;
  private config: ServerConfig;
  private server: any = null;
  private db: DatabaseConnection;
  private authService: any;

  constructor(config?: Partial<ServerConfig>) {
    this.config = { ...defaultServerConfig, ...config };
    this.app = express();
    this.db = DatabaseConnection.getInstance();
    this.authService = getAuthService();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  /**
   * Configura middleware
   */
  private setupMiddleware(): void {
    // Security headers (SEMPRE ABILITATO)
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false // Disabilita COEP per compatibilità frontend
    }));

    // CORS - PERMETTI TUTTO IN DEVELOPMENT
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? this.config.corsOrigins 
        : true,  // Accetta TUTTO in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Webhook-Secret']
    }));

    // Rate limiting SEMPRE ATTIVO (più permissivo in dev)
    const limiter = rateLimit({
      windowMs: this.config.rateLimitWindowMs,
      max: process.env.NODE_ENV === 'production' 
        ? this.config.rateLimitMaxRequests 
        : this.config.rateLimitMaxRequests * 3, // 3x più permissivo in dev
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded, try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    
    // Rate limit su tutte le API (escluso health checks)
    this.app.use('/api/', limiter);
    this.app.use('/auth/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging con auth info
    this.app.use((req, res, next) => {
      const authHeader = req.headers['authorization'];
      const apiKey = req.headers['x-api-key'];
      const hasAuth = authHeader || apiKey ? '🔒' : '🔓';
      console.log(`${new Date().toISOString()} ${hasAuth} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configura routes
   */
  private setupRoutes(): void {
    // 🔓 PUBLIC ROUTES (nessuna autenticazione richiesta)
    
    // Health check (SEMPRE PUBLIC)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        auth: 'enabled',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Root endpoint (PUBLIC ma informativo)
    this.app.get('/', (req, res) => {
      res.json({
        name: 'PilotPro Multi-Tenant Control API',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        security: {
          authentication: 'JWT + API Key required',
          rateLimiting: 'active',
          cors: process.env.NODE_ENV === 'production' ? 'restricted' : 'permissive'
        },
        endpoints: {
          health: '/health (public)',
          auth: '/auth/* (login/register)',
          api: '/api/* (protected)',
          documentation: '/api-docs (public)'
        }
      });
    });

    // Auth routes (PUBLIC - contiene login)
    this.app.use('/auth', authController);

    // Health detail routes (PUBLIC ma limitato)
    this.app.use('/health', healthController);

    // Swagger Documentation (PUBLIC)
    setupSwagger(this.app);

    // 🔒 PROTECTED API ROUTES (autenticazione richiesta)
    
    // Applica autenticazione JWT/API Key a TUTTI gli endpoint /api/*
    this.app.use('/api/*', this.authService.authenticateToken());

    // API routes PROTETTE
    this.app.use('/api', schedulerController);
    this.app.use('/api', backupController);
    this.app.use('/api', tenantStatsRouter);  // Route per tenant-specific stats
    this.app.use('/api', securityRoutes);     // 🚀 PREMIUM: Security routes  
    this.app.use('/api', aiAgentsController); // 🤖 KILLER FEATURE: AI Agents Transparency
    this.app.use('/api', executionImportRoutes); // 🔄 Import execution data completi (n8n API)
    this.app.use('/api', executionEnrichmentRoutes); // ✨ Enrich execution data dal database
    this.app.use('/api', productionController); // 🏭 TIER 2: Production Stability APIs

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
        hint: 'Protected endpoints require Authorization header or X-API-Key'
      });
    });
  }

  /**
   * Configura error handlers
   */
  private setupErrorHandlers(): void {
    // Global error handler con logging avanzato
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const timestamp = new Date().toISOString();
      const statusCode = error.statusCode || error.status || 500;
      const isAuthError = statusCode === 401 || statusCode === 403;
      
      // Log dettagliato per troubleshooting
      console.error(`${timestamp} ❌ API ERROR:`, {
        url: req.url,
        method: req.method,
        status: statusCode,
        error: error.name,
        message: error.message,
        hasAuth: !!(req.headers['authorization'] || req.headers['x-api-key']),
        userAgent: req.get('User-Agent')
      });

      // Response JSON strutturata
      const errorResponse: any = {
        error: error.name || (isAuthError ? 'Authentication Error' : 'Internal Server Error'),
        message: error.message || 'Something went wrong',
        timestamp,
        path: req.path,
        method: req.method
      };

      // Aggiungi info per auth errors
      if (isAuthError) {
        errorResponse.hint = 'Add Authorization: Bearer <token> or X-API-Key: <key> header';
      }

      // Stack trace solo in development
      if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
        errorResponse.stack = error.stack;
      }

      res.status(statusCode).json(errorResponse);
    });

    // Unhandled promise rejection con più dettagli
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 UNHANDLED PROMISE REJECTION:', {
        timestamp: new Date().toISOString(),
        reason,
        promise
      });
      // Non terminare il processo per promise rejection
    });

    // Uncaught exception - termina processo
    process.on('uncaughtException', (error) => {
      console.error('💀 UNCAUGHT EXCEPTION:', {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
      // Graceful shutdown
      this.stop().finally(() => {
        process.exit(1);
      });
    });

    // SIGTERM - Graceful shutdown per Docker/PM2
    process.on('SIGTERM', () => {
      console.log('📛 SIGTERM received, shutting down gracefully...');
      this.handleShutdown('SIGTERM');
    });
  }

  /**
   * Avvia server
   */
  async start(): Promise<void> {
    try {
      // Inizializza database
      await this.db.connect();
      console.log('✅ Database connection established');

      // Avvia server HTTP
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        console.log('🚀 EXPRESS API SERVER STARTED - SECURITY ENABLED');
        console.log('='.repeat(50));
        console.log(`📡 Host: ${this.config.host}:${this.config.port}`);
        console.log(`🌐 CORS: ${process.env.NODE_ENV === 'production' ? 'restricted' : 'permissive'}`);
        console.log(`🛡️ Rate Limit: ${this.config.rateLimitMaxRequests}${process.env.NODE_ENV !== 'production' ? ' x3' : ''} req/${this.config.rateLimitWindowMs/1000/60}min`);
        console.log(`🔒 Security Headers: ALWAYS ENABLED`);
        console.log(`🔐 Authentication: JWT + API Key REQUIRED on /api/*`);
        console.log('');
        logTenantMode();
        console.log('='.repeat(50));
        console.log('🔓 PUBLIC ENDPOINTS:');
        console.log(`  GET  ${this.config.host}:${this.config.port}/ (info)`);
        console.log(`  GET  ${this.config.host}:${this.config.port}/health (health check)`);
        console.log(`  POST ${this.config.host}:${this.config.port}/auth/login (login)`);
        console.log(`  POST ${this.config.host}:${this.config.port}/auth/register (admin only)`);
        console.log(`  📚   ${this.config.host}:${this.config.port}/api-docs (Swagger UI)`);
        console.log('');
        console.log('🔒 PROTECTED ENDPOINTS (require auth):');
        console.log(`  GET  ${this.config.host}:${this.config.port}/api/scheduler/status`);
        console.log(`  POST ${this.config.host}:${this.config.port}/api/scheduler/sync`);
        console.log(`  GET  ${this.config.host}:${this.config.port}/api/workflows`);
        console.log(`  GET  ${this.config.host}:${this.config.port}/api/executions`);
        console.log(`  GET  ${this.config.host}:${this.config.port}/api/stats`);
        console.log('');
        console.log('🔑 DEFAULT ADMIN CREDENTIALS:');
        console.log('   Email: admin@n8n-mcp.local');
        console.log('   Password: admin123');
        console.log('='.repeat(50));
      });

      // Gestione shutdown graceful
      process.on('SIGINT', this.handleShutdown.bind(this));
      process.on('SIGTERM', this.handleShutdown.bind(this));

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Ferma server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      console.log('🛑 Stopping Express server...');
      
      this.server.close(async (error: any) => {
        if (error) {
          console.error('❌ Error stopping server:', error);
          reject(error);
          return;
        }

        try {
          await this.db.disconnect();
          console.log('✅ Express server stopped gracefully');
          resolve();
        } catch (dbError) {
          console.error('❌ Error disconnecting database:', dbError);
          reject(dbError);
        }
      });
    });
  }

  /**
   * Gestisce shutdown graceful
   */
  private async handleShutdown(signal: string): Promise<void> {
    console.log(`\n📛 Received ${signal}, starting graceful shutdown...`);
    
    try {
      await this.stop();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Ottieni istanza Express app
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Ottieni configurazione server
   */
  getConfig(): ServerConfig {
    return { ...this.config };
  }
}

/**
 * Istanza singleton del server
 */
let serverInstance: ExpressServer | null = null;

/**
 * Ottieni istanza singleton del server
 */
export function getExpressServer(config?: Partial<ServerConfig>): ExpressServer {
  if (!serverInstance) {
    serverInstance = new ExpressServer(config);
  }
  return serverInstance;
}

/**
 * Entry point per avvio standalone del server
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Express API Server in standalone mode...');
  
  const server = getExpressServer();
  
  server.start().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}