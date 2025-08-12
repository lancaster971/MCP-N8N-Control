# Backend Sync Service

## 🎯 Panoramica

Il Backend Sync Service è il componente core dell'architettura 3-tier che:
1. **Interroga** periodicamente l'API n8n per ottenere workflow ed esecuzioni
2. **Sincronizza** i dati in un database PostgreSQL locale
3. **Calcola** metriche, KPI e scores di performance
4. **Fornisce** dati ottimizzati ai tools MCP per Claude

## 🏗️ Architettura

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│    n8n API      │ ◀────── │  Backend Service │ ──────▶ │   Database   │
│                 │         │   (sync/calc)    │         │  PostgreSQL  │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                                               ▲
                                                               │
                                                          ┌─────────┐
                                                          │ Tools   │
                                                          │  MCP    │
                                                          └─────────┘
```

## 📦 Componenti

### 1. **Sync Service** (`sync-service.ts`)
- Servizio principale con scheduling automatico
- Health check e monitoring
- Gestione lifecycle (start/stop)

### 2. **Sync Manager** (`sync-manager.ts`)
- Orchestrazione processo di sincronizzazione
- Gestione priorità e batch processing
- Recovery da errori

### 3. **API Fetcher** (`api-fetcher.ts`)
- Wrapper per API n8n
- Rate limiting (10 req/sec)
- Retry con exponential backoff
- Gestione paginazione

### 4. **Data Transformer** (`data-transformer.ts`)
- Converte dati API in modelli database
- Calcola complexity score
- Normalizza strutture dati

### 5. **Sync State** (`sync-state.ts`)
- Traccia stato sincronizzazione
- Checkpoint per recovery
- Gestione retry queue

## ⚙️ Configurazione

### Variabili Ambiente Richieste

```bash
# n8n API
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-api-key

# Database PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/n8n_mcp
```

### Intervalli di Sincronizzazione

| Tipo | Intervallo Default | Descrizione |
|------|-------------------|-------------|
| Esecuzioni | 60 secondi | Nuove esecuzioni e aggiornamenti |
| Workflows | 5 minuti | Workflow modificati |
| Full Sync | 1 ora | Sincronizzazione completa |
| KPI Orari | 1 ora | Calcolo metriche orarie |
| KPI Giornalieri | 24 ore | Aggregazioni giornaliere |
| Cleanup | 24 ore | Pulizia dati vecchi |

## 🚀 Setup e Avvio

### 1. Setup Database

```bash
# Installa PostgreSQL se necessario
brew install postgresql  # macOS
brew services start postgresql

# Esegui script di setup
./scripts/setup-database.sh
```

### 2. Configurazione

```bash
# Copia e configura .env
cp env.example .env
# Modifica .env con i tuoi valori
```

### 3. Build

```bash
npm run build
```

### 4. Test Connettività

```bash
# Test base (verifica connessioni)
node scripts/test-sync-service.js

# Test con sync reale
node scripts/test-sync-service.js --sync
```

### 5. Avvio Servizio

```bash
# Avvio standalone
node build/backend/sync-service.js

# Con PM2 (consigliato per produzione)
pm2 start build/backend/sync-service.js --name n8n-sync

# Con Docker
docker run -e DATABASE_URL=... -e N8N_API_URL=... n8n-mcp-sync
```

## 📊 Metriche Calcolate

### Complexity Score (0-100)
- Basato su numero nodi e connessioni
- Penalizza workflow con loop e branch complessi
- Formula: `nodes * 2 + connections * 1.5 + complexNodes * 3`

### Reliability Score (0-100)
- Success rate delle esecuzioni
- Formula: `(successful_executions / total_executions) * 100`

### Efficiency Score (0-100)
- Basato su tempo medio esecuzione
- < 1s = 100, < 5s = 80, < 10s = 60, < 30s = 40, > 30s = 20

### Health Score (0-100)
- Media ponderata degli altri scores
- Formula: `(reliability * 0.4 + efficiency * 0.3 + (100-complexity) * 0.3)`

## 🔄 Processo di Sincronizzazione

### Sync Incrementale (Default)

1. **Check State**: Verifica ultimo sync timestamp
2. **Fetch Changes**: Ottieni solo record modificati
3. **Transform**: Converti in modelli database
4. **Calculate**: Calcola metriche e scores
5. **Save**: Salva in transazione atomica
6. **Update State**: Aggiorna checkpoint

### Full Sync

1. **Fetch All**: Ottieni tutti i workflow
2. **Compare**: Confronta con database locale
3. **Update**: Aggiorna record modificati
4. **Create**: Crea nuovi record
5. **Delete**: Rimuovi record obsoleti

## 🛡️ Gestione Errori

### Retry Logic
- Max 3 tentativi per operazione
- Exponential backoff: 1s, 2s, 4s
- Dead letter queue per errori persistenti

### Recovery
- Checkpoint ogni 10 record processati
- Resume da ultimo checkpoint dopo crash
- Transazioni atomiche per consistenza

## 📈 Monitoring

### Health Check Endpoint

```javascript
const health = await service.healthCheck();
// Returns:
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  checks: {
    service: true,
    database: true,
    api: true,
    scheduler: true
  }
}
```

### Metriche Disponibili

```javascript
const stats = service.getStats();
// Returns:
{
  syncStats: {
    totalSyncs: 150,
    successRate: 98.5,
    lastSync: Date,
    isRunning: true
  },
  current: {
    workflowsProcessed: 25,
    executionsProcessed: 340
  }
}
```

## 🔧 Troubleshooting

### Database non connesso
```bash
# Verifica PostgreSQL
psql -U postgres -c '\l'

# Crea database se mancante
createdb n8n_mcp
```

### API non raggiungibile
```bash
# Verifica n8n
curl http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: your-key"
```

### Sync lento
- Riduci `SYNC_MAX_WORKFLOWS` e `SYNC_MAX_EXECUTIONS`
- Aumenta `SYNC_BATCH_SIZE` per batch più grandi
- Verifica indici database

## 📝 Note Implementative

### Perché PostgreSQL?
- Supporto nativo JSON per dati workflow
- Views materializzate per performance
- Triggers per calcolo automatico metriche
- Transazioni ACID per consistenza

### Ottimizzazioni
- Connection pooling (max 10 connessioni)
- Batch insert per efficienza
- Indici su campi frequentemente interrogati
- Cleanup automatico dati vecchi

### Limitazioni
- Max 500 esecuzioni per sync
- Max 100 workflow per sync
- Rate limit 10 chiamate/sec API
- Retention 30 giorni executions

## 🚦 Stati del Servizio

| Stato | Descrizione |
|-------|-------------|
| `IDLE` | In attesa del prossimo sync |
| `RUNNING` | Sync in corso |
| `COMPLETED` | Sync completato con successo |
| `FAILED` | Sync fallito (retry pending) |
| `PARTIAL` | Alcuni record falliti |

## 🔮 Sviluppi Futuri

- [ ] WebSocket per sync real-time
- [ ] Supporto MySQL oltre PostgreSQL
- [ ] Dashboard web per monitoring
- [ ] Export metriche Prometheus
- [ ] Backup automatico database
- [ ] Sync distribuito multi-instance