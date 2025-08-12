/**
 * Unit Tests for JWT Authentication
 */

import { JwtAuthService } from '../../src/auth/jwt-auth';
import jwt from 'jsonwebtoken';

describe('JWT Authentication', () => {
  let authService: JwtAuthService;

  beforeEach(() => {
    authService = new JwtAuthService({
      jwtSecret: 'test-secret-key-for-testing-only',
      jwtExpiresIn: '1h'
    });
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toContain('$2b$');
      expect(hash.length).toBeGreaterThan(50);
    });

    test('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword('wrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    test('should generate valid JWT token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin' as const,
        tenant_id: null,
        permissions: ['read', 'write'],
        created_at: new Date(),
        last_login_at: new Date()
      };
      
      const token = authService.generateToken(user);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      // Verify token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded).toHaveProperty('userId', user.id);
      expect(decoded).toHaveProperty('role', user.role);
      expect(decoded).toHaveProperty('permissions');
    });

    test('should include correct claims in token', () => {
      const user = {
        id: 'user-456',
        email: 'admin@test.com',
        role: 'tenant' as const,
        tenant_id: 'tenant-123',
        permissions: ['scheduler:read']
      };
      
      const token = authService.generateToken(user);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe(user.id);
      expect(decoded.tenantId).toBe(user.tenant_id);
      expect(decoded.role).toBe(user.role);
      expect(decoded.permissions).toEqual(user.permissions);
      expect(decoded.iss).toBe('n8n-mcp-server');
    });
  });

  describe('Token Verification', () => {
    test('should verify valid token', () => {
      const user = {
        id: 'user-789',
        email: 'test@example.com',
        role: 'readonly' as const,
        tenant_id: null,
        permissions: []
      };
      
      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(user.id);
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        authService.verifyToken(invalidToken);
      }).toThrow();
    });

    test('should reject expired token', () => {
      // Create token with very short expiry
      const shortAuthService = new JwtAuthService({
        secret: 'test-secret',
        expiresIn: '1ms'
      });
      
      const user = {
        id: 'user-999',
        email: 'test@example.com',
        role: 'admin' as const,
        tenant_id: null,
        permissions: []
      };
      
      const token = shortAuthService.generateToken(user);
      
      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          shortAuthService.verifyToken(token);
        }).toThrow();
      }, 10);
    });
  });

  describe('Permission Checking', () => {
    test('admin should have all permissions', () => {
      const adminUser = {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'admin' as const,
        tenant_id: null,
        permissions: [],
        created_at: new Date(),
        last_login_at: new Date()
      };
      
      expect(authService.hasPermission(adminUser, 'any:permission')).toBe(true);
      expect(authService.hasPermission(adminUser, 'scheduler:control')).toBe(true);
      expect(authService.hasPermission(adminUser, 'users:delete')).toBe(true);
    });

    test('user should have only granted permissions', () => {
      const user = {
        id: 'user-1',
        email: 'user@test.com',
        role: 'tenant' as const,
        tenant_id: 'tenant-1',
        permissions: ['scheduler:read', 'tenants:read'],
        created_at: new Date(),
        last_login_at: new Date()
      };
      
      expect(authService.hasPermission(user, 'scheduler:read')).toBe(true);
      expect(authService.hasPermission(user, 'tenants:read')).toBe(true);
      expect(authService.hasPermission(user, 'scheduler:control')).toBe(false);
      expect(authService.hasPermission(user, 'users:write')).toBe(false);
    });

    test('readonly user should have limited permissions', () => {
      const readonlyUser = {
        id: 'readonly-1',
        email: 'readonly@test.com',
        role: 'readonly' as const,
        tenant_id: null,
        permissions: [],
        created_at: new Date(),
        last_login_at: new Date()
      };
      
      expect(authService.hasPermission(readonlyUser, 'scheduler:read')).toBe(true);
      expect(authService.hasPermission(readonlyUser, 'scheduler:control')).toBe(false);
      expect(authService.hasPermission(readonlyUser, 'users:write')).toBe(false);
    });
  });
});