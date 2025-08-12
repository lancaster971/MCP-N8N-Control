#!/bin/bash

# =====================================================
# Docker Compose Startup Script
# =====================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   n8n MCP Server - Docker Deployment${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "   Creating from example..."
    cp .env.example .env
    echo -e "${RED}   Please configure .env file before starting${NC}"
    exit 1
fi

# Check required environment variables
source .env
if [ -z "$N8N_API_URL" ] || [ -z "$N8N_API_KEY" ]; then
    echo -e "${RED}❌ Missing required environment variables${NC}"
    echo "   Please configure N8N_API_URL and N8N_API_KEY in .env"
    exit 1
fi

# Parse command line arguments
PROFILE=""
BUILD_FLAG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build"
            echo -e "${YELLOW}🔨 Force rebuild enabled${NC}"
            shift
            ;;
        --with-tools)
            PROFILE="$PROFILE --profile tools"
            echo -e "${BLUE}🛠️  Including database tools${NC}"
            shift
            ;;
        --with-monitoring)
            PROFILE="$PROFILE --profile monitoring"
            echo -e "${BLUE}📊 Including monitoring stack${NC}"
            shift
            ;;
        --with-cache)
            PROFILE="$PROFILE --profile cache"
            echo -e "${BLUE}💾 Including Redis cache${NC}"
            shift
            ;;
        --all)
            PROFILE="--profile tools --profile monitoring --profile cache"
            echo -e "${BLUE}🎯 Including all optional services${NC}"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--build] [--with-tools] [--with-monitoring] [--with-cache] [--all]"
            exit 1
            ;;
    esac
done

# Create necessary directories
echo -e "\n${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs monitoring/prometheus monitoring/grafana/dashboards monitoring/grafana/datasources

# Start services
echo -e "\n${YELLOW}🚀 Starting Docker services...${NC}"
docker-compose up -d $BUILD_FLAG $PROFILE

# Wait for services to be ready
echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check health
echo -e "\n${YELLOW}🏥 Checking service health...${NC}"

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U ${DB_USER:-postgres} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
fi

# Check API
if curl -s http://localhost:${API_PORT:-3001}/health > /dev/null; then
    echo -e "${GREEN}✅ API Server is ready${NC}"
else
    echo -e "${RED}❌ API Server is not ready${NC}"
fi

# Show running containers
echo -e "\n${BLUE}📋 Running containers:${NC}"
docker-compose ps

# Show access information
echo -e "\n${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ DOCKER DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "${BLUE}🌐 Access Points:${NC}"
echo "   API Server: http://localhost:${API_PORT:-3001}"
echo "   Health: http://localhost:${API_PORT:-3001}/health"

if [[ $PROFILE == *"tools"* ]]; then
    echo "   pgAdmin: http://localhost:${PGADMIN_PORT:-5050}"
    echo "      Email: ${PGADMIN_EMAIL:-admin@n8n-mcp.local}"
    echo "      Password: ${PGADMIN_PASSWORD:-admin}"
fi

if [[ $PROFILE == *"monitoring"* ]]; then
    echo "   Prometheus: http://localhost:${PROMETHEUS_PORT:-9090}"
    echo "   Grafana: http://localhost:${GRAFANA_PORT:-3000}"
    echo "      Username: admin"
    echo "      Password: ${GRAFANA_PASSWORD:-admin}"
fi

echo ""
echo -e "${BLUE}🔐 API Credentials:${NC}"
echo "   Email: admin@n8n-mcp.local"
echo "   Password: admin123"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "   View logs: docker-compose logs -f api"
echo "   Stop all: docker-compose down"
echo "   Stop & remove data: docker-compose down -v"
echo "   Shell access: docker-compose exec api sh"
echo ""