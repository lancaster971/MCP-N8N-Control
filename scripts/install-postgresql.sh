#!/bin/bash

# Script di installazione PostgreSQL per n8n MCP Server

set -e

echo "================================================"
echo "  Installazione PostgreSQL per n8n MCP Server"
echo "================================================"
echo ""

# Rileva sistema operativo
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        OS="debian"
    elif [ -f /etc/redhat-release ]; then
        OS="redhat"
    fi
fi

echo "🔍 Sistema rilevato: $OS"
echo ""

case $OS in
    macos)
        echo "📦 Installazione su macOS..."
        echo ""
        
        # Verifica Homebrew
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew non trovato. Installalo prima:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        
        echo "1. Installazione PostgreSQL con Homebrew..."
        brew install postgresql@16
        
        echo ""
        echo "2. Avvio servizio PostgreSQL..."
        brew services start postgresql@16
        
        echo ""
        echo "3. Creazione database n8n_mcp..."
        sleep 2  # Aspetta che il servizio si avvii
        createdb n8n_mcp 2>/dev/null || echo "   Database già esistente"
        
        echo ""
        echo "✅ PostgreSQL installato e configurato!"
        echo ""
        echo "Comandi utili:"
        echo "  Stato:    brew services list"
        echo "  Stop:     brew services stop postgresql@16"
        echo "  Restart:  brew services restart postgresql@16"
        echo "  Console:  psql -d n8n_mcp"
        ;;
        
    debian)
        echo "📦 Installazione su Debian/Ubuntu..."
        echo ""
        
        echo "1. Aggiornamento repository..."
        sudo apt-get update
        
        echo ""
        echo "2. Installazione PostgreSQL..."
        sudo apt-get install -y postgresql postgresql-contrib
        
        echo ""
        echo "3. Avvio servizio..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        echo ""
        echo "4. Configurazione utente e database..."
        sudo -u postgres psql -c "CREATE USER $USER WITH SUPERUSER;" 2>/dev/null || true
        sudo -u postgres createdb -O $USER n8n_mcp 2>/dev/null || echo "   Database già esistente"
        
        echo ""
        echo "✅ PostgreSQL installato e configurato!"
        echo ""
        echo "Comandi utili:"
        echo "  Stato:    sudo systemctl status postgresql"
        echo "  Stop:     sudo systemctl stop postgresql"
        echo "  Restart:  sudo systemctl restart postgresql"
        echo "  Console:  psql -d n8n_mcp"
        ;;
        
    redhat)
        echo "📦 Installazione su RedHat/CentOS/Fedora..."
        echo ""
        
        echo "1. Installazione PostgreSQL..."
        sudo dnf install -y postgresql postgresql-server
        
        echo ""
        echo "2. Inizializzazione database..."
        sudo postgresql-setup --initdb
        
        echo ""
        echo "3. Avvio servizio..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        echo ""
        echo "4. Configurazione utente e database..."
        sudo -u postgres psql -c "CREATE USER $USER WITH SUPERUSER;" 2>/dev/null || true
        sudo -u postgres createdb -O $USER n8n_mcp 2>/dev/null || echo "   Database già esistente"
        
        echo ""
        echo "✅ PostgreSQL installato e configurato!"
        echo ""
        echo "Comandi utili:"
        echo "  Stato:    sudo systemctl status postgresql"
        echo "  Stop:     sudo systemctl stop postgresql"
        echo "  Restart:  sudo systemctl restart postgresql"
        echo "  Console:  psql -d n8n_mcp"
        ;;
        
    *)
        echo "❌ Sistema operativo non supportato automaticamente."
        echo ""
        echo "Installa PostgreSQL manualmente:"
        echo ""
        echo "1. Visita: https://www.postgresql.org/download/"
        echo "2. Segui le istruzioni per il tuo sistema"
        echo "3. Crea il database: createdb n8n_mcp"
        echo "4. Esegui: ./scripts/setup-database.sh"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "  Prossimi passi:"
echo "================================================"
echo ""
echo "1. Esegui setup database:"
echo "   ./scripts/setup-database.sh"
echo ""
echo "2. Test connettività:"
echo "   node scripts/test-sync-service.js"
echo ""
echo "3. Avvia sync service:"
echo "   node build/backend/sync-service.js"
echo ""