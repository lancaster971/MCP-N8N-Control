/**
 * Settings Manager - Sistema robusto per gestione configurazioni
 * 
 * Features:
 * - Encryption automatico per settings sensibili
 * - Audit trail completo per modifiche
 * - Cache intelligente per performance
 * - Type-safe configuration access
 * - Environment-based overrides
 */

import crypto from 'crypto';
import { DatabaseConnection } from '../database/connection.js';

export interface SettingValue {
  key: string;
  value: any;
  category: 'connection' | 'security' | 'frontend' | 'backend' | 'general';
  description?: string;
  isEncrypted: boolean;
  isPublic: boolean;
}

export interface FrontendConfig {
  backendUrl: string;
  connectionTimeout: number;
  retryAttempts: number;
  features: Record<string, boolean>;
  apiKeyId?: string;
}

/**
 * Manager per gestione configurazioni di sistema
 */
export class SettingsManager {
  private db: DatabaseConnection;
  private encryptionKey: string;
  private cache: Map<string, SettingValue> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minuti

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.encryptionKey = process.env.SETTINGS_ENCRYPTION_KEY || 
                        process.env.JWT_SECRET || 
                        crypto.randomBytes(32).toString('hex');
  }

  /**
   * Ottieni setting singolo con cache
   */
  async getSetting(key: string): Promise<SettingValue | null> {
    // Check cache first
    if (this.isCacheValid(key)) {
      return this.cache.get(key) || null;
    }

    try {
      const record = await this.db.getOne(`
        SELECT setting_key, setting_value, category, description, is_encrypted, is_public
        FROM system_settings 
        WHERE setting_key = $1
      `, [key]);

      if (!record) return null;

      let value = record.setting_value;
      
      // Decrypt se necessario
      if (record.is_encrypted) {
        try {
          value = JSON.parse(this.decryptValue(value));
        } catch (error) {
          console.error(`Errore decryption setting ${key}:`, error);
          return null;
        }
      }

      const setting: SettingValue = {
        key: record.setting_key,
        value,
        category: record.category,
        description: record.description,
        isEncrypted: record.is_encrypted,
        isPublic: record.is_public
      };

      // Cache result
      this.cache.set(key, setting);
      this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);

      return setting;
    } catch (error) {
      console.error(`Errore recupero setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Ottieni multipli settings per categoria
   */
  async getSettingsByCategory(category: string, publicOnly = false): Promise<SettingValue[]> {
    try {
      const query = `
        SELECT setting_key, setting_value, category, description, is_encrypted, is_public
        FROM system_settings 
        WHERE category = $1 ${publicOnly ? 'AND is_public = true' : ''}
        ORDER BY setting_key
      `;

      const records = await this.db.query(query, [category]);
      const settings: SettingValue[] = [];

      for (const record of records.rows) {
        let value = record.setting_value;
        
        if (record.is_encrypted) {
          try {
            value = JSON.parse(this.decryptValue(value));
          } catch (error) {
            console.error(`Errore decryption setting ${record.setting_key}:`, error);
            continue;
          }
        }

        const setting: SettingValue = {
          key: record.setting_key,
          value,
          category: record.category,
          description: record.description,
          isEncrypted: record.is_encrypted,
          isPublic: record.is_public
        };

        settings.push(setting);
        
        // Cache anche i singoli settings
        this.cache.set(record.setting_key, setting);
        this.cacheExpiry.set(record.setting_key, Date.now() + this.CACHE_TTL);
      }

      return settings;
    } catch (error) {
      console.error(`Errore recupero settings categoria ${category}:`, error);
      return [];
    }
  }

  /**
   * Aggiorna setting esistente o crea nuovo
   */
  async setSetting(
    key: string, 
    value: any, 
    category: string = 'general',
    description?: string,
    isEncrypted = false,
    isPublic = false,
    updatedBy?: string
  ): Promise<boolean> {
    try {
      // Audit log - valore precedente
      const oldSetting = await this.getSetting(key);
      
      let storedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Encrypt se richiesto
      if (isEncrypted) {
        storedValue = this.encryptValue(storedValue);
      }

      // Upsert nel database
      await this.db.query(`
        INSERT INTO system_settings (
          setting_key, setting_value, category, description, is_encrypted, is_public, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          is_encrypted = EXCLUDED.is_encrypted,
          is_public = EXCLUDED.is_public,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = EXCLUDED.updated_by
      `, [key, storedValue, category, description, isEncrypted, isPublic, updatedBy]);

      // Audit trail
      await this.logSettingChange(
        key, 
        oldSetting ? 'UPDATE' : 'CREATE', 
        oldSetting?.value, 
        value, 
        updatedBy
      );

      // Invalida cache
      this.cache.delete(key);
      this.cacheExpiry.delete(key);

      return true;
    } catch (error) {
      console.error(`Errore aggiornamento setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Elimina setting
   */
  async deleteSetting(key: string, deletedBy?: string): Promise<boolean> {
    try {
      const oldSetting = await this.getSetting(key);
      
      const result = await this.db.query(`
        DELETE FROM system_settings WHERE setting_key = $1
      `, [key]);

      if ((result.rowCount || 0) > 0) {
        await this.logSettingChange(key, 'DELETE', oldSetting?.value, null, deletedBy);
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(`Errore eliminazione setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Ottieni configurazione frontend completa
   */
  async getFrontendConfig(): Promise<FrontendConfig> {
    const settings = await this.getSettingsByCategory('frontend', true);
    
    const config: FrontendConfig = {
      backendUrl: 'http://localhost:3001',
      connectionTimeout: 5000,
      retryAttempts: 3,
      features: {}
    };

    for (const setting of settings) {
      switch (setting.key) {
        case 'frontend.default_backend_url':
          config.backendUrl = setting.value;
          break;
        case 'frontend.connection_timeout':
          config.connectionTimeout = parseInt(setting.value);
          break;
        case 'frontend.retry_attempts':
          config.retryAttempts = parseInt(setting.value);
          break;
        case 'frontend.features':
          config.features = setting.value || {};
          break;
      }
    }

    return config;
  }

  /**
   * Aggiorna configurazione frontend
   */
  async updateFrontendConfig(config: Partial<FrontendConfig>, updatedBy?: string): Promise<boolean> {
    try {
      const promises: Promise<boolean>[] = [];

      if (config.backendUrl !== undefined) {
        promises.push(this.setSetting(
          'frontend.default_backend_url', 
          config.backendUrl, 
          'frontend', 
          'URL backend di default per frontend remoto',
          false,
          true,
          updatedBy
        ));
      }

      if (config.connectionTimeout !== undefined) {
        promises.push(this.setSetting(
          'frontend.connection_timeout', 
          config.connectionTimeout, 
          'frontend',
          'Timeout connessione in millisecondi',
          false,
          true,
          updatedBy
        ));
      }

      if (config.retryAttempts !== undefined) {
        promises.push(this.setSetting(
          'frontend.retry_attempts', 
          config.retryAttempts, 
          'frontend',
          'Numero tentativi di retry',
          false,
          true,
          updatedBy
        ));
      }

      if (config.features !== undefined) {
        promises.push(this.setSetting(
          'frontend.features', 
          config.features, 
          'frontend',
          'Feature flags per frontend',
          false,
          true,
          updatedBy
        ));
      }

      const results = await Promise.all(promises);
      return results.every(r => r === true);
    } catch (error) {
      console.error('Errore aggiornamento configurazione frontend:', error);
      return false;
    }
  }

  /**
   * Test connettività a backend URL
   */
  async testBackendConnectivity(url: string, timeout = 5000): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(timeout),
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return { success: true, responseTime };
      } else {
        return { 
          success: false, 
          responseTime, 
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return { 
        success: false, 
        responseTime, 
        error: error?.message || 'Errore sconosciuto'
      };
    }
  }

  /**
   * Pulisci cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // === PRIVATE METHODS ===

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry !== undefined && Date.now() < expiry && this.cache.has(key);
  }

  private encryptValue(value: string): string {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptValue(encryptedValue: string): string {
    const algorithm = 'aes-256-cbc';
    const parts = encryptedValue.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Formato encrypted value non valido');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async logSettingChange(
    settingKey: string, 
    action: string, 
    oldValue: any, 
    newValue: any, 
    userId?: string
  ): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO settings_audit_log (setting_key, action, old_value, new_value, user_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        settingKey, 
        action, 
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        userId
      ]);
    } catch (error) {
      console.error('Errore logging audit trail:', error);
    }
  }
}

// Singleton instance
let settingsManagerInstance: SettingsManager | null = null;

export function getSettingsManager(): SettingsManager {
  if (!settingsManagerInstance) {
    settingsManagerInstance = new SettingsManager();
  }
  return settingsManagerInstance;
}