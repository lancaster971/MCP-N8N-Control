#!/bin/bash

# =====================================================
# Docker Compose Stop Script
# =====================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping n8n MCP Docker services...${NC}"

# Parse arguments
REMOVE_VOLUMES=false

if [ "$1" == "--clean" ]; then
    REMOVE_VOLUMES=true
    echo -e "${RED}⚠️  Will remove all data volumes!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Stop services
if [ "$REMOVE_VOLUMES" = true ]; then
    docker-compose down -v
    echo -e "${GREEN}✅ Services stopped and volumes removed${NC}"
else
    docker-compose down
    echo -e "${GREEN}✅ Services stopped (volumes preserved)${NC}"
fi

# Show status
echo -e "\n${YELLOW}📋 Docker status:${NC}"
docker-compose ps