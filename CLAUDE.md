# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 REGOLE DI SVILUPPO OBBLIGATORIE

### 📝 Codice e Commenti
- **SEMPRE commentare il codice in ITALIANO** - Tutti i commenti devono essere in italiano
- **Nomi variabili/funzioni**: Inglese per coerenza del codice, commenti in italiano
- **Documentazione**: README, commenti di funzione, JSDoc sempre in italiano

### 🚫 Icone e UI
- **MAI usare icone pittografiche** (emoji) - Utilizzare esclusivamente **Lucide React icons**
- **Design System**: Control Room theme nero/verde, icone solo da Lucide React
- **Consistency**: Tutte le icone devono provenire dalla stessa libreria

### 📚 Documentazione API
- **PRIMA di qualsiasi sviluppo o ottimizzazione API**: Consultare sempre `/n8n-openapi.yml`
- **Riferimento obbligatorio**: Il file contiene la specifica completa n8n API v1.1.1
- **Endpoint verification**: Verificare sempre endpoint, parametri e schemi dati disponibili
- **Compatibility**: Mantenere piena compatibilità con n8n API v1

### 🔄 Cache e Sync Intelligente
- **Sistema implementato**: Smart cache invalidation per workflow modal
- **Refresh intervals**: 15 secondi per dati critici, 30-60 secondi per altri
- **Sync backend ottimizzato**: Rileva modifiche reali e skippa update inutili
- **Tools detection**: Vector stores, embeddings e retriever riconosciuti come AI tools

### 🚨 DATI REALI OBBLIGATORI
- **MAI utilizzare dati mock o fake** - Utilizzare ESCLUSIVAMENTE dati reali dal database PostgreSQL
- **Principio fondamentale**: Ogni componente deve mostrare dati reali dal database `n8n_mcp`
- **Zero tolleranza**: Non implementare mock data, placeholder o dati simulati
- **Tabelle di riferimento**: `tenant_workflows`, `tenant_executions`, `auth_users`, `security_audits`
- **Query sempre parametrizzate**: Usare `tenant_id` per isolamento multi-tenant
- **Fallback consentito**: Solo message "Nessun dato disponibile" se query vuota

## 🚀 PilotPro Control Center

Sistema completo di controllo e monitoraggio per workflow automation con architettura multi-tenant e interfaccia Control Room.

## 📁 Architettura del Progetto

```
MCP-N8N-Control/
├── src/                           # ✅ BACKEND COMPLETATO
│   ├── index.ts                  # MCP server entry point
│   ├── server/
│   │   └── express-server.ts     # Express API server (porta 3001)
│   ├── api/
│   │   ├── scheduler-controller.ts
│   │   ├── auth-controller.ts
│   │   ├── tenant-controller.ts
│   │   ├── stats-controller.ts
│   │   └── ai-agents-controller.ts  # ✅ AI Agent Transparency API
│   ├── auth/
│   │   └── jwt-auth.ts           # JWT authentication
│   ├── backend/
│   │   └── multi-tenant-scheduler.ts
│   ├── database/
│   │   ├── connection.ts         # PostgreSQL pool
│   │   └── migrations/           # SQL migrations
│   └── config/
│       └── environment.ts        # Config management
├── frontend/                      # ✅ FRONTEND COMPLETATO
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Layout, Sidebar, Header
│   │   │   ├── dashboard/       # Dashboard + widgets
│   │   │   ├── workflows/       # Workflows management
│   │   │   ├── executions/      # Executions monitoring
│   │   │   ├── stats/           # Analytics & KPI
│   │   │   ├── database/        # Database management
│   │   │   ├── alerts/          # Alert system
│   │   │   ├── scheduler/       # Scheduler control
│   │   │   ├── security/        # Security center
│   │   │   ├── agents/          # ✅ AI Agent Transparency
│   │   │   └── auth/            # Login/Auth components
│   │   ├── services/
│   │   │   └── api.ts           # API service layer
│   │   ├── store/
│   │   │   └── authStore.ts     # Zustand state
│   │   ├── lib/
│   │   │   └── utils.ts         # Utilities
│   │   └── styles/
│   │       └── globals.css      # Tailwind + custom CSS
│   ├── public/                   # Static assets
│   ├── dist/                     # Build output
│   └── package.json
├── tests/                         # Test suite
├── build/                         # Backend build output
├── docker-compose.yml            # Docker orchestration
├── Dockerfile                    # Container config
└── package.json                  # Root dependencies
```

## Comandi di Sviluppo

### Backend (Express + TypeScript)
```bash
npm install          # Installa dipendenze
npm run build        # Compila TypeScript in JavaScript (output in build/)
npm run dev          # Watch mode per sviluppo continuo
npm start           # Esegue il server compilato (porta 3001)
npm test            # Esegue test con Jest
npm run lint        # Esegue ESLint su src/
```

### Frontend (React + Vite + TypeScript) ✅ COMPLETATO
```bash
cd frontend
npm install          # Installa dipendenze
npm run dev         # Development server (porta 5173)
npm run build       # Build di produzione (output in dist/)
npm run preview     # Preview build di produzione
```

## Architettura del Sistema

### 🏗️ Architettura Multi-Tier

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│                         Porta: 5173                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐ │
│  │Dashboard │Workflows │Executions│  Stats   │ Security │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘ │
│                    React Query + Zustand                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │ JWT Auth
┌────────────────────────▼────────────────────────────────────┐
│                  BACKEND (Express + TypeScript)             │
│                         Porta: 3001                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes: /api/tenant/:id/* | /api/scheduler/*    │  │
│  │  Auth: JWT | Rate Limiting | CORS | Validation       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Multi-Tenant Scheduler (node-cron)                  │  │
│  │  Sync automatico ogni 30 minuti per tenant           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ PostgreSQL
┌────────────────────────▼────────────────────────────────────┐
│                    DATABASE (PostgreSQL 16)                 │
│                         Porta: 5432                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: tenant_workflows | tenant_executions        │  │
│  │         tenant_sync_logs | auth_users | tenants      │  │
│  │  Features: JSONB | Multi-tenant isolation | Indexes  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ n8n API
┌────────────────────────▼────────────────────────────────────┐
│                      n8n INSTANCE                           │
│                    (External Service)                       │
│         API endpoints for workflows & executions            │
└──────────────────────────────────────────────────────────────┘
```

### Backend - Express Server (Porta 3001)

#### Core Structure
- **Entry Point**: `src/server/express-server.ts` - Server Express con middleware e routing
- **Database**: PostgreSQL con schema multi-tenant
- **Authentication**: JWT con tenant isolation
- **Scheduler**: Sistema di sincronizzazione automatica con n8n

#### API Endpoints Principali

**Tenant-Specific** (isolamento dati per tenant):
- `GET /api/tenant/:tenantId/dashboard` - Dashboard data del tenant
- `GET /api/tenant/:tenantId/stats` - Statistiche specifiche
- `GET /api/tenant/:tenantId/workflows` - Workflow del tenant
- `GET /api/tenant/:tenantId/workflows/:workflowId/details` - Dettagli completi workflow con analisi nodi
- `GET /api/tenant/:tenantId/executions` - Esecuzioni del tenant

**AI Agent Transparency** ✅:
- `GET /api/tenant/:tenantId/agents/workflows` - Lista workflow con AI agents
- `GET /api/tenant/:tenantId/agents/workflow/:workflowId/timeline` - Timeline execution step-by-step
- `POST /api/tenant/:tenantId/agents/workflow/:workflowId/refresh` - Force refresh workflow data

**System Management**:
- `GET /api/scheduler/status` - Stato scheduler
- `POST /api/scheduler/start` - Avvia scheduler
- `POST /api/scheduler/stop` - Ferma scheduler
- `GET /api/logs` - Sync logs con filtri
- `GET /api/stats` - Statistiche sistema

**Authentication**:
- `POST /auth/login` - Login con email/password
- `GET /auth/profile` - Profilo utente corrente
- `POST /auth/logout` - Logout

### Frontend - React Application (Porta 5173) ✅ COMPLETATO

#### Design System - Control Room Theme
- **Colori**: Background nero (#000000), accenti verdi (#4ade80)
- **Componenti**: Card con bordi verdi, pulsanti gradient, tabelle dark mode
- **Icone**: Lucide React per consistenza visuale
- **Responsive**: Ottimizzato per desktop e mobile

#### Pagine Implementate (TUTTE CON DATI REALI)

1. **Dashboard** ✅ - Metriche real-time tenant-specific
   - Stats cards con trends
   - Recent activity feed
   - System health monitoring
   - Grafici ApexCharts

2. **Workflows** ✅ - Gestione workflow con status e statistiche
   - Lista completa workflow del tenant
   - Status indicators (active/inactive)
   - Filtri e ricerca avanzata
   - Export dati
   - **WorkflowDetailModal** ✅ - Modal dettagliato con 5 tabs:
     - Overview: Descrizione, AI agents, tools, sub-workflows
     - Executions: Storico esecuzioni con grafici trend
     - Nodes: Analisi nodi con distribuzione per tipo
     - Performance: Metriche performance e errori comuni
     - Activity: Log attività recenti

3. **Executions** ✅ - Monitoraggio esecuzioni con filtri avanzati
   - Tabella real-time con auto-refresh
   - Filtri per status/workflow/date
   - Dettagli esecuzione
   - Durata e performance metrics

4. **Stats & Analytics** ✅ - Analisi performance e KPI
   - Overview metrics
   - Performance analysis
   - Top/slowest workflows
   - Error tracking

5. **Database** ✅ - Gestione database e tabelle
   - Table statistics
   - System performance
   - Recent activity logs
   - Growth metrics

6. **Alerts** ✅ - Sistema di notifiche e monitoring
   - Real-time alerts dal backend
   - Filtri per severity/category
   - Monitoring metrics
   - System status indicators

7. **Scheduler** ✅ - Controllo sincronizzazione automatica
   - Scheduler status (running/stopped)
   - Sync history con dettagli
   - Job management
   - Execution timeline

8. **Security** ✅ - Audit logs e gestione accessi
   - Security logs dal backend
   - API keys management
   - User activity tracking
   - Risk analysis

9. **AI Agent Transparency** ✅ - Sistema avanzato di monitoring AI
   - Workflow cards con rilevamento AI agents automatico
   - Timeline step-by-step delle executions con show-N ordering
   - Parser intelligente contenuto email vs dati tecnici
   - Force refresh da n8n API con circuit breaker recovery
   - Trigger nodes: Input = "In attesa dati", Output = email ricevuta

#### Servizi API Frontend

File: `frontend/src/services/api.ts`

```typescript
// API principale con interceptor JWT
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' }
})

// Tenant-specific APIs - SOLO DATI DEL PROPRIO TENANT
export const tenantAPI = {
  dashboard: (tenantId) => api.get(`/api/tenant/${tenantId}/dashboard`),
  stats: (tenantId) => api.get(`/api/tenant/${tenantId}/stats`),
  workflows: (tenantId) => api.get(`/api/tenant/${tenantId}/workflows`),
  executions: (tenantId) => api.get(`/api/tenant/${tenantId}/executions`),
  analytics: {
    performance: (tenantId) => api.get(`/api/tenant/${tenantId}/stats`),
    topWorkflows: (tenantId) => api.get(`/api/tenant/${tenantId}/stats`),
    timeSeries: (tenantId) => api.get(`/api/tenant/${tenantId}/stats`)
  }
}

// System APIs
export const schedulerAPI = {
  status: () => api.get('/api/scheduler/status'),
  start: () => api.post('/api/scheduler/start'),
  stop: () => api.post('/api/scheduler/stop'),
  getSyncHistory: () => api.get('/api/logs')
}

// Security & Monitoring APIs
export const securityAPI = {
  logs: (tenantId, params) => api.get('/api/logs', { params }),
  metrics: () => api.get('/api/stats')
}
```

## Database Schema

### Tabelle Principali

```sql
-- Multi-tenant workflows
CREATE TABLE tenant_workflows (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  workflow_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  active BOOLEAN DEFAULT false,
  nodes JSONB,
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant executions
CREATE TABLE tenant_executions (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  execution_id VARCHAR(255) UNIQUE,
  workflow_id VARCHAR(255),
  workflow_name VARCHAR(255),
  status VARCHAR(50),
  mode VARCHAR(50),
  started_at TIMESTAMP,
  stopped_at TIMESTAMP,
  duration_ms INTEGER,
  error_message TEXT
);

-- Sync logs
CREATE TABLE tenant_sync_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255),
  tenant_name VARCHAR(255),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  success BOOLEAN,
  items_processed INTEGER,
  duration_ms INTEGER,
  error_message TEXT
);

-- Authentication
CREATE TABLE auth_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50),
  tenant_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configurazione Ambiente

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=n8n_mcp
DB_USER=your_user
DB_PASSWORD=your_password

# n8n API
N8N_API_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_api_key

# Server
PORT=3001
JWT_SECRET=your_jwt_secret_min_32_chars

# Scheduler
SYNC_INTERVAL_MINUTES=30
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Testing

### Backend Tests
```bash
npm test                # Tutti i test
npm run test:watch      # Watch mode
npm run test:coverage   # Con coverage report
```

### Frontend Tests
```bash
cd frontend
npm test               # Test con Vitest
```

## Deployment

### Build di Produzione

**Backend:**
```bash
npm run build
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Servire contenuto di dist/ con nginx o altro web server
```

### Docker
```bash
# Start con Docker Compose
docker-compose up -d

# Build e start
docker-compose up -d --build

# Stop
docker-compose down

# Con cleanup
docker-compose down -v
```

## Note Importanti

### Multi-Tenancy
- **ISOLAMENTO COMPLETO**: Ogni tenant vede SOLO i propri dati
- Tutte le query includono filtro `tenant_id`
- JWT contiene `tenantId` per validazione
- Nessun dato aggregato cross-tenant

### Workflow Analysis Features ✅
- **AI Agent Detection**: Rileva automaticamente agenti AI LangChain nei workflow
- **Tools Mapping**: Identifica e mappa tools collegati agli agents
- **Sub-Workflow Detection**: Identifica workflow chiamati come sub-processi
- **Sticky Notes Extraction**: Estrae documentazione da sticky notes n8n
- **Auto-Description**: Genera descrizioni automatiche basate su componenti workflow

### Sicurezza
- Autenticazione JWT su tutte le API protette
- Rate limiting su endpoint critici
- Sanitizzazione input SQL con query parametrizzate
- CORS configurato per domini autorizzati
- Audit trail completo

### Performance
- Query ottimizzate con indici su `tenant_id`
- Caching con React Query (refetch intervals configurabili)
- Pagination su liste lunghe
- Lazy loading componenti pesanti
- Build ottimizzata con code splitting

### UI/UX Features
- **Dark Mode**: Tema Control Room nero/verde
- **Real-time Updates**: Auto-refresh configurabile
- **Responsive Design**: Ottimizzato mobile/desktop
- **Filtri Avanzati**: Su tutte le tabelle principali
- **Export Dati**: CSV/JSON su liste
- **Toast Notifications**: Feedback azioni utente

## Troubleshooting

### Problemi Comuni

1. **"Cannot connect to database"**
   - Verificare credenziali in .env
   - Assicurarsi che PostgreSQL sia in esecuzione
   - Controllare che il database `n8n_mcp` esista

2. **"JWT token invalid"**
   - Pulire localStorage nel browser
   - Verificare JWT_SECRET nel backend
   - Rifare login

3. **"No data showing"**
   - Verificare che lo scheduler sia attivo
   - Controllare logs in `tenant_sync_logs`
   - Verificare connessione a n8n API

4. **Build errors TypeScript**
   - Eseguire `npm install` in entrambe le directory
   - Pulire cache: `rm -rf node_modules package-lock.json`
   - Reinstallare dipendenze

5. **Frontend non si connette al backend**
   - Verificare che backend sia su porta 3001
   - Controllare CORS settings
   - Verificare VITE_API_URL in frontend/.env

## Struttura Componenti Frontend

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx          # Layout principale
│   │   ├── Sidebar.tsx         # Navigazione laterale
│   │   └── Header.tsx          # Header con user menu
│   ├── dashboard/
│   │   ├── Dashboard.tsx       # Dashboard principale
│   │   ├── StatsCard.tsx       # Card metriche
│   │   └── RecentActivity.tsx  # Feed attività
│   ├── workflows/
│   │   ├── WorkflowsPage.tsx   # Gestione workflows
│   │   └── WorkflowDetailModal.tsx # Modal dettagli workflow
│   ├── executions/
│   │   └── ExecutionsPage.tsx  # Monitor esecuzioni
│   ├── stats/
│   │   └── StatsPage.tsx       # Analytics
│   ├── database/
│   │   └── DatabasePage.tsx    # Database management
│   ├── alerts/
│   │   └── AlertsPage.tsx      # Alert system
│   ├── scheduler/
│   │   └── SchedulerPage.tsx   # Scheduler control
│   ├── security/
│   │   └── SecurityPage.tsx    # Security center
│   └── agents/                 # ✅ AI Agent Transparency
│       └── AgentDetailModal.tsx # Modal timeline workflow execution
├── services/
│   └── api.ts                  # API service layer
├── store/
│   └── authStore.ts            # Zustand auth store
├── lib/
│   └── utils.ts                # Utility functions
└── styles/
    └── globals.css             # Global styles + Tailwind

```

## Tech Stack Completo

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL 16
- JWT Authentication
- node-cron scheduler
- Swagger/OpenAPI docs

### Frontend
- React 18 + TypeScript
- Vite build tool
- TailwindCSS styling
- React Query (data fetching)
- React Router DOM (routing)
- ApexCharts (grafici)
- Lucide React (icone)
- Zustand (state management)
- date-fns (date formatting)

## 🔄 Sistema Smart Cache Avanzato

### 1. Backend - Rilevamento Intelligente Cambiamenti
```typescript
// Confronto contenuto workflow per determinare aggiornamenti reali
private async saveWorkflowToDatabase(workflow: NormalizedWorkflow): Promise<boolean> {
  const existingResult = await this.db.query(`
    SELECT raw_data, updated_at FROM tenant_workflows 
    WHERE id = $1 AND tenant_id = $2
  `, [workflow.id, workflow.tenantId]);
  
  const newRawData = JSON.stringify(workflow.rawData);
  const isNewWorkflow = existingResult.rows.length === 0;
  
  let hasChanged = isNewWorkflow;
  if (!isNewWorkflow) {
    const existingRawData = JSON.stringify(existingResult.rows[0].raw_data);
    const existingUpdatedAt = new Date(existingResult.rows[0].updated_at);
    const newUpdatedAt = workflow.updatedAt ? new Date(workflow.updatedAt) : new Date();
    
    hasChanged = existingRawData !== newRawData || newUpdatedAt > existingUpdatedAt;
  }
  
  if (!hasChanged) {
    console.log(`📄 Workflow ${workflow.id} unchanged, skipping update`);
    return false;
  }
  // ... update logic
  return true;
}
```

### 2. Frontend - Cache Aggressiva per Modal Workflow
```typescript
const { data: detailData, isLoading, error, refetch } = useQuery({
  queryKey: ['workflow-details', tenantId, workflow.id],
  queryFn: async () => {
    console.log(`🔄 Fetching fresh workflow details for ${workflow.id}`)
    const response = await api.get(`/api/tenant/${tenantId}/workflows/${workflow.id}/details`)
    return response.data
  },
  refetchInterval: 15000, // Refresh ogni 15 secondi per dati modal critici
  refetchOnMount: true,   // Sempre refresh quando modal si apre
  refetchOnWindowFocus: true, // Refresh quando utente torna alla finestra
  staleTime: 0, // Dati immediatamente considerati stale per massima freschezza
})
```

### 3. API Force Refresh Workflow
```typescript
// Nuovo endpoint per forzare sync specifico workflow
router.post('/refresh-workflow', async (req, res) => {
  try {
    const { tenantId, workflowId } = req.body;
    
    // Forza sync immediato resettando timestamp
    await db.query(`
      UPDATE tenant_workflows 
      SET last_synced_at = '2000-01-01'
      WHERE id = $1 AND tenant_id = $2
    `, [workflowId, tenantId]);
    
    // Triggera sync per questo tenant
    const result = await scheduler.syncSingleTenant({ id: tenantId });
    
    res.json({
      success: true,
      workflow: { id: workflowId, tenantId: tenantId, synced: result.workflowsSynced > 0 },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh workflow' });
  }
});
```

### 4. Flusso Dati con Smart Cache
```
Modal Aperto → React Query fetch immediato (staleTime: 0)
            → Backend verifica se workflow è changed
            → Se unchanged: skip update, return cached
            → Se changed: update DB + return fresh data
            → Frontend auto-refresh ogni 15 secondi
            → Utente clicca Refresh → Force API call + backend sync
```

## 🤖 Analisi Workflow AI Avanzata

### Rilevamento Componenti AI
```typescript
// Identifica AI Agents con dettagli modello e temperatura
if (nodeType.includes('.agent') || nodeName.toLowerCase().includes('agent')) {
  const agentInfo = {
    name: nodeName,
    type: nodeType.split('.').pop() || nodeType,
    model: nodeParameters.model || nodeParameters.modelId || 'unknown',
    temperature: nodeParameters.temperature,
    systemPrompt: nodeParameters.systemPrompt ? 'Configured' : 'Default',
    connectedTools: [] // Popolato analizzando connections
  };
  nodeAnalysis.aiAgents.push(agentInfo);
}

// Identifica AI Tools - INCLUSI VECTOR STORES E RAG
else if (nodeType.includes('toolWorkflow') || 
         (nodeType.includes('tool') && nodeType.includes('langchain')) ||
         nodeType.includes('vectorStore') ||
         nodeType.includes('embedding') ||
         nodeType.includes('retriever')) {
  nodeAnalysis.tools.push({
    name: nodeName,
    type: nodeType.split('.').pop() || nodeType,
    description: nodeParameters.description || nodeParameters.toolDescription || nodeName
  });
}
```

### Estrazione Sticky Notes per Documentazione
```typescript
// Cattura sticky notes come documentazione workflow
if (nodeType === 'n8n-nodes-base.stickyNote') {
  nodeAnalysis.stickyNotes.push({
    content: nodeParameters.content || '',
    height: nodeParameters.height,
    width: nodeParameters.width,
    color: nodeParameters.color
  });
}
```

### Descrizione Automatica Workflow
```typescript
// Genera descrizione automatica basata su componenti
if (!nodeAnalysis.description && (nodeAnalysis.triggers.length > 0 || nodeAnalysis.aiAgents.length > 0)) {
  let autoDescription = 'This workflow ';
  
  if (nodeAnalysis.triggers.length > 0) {
    const triggerTypes = [...new Set(nodeAnalysis.triggers.map((t: any) => t.triggerType))];
    autoDescription += `starts from ${triggerTypes.join(' or ')} triggers`;
  }
  
  if (nodeAnalysis.aiAgents.length > 0) {
    autoDescription += nodeAnalysis.triggers.length > 0 ? ', uses ' : 'uses ';
    autoDescription += `${nodeAnalysis.aiAgents.length} AI agent${nodeAnalysis.aiAgents.length > 1 ? 's' : ''}`;
    if (nodeAnalysis.tools.length > 0) {
      autoDescription += ` with ${nodeAnalysis.tools.length} tool${nodeAnalysis.tools.length > 1 ? 's' : ''}`;
    }
  }
  
  if (nodeAnalysis.outputs.length > 0) {
    const outputTypes = [...new Set(nodeAnalysis.outputs.map((o: any) => o.outputType))];
    autoDescription += `, and sends responses via ${outputTypes.join(', ')}`;
  }
  
  autoDescription += '.';
  nodeAnalysis.description = autoDescription;
}
```

## 🎯 Principi di Design

### Frontend
- **Control Room Theme**: Background nero, accenti verdi fosforescenti
- **Data-First**: Tutti i componenti mostrano dati reali, zero mock
- **Responsive**: Mobile-first ma ottimizzato per dashboard desktop
- **Performance**: Lazy loading, code splitting, memo components
- **NO EMOJI**: Mai usare icone pittografiche, solo Lucide React icons

### Backend
- **Multi-Tenant First**: Ogni query filtra per tenant_id
- **Stateless**: JWT per autenticazione, no sessioni server
- **Resilient**: Retry logic, error handling, graceful degradation
- **Scalable**: Connection pooling, query optimization, caching ready

### Security
- **Zero Trust**: Verifica JWT su ogni richiesta
- **Tenant Isolation**: Impossibile accedere a dati di altri tenant
- **Rate Limiting**: Protezione da abusi
- **Audit Trail**: Logging completo di tutte le operazioni

## 🤖 AI Agent Transparency System ✅

### Funzionalità Complete Implementate

#### 1. Backend API (`src/api/ai-agents-controller.ts`)
```typescript
// Lista workflow con AI agents detection
GET /api/tenant/:tenantId/agents/workflows

// Timeline execution step-by-step con show-N ordering
GET /api/tenant/:tenantId/agents/workflow/:workflowId/timeline

// Force refresh workflow da n8n API + circuit breaker reset
POST /api/tenant/:tenantId/agents/workflow/:workflowId/refresh
```

#### 2. Frontend Modal (`frontend/src/components/agents/AgentDetailModal.tsx`)
- **Workflow Cards**: Dashboard con workflow che contengono AI agents
- **Timeline Modal**: Step-by-step execution con 3 tabs (Timeline, Business Context, Raw Data)
- **Show-N Ordering**: Nodi ordinati per annotazioni show-1, show-2, ..., show-7
- **Smart Parser**: Priorità contenuto email (subject, sender, body) vs dati tecnici
- **Trigger Logic**: Input = "In attesa di nuove email", Output = email ricevuta
- **Force Refresh**: Button per sync immediato da n8n API

#### 3. Funzioni Avanzate
- **Circuit Breaker Recovery**: Reset automatico dopo errori API n8n
- **Smart Cache**: React Query con 60s refresh + force refresh capability
- **Real-time Data**: Solo dati reali da PostgreSQL, zero mock data
- **Email Content Focus**: Parser mostra contenuto email invece di metadata
- **No Emoji Policy**: Solo Lucide React icons, nessuna icona pittografica

### Architettura AI Agent Timeline

```
Workflow Cards → Click → AgentDetailModal
                             ↓
                       Timeline Tab
                             ↓
                   Show-N Ordered Steps
                   (show-1, show-2, ...)
                             ↓
                    Expandable Steps
                             ↓
                  Input/Output Parsed
                  (Email content focus)
```

## Versioning

- **v2.3.0** ✅ - AI Agent Transparency System Completo:
  - Backend: API `/agents/workflows` e `/agents/workflow/:id/timeline`
  - Frontend: AgentDetailModal con timeline step-by-step
  - Show-N Ordering: Ordinamento custom nodi con show-1, show-2, ...
  - Smart Parser: Contenuto email vs dati tecnici con priorità intelligente
  - Trigger Logic: Input="In attesa dati", Output=email ricevuta
  - Circuit Breaker: Recovery automatico API n8n errors
  - Force Refresh: Sync immediato workflow + cache invalidation
  - No Emoji: Rimosse tutte icone pittografiche, solo Lucide React
- **v2.2.0** - Sistema Smart Cache Avanzato:
  - Backend: Intelligent sync detection con confronto raw_data
  - Frontend: Cache aggressiva per modal workflow (15s refresh, staleTime: 0)
  - API: Force refresh endpoint /api/scheduler/refresh-workflow
  - AI Analysis: Vector stores e RAG tools detection fix
  - Node counting: Sticky notes recognition e count accurato
- **v2.1.0** - WorkflowDetailModal con analisi AI agents, tools, sub-workflows e sticky notes
- **v2.0.0** - Frontend completo con tutte le pagine funzionanti e dati reali
- **v1.5.0** - Sostituiti tutti i mock data con API reali  
- **v1.0.0** - Backend completo con tutte le API
- **v0.5.0** - Sistema base MCP con scheduler

## 📞 Quick Start

```bash
# 1. Setup Database
createdb n8n_mcp
psql -d n8n_mcp -f src/database/migrations/*.sql

# 2. Start Backend
npm install
npm run build
DB_USER=your_user npm start

# 3. Start Frontend
cd frontend
npm install
npm run dev

# 4. Open Browser
http://localhost:5173

# Default login
Email: admin@pilotpro.com
Password: admin123
```

---

**Note**: Questo documento è il riferimento principale per lo sviluppo. Aggiornarlo quando si fanno modifiche significative all'architettura.