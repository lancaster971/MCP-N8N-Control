-- Migration 008 FIX: Enhanced Data Schema (solo elementi mancanti)
-- Data: 14 Agosto 2025 
-- Scopo: Completare schema per maximum data strategy

-- =====================================================
-- AGGIUNGI tag_name a workflow_tags per denormalization
-- =====================================================

ALTER TABLE workflow_tags 
ADD COLUMN IF NOT EXISTS tag_name VARCHAR(100);

-- Update tag_name da tabella tags esistente
UPDATE workflow_tags 
SET tag_name = tags.name 
FROM tags 
WHERE workflow_tags.tag_id = tags.id
AND workflow_tags.tag_name IS NULL;

-- =====================================================
-- AGGIUNGI custom_data a executions (se non esiste)
-- =====================================================

ALTER TABLE executions 
ADD COLUMN IF NOT EXISTS custom_data JSONB;

-- =====================================================
-- CORREGGI workflow_connections per connections analysis
-- =====================================================

-- Drop e ricrea workflow_connections con struttura corretta
DROP TABLE IF EXISTS workflow_connections;

CREATE TABLE workflow_connections (
    workflow_id VARCHAR(255),
    source_node VARCHAR(255),
    target_node VARCHAR(255), 
    connection_type VARCHAR(50) DEFAULT 'main',
    connection_index INTEGER DEFAULT 0,
    raw_connection JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workflow_id, source_node, target_node, connection_type, connection_index),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX idx_workflow_connections_workflow ON workflow_connections(workflow_id);
CREATE INDEX idx_workflow_connections_source ON workflow_connections(source_node);
CREATE INDEX idx_workflow_connections_target ON workflow_connections(target_node);

-- =====================================================
-- VIEWS CORRETTE per query optimization
-- =====================================================

-- Vista workflow completi con statistiche (corretta)
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
    -- Performance info consolidata
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

-- Vista executions con performance (corretta)
CREATE OR REPLACE VIEW executions_complete AS
SELECT 
    e.*,
    w.name as workflow_name,
    p.performance_score,
    p.data_processed_kb,
    p.bottleneck_node
FROM executions e
LEFT JOIN workflows w ON e.workflow_id = w.id
LEFT JOIN execution_performance p ON e.id = p.execution_id;

-- =====================================================
-- INDICI AGGIUNTIVI per performance
-- =====================================================

-- Performance query optimization
CREATE INDEX IF NOT EXISTS idx_workflow_tags_name ON workflow_tags(tag_name) WHERE tag_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_complexity ON workflows(ai_node_count, node_count);
CREATE INDEX IF NOT EXISTS idx_executions_recent ON executions(started_at DESC) WHERE started_at > CURRENT_DATE - INTERVAL '30 days';

-- =====================================================
-- FUNZIONE per sync tags automatico
-- =====================================================

CREATE OR REPLACE FUNCTION sync_workflow_tag_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna tag_name quando tag_id cambia
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.tag_id != OLD.tag_id) THEN
        SELECT name INTO NEW.tag_name FROM tags WHERE id = NEW.tag_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per mantenere tag_name sincronizzato
DROP TRIGGER IF EXISTS sync_tag_name_trigger ON workflow_tags;
CREATE TRIGGER sync_tag_name_trigger
    BEFORE INSERT OR UPDATE ON workflow_tags
    FOR EACH ROW
    EXECUTE FUNCTION sync_workflow_tag_names();

-- =====================================================
-- AGGIORNAMENTI tabelle esistenti per consistency
-- =====================================================

-- Assicura che tutte le foreign key siano corrette
ALTER TABLE workflow_nodes 
DROP CONSTRAINT IF EXISTS workflow_nodes_workflow_id_fkey,
ADD CONSTRAINT workflow_nodes_workflow_id_fkey 
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE;

-- =====================================================
-- COMMENTI e DOCUMENTAZIONE
-- =====================================================

COMMENT ON COLUMN workflow_tags.tag_name IS 'Tag name denormalized per query performance optimization';
COMMENT ON COLUMN executions.custom_data IS 'Custom data field da n8n execution per analisi avanzate';
COMMENT ON TABLE workflow_connections IS 'Analisi dettagliata connections tra nodi workflow';

COMMENT ON VIEW workflows_complete IS 'Vista ottimizzata workflow con tags, settings, complexity aggregati';
COMMENT ON VIEW executions_complete IS 'Vista ottimizzata executions con workflow context e performance';

-- =====================================================
-- SUCCESS LOG
-- =====================================================

INSERT INTO sync_logs (started_at, completed_at, success, workflows_processed, executions_processed, error_message) 
VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 0, 0, 'Migration 008 FIX: Enhanced Data Schema completata con successo');

-- Messaggio di conferma
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 008 Enhanced Data Schema completata!';
    RAISE NOTICE '📊 Tabelle disponibili: workflow_tags, workflow_settings, workflow_complexity, execution_performance';
    RAISE NOTICE '🔍 Views create: workflows_complete, executions_complete';
    RAISE NOTICE '⚡ Indici ottimizzati per query performance';
END $$;