-- Migration 010: Sync Optimization & Tracking
-- Data: 14 Agosto 2025  
-- Scopo: Sistema automatico di sync con tracking e performance optimization

-- =====================================================
-- SYNC TRACKING TABLES - Monitoring sync jobs
-- =====================================================

-- Sync status globale
CREATE TABLE IF NOT EXISTS sync_status (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL, -- 'incremental', 'enhanced', 'ultra'
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_success BOOLEAN DEFAULT true,
    last_sync_duration_ms INTEGER DEFAULT 0,
    workflows_processed INTEGER DEFAULT 0,
    executions_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    next_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sync_type)
);

-- Insert default sync status records
INSERT INTO sync_status (sync_type, next_sync_at) VALUES
('incremental', CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
('enhanced', CURRENT_TIMESTAMP + INTERVAL '1 hour'),
('ultra', CURRENT_TIMESTAMP + INTERVAL '6 hours')
ON CONFLICT (sync_type) DO NOTHING;

-- Sync jobs history per tracking dettagliato
CREATE TABLE IF NOT EXISTS sync_jobs (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Metrics
    workflows_synced INTEGER DEFAULT 0,
    workflows_updated INTEGER DEFAULT 0,
    executions_synced INTEGER DEFAULT 0,
    executions_updated INTEGER DEFAULT 0,
    
    -- Enhanced metrics
    tags_processed INTEGER DEFAULT 0,
    settings_processed INTEGER DEFAULT 0,
    complexity_processed INTEGER DEFAULT 0,
    
    -- Ultra metrics  
    versions_processed INTEGER DEFAULT 0,
    connections_processed INTEGER DEFAULT 0,
    triggers_processed INTEGER DEFAULT 0,
    development_processed INTEGER DEFAULT 0,
    analysis_processed INTEGER DEFAULT 0,
    
    -- Error tracking
    errors TEXT[],
    warnings TEXT[],
    
    -- Performance data
    api_calls_count INTEGER DEFAULT 0,
    api_calls_duration_ms INTEGER DEFAULT 0,
    db_queries_count INTEGER DEFAULT 0,
    db_queries_duration_ms INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance queries
CREATE INDEX IF NOT EXISTS idx_sync_jobs_type_started ON sync_jobs(sync_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_recent ON sync_jobs(started_at DESC) WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- =====================================================
-- SYNC METRICS AGGREGATION - Performance insights
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE DEFAULT CURRENT_DATE,
    sync_type VARCHAR(50) NOT NULL,
    
    -- Daily aggregations
    total_jobs INTEGER DEFAULT 0,
    successful_jobs INTEGER DEFAULT 0,
    failed_jobs INTEGER DEFAULT 0,
    avg_duration_ms DECIMAL(10,2) DEFAULT 0,
    min_duration_ms INTEGER DEFAULT 0,
    max_duration_ms INTEGER DEFAULT 0,
    
    -- Data processing metrics
    total_workflows_processed INTEGER DEFAULT 0,
    total_executions_processed INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_api_calls_per_job DECIMAL(8,2) DEFAULT 0,
    avg_db_queries_per_job DECIMAL(8,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date, sync_type)
);

-- =====================================================
-- CHANGE DETECTION OPTIMIZATION - Faster incremental sync
-- =====================================================

-- Workflow change tracking
CREATE TABLE IF NOT EXISTS workflow_changes (
    workflow_id VARCHAR(255) PRIMARY KEY,
    last_modified TIMESTAMP,
    content_hash VARCHAR(64), -- SHA-256 hash del content
    last_incremental_sync TIMESTAMP,
    last_enhanced_sync TIMESTAMP,
    last_ultra_sync TIMESTAMP,
    needs_incremental_sync BOOLEAN DEFAULT true,
    needs_enhanced_sync BOOLEAN DEFAULT true,
    needs_ultra_sync BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Execution change tracking  
CREATE TABLE IF NOT EXISTS execution_changes (
    execution_id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255),
    last_modified TIMESTAMP,
    last_sync TIMESTAMP,
    needs_sync BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indici per change detection performance
CREATE INDEX IF NOT EXISTS idx_workflow_changes_incremental ON workflow_changes(needs_incremental_sync) WHERE needs_incremental_sync = true;
CREATE INDEX IF NOT EXISTS idx_workflow_changes_enhanced ON workflow_changes(needs_enhanced_sync) WHERE needs_enhanced_sync = true;
CREATE INDEX IF NOT EXISTS idx_workflow_changes_ultra ON workflow_changes(needs_ultra_sync) WHERE needs_ultra_sync = true;
CREATE INDEX IF NOT EXISTS idx_workflow_changes_modified ON workflow_changes(last_modified DESC);

CREATE INDEX IF NOT EXISTS idx_execution_changes_sync ON execution_changes(needs_sync) WHERE needs_sync = true;
CREATE INDEX IF NOT EXISTS idx_execution_changes_modified ON execution_changes(last_modified DESC);

-- =====================================================
-- SYNC CONFIGURATION TABLE - Runtime configuration
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_configuration (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string', -- 'string', 'integer', 'boolean', 'json'
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO sync_configuration (key, value, value_type, description, category) VALUES
('incremental_enabled', 'true', 'boolean', 'Enable incremental sync every 5 minutes', 'scheduling'),
('incremental_interval', '*/5 * * * *', 'string', 'Cron expression for incremental sync', 'scheduling'),
('enhanced_enabled', 'true', 'boolean', 'Enable enhanced sync every hour', 'scheduling'),
('enhanced_interval', '0 * * * *', 'string', 'Cron expression for enhanced sync', 'scheduling'),
('ultra_enabled', 'false', 'boolean', 'Enable ultra sync every 6 hours (disabled by default)', 'scheduling'),
('ultra_interval', '0 */6 * * *', 'string', 'Cron expression for ultra sync', 'scheduling'),
('max_concurrent_jobs', '3', 'integer', 'Maximum number of concurrent sync jobs', 'performance'),
('batch_size', '50', 'integer', 'Number of workflows to process per batch', 'performance'),
('retry_attempts', '3', 'integer', 'Number of retry attempts for failed sync operations', 'reliability'),
('retry_delay_ms', '2000', 'integer', 'Delay between retry attempts in milliseconds', 'reliability')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PERFORMANCE OPTIMIZATION INDICES - Faster queries
-- =====================================================

-- Workflow timestamp optimization
CREATE INDEX IF NOT EXISTS idx_workflows_updated_recent ON workflows(updated_at DESC) 
WHERE updated_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Execution timestamp optimization  
CREATE INDEX IF NOT EXISTS idx_executions_started_recent ON executions(started_at DESC)
WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Raw data optimization
CREATE INDEX IF NOT EXISTS idx_workflows_raw_data_exists ON workflows(id) WHERE raw_data IS NOT NULL;

-- Node analysis optimization
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_updated ON workflow_nodes(workflow_id, updated_at DESC);

-- =====================================================
-- VIEWS PER SYNC MONITORING - Dashboard queries
-- =====================================================

-- Vista sync health dashboard
CREATE OR REPLACE VIEW sync_health_dashboard AS
SELECT 
    ss.sync_type,
    ss.last_sync_at,
    ss.last_sync_success,
    ss.last_sync_duration_ms,
    ss.workflows_processed,
    ss.executions_processed,
    ss.next_sync_at,
    
    -- Recent job stats
    recent_stats.jobs_last_24h,
    recent_stats.success_rate_24h,
    recent_stats.avg_duration_24h,
    
    -- Health indicators
    CASE 
        WHEN ss.last_sync_at < CURRENT_TIMESTAMP - INTERVAL '2 hours' THEN 'stale'
        WHEN ss.last_sync_success = false THEN 'error'
        ELSE 'healthy'
    END as health_status,
    
    -- Next sync countdown
    EXTRACT(EPOCH FROM (ss.next_sync_at - CURRENT_TIMESTAMP)) as seconds_to_next_sync

FROM sync_status ss
LEFT JOIN (
    SELECT 
        sync_type,
        COUNT(*) as jobs_last_24h,
        ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate_24h,
        ROUND(AVG(duration_ms), 0) as avg_duration_24h
    FROM sync_jobs 
    WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    GROUP BY sync_type
) recent_stats ON ss.sync_type = recent_stats.sync_type;

-- Vista sync performance trends
CREATE OR REPLACE VIEW sync_performance_trends AS
SELECT 
    metric_date,
    sync_type,
    total_jobs,
    successful_jobs,
    failed_jobs,
    ROUND((successful_jobs * 100.0 / NULLIF(total_jobs, 0)), 2) as success_rate,
    avg_duration_ms,
    total_workflows_processed,
    total_executions_processed
FROM sync_metrics
WHERE metric_date > CURRENT_DATE - INTERVAL '30 days'
ORDER BY metric_date DESC, sync_type;

-- =====================================================
-- TRIGGER FUNCTIONS - Auto-update change tracking
-- =====================================================

-- Function per aggiornare workflow_changes
CREATE OR REPLACE FUNCTION update_workflow_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workflow_changes (
        workflow_id, 
        last_modified, 
        content_hash,
        needs_incremental_sync,
        needs_enhanced_sync,
        needs_ultra_sync
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.updated_at, CURRENT_TIMESTAMP),
        MD5(COALESCE(NEW.raw_data::text, '')),
        true,
        true,
        true
    )
    ON CONFLICT (workflow_id) DO UPDATE SET
        last_modified = COALESCE(NEW.updated_at, CURRENT_TIMESTAMP),
        content_hash = MD5(COALESCE(NEW.raw_data::text, '')),
        needs_incremental_sync = CASE 
            WHEN workflow_changes.content_hash != MD5(COALESCE(NEW.raw_data::text, '')) 
            THEN true 
            ELSE workflow_changes.needs_incremental_sync 
        END,
        needs_enhanced_sync = CASE 
            WHEN workflow_changes.content_hash != MD5(COALESCE(NEW.raw_data::text, '')) 
            THEN true 
            ELSE workflow_changes.needs_enhanced_sync 
        END,
        needs_ultra_sync = CASE 
            WHEN workflow_changes.content_hash != MD5(COALESCE(NEW.raw_data::text, '')) 
            THEN true 
            ELSE workflow_changes.needs_ultra_sync 
        END,
        updated_at = CURRENT_TIMESTAMP;
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger su workflows table
DROP TRIGGER IF EXISTS workflow_changes_trigger ON workflows;
CREATE TRIGGER workflow_changes_trigger
    AFTER INSERT OR UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_changes();

-- =====================================================
-- FUNCTIONS per sync metrics calculation
-- =====================================================

-- Function per calcolare daily metrics
CREATE OR REPLACE FUNCTION calculate_daily_sync_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO sync_metrics (
        metric_date, sync_type, total_jobs, successful_jobs, failed_jobs,
        avg_duration_ms, min_duration_ms, max_duration_ms,
        total_workflows_processed, total_executions_processed
    )
    SELECT 
        target_date,
        sync_type,
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_jobs,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
        ROUND(AVG(duration_ms), 2) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms,
        SUM(workflows_synced + workflows_updated) as total_workflows_processed,
        SUM(executions_synced + executions_updated) as total_executions_processed
    FROM sync_jobs
    WHERE DATE(started_at) = target_date
    GROUP BY sync_type
    ON CONFLICT (metric_date, sync_type) DO UPDATE SET
        total_jobs = EXCLUDED.total_jobs,
        successful_jobs = EXCLUDED.successful_jobs,
        failed_jobs = EXCLUDED.failed_jobs,
        avg_duration_ms = EXCLUDED.avg_duration_ms,
        min_duration_ms = EXCLUDED.min_duration_ms,
        max_duration_ms = EXCLUDED.max_duration_ms,
        total_workflows_processed = EXCLUDED.total_workflows_processed,
        total_executions_processed = EXCLUDED.total_executions_processed,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTI e DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE sync_status IS 'Stato globale sync con last sync timestamps e next sync scheduling';
COMMENT ON TABLE sync_jobs IS 'History completa sync jobs con metrics dettagliate e error tracking';
COMMENT ON TABLE sync_metrics IS 'Aggregazioni daily per performance insights e trending analysis';
COMMENT ON TABLE workflow_changes IS 'Change tracking workflows per incremental sync optimization';
COMMENT ON TABLE execution_changes IS 'Change tracking executions per incremental sync optimization';
COMMENT ON TABLE sync_configuration IS 'Configuration runtime sync system tramite database';

COMMENT ON VIEW sync_health_dashboard IS 'Dashboard view per sync health monitoring e alerting';
COMMENT ON VIEW sync_performance_trends IS 'Performance trends view per analysis storico sync metrics';

-- =====================================================
-- SUCCESS LOG
-- =====================================================

INSERT INTO sync_logs (started_at, completed_at, success, workflows_processed, executions_processed, error_message) 
VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 0, 0, 'Migration 010: Sync Optimization & Tracking completata');

-- Messaggio di conferma
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 010 Sync Optimization completata!';
    RAISE NOTICE '📊 Nuove tabelle: sync_status, sync_jobs, sync_metrics, workflow_changes, execution_changes';
    RAISE NOTICE '🔍 Views create: sync_health_dashboard, sync_performance_trends';
    RAISE NOTICE '⚡ Triggers: workflow_changes_trigger per auto change detection';
    RAISE NOTICE '🎛️ Configuration: sync_configuration table con settings default';
    RAISE NOTICE '🚀 Sistema ready per automatic sync scheduling!';
END $$;