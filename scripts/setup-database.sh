#!/bin/bash

# Script di setup database per n8n MCP Server
# Crea database PostgreSQL e esegue migrations

set -e

echo "🚀 Setup Database per n8n MCP Server"
echo "===================================="

# Configurazione
DB_NAME="${DB_NAME:-n8n_mcp}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica se PostgreSQL è installato
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL non trovato. Installalo prima di procedere.${NC}"
    echo "   Su macOS: brew install postgresql"
    echo "   Su Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Verifica connessione PostgreSQL
echo -e "${YELLOW}🔍 Verifica connessione PostgreSQL...${NC}"
if ! psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c '\l' &> /dev/null; then
    echo -e "${RED}❌ Impossibile connettersi a PostgreSQL${NC}"
    echo "   Assicurati che PostgreSQL sia in esecuzione:"
    echo "   - macOS: brew services start postgresql"
    echo "   - Linux: sudo systemctl start postgresql"
    exit 1
fi

# Crea database se non esiste
echo -e "${YELLOW}📦 Creazione database '$DB_NAME'...${NC}"
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✅ Database '$DB_NAME' già esistente${NC}"
else
    createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
    echo -e "${GREEN}✅ Database '$DB_NAME' creato${NC}"
fi

# Esegui migrations
echo -e "${YELLOW}🔄 Esecuzione migrations...${NC}"

MIGRATIONS_DIR="$(dirname "$0")/../src/database/migrations"

# Ordina e esegui tutti i file .sql
for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
    filename=$(basename "$migration")
    echo -e "   Esecuzione: $filename"
    
    if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$migration" &> /dev/null; then
        echo -e "${GREEN}   ✅ $filename completata${NC}"
    else
        echo -e "${RED}   ❌ Errore in $filename${NC}"
        # Continua con le altre migrations
    fi
done

# Verifica tabelle create
echo -e "${YELLOW}📊 Verifica tabelle create...${NC}"
TABLE_COUNT=$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo -e "${GREEN}✅ Trovate $TABLE_COUNT tabelle nel database${NC}"

# Lista tabelle
echo -e "${YELLOW}📋 Tabelle nel database:${NC}"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo ""
echo -e "${GREEN}✅ Setup database completato!${NC}"
echo ""
echo "Per avviare il sync service:"
echo "  export DATABASE_URL=postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "  export N8N_API_URL=http://localhost:5678/api/v1"
echo "  export N8N_API_KEY=your-api-key"
echo "  node build/backend/sync-service.js"