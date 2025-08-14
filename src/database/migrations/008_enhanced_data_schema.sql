-- Migration 008: Enhanced Data Schema per Maximum Data In-House Strategy
-- Data: 14 Agosto 2025
-- Scopo: Massimizzare dati nel DB per processing in-house

-- =====================================================
-- WORKFLOW TAGS - Sistema completo tags
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_tags (
    workflow_id VARCHAR(255) NOT NULL,
    tag_id VARCHAR(255) NOT NULL,
    tag_name VARCHAR(255) NOT NULL,
    tag_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workflow_id, tag_id),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indice per performance query
CREATE INDEX IF NOT EXISTS idx_workflow_tags_workflow_id ON workflow_tags(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tags_tag_name ON workflow_tags(tag_name);

-- =====================================================
-- WORKFLOW SETTINGS - Configurazioni dettagliate
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_settings (
    workflow_id VARCHAR(255) PRIMARY KEY,
    save_execution_progress BOOLEAN DEFAULT false,
    save_manual_executions BOOLEAN DEFAULT true,
    save_data_error_execution VARCHAR(20) DEFAULT 'all',
    save_data_success_execution VARCHAR(20) DEFAULT 'all',
    execution_timeout INTEGER,
    error_workflow VARCHAR(255),
    timezone VARCHAR(100),
    execution_order VARCHAR(20),
    static_data JSONB,
    raw_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- =====================================================
-- TAGS GLOBALI - Sistema di categorizzazione
-- =====================================================

CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EXECUTION ENHANCEMENTS - Dati completi executions
-- =====================================================

-- Aggiungi colonne a executions esistente
ALTER TABLE executions 
ADD COLUMN IF NOT EXISTS custom_data JSONB,
ADD COLUMN IF NOT EXISTS wait_till TIMESTAMP,
ADD COLUMN IF NOT EXISTS retry_of VARCHAR(255),
ADD COLUMN IF NOT EXISTS retry_success_id VARCHAR(255);

-- =====================================================
-- WORKFLOW COMPLEXITY ANALYSIS - Metriche avanzate
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_complexity (
    workflow_id VARCHAR(255) PRIMARY KEY,
    total_nodes INTEGER DEFAULT 0,
    total_connections INTEGER DEFAULT 0,
    complexity_score DECIMAL(5,2),
    has_loops BOOLEAN DEFAULT false,
    has_error_handling BOOLEAN DEFAULT false,
    has_conditional_logic BOOLEAN DEFAULT false,
    has_manual_triggers BOOLEAN DEFAULT false,
    has_webhook_triggers BOOLEAN DEFAULT false,
    has_cron_triggers BOOLEAN DEFAULT false,
    credential_count INTEGER DEFAULT 0,
    max_execution_time_ms INTEGER,
    avg_nodes_per_execution DECIMAL(5,2),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- =====================================================
-- WORKFLOW CONNECTIONS - Analisi dettagliata collegamenti
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_connections (
    workflow_id VARCHAR(255),
    source_node_id VARCHAR(255),
    target_node_id VARCHAR(255),
    connection_type VARCHAR(50) DEFAULT 'main',
    connection_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workflow_id, source_node_id, target_node_id, connection_type, connection_index),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_workflow_connections_workflow ON workflow_connections(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_source ON workflow_connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_target ON workflow_connections(target_node_id);

-- =====================================================
-- EXECUTION PERFORMANCE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS execution_performance (
    execution_id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    nodes_executed INTEGER DEFAULT 0,
    nodes_failed INTEGER DEFAULT 0,
    data_processed_kb DECIMAL(10,2) DEFAULT 0,
    memory_usage_mb DECIMAL(10,2),
    cpu_time_ms INTEGER,
    network_requests INTEGER DEFAULT 0,
    database_queries INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2),
    bottleneck_node VARCHAR(255),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- =====================================================
-- INDICI COMPOUND per PERFORMANCE QUERIES
-- =====================================================

-- Workflow analysis queries
CREATE INDEX IF NOT EXISTS idx_workflows_active_updated ON workflows(active, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_ai_nodes ON workflows(ai_node_count DESC) WHERE ai_node_count > 0;

-- Execution analysis queries  
CREATE INDEX IF NOT EXISTS idx_executions_workflow_started ON executions(workflow_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_status_duration ON executions(status, duration_ms) WHERE duration_ms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_executions_workflow_status ON executions(workflow_id, status);

-- Node analysis queries
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_type ON workflow_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_show_order ON workflow_nodes(workflow_id, show_order) WHERE show_order IS NOT NULL;

-- =====================================================
-- VIEWS per QUERY OPTIMIZATION
-- =====================================================

-- Vista workflow completi con statistiche
CREATE OR REPLACE VIEW workflows_complete AS
SELECT 
    w.*,
    -- Tag info
    COALESCE(t.tag_count, 0) as tag_count,
    t.tag_names,
    -- Settings info
    s.execution_timeout,
    s.timezone,
    s.save_execution_progress,
    -- Complexity info
    c.complexity_score,
    c.has_error_handling,
    c.has_conditional_logic,
    -- Performance info
    COALESCE(w.execution_count, 0) as execution_count,
    COALESCE(w.success_count, 0) as success_count,
    COALESCE(w.failure_count, 0) as failure_count,
    CASE 
        WHEN COALESCE(w.execution_count, 0) > 0 
        THEN ROUND((w.success_count::decimal / w.execution_count) * 100, 2)
        ELSE 0 
    END as success_rate
FROM workflows w
LEFT JOIN (
    SELECT 
        workflow_id,
        COUNT(*) as tag_count,
        STRING_AGG(tag_name, ', ' ORDER BY tag_name) as tag_names
    FROM workflow_tags 
    GROUP BY workflow_id
) t ON w.id = t.workflow_id
LEFT JOIN workflow_settings s ON w.id = s.workflow_id
LEFT JOIN workflow_complexity c ON w.id = c.workflow_id;

-- Vista executions con performance
CREATE OR REPLACE VIEW executions_complete AS
SELECT 
    e.*,
    w.name as workflow_name,
    p.performance_score,
    p.nodes_executed,
    p.data_processed_kb,
    p.bottleneck_node
FROM executions e
LEFT JOIN workflows w ON e.workflow_id = w.id
LEFT JOIN execution_performance p ON e.id = p.execution_id;

-- =====================================================
-- COMMENTI DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE workflow_tags IS 'Sistema completo tag-workflow associations per categorizzazione';
COMMENT ON TABLE workflow_settings IS 'Configurazioni dettagliate workflow per analysis completa';
COMMENT ON TABLE workflow_complexity IS 'Metriche avanzate complessità workflow per insights';
COMMENT ON TABLE workflow_connections IS 'Analisi dettagliata collegamenti nodi per flow analysis';
COMMENT ON TABLE execution_performance IS 'Tracking performance execution per optimization';

COMMENT ON VIEW workflows_complete IS 'Vista completa workflow con tags, settings, complexity e performance';
COMMENT ON VIEW executions_complete IS 'Vista completa executions con workflow context e performance';

-- Migration completata
INSERT INTO sync_logs (started_at, completed_at, success, workflows_processed, executions_processed, error_message) 
VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 0, 0, 'Migration 008: Enhanced Data Schema completed successfully');