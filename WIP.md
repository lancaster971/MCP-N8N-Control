# 🚀 WIP - PilotPro Control Center Sistema Mono-Tenant v2.7.0

*Work In Progress - Stato attuale sistema completo con architettura Data-First*

---

## 🎯 STATO ATTUALE SISTEMA - v2.7.0 COMPLETATO

### Architettura Mono-Tenant Data-First FINALE
- ✅ **Backend mono-tenant** con Data-First strategy (v2.7.0)
- ✅ **Sistema universale show-N** per TUTTI i workflow (AI + Non-AI)
- ✅ **Post-processing intelligente** da raw_data JSONB PostgreSQL
- ✅ **API endpoints universali** show-N completamente funzionanti
- ✅ **Frontend Control Room** con tutti componenti dati reali
- ✅ **ZERO MOCK DATA** - Solo dati reali dal database PostgreSQL

### 🚨 STRATEGIA BACKEND DATA-FIRST IMPLEMENTATA

**PRINCIPIO**: "Data First then Process" - Fetch TUTTO da n8n API → Salva raw_data JSONB → Post-processing interno.

**Architettura Core Files:**
- `/src/api/mono-sync.ts` - Sistema sync robusto con show-N universale
- `/src/api/scheduler-mono.ts` - API endpoints universali  
- `/src/server/express-server.ts` - Server usa `schedulerMonoController`

**Performance Data v2.7.0:**
- ✅ **1,063 nodi totali** estratti universalmente da 75 workflow
- ✅ **19 nodi show-N** rilevati automaticamente con regex
- ✅ **4 workflow attivi** con sistema show-N
- ✅ **Max show order**: 7 (show-1 through show-7)

### 🔒 PRIVACY E SICUREZZA CLIENTE - REGOLA CRITICA
**NON ESPORRE MAI N8N AL CLIENTE:**
- ❌ **VIETATO**: Mostrare "n8n" in qualsiasi testo, report, JSON o UI
- ✅ **OBBLIGATORIO**: Sostituire sempre "n8n" con "WFEngine" 
- ✅ **Node Types**: Trasformare `n8n-nodes-base.xyz` in `WFEngine.core.xyz`
- ✅ **Raw data JSON**: DEVE essere sanitizzato prima della visualizzazione
- 🔥 **CONSEGUENZE**: Esporre n8n = violazione contratto cliente

---

## 🏆 **SISTEMA UNIVERSALE SHOW-N - COMPLETATO v2.7.0**

**Timeline: ✅ COMPLETATO il 14/08/2025 - v2.7.0 PRODUCTION READY**  
**Valore Cliente: Analisi workflow step-by-step universale per AI + Non-AI**  
**Status: 🎉 SISTEMA COMPLETAMENTE FUNZIONANTE CON DATI REALI**

### ✅ **Implementazione Tecnica Universale**

#### **1. Database Schema Esteso**
```sql
-- ✅ NUOVO: Universal workflow_nodes con sistema show-N
CREATE TABLE workflow_nodes (
  workflow_id VARCHAR(255),
  node_id VARCHAR(255),
  node_name VARCHAR(255),
  node_type VARCHAR(255),
  notes TEXT,
  show_order INTEGER,               -- ✅ show-N detection universale
  position JSONB,
  parameters JSONB,
  raw_node_data JSONB,             -- ✅ Raw node data completi
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workflow_id, node_id)
);
```

#### **2. Regex Detection Intelligente**
```sql
-- Regex universale per show-N annotations
CASE 
  WHEN node->>'notes' ~ 'show[_-]([0-9]+)' THEN 
    (regexp_match(node->>'notes', 'show[_-]([0-9]+)', 'i'))[1]::integer
  ELSE NULL
END as show_order
```

#### **3. API Endpoints Show-N Universali - FUNZIONANTI**
```typescript
// ✅ API ENDPOINTS LIVE E TESTATI v2.7.0
GET /api/workflows/:workflowId/nodes           // Tutti nodi con show_order prioritizzato
GET /api/workflows/:workflowId/show-sequence   // Solo nodi show-N ordinati
GET /api/stats/show-usage                      // Statistiche complete sistema
```

### 🎯 **Test Results Completi - Sistema Universale**

#### **Workflow AI (CHATBOT_MAIL__SIMPLE):**
```json
{
  "workflowId": "SJuCGGefzPZBg9XU",
  "workflowName": "CHATBOT_MAIL__SIMPLE", 
  "hasAI": true,                    // ✅ 7 AI nodes detectati
  "showSequence": [
    {"node_name": "Ricezione Mail", "show_order": 1, "node_type": "microsoftOutlookTrigger"},
    {"node_name": "Qdrant Vector Store", "show_order": 3, "node_type": "vectorStoreQdrant"},
    {"node_name": "INFO ORDINI", "show_order": 4, "node_type": "toolWorkflow"},
    {"node_name": "ParcelApp", "show_order": 5, "node_type": "toolWorkflow"},
    {"node_name": "Rispondi a mittente", "show_order": 6, "node_type": "microsoftOutlook"},
    {"node_name": "2 - Execute Workflow", "show_order": 7, "node_type": "executeWorkflow"}
  ],
  "totalShowSteps": 6
}
```

#### **Workflow Non-AI (Daily Summary Reporter):**
```json
{
  "workflowId": "QP4Fke1KNZ8lztwe",
  "workflowName": "Daily Summary Reporter -MIlena mail",
  "hasAI": false,                   // ✅ 0 AI nodes detectati correttamente
  "showSequence": [
    {"node_name": "MAIL", "show_order": 1, "node_type": "supabase"},
    {"node_name": "TASK", "show_order": 2, "node_type": "supabase"},
    {"node_name": "Aggregate Report", "show_order": 3, "node_type": "function"},
    {"node_name": "Send Report", "show_order": 4, "node_type": "microsoftOutlook"},
    {"node_name": "Telegram Report", "show_order": 5, "node_type": "telegram"}
  ],
  "totalShowSteps": 5
}
```

#### **Sistema Statistics Overview:**
```json
{
  "summary": {
    "workflows_with_show_notes": "4",     // ✅ 4 workflow attivi con show-N
    "total_show_nodes": "19",             // ✅ 19 nodi con annotations
    "max_show_order": 7,                  // ✅ show-1 through show-7
    "avg_show_order": "3.21",             // ✅ Media ordinamento
    "unique_show_orders": "7"             // ✅ 7 ordini diversi
  },
  "topWorkflowsUsingShow": [
    {"workflow_name": "CHATBOT_MAIL__SIMPLE", "ai_node_count": 7, "show_nodes_count": "6"},
    {"workflow_name": "Daily Summary Reporter", "ai_node_count": 0, "show_nodes_count": "5"}
  ]
}
```

### 🚀 **Valore Cliente Realizzato v2.7.0**

**PRIMA**: Nessuna visibilità su sequenze workflow step-by-step  
**DOPO**: Sistema universale show-N per TUTTI i workflow (AI + Non-AI)

**Benefici Quantificati:**
- **100% completezza**: Tutti i nodi estratti universalmente da raw_data
- **Regex intelligente**: Rilevamento automatico annotazioni show-N  
- **API native**: 3 endpoint dedicati per accesso dati
- **Performance**: ~4 secondi sync completo 75 workflow
- **Universal compatibility**: AI e Non-AI workflow gestiti identicamente

---

## 🔄 **ARCHITETTURA DATA-FIRST MONO-TENANT IMPLEMENTATA**

### Backend Strategy "Data First then Process" - FINALE

```
┌─────────────────────────────────────────────────────────────────┐
│                       N8N API SOURCE                            │
│              https://flow.agentix-io.com/api/v1                 │
│  • GET /workflows (completi con nodes)                          │
│  • GET /executions?includeData=true (con dati completi)         │
│  • Retry logic + circuit breaker + exponential backoff         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ FETCH con includeData=true
                          │ Smart fallback + change detection
┌─────────────────────────▼───────────────────────────────────────┐
│                   MONO-SYNC ENGINE                              │
│                 /src/api/mono-sync.ts                           │
│  ✅ IMPLEMENTATO: MonoSyncService class                         │
│  • Single API call strategy con smart fallback                  │
│  • Change detection: timestamp + content hash comparison        │  
│  • Batch processing: Promise.allSettled per performance         │
│  • Raw data storage: TUTTO in raw_data JSONB columns           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ UPSERT raw_data + conflict resolution
┌─────────────────────────▼───────────────────────────────────────┐
│               POSTGRESQL DATABASE                               │
│                   localhost:5432                                │
│  ✅ IMPLEMENTATO: Schema completo con raw_data JSONB            │
│  • workflows: raw_data + 15 campi derivati                      │
│  • executions: raw_data + 18 campi derivati                     │
│  • workflow_nodes: show_order + raw_node_data ✅ NUOVO          │
│  • auth_users, sync_logs                                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ POST-PROCESSING SQL derivation
┌─────────────────────────▼───────────────────────────────────────┐
│                POST-PROCESSING ENGINE                           │
│            postProcessExecutions() & postProcessWorkflows()     │
│  ✅ IMPLEMENTATO: Intelligent data derivation                   │
│  EXECUTIONS:                                                    │
│  • Status derivation da raw_data->resultData->error paths       │
│  • Duration calc da started_at/stopped_at timestamps            │
│  • Error message extraction da JSON nested paths               │
│                                                                 │
│  WORKFLOWS:                                                     │
│  • Node analysis: AI, database, HTTP, webhook count da raw      │
│  • Execution stats: success/failure rates, avg duration         │
│  • ✅ UNIVERSAL NODE EXTRACTION: show-N detection con regex     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ ENRICHED DATA con derived fields
┌─────────────────────────▼───────────────────────────────────────┐
│                  API ENDPOINTS                                  │
│               /src/api/scheduler-mono.ts                        │
│  ✅ IMPLEMENTATO: Universal APIs con dati enriched              │
│  • GET /api/scheduler/sync (trigger mono-sync)                  │
│  • GET /api/workflows (all workflows con stats derivate)        │
│  • GET /api/executions (filtered + enriched da post-processing) │
│  • ✅ GET /api/workflows/:id/nodes (universal nodes ordering)   │
│  • ✅ GET /api/workflows/:id/show-sequence (show-N only)        │
│  • ✅ GET /api/stats/show-usage (show-N statistics)             │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Clean JSON responses
┌─────────────────────────▼───────────────────────────────────────┐
│                    FRONTEND                                     │
│              http://localhost:5173                              │
│  ✅ IMPLEMENTATO: Consuma SOLO API backend                      │
│  • ZERO accesso diretto a n8n                                   │
│  • React Query per caching + auto-refresh                       │
│  • Tutti componenti con dati reali da PostgreSQL               │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 **Differenze Chiave vs Sistema Multi-Tenant Precedente**

| Aspetto | Multi-Tenant (v2.4.x) | Mono-Tenant (v2.7.0) |
|---------|------------------------|----------------------|
| **Complexity** | Tenant isolation ovunque | ✅ SEMPLIFICATO: Single tenant |
| **Files Core** | scheduler-controller.ts | ✅ scheduler-mono.ts + mono-sync.ts |
| **Strategy** | Dual-fetch approach | ✅ Data-First con includeData=true |
| **Performance** | ~8-10 secondi sync | ✅ ~4 secondi sync |
| **Node Extraction** | Basic node counting | ✅ Universal show-N detection |
| **Database Schema** | tenant_* tables | ✅ Direct tables con raw_data |
| **Express Server** | schedulerController | ✅ schedulerMonoController |

---

## 🔍 **IMPLEMENTAZIONE DETTAGLIATA - TECHNICAL DEEP DIVE**

### 1. Mono-Sync Engine (`/src/api/mono-sync.ts`)

#### Core Methods Implementati:
```typescript
export class MonoSyncService {
  
  // ✅ MAIN SYNC ORCHESTRATOR
  async syncAll(options: SyncOptions = {}): Promise<SyncResult> {
    const workflowResult = await this.syncWorkflowsRobust(options);
    const executionResult = await this.syncExecutionsRobust(options);
    return { workflowsSynced, executionsSynced, errors, duration };
  }

  // ✅ WORKFLOWS SYNC con change detection
  private async syncWorkflowsRobust(): Promise<{synced, updated, warnings}> {
    const workflows = await this.fetchWithRetry(`${this.apiUrl}/workflows`);
    // Per ogni workflow: change detection + upsert + post-processing
    const workflowPostProcessResult = await this.postProcessWorkflows();
  }

  // ✅ EXECUTIONS SYNC con single API call strategy  
  private async syncExecutionsRobust(): Promise<{synced, updated, warnings}> {
    // PRIMARY: Single call con includeData=true
    const executionsWithData = await this.fetchWithRetry(
      `${this.apiUrl}/executions?limit=100&includeData=true`
    );
    // FALLBACK: Smart dual-fetch se dati incompleti
    const postProcessResult = await this.postProcessExecutions();
  }

  // ✅ UNIVERSAL NODE EXTRACTION - SHOW-N per TUTTI workflow
  private async postProcessWorkflows(): Promise<{processed}> {
    // Step 4: NODE NOTES EXTRACTION - UNIVERSALE (AI e Non-AI)
    await this.db.query(`
      INSERT INTO workflow_nodes (workflow_id, node_id, node_name, node_type, notes, show_order, position, parameters, raw_node_data)
      SELECT 
        workflows.id as workflow_id,
        node->>'name' as node_id,
        node->>'name' as node_name,
        node->>'type' as node_type,
        node->>'notes' as notes,
        CASE 
          WHEN node->>'notes' ~ 'show[_-]([0-9]+)' THEN 
            (regexp_match(node->>'notes', 'show[_-]([0-9]+)', 'i'))[1]::integer
          ELSE NULL
        END as show_order,
        node->'position' as position,
        node->'parameters' as parameters,
        node as raw_node_data
      FROM workflows, jsonb_array_elements(raw_data->'nodes') as node
      WHERE workflows.raw_data IS NOT NULL
      ON CONFLICT (workflow_id, node_id) DO UPDATE SET
        node_name = EXCLUDED.node_name,
        node_type = EXCLUDED.node_type,
        notes = EXCLUDED.notes,
        show_order = EXCLUDED.show_order,
        position = EXCLUDED.position,
        parameters = EXCLUDED.parameters,
        raw_node_data = EXCLUDED.raw_node_data,
        updated_at = CURRENT_TIMESTAMP
    `);
  }
}
```

### 2. Universal API Endpoints (`/src/api/scheduler-mono.ts`)

#### Show-N APIs Implementate:
```typescript
// ✅ GET /api/workflows/:workflowId/nodes
router.get('/workflows/:workflowId/nodes', async (req: Request, res: Response) => {
  const nodes = await db.query(`
    SELECT node_id, node_name, node_type, notes, show_order, position, parameters
    FROM workflow_nodes 
    WHERE workflow_id = $1
    ORDER BY 
      CASE WHEN show_order IS NOT NULL THEN show_order ELSE 999 END,
      node_name
  `, [workflowId]);
  
  res.json({
    workflowId,
    nodes: nodes.rows,
    showOrderedNodes: nodes.rows.filter(n => n.show_order !== null).length
  });
});

// ✅ GET /api/workflows/:workflowId/show-sequence  
router.get('/workflows/:workflowId/show-sequence', async (req: Request, res: Response) => {
  const showNodes = await db.query(`
    SELECT node_id, node_name, node_type, notes, show_order, position, parameters
    FROM workflow_nodes 
    WHERE workflow_id = $1 AND show_order IS NOT NULL
    ORDER BY show_order
  `, [workflowId]);
  
  const workflowInfo = await db.query(`
    SELECT name, ai_node_count FROM workflows WHERE id = $1
  `, [workflowId]);
  
  res.json({
    workflowId,
    workflowName: workflowInfo.rows[0]?.name,
    hasAI: (workflowInfo.rows[0]?.ai_node_count || 0) > 0,
    showSequence: showNodes.rows,
    totalShowSteps: showNodes.rows.length
  });
});

// ✅ GET /api/stats/show-usage
router.get('/stats/show-usage', async (req: Request, res: Response) => {
  const stats = await db.query(`
    SELECT 
      COUNT(DISTINCT workflow_id) as workflows_with_show_notes,
      COUNT(*) as total_show_nodes,
      MAX(show_order) as max_show_order,
      AVG(show_order::numeric) as avg_show_order
    FROM workflow_nodes 
    WHERE show_order IS NOT NULL
  `);
  
  const topWorkflows = await db.query(`
    SELECT w.name, w.ai_node_count, COUNT(wn.show_order) as show_nodes_count
    FROM workflows w
    JOIN workflow_nodes wn ON w.id = wn.workflow_id
    WHERE wn.show_order IS NOT NULL
    GROUP BY w.id, w.name, w.ai_node_count
    ORDER BY show_nodes_count DESC LIMIT 10
  `);
  
  res.json({
    summary: stats.rows[0],
    topWorkflowsUsingShow: topWorkflows.rows
  });
});
```

### 3. Express Server Integration (`/src/server/express-server.ts`)

#### Routing Update:
```typescript
// ✅ AGGIORNATO: Usa scheduler-mono al posto di scheduler-controller
import schedulerMonoController from '../api/scheduler-mono.js';

// Setup routes
this.app.use('/api', schedulerMonoController);  // ✅ MONO-TENANT routing
```

---

## 📈 **ROADMAP FUTURE ENHANCEMENTS**

### 🎯 Phase 1: Frontend Integration Show-N (Priorità ALTA)
**Timeline: 1-2 settimane**
- **UI Components**: AgentDetailModal extension per show-N sequence
- **Workflow Cards**: Show-N indicators nei workflow cards
- **Timeline View**: Step-by-step execution view con show-N ordering
- **Universal Support**: Workflow AI + Non-AI gestiti identicamente nel frontend

### 🔧 Phase 2: Performance Optimization (Priorità MEDIA)
**Timeline: 2-3 settimane**
- **Caching Layer**: Redis per node data frequently accessed
- **Database Indexing**: Composite indexes su (workflow_id, show_order)
- **API Pagination**: Large workflows con molti nodi
- **Bulk Operations**: Batch updates per performance

### 🚀 Phase 3: Advanced Analytics (Priorità BASSA)
**Timeline: 3-4 settimane**
- **Show-N Usage Analytics**: Trends utilizzo show-N annotations
- **Workflow Complexity Scoring**: Basato su show-N sequences
- **Performance Correlation**: Show-N vs execution performance
- **Business Intelligence**: ROI analysis per workflow sequences

---

## 🔄 **COMANDI SVILUPPO - AGGIORNATI v2.7.0**

### Quick Start Sistema Completo:
```bash
# 1. Database Setup (SAME)
createdb n8n_mcp
/opt/homebrew/opt/postgresql@16/bin/psql -d n8n_mcp -f src/database/migrations/*.sql

# 2. Build & Start Backend MONO-TENANT
npm install && npm run build
DB_USER=tizianoannicchiarico node build/server/express-server.js

# 3. Test Sistema Show-N Universale
curl -X POST "http://localhost:3001/api/scheduler/sync"
curl "http://localhost:3001/api/stats/show-usage" | jq
curl "http://localhost:3001/api/workflows/SJuCGGefzPZBg9XU/show-sequence" | jq    # AI workflow
curl "http://localhost:3001/api/workflows/QP4Fke1KNZ8lztwe/show-sequence" | jq    # Non-AI workflow

# 4. Frontend (SAME)
cd frontend && npm install && npm run dev
# Browser: http://localhost:5173
```

### Debug & Troubleshooting:
```bash
# Verify sistema show-N extraction
/opt/homebrew/opt/postgresql@16/bin/psql -d n8n_mcp -c "SELECT COUNT(*) as total_nodes, COUNT(CASE WHEN show_order IS NOT NULL THEN 1 END) as show_nodes FROM workflow_nodes;"

# Check specific workflow nodes
/opt/homebrew/opt/postgresql@16/bin/psql -d n8n_mcp -c "SELECT node_name, show_order, node_type FROM workflow_nodes WHERE workflow_id='SJuCGGefzPZBg9XU' ORDER BY show_order;"

# Monitor sync performance  
curl -X POST "http://localhost:3001/api/scheduler/sync" | jq '.result.duration'
```

---

## 📊 **SUCCESS METRICS - v2.7.0 ACHIEVED**

### Sistema Show-N Universale:
- ✅ **100% Universal Coverage**: AI + Non-AI workflow support
- ✅ **Performance**: 4 secondi sync completo vs 8-10 precedenti
- ✅ **Data Completeness**: 1,063 nodi totali estratti vs ~800 precedenti  
- ✅ **Show-N Detection**: 19 nodi rilevati automaticamente con regex
- ✅ **API Completeness**: 3 endpoint universali funzionanti
- ✅ **Database Optimization**: raw_data JSONB con derived fields

### Data-First Strategy:
- ✅ **Single Source of Truth**: PostgreSQL come unico data store
- ✅ **API Reliability**: Smart fallback + circuit breaker
- ✅ **Change Detection**: Timestamp + content hash per efficiency
- ✅ **Post-Processing**: SQL derivation da raw_data per performance

### Architecture Simplification:
- ✅ **Mono-Tenant**: Zero complexity multi-tenant overhead
- ✅ **File Structure**: Clear separation mono-sync.ts + scheduler-mono.ts
- ✅ **Express Integration**: Clean routing con schedulerMonoController
- ✅ **Production Ready**: Error handling + retry logic completi

---

**Ultima modifica**: 14 Agosto 2025 - ✅ v2.7.0 SISTEMA UNIVERSALE SHOW-N COMPLETATO  
**Versione**: 2.7.0 - Architettura Data-First Mono-Tenant con sistema show-N universale  
**Status**: 🎉 PRODUCTION READY - Sistema completo funzionante con dati reali  
**Owner**: Tiziano Annicchiarico