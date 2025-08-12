#!/bin/bash

# =====================================================
# n8n MCP Multi-Tenant Control - Production Stop
# =====================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Arresto n8n Multi-Tenant Control...${NC}"

# Stop API server
if [ -f .api.pid ]; then
    PID=$(cat .api.pid)
    if ps -p $PID > /dev/null; then
        echo "   Arresto API Server (PID: $PID)..."
        kill $PID
        sleep 2
        rm .api.pid
        echo -e "${GREEN}✅ API Server arrestato${NC}"
    else
        echo "   API Server non in esecuzione"
        rm .api.pid
    fi
else
    # Prova a trovare processo per porta
    API_PORT=${API_PORT:-3001}
    if lsof -Pi :$API_PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "   Arresto processo su porta $API_PORT..."
        lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ Processo arrestato${NC}"
    else
        echo "   Nessun processo attivo trovato"
    fi
fi

echo -e "${GREEN}✅ Sistema arrestato con successo${NC}"