# CLAUDE.md

Guida principale per Claude Code (claude.ai/code) quando lavora con il codice di questo repository.

---

## 📚 **DOCUMENTAZIONE COMPLETA**

**File di documentazione separati:**
- 🏗️ **[CLAUDE-ARCHITECTURE.md](./CLAUDE-ARCHITECTURE.md)** - Architettura sistema, database schema, API endpoints
- 🔧 **[CLAUDE-DEVELOPMENT.md](./CLAUDE-DEVELOPMENT.md)** - Comandi sviluppo, configurazione, testing, deployment  
- ⚡ **[CLAUDE-FEATURES.md](./CLAUDE-FEATURES.md)** - Smart Cache, AI Analysis, Agent Transparency System
- 🧪 **[CLAUDE-TESTING.md](./CLAUDE-TESTING.md)** - Test suite completa, TIER 1+2, script automatizzati
- 🚀 **[CLAUDE-ROADMAP.md](./CLAUDE-ROADMAP.md)** - Versioning, TIER 3+4, migration path futuro

---

## 🚨 **REGOLE DI SVILUPPO OBBLIGATORIE**

### 📝 Codice e Commenti
- **SEMPRE commentare il codice in ITALIANO** - Tutti i commenti devono essere in italiano
- **Nomi variabili/funzioni**: Inglese per coerenza del codice, commenti in italiano
- **Documentazione**: README, commenti di funzione, JSDoc sempre in italiano

### 🚫 Icone e UI
- **MAI usare icone pittografiche** (emoji) - Utilizzare esclusivamente **Lucide React icons**
- **Design System**: Control Room theme nero/verde, icone solo da Lucide React
- **Consistency**: Tutte le icone devono provenire dalla stessa libreria

### 🔒 SICUREZZA E PRIVACY CLIENTE - CRITICO
- **MAI esporre riferimenti a n8n** nell'interfaccia utente, report o export
- **Sostituire SEMPRE "n8n" con "WFEngine"** in tutti i testi visibili al cliente
- **Sanitizzare nodeTypes**: trasformare `n8n-nodes-base` in `WFEngine.core`
- **Raw data JSON**: DEVE essere sanitizzato prima della visualizzazione
- **Report e documenti**: pulire ogni riferimento all'implementazione sottostante
- **Nomenclatura**: usare termini generici come "workflow engine", "automation system"
- **REGOLA D'ORO**: Il cliente NON deve mai sapere che sotto c'è n8n

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

---

## 🚀 **PilotPro Control Center**

Sistema completo di controllo e monitoraggio per workflow automation con architettura multi-tenant e interfaccia Control Room.

**STATO ATTUALE v2.13.0**: 📦 **LOGIN PAGE PACKAGE + ADMIN UI ENHANCED**
- 📦 **NUOVO: Complete Login Page Package** - Pacchetto standalone riutilizzabile con tutti i componenti per login/auth
- 🎨 **Complete Test Results System** - Sezione cliccabile con UI dettagliata per visualizzazione risultati completi
- 🔐 **Dedicated Login Screen** - Sistema login professionale che sempre parte con autenticazione
- 📱 **Boxed Responsive Layout** - Layout contenuto senza scroll laterali, responsive design completo
- 🏢 **Mono-Tenant con Architettura Multi-Tenant Predisposta** - Switch immediato via environment variables
- 🔒 **TIER 1 Security Integration COMPLETATO** - JWT + API Key + RBAC + Rate Limiting (88% test pass)
- 🏭 **TIER 2 Production Stability COMPLETATO** - Health monitoring + Alert system + Backup + Graceful shutdown (82% test pass)
- ✅ Test Suite completo con export/copy/re-run functionality
- ✅ 50+ API endpoints enterprise-grade con tenant isolation
- ✅ Admin Interface completa con professional UX/UI
- 📚 Documentazione completa per production deployment

### 📋 **Documentazione Dettagliata:**
- 🏗️ **Architettura**: [CLAUDE-ARCHITECTURE.md](./CLAUDE-ARCHITECTURE.md) - Schema database, API endpoints, tech stack
- 🔧 **Sviluppo**: [CLAUDE-DEVELOPMENT.md](./CLAUDE-DEVELOPMENT.md) - Setup, comandi, deployment, troubleshooting
- ⚡ **Features**: [CLAUDE-FEATURES.md](./CLAUDE-FEATURES.md) - Smart cache, AI transparency, design principles
- 🧪 **Testing**: [CLAUDE-TESTING.md](./CLAUDE-TESTING.md) - Test suite enterprise, security validation
- 🚀 **Roadmap**: [CLAUDE-ROADMAP.md](./CLAUDE-ROADMAP.md) - Versioning, TIER 3+4, migration path

---

---

## 🏢 **Configurazione Mono/Multi-Tenant v2.11.0**

### 🎯 **Modalità Mono-Tenant (Default)**

```bash
# Environment variables (default behavior)
MULTI_TENANT_MODE=false
DEFAULT_TENANT_ID=client_simulation_a

# Comportamento sistema
✅ Tutti gli utenti assegnati automaticamente al tenant default
✅ User creation ignora tenant ID fornito, usa sempre il default  
✅ Sistema funziona come mono-tenant ma mantiene isolamento dati
✅ Architettura predisposta per multi-tenant
```

### 🌐 **Modalità Multi-Tenant (Switch Immediato)**

```bash
# Environment variables per multi-tenant
MULTI_TENANT_MODE=true
DEFAULT_TENANT_ID=primary_tenant

# Comportamento sistema  
✅ Tenant ID può essere specificato esplicitamente
✅ Fallback al default tenant se non specificato
✅ Validazione tenant ID con mode-aware logic
✅ Nessuna modifica al codice richiesta
```

### 🔧 **Switch Modalità (Runtime)**

```bash
# Da mono-tenant a multi-tenant
MULTI_TENANT_MODE=true DEFAULT_TENANT_ID=primary_tenant node build/server/express-server.js
# Output: "🏢 Tenant Mode: Multi-Tenant"

# Da multi-tenant a mono-tenant  
MULTI_TENANT_MODE=false DEFAULT_TENANT_ID=client_simulation_a node build/server/express-server.js
# Output: "🏢 Tenant Mode: Mono-Tenant"
```

---

## 📞 **Quick Start**

```bash
# 1. Setup Database
createdb n8n_mcp
psql -d n8n_mcp -f src/database/migrations/*.sql

# 2. Start Backend (Mono-Tenant Mode)
npm install
npm run build
WEBHOOK_SECRET=pilotpro-webhook-2025-secure DB_USER=your_user \
MULTI_TENANT_MODE=false DEFAULT_TENANT_ID=client_simulation_a \
npm start

# 3. Start Frontend
cd frontend
npm install
npm run dev

# 4. Open Browser - Client Frontend  
http://localhost:5174

# 5. Open Admin Interface - Backend Management
http://localhost:3002

# Default admin credentials (both interfaces)
Email: admin@n8n-mcp.local
Password: admin123

# Expected server output
🏢 Tenant Mode: Mono-Tenant
🏷️  Default Tenant: client_simulation_a

# 6. Login Page Package (Optional)
# Per progetti esterni - usa il pacchetto completo in /loginPage/
# Documentazione completa: /loginPage/README.md
```

### 🎯 **Test Suite Rapido**

```bash
# Test rapido sistema (30 secondi)
./test-quick.sh

# Test completo enterprise (3 minuti)
./test-suite.sh

# Test sicurezza approfonditi (2 minuti)
./test-suite-security.sh
```

---

## 🏗️ **Architettura High-Level**

```
┌─────────────────────────────────────────────────────────────┐
│               FRONTEND (React + Vite + TypeScript)          │
│   🖥️ Control Room UI | 📱 Responsive | ⚡ Real-time        │
│   Dashboard • Workflows • Executions • AI Agents • Stats    │
└──────────────────────┬──────────────────────────────────────┘
                       │ JWT Auth + API Calls
┌──────────────────────▼──────────────────────────────────────┐
│                BACKEND (Express + TypeScript)               │
│   🔒 JWT + RBAC | ⚡ Rate Limiting | 🏊‍♂️ Connection Pool   │
│   Tenant APIs • Scheduler • AI Agents • Production APIs     │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries + Sync
┌──────────────────────▼──────────────────────────────────────┐
│                DATABASE (PostgreSQL 16)                     │
│   🔐 Multi-tenant | 📊 JSONB | 🔍 Indexed | 💾 Backup      │
│   Workflows • Executions • Metrics • Alerts • Security      │
└──────────────────────┬──────────────────────────────────────┘
                       │ n8n API Integration
┌──────────────────────▼──────────────────────────────────────┐
│                     n8n WORKFLOW ENGINE                     │
│                    🤖 AI Workflows + RAG                    │
└──────────────────────────────────────────────────────────────┘
```

**📋 Per dettagli completi:** [CLAUDE-ARCHITECTURE.md](./CLAUDE-ARCHITECTURE.md)

---

## ⚡ **Features Principali**

### 🤖 **AI Agent Transparency System**
- **Timeline execution step-by-step** con show-N ordering
- **Smart parser** contenuto email vs dati tecnici  
- **Force refresh** da n8n API con circuit breaker recovery
- **Real-time data** solo da PostgreSQL, zero mock data

### 🔄 **Smart Cache System**
- **Backend intelligent sync** detection con confronto raw_data
- **Frontend cache aggressiva** per modal workflow (15s refresh)
- **Auto-invalidation** dopo modifiche + background refetch
- **Circuit breaker recovery** per errori API n8n

### 🏢 **Mono/Multi-Tenant System (v2.11.0)**
- **Mono-tenant di default** con assignment automatico tenant
- **Architettura multi-tenant ready** - switch immediato via ENV variables
- **Tenant isolation completo** a livello database e API
- **User management** con tenant resolution intelligente
- **Environment-based configuration** per deployment flessibile

### 🏭 **Production Stability (TIER 2)**
- **Health monitoring** avanzato (memory, CPU, DB, scheduler)
- **Alert system** enterprise con escalation rules (50 alerts/hour)
- **Backup manager** automatico full/incremental con retention
- **Graceful shutdown** orchestrato con priorità component
- **Database pool** ottimizzato con performance tracking

**📋 Per dettagli completi:** [CLAUDE-FEATURES.md](./CLAUDE-FEATURES.md)

---

## 📦 **Login Page Package v2.13.0**

### 🚀 **Pacchetto Completo Riutilizzabile**
Sistema completo di autenticazione pronto per integrazione in qualsiasi progetto Next.js/React.

**Ubicazione**: `/loginPage/` - Pacchetto standalone completo

### 🏗️ **Architettura del Package**
```
loginPage/
├── AuthPage.tsx              # Componente principale autenticazione
├── components/
│   ├── Header.tsx            # Header navigazione completa  
│   ├── BackToTopButton.tsx   # Bottone "torna su" flottante
│   └── ui/                   # Componenti shadcn/ui completi
│       ├── button.tsx        # Button component
│       ├── input.tsx         # Input con validazione
│       ├── label.tsx         # Label accessibile
│       ├── card.tsx          # Card container
│       └── toast.tsx         # Toast notification system
├── hooks/
│   └── use-toast.ts          # Hook gestione toast
├── lib/
│   └── utils.ts              # Utility cn() per classi CSS
└── package.json              # Dipendenze complete
```

### ⚡ **Features Incluse**
- **🎨 Design System**: Control Room theme nero/verde con gradients
- **📱 Responsive**: Layout mobile-first con split-screen desktop
- **🔐 Form Security**: Validazione, password toggle, loading states
- **🍞 Toast System**: Notifiche complete con auto-dismiss
- **🎭 Typography**: DM Sans con font-weight ottimizzato
- **♿ Accessibility**: ARIA labels e semantic HTML
- **⚡ Performance**: Componenti ottimizzati con TypeScript

### 🔧 **Integrazione Rapida**
```bash
# 1. Installa dipendenze
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge lucide-react

# 2. Copia componenti nel tuo progetto
cp -r loginPage/components/ your-project/components/
cp -r loginPage/hooks/ your-project/hooks/
cp -r loginPage/lib/ your-project/lib/

# 3. Importa e usa
import AuthPage from './AuthPage';
```

### 🎯 **Customizzazione**
- **Branding**: Modifica costanti testi in `AuthPage.tsx`
- **Collegamenti**: Aggiorna `/prenota-demo`, `/terms-of-service`, `/privacy-policy`
- **Colori**: Palette configurabile via Tailwind CSS
- **Header**: Navigation items personalizzabili in `Header.tsx`

---

## 🎯 **Sistema Multi-Tenant Enterprise**

### **Frontend** - Control Room UI ✅ COMPLETATO
- **9 pagine complete** con dati reali: Dashboard, Workflows, Executions, Stats, Database, Alerts, Scheduler, Security, AI Agents
- **Control Room theme** nero/verde con Lucide React icons
- **Real-time updates** con auto-refresh configurabile
- **Responsive design** ottimizzato desktop/mobile
- **Export system** CSV/JSON per tutte le liste

### **Backend** - Express + TypeScript ✅ COMPLETATO
- **50+ API endpoints** tenant-specific + system management
- **JWT authentication** con tenant isolation completo
- **Auto-healing scheduler** con monitoring avanzato
- **Multi-tenant database** con query parametrizzate
- **Rate limiting** + security headers + audit trail

### **Database** - PostgreSQL 16 ✅ COMPLETATO
- **Multi-tenant schema** con isolamento completo per tenant
- **JSONB support** per dati complessi workflow
- **20+ tabelle** core + TIER 2 production stability
- **Performance optimization** con indici su tenant_id
- **Backup system** automatico con retention policies

---

## 🧪 **Quality Assurance Enterprise**

### **Test Suite Multi-Tier v2.9.0**
- ✅ **TIER 1 Security**: JWT + API Key + RBAC + Rate Limiting (10 tests)
- ✅ **TIER 2 Core APIs**: Workflows + Executions + Stats validation (5 tests)
- ✅ **TIER 3 Scheduler**: Status + sync + auto-healing (3 tests)
- ✅ **TIER 4 Advanced**: Show-N system + performance (4 tests)
- ✅ **TIER 2 Production**: Health + alerts + backup + shutdown (34 tests)

### **Success Metrics**
- **31/34 test PASSATI** (91% Success Rate)
- **Security tests**: >95% pass rate
- **API response time**: <2000ms per 3 API calls
- **Concurrent handling**: 20+ simultaneous requests
- **Enterprise ready**: Production stability verificata

**📋 Per dettagli completi:** [CLAUDE-TESTING.md](./CLAUDE-TESTING.md)

---

## 🚀 **Roadmap & Migration Path**

### **TIER 3: Enterprise Scaling (v3.x)** - Q2-Q4 2025
- 🌍 **Multi-Region & Cloud Native**: Kubernetes + Helm + Istio service mesh
- 📊 **Advanced Analytics**: InfluxDB + Grafana + ML anomaly detection
- 🔒 **Enterprise Security**: SSO/SAML + HashiCorp Vault + Zero Trust
- 🤖 **AI/ML Platform**: Vector DB + LangGraph + MLflow + LangSmith

### **TIER 4: Innovation Labs (v4.x)** - 2026+
- 🔮 **Next-Gen Features**: Assistente AI conversazionale + Predictive analytics
- 🌐 **Ecosystem Expansion**: Plugin marketplace + Mobile app + Voice interface
- ⚡ **Smart Optimization**: Auto-tuning + Real-time recommendations
- 🔗 **Blockchain Integration**: Smart contracts per workflow verification

**📋 Per roadmap completa:** [CLAUDE-ROADMAP.md](./CLAUDE-ROADMAP.md)

---

## 💡 **Note Finali**

Questo è il file principale di riferimento per lo sviluppo. Per informazioni dettagliate, consultare i file specializzati:

- 🏗️ **[CLAUDE-ARCHITECTURE.md](./CLAUDE-ARCHITECTURE.md)** - Schema completo architettura
- 🔧 **[CLAUDE-DEVELOPMENT.md](./CLAUDE-DEVELOPMENT.md)** - Setup e workflow sviluppo
- ⚡ **[CLAUDE-FEATURES.md](./CLAUDE-FEATURES.md)** - Funzionalità avanzate e AI
- 🧪 **[CLAUDE-TESTING.md](./CLAUDE-TESTING.md)** - Test suite enterprise
- 🚀 **[CLAUDE-ROADMAP.md](./CLAUDE-ROADMAP.md)** - Versioning e roadmap futura

---

**Aggiornare questo documento quando si fanno modifiche significative alle regole di sviluppo o all'overview del progetto.**