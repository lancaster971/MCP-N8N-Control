-- Migration 007: Sistema Settings API per Frontend Remoto
-- Aggiunge sistema completo di configurazione per deployment frontend remoto

-- Tabella settings di sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- Può essere letto da API pubbliche
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    
    CONSTRAINT settings_category_check CHECK (
        category IN ('connection', 'security', 'frontend', 'backend', 'general')
    )
);

-- Tabella API Keys con TTL e permissions
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(128) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL, -- Esempio: 'pk_', 'sk_'
    key_type VARCHAR(50) NOT NULL DEFAULT 'frontend-read',
    permissions JSONB DEFAULT '[]'::jsonb,
    scopes JSONB DEFAULT '["read"]'::jsonb,
    tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT api_keys_type_check CHECK (
        key_type IN ('frontend-read', 'frontend-full', 'frontend-limited', 'backend-service', 'admin-full')
    )
);

-- Tabella audit trail per settings
CREATE TABLE IF NOT EXISTS settings_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, READ
    old_value JSONB,
    new_value JSONB,
    user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_action_check CHECK (
        action IN ('CREATE', 'UPDATE', 'DELETE', 'READ')
    )
);

-- Tabella configurazioni frontend
CREATE TABLE IF NOT EXISTS frontend_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_name VARCHAR(100) UNIQUE NOT NULL,
    backend_url VARCHAR(500) NOT NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    connection_timeout INTEGER DEFAULT 5000, -- milliseconds
    retry_attempts INTEGER DEFAULT 3,
    features JSONB DEFAULT '{}'::jsonb, -- Feature flags
    environment VARCHAR(20) DEFAULT 'production',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    
    CONSTRAINT environment_check CHECK (
        environment IN ('development', 'staging', 'production')
    )
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

CREATE INDEX IF NOT EXISTS idx_api_keys_type ON api_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

CREATE INDEX IF NOT EXISTS idx_settings_audit_timestamp ON settings_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_settings_audit_user ON settings_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_key ON settings_audit_log(setting_key);

CREATE INDEX IF NOT EXISTS idx_frontend_config_active ON frontend_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_frontend_config_env ON frontend_configurations(environment);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

DROP TRIGGER IF EXISTS trigger_update_api_keys_updated_at ON api_keys;
CREATE TRIGGER trigger_update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

DROP TRIGGER IF EXISTS trigger_update_frontend_config_updated_at ON frontend_configurations;
CREATE TRIGGER trigger_update_frontend_config_updated_at
    BEFORE UPDATE ON frontend_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Inserimento dati di default
INSERT INTO system_settings (setting_key, setting_value, category, description, is_public) VALUES
('frontend.default_backend_url', '"http://localhost:3001"', 'frontend', 'URL backend di default per frontend remoto', true),
('frontend.connection_timeout', '5000', 'frontend', 'Timeout connessione in millisecondi', true),
('frontend.retry_attempts', '3', 'frontend', 'Numero tentativi di retry', true),
('security.api_key_default_ttl', '86400', 'security', 'TTL default API keys in secondi (24h)', false),
('security.max_api_keys_per_user', '10', 'security', 'Numero massimo API keys per utente', false),
('security.rate_limit_api_key_generation', '5', 'security', 'Rate limit generazione API keys per ora', false),
('backend.health_check_interval', '30000', 'backend', 'Intervallo health check in ms', false),
('backend.cluster_mode', 'false', 'backend', 'Modalità cluster per scalabilità', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Creazione API key di default per admin
DO $$
DECLARE
    admin_user_id UUID;
    default_api_key VARCHAR(128);
BEGIN
    -- Trova admin user
    SELECT id INTO admin_user_id 
    FROM auth_users 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Genera API key di default
        default_api_key := 'pk_' || encode(gen_random_bytes(32), 'hex');
        
        INSERT INTO api_keys (
            key_name, 
            api_key, 
            key_prefix, 
            key_type, 
            permissions, 
            scopes, 
            created_by,
            expires_at
        ) VALUES (
            'Default Admin API Key',
            default_api_key,
            'pk_',
            'admin-full',
            '["*"]'::jsonb,
            '["read", "write", "admin"]'::jsonb,
            admin_user_id,
            CURRENT_TIMESTAMP + INTERVAL '365 days'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Configurazione frontend di default
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth_users 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO frontend_configurations (
            config_name,
            backend_url,
            connection_timeout,
            retry_attempts,
            features,
            environment,
            created_by
        ) VALUES (
            'default',
            'http://localhost:3001',
            5000,
            3,
            '{"auth": true, "sanitization": true, "audit": true}'::jsonb,
            'production',
            admin_user_id
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;