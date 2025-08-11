# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandi di Sviluppo

### Build e Sviluppo
- `npm install` - Installa le dipendenze
- `npm run build` - Compila TypeScript in JavaScript (output in `build/`)
- `npm run dev` - Watch mode per compilazione continua durante lo sviluppo
- `npm start` - Esegue il server compilato

### Testing e Qualità
- `npm test` - Esegue tutti i test con Jest
- `npm run test:watch` - Esegue test in watch mode
- `npm run test:coverage` - Esegue test con report di coverage
- `npm run lint` - Esegue ESLint sui file TypeScript in `src/`

## Architettura del Progetto

### Server MCP per n8n
Questo è un server Model Context Protocol che permette agli assistenti AI di interagire con n8n. Il server espone tools e resources tramite il protocollo MCP usando stdio come transport.

### Struttura Core
- **Entry Point**: `src/index.ts` - Inizializza il server MCP con StdioServerTransport
- **Configurazione Server**: `src/config/server.ts` - Configura tools e resources, verifica connettività API
- **Client API**: `src/api/n8n-client.ts` - Servizio wrapper per tutte le chiamate API n8n
- **Environment**: `src/config/environment.ts` - Gestisce e valida le variabili d'ambiente

### Tools Implementati
Il server implementa due categorie principali di tools:

**Workflow Tools** (`src/tools/workflow/`):
- list, get, create, update, delete
- activate, deactivate
- Ogni tool estende `BaseWorkflowHandler` per gestione errori uniforme

**Execution Tools** (`src/tools/execution/`):
- run (esegue workflow via API o webhook)
- get, list, delete
- Ogni tool estende `BaseExecutionHandler`

### Resources Dinamiche
- `n8n://workflows/list` - Lista workflow
- `n8n://workflow/{id}` - Dettagli workflow specifico
- `n8n://executions/{workflowId}` - Esecuzioni per workflow
- `n8n://execution/{id}` - Dettagli esecuzione

### Configurazione Richiesta
Variabili d'ambiente necessarie:
- `N8N_API_URL` - URL completo API n8n (deve includere `/api/v1`)
- `N8N_API_KEY` - API key per autenticazione
- `N8N_WEBHOOK_USERNAME` (opzionale) - Per autenticazione webhook
- `N8N_WEBHOOK_PASSWORD` (opzionale) - Per autenticazione webhook

### Testing
- Framework: Jest con ts-jest per supporto TypeScript
- File di test in `tests/unit/` seguono struttura `src/`
- Mock di axios per test isolati delle chiamate API
- Setup globale in `tests/test-setup.ts`

### API n8n Utilizzate
Il client implementa le seguenti API n8n (tutte con prefisso `/api/v1`):

**Workflow API**:
- `GET /workflows` - Lista tutti i workflow
- `GET /workflows/{id}` - Ottiene workflow con tutti i dettagli (nodi, connessioni, settings)
- `POST /workflows` - Crea nuovo workflow
- `PUT /workflows/{id}` - Aggiorna workflow esistente
- `DELETE /workflows/{id}` - Elimina workflow
- `POST /workflows/{id}/activate` - Attiva workflow
- `POST /workflows/{id}/deactivate` - Disattiva workflow
- `POST /workflows/{id}/execute` - Esegue workflow

**Execution API**:
- `GET /executions` - Lista tutte le esecuzioni
- `GET /executions/{id}` - Ottiene esecuzione specifica
- `DELETE /executions/{id}` - Elimina esecuzione

Autenticazione tramite header `X-N8N-API-KEY`.

### Elaborazione Dati da Claude
Quando Claude Desktop utilizza questi tools, elabora e filtra i dati grezzi JSON:

**Esempio con `get_workflow`**:
- L'API restituisce un oggetto JSON complesso con tutti i dettagli
- La proprietà `nodes` contiene array completo di tutti i nodi del workflow
- Claude analizza e presenta i dati in formato leggibile:
  - Raggruppa nodi per categoria (Form, AI, Processing, etc.)
  - Estrae informazioni rilevanti (nome, tipo, parametri chiave)
  - Nasconde dettagli tecnici non necessari
  - Crea strutture organizzate e comprensibili

Questo permette di trasformare dati JSON complessi in informazioni utili e actionable.

### Note Tecniche
- TypeScript target ES2020 con module NodeNext
- Usa ESM modules (type: "module" in package.json)
- Build output in `build/` directory
- Richiede Node.js >= 18.0.0