-- TIER 2: Production Stability Database Tables
-- Migration 007 - Tabelle per monitoring, alerting, backup e metriche

-- =====================================================
-- ALERTS SYSTEM TABLES
-- =====================================================

-- Tabella principale alerts
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'critical', 'emergency')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('system', 'database', 'performance', 'business', 'security')),
  source VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Alert lifecycle
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'suppressed')),
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Escalation
  escalation_level INTEGER DEFAULT 0,
  escalated_at TIMESTAMP,
  next_escalation_at TIMESTAMP,
  
  -- Suppression
  suppressed_until TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_source ON alerts(source);

-- Tabella notification logs
CREATE TABLE IF NOT EXISTS alert_notifications (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR(255) REFERENCES alerts(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  channel VARCHAR(100) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered')),
  error_message TEXT
);

-- Indici per alert_notifications
CREATE INDEX IF NOT EXISTS idx_alert_notifications_alert_id ON alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_timestamp ON alert_notifications(timestamp);

-- =====================================================
-- BACKUP SYSTEM TABLES
-- =====================================================

-- Tabella backup jobs
CREATE TABLE IF NOT EXISTS backup_jobs (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('full', 'incremental')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  size_bytes BIGINT,
  file_path VARCHAR(512),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per backup jobs
CREATE INDEX IF NOT EXISTS idx_backup_jobs_type ON backup_jobs(type);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_started_at ON backup_jobs(started_at);

-- Tabella backup schedule
CREATE TABLE IF NOT EXISTS backup_schedule (
  id VARCHAR(255) PRIMARY KEY,
  backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('full', 'incremental')),
  cron_expression VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTION MONITORING TABLES
-- =====================================================

-- Tabella metriche di sistema
CREATE TABLE IF NOT EXISTS system_metrics (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- System metrics
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_percent DECIMAL(5,2),
  memory_used_mb DECIMAL(10,2),
  memory_total_mb DECIMAL(10,2),
  disk_usage_percent DECIMAL(5,2),
  
  -- Performance metrics
  request_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  response_time_avg_ms DECIMAL(8,2),
  response_time_p95_ms DECIMAL(8,2),
  response_time_p99_ms DECIMAL(8,2),
  
  -- Database metrics
  active_connections INTEGER,
  idle_connections INTEGER,
  slow_queries INTEGER,
  cache_hit_ratio DECIMAL(5,2),
  
  -- Business metrics
  workflows_executed INTEGER DEFAULT 0,
  executions_successful INTEGER DEFAULT 0,
  executions_failed INTEGER DEFAULT 0,
  avg_execution_duration_ms DECIMAL(10,2)
);

-- Indici per system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

-- Tabella health checks
CREATE TABLE IF NOT EXISTS health_checks (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  component VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  check_duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- Indici per health_checks
CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp_component ON health_checks(timestamp, component);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON health_checks(status);

-- =====================================================
-- PERFORMANCE MONITORING TABLES
-- =====================================================

-- Tabella query performance
CREATE TABLE IF NOT EXISTS query_performance (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  query_hash VARCHAR(64), -- Hash della query per grouping
  query_text TEXT,
  execution_time_ms DECIMAL(10,2),
  rows_affected INTEGER,
  table_name VARCHAR(255),
  operation_type VARCHAR(20) CHECK (operation_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE'))
);

-- Indici per query_performance
CREATE INDEX IF NOT EXISTS idx_query_performance_timestamp ON query_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_query_performance_query_hash ON query_performance(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_performance_execution_time ON query_performance(execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_query_performance_table_name ON query_performance(table_name);

-- Tabella per tracking errori di applicazione
CREATE TABLE IF NOT EXISTS application_errors (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_type VARCHAR(100),
  error_message TEXT,
  stack_trace TEXT,
  request_path VARCHAR(255),
  request_method VARCHAR(10),
  user_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indici per application_errors
CREATE INDEX IF NOT EXISTS idx_application_errors_timestamp ON application_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_application_errors_error_type ON application_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_application_errors_request_path ON application_errors(request_path);

-- =====================================================
-- CONNECTION POOL MONITORING
-- =====================================================

-- Tabella pool metrics (storico)
CREATE TABLE IF NOT EXISTS pool_metrics_history (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_connections INTEGER,
  active_connections INTEGER,
  idle_connections INTEGER,
  waiting_connections INTEGER,
  pool_utilization_percent DECIMAL(5,2),
  average_query_time_ms DECIMAL(8,2),
  slow_queries_count INTEGER,
  failed_queries_count INTEGER,
  health_status VARCHAR(20) CHECK (health_status IN ('healthy', 'degraded', 'unhealthy'))
);

-- Indici per pool_metrics_history
CREATE INDEX IF NOT EXISTS idx_pool_metrics_history_timestamp ON pool_metrics_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_pool_metrics_history_health_status ON pool_metrics_history(health_status);

-- =====================================================
-- CLEANUP POLICIES
-- =====================================================

-- Trigger per cleanup automatico dati vecchi (30 giorni)
-- Nota: In produzione si userebbe un job cron o scheduler

-- Function per cleanup dati vecchi
CREATE OR REPLACE FUNCTION cleanup_old_metrics() RETURNS void AS $$
BEGIN
  -- Cleanup system metrics > 30 giorni
  DELETE FROM system_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Cleanup health checks > 7 giorni  
  DELETE FROM health_checks WHERE timestamp < NOW() - INTERVAL '7 days';
  
  -- Cleanup query performance > 14 giorni
  DELETE FROM query_performance WHERE timestamp < NOW() - INTERVAL '14 days';
  
  -- Cleanup application errors > 30 giorni
  DELETE FROM application_errors WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Cleanup pool metrics > 14 giorni
  DELETE FROM pool_metrics_history WHERE timestamp < NOW() - INTERVAL '14 days';
  
  -- Cleanup alert notifications > 30 giorni
  DELETE FROM alert_notifications WHERE timestamp < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Cleanup completed for metrics older than retention periods';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Backup schedule defaults
INSERT INTO backup_schedule (id, backup_type, cron_expression, enabled) 
VALUES 
  ('daily-full', 'full', '0 2 * * *', true),
  ('hourly-incremental', 'incremental', '0 */6 * * *', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VIEWS FOR MONITORING
-- =====================================================

-- Vista metriche recenti (ultima ora)
CREATE OR REPLACE VIEW recent_system_metrics AS
SELECT 
  timestamp,
  cpu_usage_percent,
  memory_usage_percent,
  request_count,
  error_count,
  response_time_avg_ms,
  active_connections,
  workflows_executed
FROM system_metrics 
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Vista alert summary
CREATE OR REPLACE VIEW alert_summary AS
SELECT 
  status,
  level,
  category,
  COUNT(*) as count,
  MIN(timestamp) as oldest_alert,
  MAX(timestamp) as newest_alert
FROM alerts 
WHERE status IN ('active', 'acknowledged')
GROUP BY status, level, category;

-- Vista backup summary
CREATE OR REPLACE VIEW backup_summary AS
SELECT 
  type,
  status,
  COUNT(*) as job_count,
  SUM(size_bytes) as total_size_bytes,
  AVG(duration_seconds) as avg_duration_seconds,
  MAX(started_at) as last_backup
FROM backup_jobs 
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY type, status;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ TIER 2: Production Stability Migration Completed';
  RAISE NOTICE '📊 Created tables: alerts, backup_jobs, system_metrics, health_checks';
  RAISE NOTICE '🔍 Created indexes for optimal query performance';
  RAISE NOTICE '📈 Created monitoring views and cleanup functions';
  RAISE NOTICE '⏰ Configured default backup schedules';
END $$;