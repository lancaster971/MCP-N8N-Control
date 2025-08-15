/**
 * Alert System - Sistema Alerting Avanzato per Produzione
 * 
 * Sistema completo di alerting con multiple channel di notifica, escalation e deduplicazione
 */

import { DatabaseConnection } from '../database/connection.js';

export interface Alert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical' | 'emergency';
  category: 'system' | 'database' | 'performance' | 'business' | 'security';
  source: string;
  title: string;
  message: string;
  metadata?: any;
  
  // Alert lifecycle
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  
  // Escalation
  escalationLevel: number;
  escalatedAt?: string;
  nextEscalationAt?: string;
  
  // Notification tracking
  notificationsSent: NotificationLog[];
  suppressedUntil?: string;
}

export interface NotificationLog {
  timestamp: string;
  channel: string;
  recipient: string;
  status: 'sent' | 'failed' | 'delivered';
  error?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: AlertCondition;
  severity: Alert['level'];
  category: Alert['category'] | 'all';
  
  // Notification settings
  channels: NotificationChannel[];
  escalationRules: EscalationRule[];
  
  // Suppression
  suppressionRules: SuppressionRule[];
  cooldownMinutes: number;
}

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '=' | '!=' | 'contains' | 'not_contains';
  threshold: number | string;
  timeWindow?: number; // minuti
  minOccurrences?: number;
}

export interface NotificationChannel {
  id: string;
  type: 'console' | 'webhook' | 'email' | 'slack' | 'teams';
  name: string;
  enabled: boolean;
  config: any;
  
  // Channel-specific settings
  filters?: {
    levels?: Alert['level'][];
    categories?: Alert['category'][];
    sources?: string[];
  };
}

export interface EscalationRule {
  level: number;
  delayMinutes: number;
  channels: string[]; // Channel IDs
  condition?: 'unacknowledged' | 'unresolved';
}

export interface SuppressionRule {
  condition: AlertCondition;
  durationMinutes: number;
  reason: string;
}

export interface AlertSystemConfig {
  enabled: boolean;
  defaultChannels: string[];
  escalationEnabled: boolean;
  deduplicationWindow: number; // minuti
  maxAlertsPerHour: number;
  retentionDays: number;
}

const defaultAlertConfig: AlertSystemConfig = {
  enabled: process.env.NODE_ENV === 'production',
  defaultChannels: ['console'],
  escalationEnabled: true,
  deduplicationWindow: 10, // 10 minuti
  maxAlertsPerHour: 50,
  retentionDays: 30
};

/**
 * Sistema di alerting enterprise
 */
export class AlertSystem {
  private db: DatabaseConnection;
  private config: AlertSystemConfig;
  private channels: Map<string, NotificationChannel> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private escalationInterval?: NodeJS.Timeout;

  constructor(config?: Partial<AlertSystemConfig>) {
    this.db = DatabaseConnection.getInstance();
    this.config = { ...defaultAlertConfig, ...config };
  }

  /**
   * Inizializza sistema alerting
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⚠️ Alert system disabled in configuration');
      return;
    }

    console.log('🚨 Initializing Alert System...');
    
    // Setup database
    await this.setupAlertTables();
    
    // Carica configurazione
    await this.loadChannels();
    await this.loadRules();
    await this.loadActiveAlerts();
    
    // Setup default channels
    await this.setupDefaultChannels();
    
    // Avvia escalation processing
    this.startEscalationProcessor();
    
    console.log(`✅ Alert System initialized (${this.channels.size} channels, ${this.rules.size} rules)`);
  }

  /**
   * Setup tabelle database per alerting
   */
  private async setupAlertTables(): Promise<void> {
    // Tabella alert
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(255) PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        level VARCHAR(20) NOT NULL,
        category VARCHAR(50) NOT NULL,
        source VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        
        status VARCHAR(20) DEFAULT 'active',
        acknowledged_by VARCHAR(100),
        acknowledged_at TIMESTAMP,
        resolved_at TIMESTAMP,
        
        escalation_level INTEGER DEFAULT 0,
        escalated_at TIMESTAMP,
        next_escalation_at TIMESTAMP,
        
        notifications_sent JSONB DEFAULT '[]'::jsonb,
        suppressed_until TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX (timestamp),
        INDEX (level, status),
        INDEX (category),
        INDEX (status, next_escalation_at)
      );
    `);

    // Tabella notification channels
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS alert_channels (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        config JSONB NOT NULL,
        filters JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabella alert rules
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS alert_rules (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        condition JSONB NOT NULL,
        severity VARCHAR(20) NOT NULL,
        category VARCHAR(50) NOT NULL,
        channels JSONB DEFAULT '[]'::jsonb,
        escalation_rules JSONB DEFAULT '[]'::jsonb,
        suppression_rules JSONB DEFAULT '[]'::jsonb,
        cooldown_minutes INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Setup canali di notifica di default
   */
  private async setupDefaultChannels(): Promise<void> {
    // Console channel (sempre presente)
    const consoleChannel: NotificationChannel = {
      id: 'console',
      type: 'console',
      name: 'Console Logging',
      enabled: true,
      config: {}
    };
    
    await this.addChannel(consoleChannel);

    // Webhook channel per development
    if (process.env.NODE_ENV === 'development') {
      const webhookChannel: NotificationChannel = {
        id: 'dev-webhook',
        type: 'webhook',
        name: 'Development Webhook',
        enabled: true,
        config: {
          url: 'http://localhost:3001/api/alerts/webhook',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        filters: {
          levels: ['critical', 'emergency']
        }
      };
      
      await this.addChannel(webhookChannel);
    }
  }

  /**
   * Carica canali dal database
   */
  private async loadChannels(): Promise<void> {
    try {
      const channels = await this.db.getMany(`
        SELECT * FROM alert_channels WHERE enabled = true
      `);
      
      for (const channelRow of channels) {
        const channel: NotificationChannel = {
          id: channelRow.id,
          type: channelRow.type,
          name: channelRow.name,
          enabled: channelRow.enabled,
          config: JSON.parse(channelRow.config),
          filters: JSON.parse(channelRow.filters || '{}')
        };
        
        this.channels.set(channel.id, channel);
      }
      
    } catch (error) {
      console.error('❌ Error loading alert channels:', error);
    }
  }

  /**
   * Carica regole dal database
   */
  private async loadRules(): Promise<void> {
    try {
      const rules = await this.db.getMany(`
        SELECT * FROM alert_rules WHERE enabled = true
      `);
      
      for (const ruleRow of rules) {
        const rule: AlertRule = {
          id: ruleRow.id,
          name: ruleRow.name,
          enabled: ruleRow.enabled,
          condition: JSON.parse(ruleRow.condition),
          severity: ruleRow.severity,
          category: ruleRow.category,
          channels: JSON.parse(ruleRow.channels || '[]'),
          escalationRules: JSON.parse(ruleRow.escalation_rules || '[]'),
          suppressionRules: JSON.parse(ruleRow.suppression_rules || '[]'),
          cooldownMinutes: ruleRow.cooldown_minutes
        };
        
        this.rules.set(rule.id, rule);
      }
      
    } catch (error) {
      console.error('❌ Error loading alert rules:', error);
    }
  }

  /**
   * Carica alert attivi dal database
   */
  private async loadActiveAlerts(): Promise<void> {
    try {
      const alerts = await this.db.getMany(`
        SELECT * FROM alerts 
        WHERE status IN ('active', 'acknowledged')
        AND (suppressed_until IS NULL OR suppressed_until < CURRENT_TIMESTAMP)
        ORDER BY timestamp DESC
      `);
      
      for (const alertRow of alerts) {
        const alert: Alert = {
          id: alertRow.id,
          timestamp: alertRow.timestamp,
          level: alertRow.level,
          category: alertRow.category,
          source: alertRow.source,
          title: alertRow.title,
          message: alertRow.message,
          metadata: JSON.parse(alertRow.metadata || '{}'),
          
          status: alertRow.status,
          acknowledgedBy: alertRow.acknowledged_by,
          acknowledgedAt: alertRow.acknowledged_at,
          resolvedAt: alertRow.resolved_at,
          
          escalationLevel: alertRow.escalation_level || 0,
          escalatedAt: alertRow.escalated_at,
          nextEscalationAt: alertRow.next_escalation_at,
          
          notificationsSent: JSON.parse(alertRow.notifications_sent || '[]'),
          suppressedUntil: alertRow.suppressed_until
        };
        
        this.activeAlerts.set(alert.id, alert);
      }
      
    } catch (error) {
      console.error('❌ Error loading active alerts:', error);
    }
  }

  /**
   * Crea nuovo alert
   */
  async createAlert(alertData: {
    level: Alert['level'];
    category: Alert['category'];
    source: string;
    title: string;
    message: string;
    metadata?: any;
  }): Promise<Alert> {
    
    // Check se alerting è abilitato
    if (!this.config.enabled) {
      console.log(`⚠️ Alert suppressed (system disabled): ${alertData.title}`);
      return this.createDummyAlert(alertData);
    }

    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check deduplicazione
    const existingAlert = await this.findDuplicateAlert(alertData);
    if (existingAlert) {
      console.log(`🔄 Duplicate alert suppressed: ${alertData.title}`);
      return existingAlert;
    }

    // Check rate limiting
    if (await this.isRateLimited()) {
      console.log(`⚠️ Alert rate limited: ${alertData.title}`);
      return this.createDummyAlert(alertData);
    }

    const alert: Alert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      level: alertData.level,
      category: alertData.category,
      source: alertData.source,
      title: alertData.title,
      message: alertData.message,
      metadata: alertData.metadata || {},
      
      status: 'active',
      escalationLevel: 0,
      notificationsSent: []
    };

    // Salva nel database
    await this.persistAlert(alert);
    
    // Aggiungi agli alert attivi
    this.activeAlerts.set(alert.id, alert);
    
    // Invia notifiche immediate
    await this.sendNotifications(alert);
    
    // Setup escalation se necessario
    await this.scheduleEscalation(alert);
    
    // Log alert
    const emoji = this.getAlertEmoji(alert.level);
    console.log(`${emoji} ALERT [${alert.level.toUpperCase()}] ${alert.source}: ${alert.title}`);
    
    return alert;
  }

  /**
   * Trova alert duplicato
   */
  private async findDuplicateAlert(alertData: any): Promise<Alert | null> {
    const cutoffTime = new Date(Date.now() - this.config.deduplicationWindow * 60 * 1000);
    
    for (const alert of this.activeAlerts.values()) {
      if (
        alert.title === alertData.title &&
        alert.source === alertData.source &&
        alert.status === 'active' &&
        new Date(alert.timestamp) > cutoffTime
      ) {
        return alert;
      }
    }
    
    return null;
  }

  /**
   * Check rate limiting
   */
  private async isRateLimited(): Promise<boolean> {
    try {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const recentAlerts = await this.db.getOne(`
        SELECT COUNT(*) as count 
        FROM alerts 
        WHERE timestamp > $1
      `, [hourAgo.toISOString()]);
      
      return parseInt(recentAlerts.count) >= this.config.maxAlertsPerHour;
      
    } catch (error) {
      console.error('❌ Error checking rate limit:', error);
      return false;
    }
  }

  /**
   * Crea alert dummy per casi soppressi
   */
  private createDummyAlert(alertData: any): Alert {
    return {
      id: `dummy-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: alertData.level,
      category: alertData.category,
      source: alertData.source,
      title: alertData.title,
      message: alertData.message,
      metadata: alertData.metadata || {},
      status: 'suppressed',
      escalationLevel: 0,
      notificationsSent: []
    };
  }

  /**
   * Invia notifiche per alert
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    const channelsToNotify = this.getChannelsForAlert(alert);
    
    for (const channel of channelsToNotify) {
      try {
        await this.sendNotification(alert, channel);
        
        // Log notifica
        const notificationLog: NotificationLog = {
          timestamp: new Date().toISOString(),
          channel: channel.id,
          recipient: channel.name,
          status: 'sent'
        };
        
        alert.notificationsSent.push(notificationLog);
        
      } catch (error) {
        console.error(`❌ Failed to send notification via ${channel.name}:`, error);
        
        const notificationLog: NotificationLog = {
          timestamp: new Date().toISOString(),
          channel: channel.id,
          recipient: channel.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        alert.notificationsSent.push(notificationLog);
      }
    }
    
    // Aggiorna alert con notification logs
    await this.persistAlert(alert);
  }

  /**
   * Ottieni canali per alert specifico
   */
  private getChannelsForAlert(alert: Alert): NotificationChannel[] {
    const channels: NotificationChannel[] = [];
    
    for (const channel of this.channels.values()) {
      if (!channel.enabled) continue;
      
      // Check filtri
      if (channel.filters) {
        if (channel.filters.levels && !channel.filters.levels.includes(alert.level)) {
          continue;
        }
        if (channel.filters.categories && !channel.filters.categories.includes(alert.category)) {
          continue;
        }
        if (channel.filters.sources && !channel.filters.sources.includes(alert.source)) {
          continue;
        }
      }
      
      channels.push(channel);
    }
    
    return channels;
  }

  /**
   * Invia singola notifica
   */
  private async sendNotification(alert: Alert, channel: NotificationChannel): Promise<void> {
    switch (channel.type) {
      case 'console':
        this.sendConsoleNotification(alert, channel);
        break;
        
      case 'webhook':
        await this.sendWebhookNotification(alert, channel);
        break;
        
      // Altri tipi di canale possono essere implementati qui
      default:
        console.warn(`⚠️ Unsupported notification channel type: ${channel.type}`);
    }
  }

  /**
   * Notifica console
   */
  private sendConsoleNotification(alert: Alert, channel: NotificationChannel): void {
    const emoji = this.getAlertEmoji(alert.level);
    const timestamp = new Date(alert.timestamp).toLocaleString();
    
    console.log('');
    console.log('━'.repeat(80));
    console.log(`${emoji} ALERT NOTIFICATION [${alert.level.toUpperCase()}]`);
    console.log('━'.repeat(80));
    console.log(`Time: ${timestamp}`);
    console.log(`Source: ${alert.source}`);
    console.log(`Category: ${alert.category}`);
    console.log(`Title: ${alert.title}`);
    console.log(`Message: ${alert.message}`);
    if (Object.keys(alert.metadata || {}).length > 0) {
      console.log(`Metadata: ${JSON.stringify(alert.metadata, null, 2)}`);
    }
    console.log('━'.repeat(80));
    console.log('');
  }

  /**
   * Notifica webhook
   */
  private async sendWebhookNotification(alert: Alert, channel: NotificationChannel): Promise<void> {
    const payload = {
      alert: {
        id: alert.id,
        timestamp: alert.timestamp,
        level: alert.level,
        category: alert.category,
        source: alert.source,
        title: alert.title,
        message: alert.message,
        metadata: alert.metadata
      },
      system: {
        environment: process.env.NODE_ENV || 'development',
        hostname: process.env.HOSTNAME || 'unknown'
      }
    };

    const response = await fetch(channel.config.url, {
      method: channel.config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...channel.config.headers
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Ottieni emoji per livello alert
   */
  private getAlertEmoji(level: Alert['level']): string {
    switch (level) {
      case 'emergency': return '🚨';
      case 'critical': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  /**
   * Schedule escalation per alert
   */
  private async scheduleEscalation(alert: Alert): Promise<void> {
    if (!this.config.escalationEnabled) return;
    
    // Find escalation rules for this alert
    const applicableRules = Array.from(this.rules.values()).filter(rule => 
      rule.category === alert.category || rule.category === 'all'
    );
    
    for (const rule of applicableRules) {
      if (rule.escalationRules.length > 0) {
        const firstEscalation = rule.escalationRules[0];
        const escalationTime = new Date(Date.now() + firstEscalation.delayMinutes * 60 * 1000);
        
        alert.nextEscalationAt = escalationTime.toISOString();
        await this.persistAlert(alert);
        
        break; // Use first matching rule
      }
    }
  }

  /**
   * Avvia processor escalation
   */
  private startEscalationProcessor(): void {
    this.escalationInterval = setInterval(async () => {
      await this.processEscalations();
    }, 60000); // Check ogni minuto
  }

  /**
   * Processa escalation in sospeso
   */
  private async processEscalations(): Promise<void> {
    const now = new Date();
    
    for (const alert of this.activeAlerts.values()) {
      if (
        alert.status === 'active' &&
        alert.nextEscalationAt &&
        new Date(alert.nextEscalationAt) <= now
      ) {
        await this.escalateAlert(alert);
      }
    }
  }

  /**
   * Escalate alert
   */
  private async escalateAlert(alert: Alert): Promise<void> {
    alert.escalationLevel++;
    alert.escalatedAt = new Date().toISOString();
    alert.nextEscalationAt = undefined;
    
    console.log(`⬆️ Escalating alert ${alert.id} to level ${alert.escalationLevel}`);
    
    // Send escalation notifications
    await this.sendNotifications(alert);
    
    // Schedule next escalation if applicable
    await this.scheduleEscalation(alert);
    
    // Update in database
    await this.persistAlert(alert);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }
    
    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();
    alert.nextEscalationAt = undefined; // Stop escalation
    
    await this.persistAlert(alert);
    
    console.log(`✅ Alert ${alertId} acknowledged by ${acknowledgedBy}`);
  }

  /**
   * Risolvi alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }
    
    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.nextEscalationAt = undefined; // Stop escalation
    
    await this.persistAlert(alert);
    this.activeAlerts.delete(alertId);
    
    console.log(`✅ Alert ${alertId} resolved`);
  }

  /**
   * Salva alert nel database
   */
  private async persistAlert(alert: Alert): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO alerts (
          id, timestamp, level, category, source, title, message, metadata,
          status, acknowledged_by, acknowledged_at, resolved_at,
          escalation_level, escalated_at, next_escalation_at,
          notifications_sent, suppressed_until, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
        ) ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          acknowledged_by = EXCLUDED.acknowledged_by,
          acknowledged_at = EXCLUDED.acknowledged_at,
          resolved_at = EXCLUDED.resolved_at,
          escalation_level = EXCLUDED.escalation_level,
          escalated_at = EXCLUDED.escalated_at,
          next_escalation_at = EXCLUDED.next_escalation_at,
          notifications_sent = EXCLUDED.notifications_sent,
          suppressed_until = EXCLUDED.suppressed_until,
          updated_at = CURRENT_TIMESTAMP
      `, [
        alert.id,
        alert.timestamp,
        alert.level,
        alert.category,
        alert.source,
        alert.title,
        alert.message,
        JSON.stringify(alert.metadata || {}),
        alert.status,
        alert.acknowledgedBy,
        alert.acknowledgedAt,
        alert.resolvedAt,
        alert.escalationLevel,
        alert.escalatedAt,
        alert.nextEscalationAt,
        JSON.stringify(alert.notificationsSent),
        alert.suppressedUntil
      ]);
    } catch (error) {
      console.error('❌ Error persisting alert:', error);
    }
  }

  /**
   * Aggiungi canale di notifica
   */
  async addChannel(channel: NotificationChannel): Promise<void> {
    this.channels.set(channel.id, channel);
    
    try {
      await this.db.query(`
        INSERT INTO alert_channels (id, type, name, enabled, config, filters)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          name = EXCLUDED.name,
          enabled = EXCLUDED.enabled,
          config = EXCLUDED.config,
          filters = EXCLUDED.filters,
          updated_at = CURRENT_TIMESTAMP
      `, [
        channel.id,
        channel.type,
        channel.name,
        channel.enabled,
        JSON.stringify(channel.config),
        JSON.stringify(channel.filters || {})
      ]);
    } catch (error) {
      console.error('❌ Error saving channel:', error);
    }
  }

  /**
   * Ottieni alert attivi
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Ottieni statistiche alerting
   */
  async getAlertStats(): Promise<any> {
    try {
      const stats = await this.db.getOne(`
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(CASE WHEN level = 'critical' THEN 1 END) as critical_alerts,
          COUNT(CASE WHEN level = 'warning' THEN 1 END) as warning_alerts,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_alerts,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_alerts
        FROM alerts 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);
      
      return {
        last24Hours: {
          total: parseInt(stats.total_alerts),
          critical: parseInt(stats.critical_alerts),
          warning: parseInt(stats.warning_alerts),
          active: parseInt(stats.active_alerts),
          resolved: parseInt(stats.resolved_alerts)
        },
        current: {
          activeAlerts: this.activeAlerts.size,
          channels: this.channels.size,
          rules: this.rules.size
        },
        config: {
          enabled: this.config.enabled,
          escalationEnabled: this.config.escalationEnabled,
          deduplicationWindow: this.config.deduplicationWindow,
          maxAlertsPerHour: this.config.maxAlertsPerHour
        }
      };
    } catch (error) {
      console.error('❌ Error getting alert stats:', error);
      return {
        last24Hours: { total: 0, critical: 0, warning: 0, active: 0, resolved: 0 },
        current: { activeAlerts: this.activeAlerts.size, channels: this.channels.size, rules: this.rules.size },
        config: this.config
      };
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    if (this.escalationInterval) {
      clearInterval(this.escalationInterval);
      this.escalationInterval = undefined;
    }
    
    // Cleanup old alerts
    try {
      await this.db.query(`
        DELETE FROM alerts 
        WHERE timestamp < NOW() - INTERVAL '${this.config.retentionDays} days'
        AND status = 'resolved'
      `);
    } catch (error) {
      console.error('❌ Error during alert cleanup:', error);
    }
    
    console.log('🧹 Alert System cleaned up');
  }
}

/**
 * Istanza singleton dell'alert system
 */
let alertSystemInstance: AlertSystem | null = null;

/**
 * Ottieni istanza singleton dell'alert system
 */
export function getAlertSystem(config?: Partial<AlertSystemConfig>): AlertSystem {
  if (!alertSystemInstance) {
    alertSystemInstance = new AlertSystem(config);
  }
  return alertSystemInstance;
}