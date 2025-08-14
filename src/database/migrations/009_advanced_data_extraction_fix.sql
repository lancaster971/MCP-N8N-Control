-- Migration 009 FIX: Advanced Data Extraction - Corretto errori
-- Data: 14 Agosto 2025

-- =====================================================
-- FIX workflow_connections table (DROP CASCADE per view conflict)
-- =====================================================

DROP VIEW IF EXISTS workflows_complete CASCADE;
DROP TABLE IF EXISTS workflow_connections CASCADE;

CREATE TABLE workflow_connections (
    workflow_id VARCHAR(255),
    source_node VARCHAR(255),
    target_node VARCHAR(255),
    connection_type VARCHAR(50) DEFAULT 'main',
    connection_index INTEGER DEFAULT 0,
    source_output_index INTEGER DEFAULT 0,
    target_input_index INTEGER DEFAULT 0,
    raw_connection JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workflow_id, source_node, target_node, connection_type, connection_index),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indici
CREATE INDEX idx_wf_connections_workflow ON workflow_connections(workflow_id);
CREATE INDEX idx_wf_connections_source ON workflow_connections(source_node);
CREATE INDEX idx_wf_connections_target ON workflow_connections(target_node);
CREATE INDEX idx_wf_connections_type ON workflow_connections(connection_type);

-- =====================================================
-- FIX execution_node_results table structure
-- =====================================================

-- Correggi struttura execution_node_results con colonne corrette
ALTER TABLE execution_node_results 
ALTER COLUMN duration_ms TYPE INTEGER USING duration_ms::INTEGER,
ADD COLUMN IF NOT EXISTS node_duration_ms INTEGER;

-- Update node_duration_ms per chiarezza
UPDATE execution_node_results 
SET node_duration_ms = duration_ms 
WHERE node_duration_ms IS NULL AND duration_ms IS NOT NULL;

-- =====================================================
-- FIX workflow_versions table (correggi struttura)
-- =====================================================

ALTER TABLE workflow_versions 
ADD COLUMN IF NOT EXISTS version_archived BOOLEAN DEFAULT false;

-- Update da is_archived a version_archived per chiarezza
UPDATE workflow_versions 
SET version_archived = is_archived 
WHERE version_archived IS NULL AND is_archived IS NOT NULL;

-- =====================================================
-- RECREATE views corrette con colonne esistenti
-- =====================================================

-- Vista workflow completa BASE (ricreata)
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
        STRING_AGG(COALESCE(tag_name, 'Unknown'), ', ' ORDER BY tag_name) as tag_names
    FROM workflow_tags 
    GROUP BY workflow_id
) t ON w.id = t.workflow_id
LEFT JOIN workflow_settings s ON w.id = s.workflow_id
LEFT JOIN workflow_complexity c ON w.id = c.workflow_id;

-- Vista workflow EXTENDED (con tutti i nuovi dati)
CREATE OR REPLACE VIEW workflows_complete_extended AS
SELECT 
    w.*,
    -- Version info (corretto)
    wv.version_id,
    wv.version_archived,
    wv.template_creds_setup,
    -- Trigger info
    wt.trigger_types,
    wt.webhook_count,
    wt.cron_count,
    -- Development data
    wd.has_pin_data,
    wd.has_static_data,
    wd.pin_data_nodes,
    -- Analysis metrics
    wa.total_paths,
    wa.max_path_length,
    wa.has_parallel_branches,
    wa.estimated_complexity_score,
    -- Connection stats
    COALESCE(conn_stats.connection_count, 0) as connection_count,
    COALESCE(conn_stats.connection_types, ARRAY[]::TEXT[]) as connection_types,
    -- Success rate
    CASE 
        WHEN COALESCE(w.execution_count, 0) > 0 
        THEN ROUND((w.success_count::decimal / w.execution_count) * 100, 2)
        ELSE 0 
    END as success_rate
FROM workflows w
LEFT JOIN workflow_versions wv ON w.id = wv.workflow_id AND wv.is_current = true
LEFT JOIN (
    SELECT 
        workflow_id,
        ARRAY_AGG(DISTINCT trigger_type ORDER BY trigger_type) as trigger_types,
        COUNT(CASE WHEN trigger_type LIKE '%webhook%' THEN 1 END) as webhook_count,
        COUNT(CASE WHEN trigger_type LIKE '%cron%' THEN 1 END) as cron_count
    FROM workflow_triggers 
    WHERE is_active = true
    GROUP BY workflow_id
) wt ON w.id = wt.workflow_id
LEFT JOIN workflow_development_data wd ON w.id = wd.workflow_id
LEFT JOIN workflow_analysis wa ON w.id = wa.workflow_id
LEFT JOIN (
    SELECT 
        workflow_id,
        COUNT(*) as connection_count,
        ARRAY_AGG(DISTINCT connection_type ORDER BY connection_type) as connection_types
    FROM workflow_connections
    GROUP BY workflow_id
) conn_stats ON w.id = conn_stats.workflow_id;

-- Vista execution EXTENDED (corretta)
CREATE OR REPLACE VIEW executions_complete_extended AS
SELECT 
    e.*,
    w.name as workflow_name,
    -- Node execution stats (corrette)
    node_stats.nodes_executed,
    node_stats.nodes_failed,
    node_stats.total_node_duration,
    node_stats.avg_node_duration,
    node_stats.slowest_node,
    -- Data processing stats
    node_stats.total_data_in_kb,
    node_stats.total_data_out_kb
FROM executions e
LEFT JOIN workflows w ON e.workflow_id = w.id
LEFT JOIN (
    SELECT 
        execution_id,
        COUNT(*) as nodes_executed,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as nodes_failed,
        SUM(COALESCE(node_duration_ms, 0)) as total_node_duration,
        ROUND(AVG(COALESCE(node_duration_ms, 0)), 2) as avg_node_duration,
        (SELECT node_name FROM execution_node_results enr2 
         WHERE enr2.execution_id = enr.execution_id 
         ORDER BY node_duration_ms DESC NULLS LAST LIMIT 1) as slowest_node,
        SUM(COALESCE(data_in_kb, 0)) as total_data_in_kb,
        SUM(COALESCE(data_out_kb, 0)) as total_data_out_kb
    FROM execution_node_results enr
    GROUP BY execution_id
) node_stats ON e.id = node_stats.execution_id;

-- =====================================================
-- INDICI CORRETTI
-- =====================================================

-- Node results performance indices (corretti)
CREATE INDEX IF NOT EXISTS idx_node_results_duration_corrected 
ON execution_node_results(node_type, node_duration_ms DESC) 
WHERE node_duration_ms > 0;

CREATE INDEX IF NOT EXISTS idx_node_results_error_analysis 
ON execution_node_results(node_type, status) 
WHERE status = 'error';

-- Workflow analysis indices
CREATE INDEX IF NOT EXISTS idx_workflow_analysis_complexity 
ON workflow_analysis(estimated_complexity_score DESC) 
WHERE estimated_complexity_score IS NOT NULL;

-- =====================================================
-- COMMENTI CORRETTI
-- =====================================================

COMMENT ON VIEW workflows_complete_extended IS 'Vista workflow completa con TUTTI i dati aggregati - versione corretta';
COMMENT ON VIEW executions_complete_extended IS 'Vista execution completa con node results - versione corretta';

-- =====================================================
-- SUCCESS LOG
-- =====================================================

INSERT INTO sync_logs (started_at, completed_at, success, workflows_processed, executions_processed, error_message) 
VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 0, 0, 'Migration 009 FIX: Advanced Data Extraction corretta');

-- Messaggio di conferma
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 009 FIX Advanced Data Extraction completata!';
    RAISE NOTICE '🔧 Views corrette: workflows_complete, workflows_complete_extended';
    RAISE NOTICE '📊 Tabelle funzionanti: workflow_connections, execution_node_results';
    RAISE NOTICE '⚡ Sistema pronto per maximum data extraction!';
END $$;