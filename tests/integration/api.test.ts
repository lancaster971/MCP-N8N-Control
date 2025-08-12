/**
 * Integration Tests for API Endpoints
 */

import request from 'supertest';
import { ExpressServer } from '../../src/server/express-server';
import { DatabaseConnection } from '../../src/database/connection';
import { getAuthService } from '../../src/auth/jwt-auth';

describe('API Integration Tests', () => {
  let server: ExpressServer;
  let app: any;
  let authToken: string;
  let db: DatabaseConnection;

  beforeAll(async () => {
    // Initialize server
    server = new ExpressServer({
      port: 3002,
      enableHelmet: false
    });
    app = server.getApp();
    
    // Initialize database
    db = DatabaseConnection.getInstance();
    await db.connect();
    
    // Start server
    await server.start();
    
    // Login to get token
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@n8n-mcp.local',
        password: 'admin123'
      });
    
    authToken = response.body.token;
  });

  afterAll(async () => {
    await server.stop();
    await db.disconnect();
  });

  describe('Health Endpoints', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /health/live should return ok', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
    });

    test('GET /health/check should return health check', async () => {
      const response = await request(app)
        .get('/health/check')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('alerts');
    });

    test('GET /health/metrics should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);
      
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
      expect(response.text).toContain('n8n_mcp_health_status');
    });
  });

  describe('Authentication Endpoints', () => {
    test('POST /auth/login with valid credentials should return token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@n8n-mcp.local',
          password: 'admin123'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@n8n-mcp.local');
    });

    test('POST /auth/login with invalid credentials should return 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@n8n-mcp.local',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    test('GET /auth/profile with valid token should return user', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
    });

    test('GET /auth/profile without token should return 401', async () => {
      await request(app)
        .get('/auth/profile')
        .expect(401);
    });
  });

  describe('Scheduler Endpoints', () => {
    test('GET /api/scheduler/status should return scheduler status', async () => {
      const response = await request(app)
        .get('/api/scheduler/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('scheduler');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('system');
    });

    test('POST /api/scheduler/start without auth should return 401', async () => {
      await request(app)
        .post('/api/scheduler/start')
        .expect(401);
    });

    test('POST /api/scheduler/start with auth should work', async () => {
      const response = await request(app)
        .post('/api/scheduler/start')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // Can be 200 if started or 400 if already running
          expect([200, 400]).toContain(res.status);
        });
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('status');
      }
    });
  });

  describe('Tenants Endpoints', () => {
    test('GET /api/tenants should return list of tenants', async () => {
      const response = await request(app)
        .get('/api/tenants')
        .expect(200);
      
      expect(response.body).toHaveProperty('tenants');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.tenants)).toBe(true);
    });

    test('POST /api/tenants should create new tenant', async () => {
      const response = await request(app)
        .post('/api/tenants')
        .send({
          id: 'test-tenant-' + Date.now(),
          name: 'Test Tenant',
          n8n_api_url: 'https://test.n8n.io/api/v1'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'Tenant registered successfully');
      expect(response.body).toHaveProperty('tenant');
    });

    test('POST /api/tenants without required fields should return 400', async () => {
      const response = await request(app)
        .post('/api/tenants')
        .send({
          name: 'Test Tenant'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Backup Endpoints', () => {
    test('GET /api/backup/status with auth should return backup status', async () => {
      const response = await request(app)
        .get('/api/backup/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('isRunning');
      expect(response.body).toHaveProperty('config');
    });

    test('GET /api/backup/list with auth should return backups', async () => {
      const response = await request(app)
        .get('/api/backup/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('backups');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.backups)).toBe(true);
    });

    test('POST /api/backup/create with auth should create backup', async () => {
      const response = await request(app)
        .post('/api/backup/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label: 'test-integration'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('size');
    });
  });

  describe('Stats Endpoints', () => {
    test('GET /api/stats should return system statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('scheduler');
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('system');
    });

    test('GET /api/logs should return sync logs', async () => {
      const response = await request(app)
        .get('/api/logs')
        .expect(200);
      
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    test('Should enforce rate limiting', async () => {
      // Make many requests quickly
      const requests = [];
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app).get('/api/stats')
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      // Should have some rate limited responses
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});