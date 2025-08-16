/**
 * API Key Manager - Sistema robusto per gestione API Keys
 * 
 * Features:
 * - Generazione API keys con TTL configurabile
 * - Encryption/Decryption automatico
 * - Rate limiting generazione
 * - Audit trail completo
 * - Permissions & Scopes management
 */

import crypto from 'crypto';
import { DatabaseConnection } from '../database/connection.js';

export interface ApiKeyConfig {
  name: string;
  type: 'frontend-read' | 'frontend-full' | 'frontend-limited' | 'backend-service' | 'admin-full';
  permissions: string[];
  scopes: string[];
  tenantId?: string;
  expiresInSeconds?: number; // TTL in secondi
}

export interface ApiKeyInfo {
  id: string;
  keyName: string;
  keyPrefix: string;
  keyType: string;
  permissions: string[];
  scopes: string[];
  tenantId?: string;
  createdBy: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ApiKeyValidation {
  isValid: boolean;
  keyInfo?: ApiKeyInfo;
  reason?: string;
}

/**
 * Manager per API Keys con sicurezza enterprise
 */
export class ApiKeyManager {
  private db: DatabaseConnection;
  private encryptionKey: string;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    // Usa JWT_SECRET come chiave di encryption (o genera una dedicata)
    this.encryptionKey = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera una nuova API key con configurazione specifica
   */
  async generateApiKey(config: ApiKeyConfig, createdBy: string): Promise<{ apiKey: string; keyInfo: ApiKeyInfo }> {
    // Verifica rate limiting
    await this.checkRateLimit(createdBy);

    // Genera API key sicura
    const keyPrefix = this.getKeyPrefix(config.type);
    const keyBody = crypto.randomBytes(32).toString('hex');
    const fullApiKey = `${keyPrefix}${keyBody}`;

    // Calcola scadenza
    const defaultTtl = await this.getDefaultTtl();
    const expiresAt = config.expiresInSeconds 
      ? new Date(Date.now() + config.expiresInSeconds * 1000)
      : new Date(Date.now() + defaultTtl * 1000);

    // Encrypta la chiave per storage
    const encryptedKey = this.encryptApiKey(fullApiKey);

    try {
      // Inserisci nel database
      const result = await this.db.getOne(`
        INSERT INTO api_keys (
          key_name, api_key, key_prefix, key_type, permissions, scopes,
          tenant_id, created_by, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [
        config.name,
        encryptedKey,
        keyPrefix,
        config.type,
        JSON.stringify(config.permissions),
        JSON.stringify(config.scopes),
        config.tenantId || null,
        createdBy,
        expiresAt
      ]);

      // Audit log
      await this.logApiKeyAction('CREATE', result.id, createdBy);

      const keyInfo: ApiKeyInfo = {
        id: result.id,
        keyName: config.name,
        keyPrefix,
        keyType: config.type,
        permissions: config.permissions,
        scopes: config.scopes,
        tenantId: config.tenantId,
        createdBy,
        expiresAt,
        lastUsedAt: undefined,
        usageCount: 0,
        isActive: true,
        createdAt: result.created_at
      };

      return {
        apiKey: fullApiKey,
        keyInfo
      };

    } catch (error: any) {
      throw new Error(`Errore generazione API key: ${error?.message || 'Errore sconosciuto'}`);
    }
  }

  /**
   * Valida un'API key e restituisce informazioni associate
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      const keyPrefix = this.extractPrefix(apiKey);
      const encryptedKey = this.encryptApiKey(apiKey);

      const keyRecord = await this.db.getOne(`
        SELECT 
          id, key_name, key_prefix, key_type, permissions, scopes,
          tenant_id, created_by, expires_at, last_used_at, usage_count,
          is_active, created_at
        FROM api_keys 
        WHERE api_key = $1 AND key_prefix = $2 AND is_active = true
      `, [encryptedKey, keyPrefix]);

      if (!keyRecord) {
        return { isValid: false, reason: 'API key non trovata o non attiva' };
      }

      // Verifica scadenza
      if (keyRecord.expires_at && new Date() > new Date(keyRecord.expires_at)) {
        return { isValid: false, reason: 'API key scaduta' };
      }

      // Aggiorna ultimo utilizzo
      await this.updateLastUsed(keyRecord.id);

      const keyInfo: ApiKeyInfo = {
        id: keyRecord.id,
        keyName: keyRecord.key_name,
        keyPrefix: keyRecord.key_prefix,
        keyType: keyRecord.key_type,
        permissions: keyRecord.permissions,
        scopes: keyRecord.scopes,
        tenantId: keyRecord.tenant_id,
        createdBy: keyRecord.created_by,
        expiresAt: keyRecord.expires_at ? new Date(keyRecord.expires_at) : undefined,
        lastUsedAt: keyRecord.last_used_at ? new Date(keyRecord.last_used_at) : undefined,
        usageCount: keyRecord.usage_count,
        isActive: keyRecord.is_active,
        createdAt: new Date(keyRecord.created_at)
      };

      return { isValid: true, keyInfo };

    } catch (error: any) {
      return { isValid: false, reason: `Errore validazione: ${error?.message || 'Errore sconosciuto'}` };
    }
  }

  /**
   * Lista API keys per utente
   */
  async listApiKeys(userId: string, includeInactive = false): Promise<ApiKeyInfo[]> {
    const query = `
      SELECT 
        id, key_name, key_prefix, key_type, permissions, scopes,
        tenant_id, created_by, expires_at, last_used_at, usage_count,
        is_active, created_at
      FROM api_keys 
      WHERE created_by = $1 ${includeInactive ? '' : 'AND is_active = true'}
      ORDER BY created_at DESC
    `;

    const records = await this.db.query(query, [userId]);
    
    return records.rows.map(record => ({
      id: record.id,
      keyName: record.key_name,
      keyPrefix: record.key_prefix,
      keyType: record.key_type,
      permissions: record.permissions,
      scopes: record.scopes,
      tenantId: record.tenant_id,
      createdBy: record.created_by,
      expiresAt: record.expires_at ? new Date(record.expires_at) : undefined,
      lastUsedAt: record.last_used_at ? new Date(record.last_used_at) : undefined,
      usageCount: record.usage_count,
      isActive: record.is_active,
      createdAt: new Date(record.created_at)
    }));
  }

  /**
   * Revoca un'API key
   */
  async revokeApiKey(keyId: string, revokedBy: string): Promise<boolean> {
    try {
      const result = await this.db.query(`
        UPDATE api_keys 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = true
      `, [keyId]);

      if ((result.rowCount || 0) > 0) {
        await this.logApiKeyAction('REVOKE', keyId, revokedBy);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(`Errore revoca API key: ${error?.message || 'Errore sconosciuto'}`);
    }
  }

  /**
   * Rinnova scadenza API key
   */
  async renewApiKey(keyId: string, expiresInSeconds: number, renewedBy: string): Promise<boolean> {
    try {
      const newExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
      
      const result = await this.db.query(`
        UPDATE api_keys 
        SET expires_at = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND is_active = true
      `, [newExpiresAt, keyId]);

      if ((result.rowCount || 0) > 0) {
        await this.logApiKeyAction('RENEW', keyId, renewedBy);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(`Errore rinnovo API key: ${error?.message || 'Errore sconosciuto'}`);
    }
  }

  /**
   * Cleanup API keys scadute
   */
  async cleanupExpiredKeys(): Promise<number> {
    const result = await this.db.query(`
      UPDATE api_keys 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true
    `);

    return result.rowCount || 0;
  }

  // === PRIVATE METHODS ===

  private getKeyPrefix(keyType: string): string {
    const prefixes: Record<string, string> = {
      'frontend-read': 'fr_',
      'frontend-full': 'ff_',
      'frontend-limited': 'fl_',
      'backend-service': 'bs_',
      'admin-full': 'pk_'
    };
    return prefixes[keyType] || 'gk_'; // generic key
  }

  private extractPrefix(apiKey: string): string {
    const match = apiKey.match(/^([a-z]{2}_)/);
    return match ? match[1] : '';
  }

  private encryptApiKey(apiKey: string): string {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(this.encryptionKey, 'salt', 32), iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private async getDefaultTtl(): Promise<number> {
    try {
      const setting = await this.db.getOne(`
        SELECT setting_value 
        FROM system_settings 
        WHERE setting_key = 'security.api_key_default_ttl'
      `);
      return parseInt(setting?.setting_value || '86400'); // 24h default
    } catch {
      return 86400; // fallback 24h
    }
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const rateLimitSetting = await this.db.getOne(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'security.rate_limit_api_key_generation'
    `);
    
    const maxKeysPerHour = parseInt(rateLimitSetting?.setting_value || '5');
    
    const recentKeys = await this.db.getOne(`
      SELECT COUNT(*) as count
      FROM api_keys 
      WHERE created_by = $1 
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
    `, [userId]);

    if (parseInt(recentKeys.count) >= maxKeysPerHour) {
      throw new Error(`Rate limit raggiunto: massimo ${maxKeysPerHour} API keys per ora`);
    }
  }

  private async updateLastUsed(keyId: string): Promise<void> {
    await this.db.query(`
      UPDATE api_keys 
      SET last_used_at = CURRENT_TIMESTAMP, usage_count = usage_count + 1
      WHERE id = $1
    `, [keyId]);
  }

  private async logApiKeyAction(action: string, keyId: string, userId: string): Promise<void> {
    await this.db.query(`
      INSERT INTO settings_audit_log (setting_key, action, new_value, user_id)
      VALUES ($1, $2, $3, $4)
    `, [`api_key.${keyId}`, action, JSON.stringify({ keyId, timestamp: new Date() }), userId]);
  }
}

// Singleton instance
let apiKeyManagerInstance: ApiKeyManager | null = null;

export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManagerInstance) {
    apiKeyManagerInstance = new ApiKeyManager();
  }
  return apiKeyManagerInstance;
}