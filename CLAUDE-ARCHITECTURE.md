# CLAUDE-ARCHITECTURE.md

Architettura tecnica del sistema PilotPro Control Center.

**← Torna a [CLAUDE.md](./CLAUDE.md) | Vedi anche: [Development](./CLAUDE-DEVELOPMENT.md) | [Features](./CLAUDE-FEATURES.md) | [Testing](./CLAUDE-TESTING.md) | [Roadmap](./CLAUDE-ROADMAP.md)**

---

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

## 🏗️ Architettura Multi-Tier

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

## Backend - Express Server (Porta 3001)

### Core Structure
- **Entry Point**: `src/server/express-server.ts` - Server Express con middleware e routing
- **Database**: PostgreSQL con schema multi-tenant
- **Authentication**: JWT con tenant isolation
- **Scheduler**: Sistema di sincronizzazione automatica con n8n

### API Endpoints Principali

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

## Frontend - React Application (Porta 5173) ✅ COMPLETATO

### Design System - Control Room Theme
- **Colori**: Background nero (#000000), accenti verdi (#4ade80)
- **Componenti**: Card con bordi verdi, pulsanti gradient, tabelle dark mode
- **Icone**: Lucide React per consistenza visuale
- **Responsive**: Ottimizzato per desktop e mobile

### Pagine Implementate (TUTTE CON DATI REALI)

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

### Servizi API Frontend

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

### Database Schema TIER 2 (Production Stability)

```sql
-- 7 nuove tabelle Production Stability
alerts                    # Alert management + escalation
alert_notifications      # Notification tracking
backup_jobs              # Backup job tracking + statistics  
backup_schedule          # Scheduled backup configuration
system_metrics           # Real-time system metrics
health_checks            # Component health monitoring
query_performance        # Database performance tracking
application_errors       # Error tracking + stack traces
pool_metrics_history     # Connection pool metrics history
```

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

## Multi-Tenancy

### ISOLAMENTO COMPLETO
- **Principio**: Ogni tenant vede SOLO i propri dati
- Tutte le query includono filtro `tenant_id`
- JWT contiene `tenantId` per validazione
- Nessun dato aggregato cross-tenant

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

## API Endpoints TIER 2 (12 Nuovi)

```bash
# Production Monitoring
GET  /api/production/health              # Multi-component health check
GET  /api/production/dashboard           # Aggregated production dashboard
GET  /api/production/metrics             # Real-time metrics
GET  /api/production/metrics/history     # Historical metrics

# Database Pool Management  
GET  /api/production/database/pool       # Pool status + detailed metrics
POST /api/production/database/pool/refresh # Pool refresh operation

# Alert System
GET  /api/production/alerts              # Active alerts + statistics
POST /api/production/alerts/{id}/acknowledge # Alert acknowledgment

# Backup System
GET  /api/production/backup              # Backup status + recent jobs  
POST /api/production/backup/trigger      # Manual backup trigger

# Graceful Shutdown
GET  /api/production/shutdown/status     # Shutdown manager status
POST /api/production/shutdown/test       # Shutdown simulation (dev only)
```

---

**← Torna a [CLAUDE.md](./CLAUDE.md) | Continua con: [Development](./CLAUDE-DEVELOPMENT.md) →**