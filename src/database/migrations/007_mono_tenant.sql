-- Migration 007: Conversione a Mono-Tenant
-- Rimuove complessità multi-tenant per sistema più robusto
-- Data: 14/08/2025

-- 1. BACKUP dei dati esistenti
CREATE TABLE workflows_backup AS SELECT * FROM tenant_workflows;
CREATE TABLE executions_backup AS SELECT * FROM tenant_executions;

-- 2. Crea nuove tabelle mono-tenant
CREATE TABLE workflows (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB NOT NULL,
    node_count INTEGER DEFAULT 0,
    has_webhook BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    schema_version VARCHAR(20) DEFAULT '2.0',
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nodes_notes JSONB
);

CREATE TABLE executions (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) REFERENCES workflows(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255),
    status VARCHAR(50),
    mode VARCHAR(50),
    started_at TIMESTAMP,
    stopped_at TIMESTAMP,
    duration_ms INTEGER,
    has_error BOOLEAN DEFAULT false,
    error_message TEXT,
    raw_data JSONB,
    detailed_steps JSONB,
    business_context JSONB,
    has_detailed_data BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes per performance
CREATE INDEX idx_workflows_active ON workflows(active);
CREATE INDEX idx_workflows_archived ON workflows(is_archived);
CREATE INDEX idx_workflows_updated ON workflows(updated_at DESC);
CREATE INDEX idx_workflows_webhook ON workflows(has_webhook);
CREATE INDEX idx_workflows_raw_data_gin ON workflows USING gin(raw_data);
CREATE INDEX idx_workflows_nodes_notes_gin ON workflows USING gin(nodes_notes);

CREATE INDEX idx_executions_workflow ON executions(workflow_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started ON executions(started_at DESC);
CREATE INDEX idx_executions_detailed ON executions(has_detailed_data);
CREATE INDEX idx_executions_raw_data_gin ON executions USING gin(raw_data);

-- 4. Triggers per auto-update
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_updated_at();

-- 5. Migra dati dal multi-tenant (client_simulation_a come main)
INSERT INTO workflows (
    id, name, active, created_at, updated_at, raw_data, 
    node_count, has_webhook, is_archived, last_synced_at, nodes_notes
)
SELECT 
    id, name, active, created_at, updated_at, raw_data,
    node_count, has_webhook, is_archived, last_synced_at, nodes_notes
FROM tenant_workflows 
WHERE tenant_id = 'client_simulation_a'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    active = EXCLUDED.active,
    updated_at = EXCLUDED.updated_at,
    raw_data = EXCLUDED.raw_data,
    nodes_notes = EXCLUDED.nodes_notes;

INSERT INTO executions (
    id, workflow_id, workflow_name, status, mode, started_at, stopped_at,
    duration_ms, has_error, error_message, raw_data, detailed_steps, 
    business_context, has_detailed_data
)
SELECT 
    execution_id, workflow_id, workflow_name, status, mode, started_at, stopped_at,
    duration_ms, has_error, error_message, raw_data, detailed_steps,
    business_context, has_detailed_data
FROM tenant_executions
WHERE tenant_id = 'client_simulation_a'
ON CONFLICT (id) DO NOTHING;

-- 6. Tabella sync logs semplificata
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    success BOOLEAN,
    workflows_processed INTEGER DEFAULT 0,
    executions_processed INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT
);

-- 7. Cleanup delle vecchie tabelle multi-tenant (OPTIONAL - da fare dopo test)
-- DROP TABLE tenant_workflows CASCADE;
-- DROP TABLE tenant_executions CASCADE;
-- DROP TABLE tenant_sync_logs CASCADE;
-- DROP TABLE tenants CASCADE;

COMMENT ON TABLE workflows IS 'Mono-tenant workflows table - simplified from multi-tenant';
COMMENT ON TABLE executions IS 'Mono-tenant executions table - simplified from multi-tenant';