#!/bin/bash

# =====================================================
# n8n MCP Multi-Tenant Control - Production Startup
# =====================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   n8n Multi-Tenant Control - Production${NC}"
echo -e "${BLUE}=============================================${NC}"

# Funzione per verificare dipendenze
check_dependencies() {
    echo -e "\n${YELLOW}📋 Verifica dipendenze...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js non trovato${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL client non trovato${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PostgreSQL client trovato${NC}"
    
    # Check build
    if [ ! -d "build" ]; then
        echo -e "${YELLOW}⚠️  Build mancante, esecuzione build...${NC}"
        npm run build
    fi
    echo -e "${GREEN}✅ Build presente${NC}"
}

# Funzione per caricare configurazione
load_config() {
    echo -e "\n${YELLOW}⚙️  Caricamento configurazione...${NC}"
    
    # Carica da .env se esiste
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
        echo -e "${GREEN}✅ Configurazione caricata da .env${NC}"
    fi
    
    # Verifica variabili richieste
    if [ -z "$N8N_API_URL" ]; then
        echo -e "${RED}❌ N8N_API_URL non configurato${NC}"
        echo "   Imposta in .env o come variabile d'ambiente"
        exit 1
    fi
    
    if [ -z "$N8N_API_KEY" ]; then
        echo -e "${RED}❌ N8N_API_KEY non configurato${NC}"
        echo "   Imposta in .env o come variabile d'ambiente"
        exit 1
    fi
    
    # Imposta defaults
    export DB_HOST=${DB_HOST:-"localhost"}
    export DB_PORT=${DB_PORT:-"5432"}
    export DB_NAME=${DB_NAME:-"n8n_mcp"}
    export DB_USER=${DB_USER:-"postgres"}
    export API_PORT=${API_PORT:-"3001"}
    export NODE_ENV=${NODE_ENV:-"production"}
    
    echo -e "${GREEN}✅ Configurazione completa${NC}"
    echo "   API URL: $N8N_API_URL"
    echo "   Database: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    echo "   API Port: $API_PORT"
    echo "   Environment: $NODE_ENV"
}

# Funzione per verificare database
check_database() {
    echo -e "\n${YELLOW}🗄️  Verifica database...${NC}"
    
    # Test connessione
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✅ Database connesso${NC}"
    else
        echo -e "${RED}❌ Impossibile connettersi al database${NC}"
        exit 1
    fi
    
    # Verifica tabelle
    TABLES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
    echo -e "${GREEN}✅ Tabelle database: $TABLES${NC}"
    
    # Verifica tenant
    TENANTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM tenants WHERE sync_enabled = true")
    echo -e "${GREEN}✅ Tenant attivi: $TENANTS${NC}"
}

# Funzione per avviare server API
start_api_server() {
    echo -e "\n${YELLOW}🚀 Avvio API Server...${NC}"
    
    # Kill processi esistenti sulla porta
    if lsof -Pi :$API_PORT -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}   Arresto processo esistente su porta $API_PORT...${NC}"
        lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Avvia server in background
    nohup node build/server/express-server.js > logs/api-server.log 2>&1 &
    API_PID=$!
    echo $API_PID > .api.pid
    
    # Attendi avvio
    sleep 3
    
    # Verifica che sia attivo
    if curl -s http://localhost:$API_PORT/health > /dev/null; then
        echo -e "${GREEN}✅ API Server avviato (PID: $API_PID)${NC}"
        echo "   URL: http://localhost:$API_PORT"
        echo "   Health: http://localhost:$API_PORT/health"
        echo "   Logs: tail -f logs/api-server.log"
    else
        echo -e "${RED}❌ API Server non risponde${NC}"
        exit 1
    fi
}

# Funzione per avviare scheduler
start_scheduler() {
    echo -e "\n${YELLOW}⏰ Avvio Multi-Tenant Scheduler...${NC}"
    
    # Ottieni token admin
    echo "   Ottenimento token admin..."
    TOKEN=$(curl -s -X POST http://localhost:$API_PORT/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@n8n-mcp.local","password":"admin123"}' | \
        grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ Impossibile ottenere token admin${NC}"
        echo "   Verifica credenziali admin"
        exit 1
    fi
    
    # Avvia scheduler via API
    RESPONSE=$(curl -s -X POST http://localhost:$API_PORT/api/scheduler/start \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | grep -q "Scheduler started successfully"; then
        echo -e "${GREEN}✅ Scheduler avviato con successo${NC}"
    elif echo "$RESPONSE" | grep -q "already running"; then
        echo -e "${GREEN}✅ Scheduler già in esecuzione${NC}"
    else
        echo -e "${YELLOW}⚠️  Scheduler response: $RESPONSE${NC}"
    fi
    
    # Mostra status
    STATUS=$(curl -s http://localhost:$API_PORT/api/scheduler/status \
        -H "Authorization: Bearer $TOKEN" | \
        grep -o '"isRunning":[^,]*' | cut -d':' -f2)
    
    echo "   Scheduler running: $STATUS"
}

# Funzione per mostrare statistiche
show_stats() {
    echo -e "\n${BLUE}📊 Statistiche Sistema:${NC}"
    
    STATS=$(curl -s http://localhost:$API_PORT/api/stats)
    
    if [ ! -z "$STATS" ]; then
        echo "$STATS" | grep -o '"totalTenants":[0-9]*' | cut -d':' -f2 | xargs echo "   Total Tenants:"
        echo "$STATS" | grep -o '"totalWorkflows":[0-9]*' | cut -d':' -f2 | xargs echo "   Total Workflows:"
        echo "$STATS" | grep -o '"totalExecutions":[0-9]*' | cut -d':' -f2 | xargs echo "   Total Executions:"
    fi
}

# Funzione per mostrare info accesso
show_access_info() {
    echo -e "\n${GREEN}=============================================${NC}"
    echo -e "${GREEN}✅ SISTEMA AVVIATO CON SUCCESSO!${NC}"
    echo -e "${GREEN}=============================================${NC}"
    echo ""
    echo -e "${BLUE}🌐 Accesso API:${NC}"
    echo "   URL: http://localhost:$API_PORT"
    echo "   Health: http://localhost:$API_PORT/health"
    echo "   API Docs: http://localhost:$API_PORT/api-docs"
    echo ""
    echo -e "${BLUE}🔐 Credenziali Admin:${NC}"
    echo "   Email: admin@n8n-mcp.local"
    echo "   Password: admin123"
    echo ""
    echo -e "${BLUE}📋 Comandi Utili:${NC}"
    echo "   Logs API: tail -f logs/api-server.log"
    echo "   Stop: ./scripts/stop-production.sh"
    echo "   Status: curl http://localhost:$API_PORT/api/scheduler/status"
    echo ""
}

# Funzione per gestire shutdown
cleanup() {
    echo -e "\n${YELLOW}🛑 Arresto sistema...${NC}"
    
    if [ -f .api.pid ]; then
        kill $(cat .api.pid) 2>/dev/null || true
        rm .api.pid
    fi
    
    echo -e "${GREEN}✅ Sistema arrestato${NC}"
    exit 0
}

# Trap per gestire CTRL+C
trap cleanup INT TERM

# =====================================================
# MAIN EXECUTION
# =====================================================

# Crea directory logs se non esiste
mkdir -p logs

# Esegui steps
check_dependencies
load_config
check_database
start_api_server
start_scheduler
show_stats
show_access_info

echo -e "\n${YELLOW}Sistema in esecuzione. Premi CTRL+C per arrestare.${NC}"

# Mantieni script attivo
while true; do
    sleep 60
    # Opzionale: health check periodico
    if ! curl -s http://localhost:$API_PORT/health > /dev/null; then
        echo -e "${RED}⚠️  API Server non risponde!${NC}"
    fi
done