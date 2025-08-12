# 📚 N8N API - Documentazione Completa dei Campi

> **Generato il:** 2025-08-12  
> **Versione API:** v1  
> **Base URL:** https://flow.agentix-io.com/api/v1

## 📋 Indice

1. [Workflows API](#workflows-api)
2. [Executions API](#executions-api)
3. [Credentials API](#credentials-api)
4. [Tags API](#tags-api)
5. [Node Types API](#node-types-api)
6. [System API](#system-api)
7. [Schema Database Proposto](#schema-database-proposto)

---

## 🔄 Workflows API

### GET /workflows
Restituisce la lista di tutti i workflow.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `id` | string | ID univoco del workflow | "053vrF50XdC1ciOA" |
| `name` | string | Nome del workflow | "RETURN VALIDATION & INTAKE" |
| `active` | boolean | Se il workflow è attivo | true |
| `isArchived` | boolean | Se il workflow è archiviato (nascosto dall'UI) | false |
| `createdAt` | string (ISO 8601) | Data di creazione | "2025-06-20T13:50:12.556Z" |
| `updatedAt` | string (ISO 8601) | Data ultimo aggiornamento | "2025-06-28T14:35:35.000Z" |
| `nodes` | array | Array di nodi del workflow | [...] |
| `connections` | object | Mappa delle connessioni tra nodi | {...} |
| `settings` | object | Settings del workflow | {"executionOrder": "v1"} |
| `staticData` | object/null | Dati statici persistenti | null |
| `meta` | object | Metadata del workflow | {"templateCredsSetupCompleted": true} |
| `pinData` | object | Dati pinned per testing | {...} |
| `versionId` | string | ID della versione corrente | "f696720d-965e-4727-823e-a38652a9db49" |
| `triggerCount` | number | Numero di trigger nel workflow | 1 |
| `tags` | array | Tags associati | [] |

### GET /workflows/{id}
Restituisce i dettagli completi di un workflow specifico.

**Campi aggiuntivi rispetto alla lista:**

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `shared` | array | Info su ownership e condivisione | [{"role": "workflow:owner", ...}] |
| `shared[].createdAt` | string | Data di condivisione | "2025-06-20T13:50:12.562Z" |
| `shared[].role` | string | Ruolo dell'utente | "workflow:owner" |
| `shared[].workflowId` | string | ID del workflow | "053vrF50XdC1ciOA" |
| `shared[].projectId` | string | ID del progetto | "faRAVziI0wwHAtrH" |
| `shared[].project` | object | Dettagli del progetto | {...} |
| `shared[].project.name` | string | Nome del progetto/owner | "Tiziano Annicchiarico <email>" |
| `shared[].project.type` | string | Tipo progetto | "personal" |

### Struttura Nodi (nodes array)

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `id` | string | ID univoco del nodo | "38eac349-913b-4304-91f6-77e2762aa33e" |
| `name` | string | Nome del nodo | "Prepara Dati" |
| `type` | string | Tipo del nodo | "n8n-nodes-base.code" |
| `typeVersion` | number | Versione del tipo di nodo | 1 |
| `position` | array[2] | Coordinate [x, y] nel canvas | [-1460, -1880] |
| `parameters` | object | Parametri configurati del nodo | {...} |
| `credentials` | object | Credenziali associate | {} |
| `disabled` | boolean | Se il nodo è disabilitato | false |
| `notes` | string | Note del nodo | "" |
| `color` | string | Colore personalizzato | "#ff0000" |
| `continueOnFail` | boolean | Continua se il nodo fallisce | false |
| `executeOnce` | boolean | Esegui solo una volta | false |
| `notesInFlow` | boolean | Mostra note nel flow | false |
| `webhookId` | string | ID webhook (per trigger webhook) | "2c77a0da-6beb-48b1-acc8-bc20b702449e" |

### Struttura Connessioni (connections object)

```json
{
  "NodeName": {
    "main": [
      [
        {
          "node": "TargetNodeName",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

---

## ⚡ Executions API

### GET /executions
Lista delle esecuzioni dei workflow.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `id` | string | ID univoco dell'esecuzione | "110412" |
| `finished` | boolean | Se l'esecuzione è terminata | true |
| `mode` | string | Modalità di esecuzione | "trigger", "manual", "webhook" |
| `retryOf` | string/null | ID esecuzione che sta ritentando | null |
| `retrySuccessId` | string/null | ID del retry riuscito | null |
| `startedAt` | string | Timestamp di inizio | "2025-08-12T11:55:28.024Z" |
| `stoppedAt` | string | Timestamp di fine | "2025-08-12T11:55:28.206Z" |
| `workflowId` | string | ID del workflow eseguito | "KKSqAvsx6IO89YIJ" |
| `waitTill` | string/null | Attesa fino a timestamp | null |

### GET /executions/{id}
Dettagli completi di una singola esecuzione.

**Campi aggiuntivi:**

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `status` | string | Stato dell'esecuzione | "success", "error", "running", "waiting" |
| `data` | object | Dati completi dell'esecuzione | {...} |
| `data.startData` | object | Dati di input | {} |
| `data.resultData` | object | Risultati dell'esecuzione | {...} |
| `data.resultData.runData` | object | Dati di ogni nodo eseguito | {...} |
| `data.executionData` | object | Metadata dell'esecuzione | {...} |
| `workflowData` | object | Snapshot del workflow al momento dell'esecuzione | {...} |

### Struttura RunData (per ogni nodo eseguito)

```json
{
  "NodeName": [
    {
      "startTime": 1754138128045,
      "executionTime": 181,
      "executionStatus": "success",
      "source": [],
      "data": {
        "main": [[{...}]]
      }
    }
  ]
}
```

---

## 🔑 Credentials API

### GET /credentials
Lista delle credenziali configurate.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `id` | string | ID univoco credenziale | "cred_001" |
| `name` | string | Nome della credenziale | "Gmail Account" |
| `type` | string | Tipo di credenziale | "gmailOAuth2" |
| `createdAt` | string | Data creazione | "2025-05-08T14:10:38.611Z" |
| `updatedAt` | string | Data aggiornamento | "2025-08-11T22:01:00.000Z" |

---

## 🏷️ Tags API

### GET /tags
Lista di tutti i tag disponibili.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `id` | number | ID univoco del tag | 1 |
| `name` | string | Nome del tag | "production" |
| `createdAt` | string | Data creazione | "2025-05-08T14:10:38.611Z" |
| `updatedAt` | string | Data aggiornamento | "2025-08-11T22:01:00.000Z" |

---

## 🔧 Node Types API

### GET /node-types
Lista di tutti i tipi di nodi disponibili.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `name` | string | Nome del tipo di nodo | "n8n-nodes-base.httpRequest" |
| `displayName` | string | Nome visualizzato | "HTTP Request" |
| `group` | array | Gruppi di appartenenza | ["transform"] |
| `version` | number | Versione del nodo | 3 |
| `description` | string | Descrizione del nodo | "Makes HTTP requests" |
| `defaults` | object | Valori di default | {...} |
| `inputs` | array | Tipi di input accettati | ["main"] |
| `outputs` | array | Tipi di output prodotti | ["main"] |
| `credentials` | array | Credenziali supportate | [] |
| `properties` | array | Proprietà configurabili | [...] |

---

## 📊 System API

### GET /version
Informazioni sulla versione di n8n.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `version` | string | Versione n8n | "1.91.3" |
| `build` | object | Info build | {...} |

### GET /health
Stato di salute del sistema.

| Campo | Tipo | Descrizione | Esempio |
|-------|------|-------------|---------|
| `status` | string | Stato sistema | "ok" |
| `database` | boolean | Database connesso | true |
| `redis` | boolean | Redis connesso (se usato) | true |

### GET /metrics
Metriche Prometheus del sistema.

```
# HELP n8n_workflow_executions_total Total workflow executions
# TYPE n8n_workflow_executions_total counter
n8n_workflow_executions_total{workflow_id="...",status="success"} 123
```

---

## 💾 Schema Database Proposto

### Tabelle Principali

#### 1. `workflows`
```sql
CREATE TABLE workflows (
  -- Identificativi
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Stati
  active BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Ownership
  project_id VARCHAR(100),
  owner_email VARCHAR(255),
  modified_by VARCHAR(255),
  
  -- Classificazione
  workflow_type VARCHAR(50), -- webhook, scheduled, manual, form
  template_id VARCHAR(100),
  
  -- Struttura
  node_count INTEGER DEFAULT 0,
  connection_count INTEGER DEFAULT 0,
  trigger_count INTEGER DEFAULT 0,
  unique_node_types INTEGER DEFAULT 0,
  
  -- Contatori specifici nodi
  ai_node_count INTEGER DEFAULT 0,
  database_node_count INTEGER DEFAULT 0,
  http_node_count INTEGER DEFAULT 0,
  webhook_node_count INTEGER DEFAULT 0,
  
  -- Flags
  has_error_handler BOOLEAN DEFAULT false,
  has_wait_node BOOLEAN DEFAULT false,
  has_manual_trigger BOOLEAN DEFAULT false,
  
  -- Metriche calcolate
  complexity_score INTEGER DEFAULT 0,
  reliability_score INTEGER DEFAULT 0,
  efficiency_score INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 0,
  
  -- Statistiche esecuzione
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_duration_ms NUMERIC(10,2),
  min_duration_ms NUMERIC(10,2),
  max_duration_ms NUMERIC(10,2),
  
  -- Date esecuzione
  last_execution_at TIMESTAMP,
  last_success_at TIMESTAMP,
  last_failure_at TIMESTAMP,
  
  -- Metadata JSON
  settings JSONB,
  static_data JSONB,
  pinned_data JSONB,
  meta JSONB,
  shared JSONB,
  
  -- Versioning
  version_id VARCHAR(100),
  is_latest BOOLEAN DEFAULT true,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `executions`
```sql
CREATE TABLE executions (
  -- Identificativi
  id VARCHAR(100) PRIMARY KEY,
  workflow_id VARCHAR(255) NOT NULL,
  
  -- Stati
  finished BOOLEAN DEFAULT false,
  status VARCHAR(20), -- success, error, running, waiting, crashed
  mode VARCHAR(20), -- trigger, manual, webhook, retry, cli
  
  -- Retry
  retry_of VARCHAR(100),
  retry_success_id VARCHAR(100),
  
  -- Timing
  started_at TIMESTAMP NOT NULL,
  stopped_at TIMESTAMP,
  wait_till TIMESTAMP,
  duration_ms INTEGER,
  
  -- Dati esecuzione
  data JSONB, -- Dati completi (grande)
  workflow_data JSONB, -- Snapshot workflow
  
  -- Error tracking
  error_message TEXT,
  error_node_id VARCHAR(255),
  error_node_type VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);
```

#### 3. `workflow_nodes`
```sql
CREATE TABLE workflow_nodes (
  id SERIAL PRIMARY KEY,
  workflow_id VARCHAR(255) NOT NULL,
  
  -- Identificativi nodo
  node_id VARCHAR(255) NOT NULL,
  node_name VARCHAR(255),
  node_type VARCHAR(255),
  type_version NUMERIC(5,2),
  
  -- Posizione e visualizzazione
  position_x INTEGER,
  position_y INTEGER,
  color VARCHAR(7),
  notes TEXT,
  notes_in_flow BOOLEAN DEFAULT false,
  
  -- Configurazione
  parameters JSONB,
  credentials JSONB,
  webhook_id VARCHAR(255),
  
  -- Flags comportamento
  disabled BOOLEAN DEFAULT false,
  continue_on_fail BOOLEAN DEFAULT false,
  execute_once BOOLEAN DEFAULT false,
  
  -- Metriche nodo
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_execution_time_ms NUMERIC(10,2),
  error_rate NUMERIC(5,2),
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  UNIQUE(workflow_id, node_id)
);
```

#### 4. `workflow_connections`
```sql
CREATE TABLE workflow_connections (
  id SERIAL PRIMARY KEY,
  workflow_id VARCHAR(255) NOT NULL,
  
  -- Nodo sorgente
  source_node VARCHAR(255) NOT NULL,
  source_type VARCHAR(255),
  source_output INTEGER DEFAULT 0,
  
  -- Nodo destinazione
  target_node VARCHAR(255) NOT NULL,
  target_type VARCHAR(255),
  target_input INTEGER DEFAULT 0,
  
  -- Tipo connessione
  connection_type VARCHAR(20) DEFAULT 'main', -- main, error
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);
```

#### 5. `projects`
```sql
CREATE TABLE projects (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- personal, team, organization
  owner_email VARCHAR(255),
  description TEXT,
  icon VARCHAR(255),
  
  -- Settings
  settings JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `tags`
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. `workflow_tags`
```sql
CREATE TABLE workflow_tags (
  workflow_id VARCHAR(255) NOT NULL,
  tag_id INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workflow_id, tag_id),
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### 8. `credentials`
```sql
CREATE TABLE credentials (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  project_id VARCHAR(100),
  
  -- Non salviamo i dati sensibili!
  -- data JSONB, -- MAI salvare credenziali in chiaro
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
```

#### 9. `execution_node_results`
```sql
CREATE TABLE execution_node_results (
  id SERIAL PRIMARY KEY,
  execution_id VARCHAR(100) NOT NULL,
  workflow_id VARCHAR(255) NOT NULL,
  node_id VARCHAR(255) NOT NULL,
  
  -- Timing
  start_time BIGINT,
  execution_time INTEGER,
  
  -- Stato
  execution_status VARCHAR(20), -- success, error, skipped
  
  -- Dati (compressi se grandi)
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);
```

### Indici Ottimizzati

```sql
-- Workflows
CREATE INDEX idx_workflows_active ON workflows(active) WHERE is_archived = false;
CREATE INDEX idx_workflows_archived ON workflows(is_archived);
CREATE INDEX idx_workflows_project ON workflows(project_id);
CREATE INDEX idx_workflows_owner ON workflows(owner_email);
CREATE INDEX idx_workflows_type ON workflows(workflow_type);
CREATE INDEX idx_workflows_health ON workflows(health_score DESC);
CREATE INDEX idx_workflows_updated ON workflows(updated_at DESC);
CREATE INDEX idx_workflows_last_exec ON workflows(last_execution_at DESC);

-- Executions
CREATE INDEX idx_executions_workflow ON executions(workflow_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started ON executions(started_at DESC);
CREATE INDEX idx_executions_finished ON executions(finished) WHERE finished = false;

-- Nodes
CREATE INDEX idx_workflow_nodes_workflow ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_type ON workflow_nodes(node_type);

-- Connections
CREATE INDEX idx_connections_workflow ON workflow_connections(workflow_id);

-- Tags
CREATE INDEX idx_workflow_tags_workflow ON workflow_tags(workflow_id);
CREATE INDEX idx_workflow_tags_tag ON workflow_tags(tag_id);
```

### Viste Utili

```sql
-- Vista workflow visibili (non archiviati)
CREATE VIEW visible_workflows AS
SELECT * FROM workflows 
WHERE is_archived = false
ORDER BY active DESC, updated_at DESC;

-- Vista workflow con problemi
CREATE VIEW problematic_workflows AS
SELECT 
  id, name, active,
  failure_count,
  ROUND((failure_count::numeric / NULLIF(execution_count, 0) * 100), 2) as error_rate,
  health_score
FROM workflows
WHERE failure_count > 0
  AND last_execution_at > NOW() - INTERVAL '7 days'
ORDER BY error_rate DESC;

-- Vista statistiche per progetto
CREATE VIEW project_stats AS
SELECT 
  p.id,
  p.name,
  COUNT(w.id) as total_workflows,
  COUNT(CASE WHEN w.active = true THEN 1 END) as active_workflows,
  COUNT(CASE WHEN w.is_archived = true THEN 1 END) as archived_workflows,
  AVG(w.health_score) as avg_health_score,
  SUM(w.execution_count) as total_executions
FROM projects p
LEFT JOIN workflows w ON p.id = w.project_id
GROUP BY p.id, p.name;

-- Vista ultimi errori
CREATE VIEW recent_errors AS
SELECT 
  e.id,
  e.workflow_id,
  w.name as workflow_name,
  e.started_at,
  e.error_message,
  e.error_node_id,
  e.error_node_type
FROM executions e
JOIN workflows w ON e.workflow_id = w.id
WHERE e.status = 'error'
  AND e.started_at > NOW() - INTERVAL '24 hours'
ORDER BY e.started_at DESC;
```

---

## 📈 Campi Calcolati e KPI

### Metriche da Calcolare

1. **Complexity Score** (0-100)
   - Basato su: numero nodi, connessioni, tipi di nodi unici
   - Formula: `(node_count * 2 + connection_count * 1.5 + unique_node_types * 3) / 2`

2. **Reliability Score** (0-100)
   - Basato su: success rate ultimi 30 giorni
   - Formula: `(success_count / execution_count) * 100`

3. **Efficiency Score** (0-100)
   - Basato su: tempo medio esecuzione vs benchmark
   - < 1s = 100, < 5s = 80, < 10s = 60, < 30s = 40, > 30s = 20

4. **Health Score** (0-100)
   - Media ponderata di: reliability (40%), efficiency (30%), complexity inversa (30%)

### KPI Principali

- **Workflow più eseguiti** (top 10)
- **Workflow con più errori** (top 10)
- **Tempo medio di esecuzione** per workflow
- **Tasso di successo globale**
- **Workflow non utilizzati** (> 30 giorni)
- **Workflow complessi** (complexity_score > 80)
- **Utilizzo per tipo di trigger** (webhook vs scheduled vs manual)

---

## 🔄 Sincronizzazione Consigliata

### Frequenza Sync

- **Workflows**: Ogni 5 minuti (struttura cambia raramente)
- **Executions**: Ogni minuto (dati real-time importanti)
- **Tags/Credentials**: Ogni ora (cambiano poco)
- **Metriche/KPI**: Calcolo ogni 5 minuti
- **Cleanup old data**: Giornaliero (rimuovi esecuzioni > 90 giorni)

### Strategia di Sync

1. **Incremental Sync**: Usa `updatedAt` per prendere solo modifiche
2. **Full Sync**: Una volta al giorno per consistency
3. **Rate Limiting**: Max 10 richieste/secondo
4. **Retry Logic**: 3 tentativi con exponential backoff
5. **Error Handling**: Log errori in tabella dedicata

---

## 📝 Note Importanti

1. **NON salvare mai credenziali in chiaro** nel database
2. **Comprimere data field** delle esecuzioni se > 1MB
3. **Implementare soft delete** per audit trail
4. **Usare JSONB** per campi strutturati ma variabili
5. **Indicizzare campi** usati frequentemente nelle WHERE
6. **Partitionare executions** per data se volume alto
7. **Backup incrementali** ogni ora, full ogni notte

---

## 🚀 Prossimi Passi

1. ✅ Analisi completa API completata
2. ✅ Schema database definito
3. ⏳ Implementare migrazione per campi mancanti
4. ⏳ Aggiornare sync service per nuovi campi
5. ⏳ Creare dashboard analytics
6. ⏳ Implementare alerting per workflow critici