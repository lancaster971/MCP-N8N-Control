# CLAUDE-DEVELOPMENT.md

Guida completa allo sviluppo, configurazione e deployment del sistema PilotPro Control Center.

**← Torna a [CLAUDE.md](./CLAUDE.md) | Vedi anche: [Architecture](./CLAUDE-ARCHITECTURE.md) | [Features](./CLAUDE-FEATURES.md) | [Testing](./CLAUDE-TESTING.md) | [Roadmap](./CLAUDE-ROADMAP.md)**

---

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

## 📞 Quick Start

```bash
# 1. Setup Database
createdb n8n_mcp
psql -d n8n_mcp -f src/database/migrations/*.sql

# 2. Start Backend
npm install
npm run build
WEBHOOK_SECRET=pilotpro-webhook-2025-secure DB_USER=your_user npm start

# 3. Start Frontend
cd frontend
npm install
npm run dev

# 4. Open Browser
http://localhost:5174

# Default login
Email: admin@pilotpro.com
Password: admin123
```

## 🚀 Deployment con IP Pubblico

### Configurazione Webhook Real-time per n8n

Quando il servizio sarà deployato con IP pubblico, configurare nei workflow n8n:

**Nodo HTTP Request (ultimo step del workflow):**
```json
URL: https://your-public-ip:3001/api/webhook/n8n/execution-complete
Method: POST
Headers:
  Content-Type: application/json
  X-Webhook-Secret: pilotpro-webhook-2025-secure

Body:
{
  "executionId": "{{ $execution.id }}",
  "workflowId": "{{ $workflow.id }}",
  "tenantId": "client_simulation_a",
  "status": "{{ $execution.executionStatus }}",
  "workflowName": "{{ $workflow.name }}"
}
```

**Benefici del Webhook:**
- ✅ **Refresh immediato**: Modal si aggiorna in 1-2 secondi
- ✅ **Cache invalidation**: Elimina automaticamente cache stale
- ✅ **Zero ritardi**: Niente più attesa di 5 minuti
- ✅ **Background import**: Importa execution data automaticamente

**Sicurezza:**
- 🔒 **API Key required**: Header `X-Webhook-Secret` obbligatorio
- 🔍 **Logging security**: Tentativi non autorizzati vengono loggati
- ⚡ **Rate limiting**: Protezione contro abusi

## UI/UX Features

### Design System - Control Room Theme
- **Dark Mode**: Tema Control Room nero/verde
- **Real-time Updates**: Auto-refresh configurabile
- **Responsive Design**: Ottimizzato mobile/desktop
- **Filtri Avanzati**: Su tutte le tabelle principali
- **Export Dati**: CSV/JSON su liste
- **Toast Notifications**: Feedback azioni utente

### Performance Features
- **Lazy Loading**: Componenti pesanti caricati on-demand
- **Code Splitting**: Bundle ottimizzati per page
- **Memory Cache**: React Query con smart invalidation
- **Virtualization**: Per liste lunghe
- **Prefetching**: Dati anticipati per UX fluida

## Ambiente di Sviluppo

### Setup Iniziale

1. **Clone Repository**
```bash
git clone <repository-url>
cd MCP-N8N-Control
```

2. **Database Setup**
```bash
# Installare PostgreSQL 16
brew install postgresql@16

# Creare database
createdb n8n_mcp

# Eseguire migrations
psql -d n8n_mcp -f src/database/migrations/001_initial_schema.sql
psql -d n8n_mcp -f src/database/migrations/002_sync_tables.sql
# ... altre migrations
```

3. **Backend Setup**
```bash
npm install
cp .env.example .env
# Configurare variabili ambiente
npm run build
npm start
```

4. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Development Workflow

1. **Feature Development**
   - Creare branch da `main`: `git checkout -b feature/nome-feature`
   - Sviluppare con hot reload: `npm run dev` (backend) + `npm run dev` (frontend)
   - Testare: `npm test` + `./test-quick.sh`

2. **Code Quality**
   - Linting: `npm run lint` (backend) + `npm run lint` (frontend)
   - Type checking: Automatico con TypeScript
   - Formatting: Prettier configurato

3. **Testing Strategy**
   - Unit tests: Jest per backend, Vitest per frontend
   - Integration tests: API endpoints + DB operations
   - E2E tests: Playwright per user flows critici

4. **Git Workflow**
   - Commit con messaggi descriptive in inglese
   - Rebase su main prima di push
   - PR con review obbligatorio
   - Squash merge per feature complete

### Production Checklist

**Pre-Deployment:**
- [ ] Build senza errori: `npm run build`
- [ ] Test suite passa: `./test-suite.sh`
- [ ] Environment variables configurate
- [ ] Database migrations applicate
- [ ] SSL certificates installati
- [ ] Firewall rules configurate

**Post-Deployment:**
- [ ] Health check endpoints rispondono
- [ ] Logs applicazioni monitorate
- [ ] Backup automatici attivi
- [ ] Monitoring alerts configurati
- [ ] Performance metrics baseline

### Monitoring Production

**Health Endpoints:**
```bash
# Sistema generale
GET /api/production/health

# Database
GET /api/production/database/pool

# Scheduler
GET /api/scheduler/status
```

**Key Metrics:**
- Response time API < 500ms
- Database pool utilization < 80%
- Memory usage < 85%
- Error rate < 1%
- Uptime > 99.9%

### Security Best Practices

**Development:**
- Mai committare secrets in git
- Usare .env per variabili sensibili
- Sanitizzare sempre input utente
- Validare parametri API con joi/zod
- Rate limiting su endpoint pubblici

**Production:**
- HTTPS obbligatorio
- JWT con scadenza < 24h
- API keys rotation periodica
- Audit logs per azioni critiche
- Backup encrypted offsite

---

**← Torna a [CLAUDE.md](./CLAUDE.md) | Continua con: [Features](./CLAUDE-FEATURES.md) →**