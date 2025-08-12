# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
│   │   └── stats-controller.ts
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
│   └── security/
│       └── SecurityPage.tsx    # Security center
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

## 🔄 Flusso Dati del Sistema

### 1. Autenticazione
```
User Login → Frontend → POST /auth/login → JWT Token → localStorage
            → Tutte le richieste successive includono: Authorization: Bearer <token>
```

### 2. Tenant Data Flow
```
Frontend Request → API /api/tenant/:tenantId/data
                → Backend verifica JWT.tenantId === request.tenantId
                → Query PostgreSQL con WHERE tenant_id = :tenantId
                → Ritorna SOLO dati del tenant
```

### 3. Scheduler Sync Flow
```
Cron Job (ogni 30 min) → Per ogni tenant attivo:
                       → Fetch da n8n API
                       → Salva in PostgreSQL
                       → Log in tenant_sync_logs
                       → Frontend riceve update via polling
```

### 4. Real-time Updates
```
Frontend (React Query) → refetchInterval: 5-60 secondi
                      → GET nuovi dati
                      → Aggiorna UI automaticamente
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

## Versioning

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