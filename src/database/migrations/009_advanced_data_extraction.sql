-- Migration 009: Advanced Data Extraction - Maximum In-House Processing
-- Data: 14 Agosto 2025
-- Scopo: Estrarre TUTTI i dati possibili da raw_data per processing completo

-- =====================================================
-- WORKFLOW VERSIONING & META - Tracking completo storia
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_versions (
    workflow_id VARCHAR(255),
    version_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    is_current BOOLEAN DEFAULT true,
    template_creds_setup BOOLEAN DEFAULT false,
    instance_id VARCHAR(255),
    raw_meta JSONB,
    created_at_db TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workflow_id, version_id),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- =====================================================
-- WORKFLOW CONNECTIONS ESTESO - Flow analysis completa
-- =====================================================

-- Drop e ricrea con struttura completa
DROP TABLE IF EXISTS workflow_connections;

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

-- Indici per analisi flow
CREATE INDEX idx_wf_connections_workflow ON workflow_connections(workflow_id);
CREATE INDEX idx_wf_connections_source ON workflow_connections(source_node);
CREATE INDEX idx_wf_connections_target ON workflow_connections(target_node);
CREATE INDEX idx_wf_connections_type ON workflow_connections(connection_type);

-- =====================================================
-- WORKFLOW TRIGGERS - Analisi completa trigger system
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_triggers (
    workflow_id VARCHAR(255),
    node_id VARCHAR(255),
    trigger_type VARCHAR(100),
    trigger_config JSONB,
    is_active BOOLEAN DEFAULT true,
    webhook_path VARCHAR(500),
    webhook_id VARCHAR(255),
    cron_expression VARCHAR(100),
    timezone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workflow_id, node_id),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indici per query trigger
CREATE INDEX idx_workflow_triggers_type ON workflow_triggers(trigger_type);
CREATE INDEX idx_workflow_triggers_active ON workflow_triggers(is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_triggers_webhook ON workflow_triggers(webhook_path) WHERE webhook_path IS NOT NULL;

-- =====================================================
-- WORKFLOW STATIC & PIN DATA - Development data tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_development_data (
    workflow_id VARCHAR(255) PRIMARY KEY,
    pin_data JSONB,
    static_data JSONB,
    pin_data_nodes TEXT[], -- Array nodi con pin data
    static_data_keys TEXT[], -- Keys static data
    has_pin_data BOOLEAN GENERATED ALWAYS AS (pin_data IS NOT NULL AND pin_data != '{}') STORED,
    has_static_data BOOLEAN GENERATED ALWAYS AS (static_data IS NOT NULL AND static_data != 'null') STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- =====================================================
-- EXECUTION NODE RESULTS - Risultati dettagliati per nodo
-- =====================================================

CREATE TABLE IF NOT EXISTS execution_node_results (
    execution_id VARCHAR(255),
    node_id VARCHAR(255), 
    node_name VARCHAR(255),
    node_type VARCHAR(255),
    status VARCHAR(50), -- success, error, disabled, skipped
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    duration_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    error_stack TEXT,
    execution_count INTEGER DEFAULT 1,
    data_in_kb DECIMAL(8,2),
    data_out_kb DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (execution_id, node_id),
    FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
);

-- Indici per performance queries
CREATE INDEX idx_exec_node_results_execution ON execution_node_results(execution_id);
CREATE INDEX idx_exec_node_results_node_type ON execution_node_results(node_type);
CREATE INDEX idx_exec_node_results_status ON execution_node_results(status);
CREATE INDEX idx_exec_node_results_duration ON execution_node_results(duration_ms) WHERE duration_ms IS NOT NULL;

-- =====================================================
-- EXECUTION CONTEXT EXTENDED - Contesto completo executions
-- =====================================================

-- Estendi executions table con campi context
ALTER TABLE executions 
ADD COLUMN IF NOT EXISTS parent_execution_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS root_execution_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS execution_data JSONB,
ADD COLUMN IF NOT EXISTS waiting_execution JSONB,
ADD COLUMN IF NOT EXISTS annotation JSONB;

-- Indici per execution context
CREATE INDEX IF NOT EXISTS idx_executions_parent ON executions(parent_execution_id) WHERE parent_execution_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_executions_root ON executions(root_execution_id) WHERE root_execution_id IS NOT NULL;

-- =====================================================
-- WORKFLOW ANALYSIS AGGREGATES - Metriche avanzate pre-calcolate
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_analysis (
    workflow_id VARCHAR(255) PRIMARY KEY,
    -- Flow analysis
    total_paths INTEGER DEFAULT 0,
    max_path_length INTEGER DEFAULT 0,
    has_parallel_branches BOOLEAN DEFAULT false,
    has_loops BOOLEAN DEFAULT false,
    loop_count INTEGER DEFAULT 0,
    -- Trigger analysis  
    trigger_types TEXT[], -- Array tipi trigger
    webhook_count INTEGER DEFAULT 0,
    cron_count INTEGER DEFAULT 0,
    manual_count INTEGER DEFAULT 0,
    error_trigger_count INTEGER DEFAULT 0,
    -- Node type analysis
    http_nodes INTEGER DEFAULT 0,
    database_nodes INTEGER DEFAULT 0,
    transformation_nodes INTEGER DEFAULT 0,
    conditional_nodes INTEGER DEFAULT 0,
    -- Development status
    has_development_data BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    -- Performance prediction
    estimated_complexity_score DECIMAL(5,2),
    estimated_duration_ms INTEGER,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- =====================================================
-- VIEWS ESTESE per query optimization
-- =====================================================

-- Vista workflow completa con TUTTI i dati
CREATE OR REPLACE VIEW workflows_complete_extended AS
SELECT 
    w.*,
    -- Version info
    wv.version_id,
    wv.is_archived as version_archived,
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
    COALESCE(conn_stats.connection_types, ARRAY[]::TEXT[]) as connection_types
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

-- Vista execution completa con node results
CREATE OR REPLACE VIEW executions_complete_extended AS
SELECT 
    e.*,
    w.name as workflow_name,
    -- Node execution stats
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
        SUM(COALESCE(duration_ms, 0)) as total_node_duration,
        ROUND(AVG(COALESCE(duration_ms, 0)), 2) as avg_node_duration,
        (SELECT node_name FROM execution_node_results enr2 
         WHERE enr2.execution_id = enr.execution_id 
         ORDER BY duration_ms DESC NULLS LAST LIMIT 1) as slowest_node,
        SUM(COALESCE(data_in_kb, 0)) as total_data_in_kb,
        SUM(COALESCE(data_out_kb, 0)) as total_data_out_kb
    FROM execution_node_results enr
    GROUP BY execution_id
) node_stats ON e.id = node_stats.execution_id;

-- =====================================================
-- INDICI AVANZATI per performance query complesse
-- =====================================================

-- Workflow analysis indices
CREATE INDEX IF NOT EXISTS idx_workflow_analysis_complexity ON workflow_analysis(estimated_complexity_score DESC) WHERE estimated_complexity_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_analysis_paths ON workflow_analysis(total_paths DESC, max_path_length DESC);

-- Node results performance indices
CREATE INDEX IF NOT EXISTS idx_node_results_performance ON execution_node_results(node_type, duration_ms DESC) WHERE duration_ms > 0;
CREATE INDEX IF NOT EXISTS idx_node_results_error_analysis ON execution_node_results(node_type, status) WHERE status = 'error';

-- =====================================================
-- FUNCTIONS per automated data processing
-- =====================================================

-- Funzione per calcolare workflow complexity
CREATE OR REPLACE FUNCTION calculate_workflow_complexity(wf_id VARCHAR(255))
RETURNS DECIMAL(5,2) AS $$
DECLARE
    complexity_score DECIMAL(5,2) := 0;
    node_count INTEGER;
    connection_count INTEGER;
    trigger_count INTEGER;
    ai_node_count INTEGER;
BEGIN
    -- Base score da node count
    SELECT 
        COALESCE(node_count, 0),
        COALESCE(ai_node_count, 0)
    INTO node_count, ai_node_count
    FROM workflows 
    WHERE id = wf_id;
    
    complexity_score := node_count * 1.0;
    
    -- AI nodes aumentano complessità
    complexity_score := complexity_score + (ai_node_count * 2.0);
    
    -- Connection complexity
    SELECT COUNT(*) INTO connection_count
    FROM workflow_connections 
    WHERE workflow_id = wf_id;
    
    complexity_score := complexity_score + (connection_count * 0.5);
    
    -- Trigger complexity
    SELECT COUNT(*) INTO trigger_count
    FROM workflow_triggers 
    WHERE workflow_id = wf_id AND is_active = true;
    
    complexity_score := complexity_score + (trigger_count * 1.5);
    
    RETURN ROUND(complexity_score, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTI e DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE workflow_versions IS 'Tracking completo versioni workflow con meta information';
COMMENT ON TABLE workflow_connections IS 'Analisi dettagliata connections per flow analysis avanzato';
COMMENT ON TABLE workflow_triggers IS 'Sistema completo trigger analysis e configurazioni';
COMMENT ON TABLE workflow_development_data IS 'Pin data e static data per development tracking';
COMMENT ON TABLE execution_node_results IS 'Risultati dettagliati per ogni nodo in execution';
COMMENT ON TABLE workflow_analysis IS 'Metriche pre-calcolate per workflow complexity analysis';

COMMENT ON VIEW workflows_complete_extended IS 'Vista workflow completa con TUTTI i dati aggregati per frontend';
COMMENT ON VIEW executions_complete_extended IS 'Vista execution completa con node results e performance';

-- =====================================================
-- SUCCESS LOG
-- =====================================================

INSERT INTO sync_logs (started_at, completed_at, success, workflows_processed, executions_processed, error_message) 
VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 0, 0, 'Migration 009: Advanced Data Extraction schema completato');

-- Messaggio di conferma
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 009 Advanced Data Extraction completata!';
    RAISE NOTICE '📊 Nuove tabelle: workflow_versions, workflow_triggers, workflow_development_data';
    RAISE NOTICE '🔍 Estensioni: execution_node_results, workflow_analysis';
    RAISE NOTICE '⚡ Views avanzate: workflows_complete_extended, executions_complete_extended';
    RAISE NOTICE '🧮 Functions: calculate_workflow_complexity()';
END $$;