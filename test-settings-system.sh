#!/bin/bash

# Test Settings System - Verifica sistema configurazione robusto
# Testa database schema, dati di default, e funzionalità base

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_TOTAL=0

echo -e "${BLUE}🔧 SETTINGS SYSTEM TEST - Database & Configuration${NC}"
echo "========================================================"

# Test function
test_db() {
    local test_name="$1"
    local query="$2"
    local expected="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    local result=$(/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -t -c "$query" 2>/dev/null | xargs)
    
    if [[ "$result" == "$expected" ]] || [ "$expected" = "any" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✅${NC} $test_name"
    else
        echo -e "${RED}❌${NC} $test_name (Expected: $expected, Got: $result)"
    fi
}

echo -e "\n${BLUE}📊 Database Schema Verification${NC}"
test_db "System Settings Table" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'system_settings';" "1"
test_db "API Keys Table" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'api_keys';" "1"
test_db "Settings Audit Log Table" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'settings_audit_log';" "1"
test_db "Frontend Configurations Table" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'frontend_configurations';" "1"

echo -e "\n${BLUE}📋 Default Data Verification${NC}"
test_db "Default Settings Count" "SELECT COUNT(*) FROM system_settings;" "8"
test_db "Default API Key" "SELECT COUNT(*) FROM api_keys WHERE is_active = true;" "1"
test_db "Frontend Config Default" "SELECT COUNT(*) FROM frontend_configurations;" "1"

echo -e "\n${BLUE}🔒 Security Settings Verification${NC}"
test_db "API Key TTL Setting" "SELECT setting_value FROM system_settings WHERE setting_key = 'security.api_key_default_ttl';" "86400"
test_db "Rate Limit Setting" "SELECT setting_value FROM system_settings WHERE setting_key = 'security.rate_limit_api_key_generation';" "5"
test_db "Max Keys Per User" "SELECT setting_value FROM system_settings WHERE setting_key = 'security.max_api_keys_per_user';" "10"

echo -e "\n${BLUE}⚙️ Frontend Configuration Verification${NC}"
test_db "Default Backend URL" "SELECT setting_value FROM system_settings WHERE setting_key = 'frontend.default_backend_url';" "\"http://localhost:3001\""
test_db "Connection Timeout" "SELECT setting_value FROM system_settings WHERE setting_key = 'frontend.connection_timeout';" "5000"
test_db "Retry Attempts" "SELECT setting_value FROM system_settings WHERE setting_key = 'frontend.retry_attempts';" "3"

echo -e "\n${BLUE}🗂️ API Key Details Verification${NC}"
API_KEY_INFO=$(/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -t -c "SELECT key_name, key_type, key_prefix FROM api_keys WHERE is_active = true LIMIT 1;" 2>/dev/null | xargs)
if [[ "$API_KEY_INFO" == *"Default Admin API Key"* ]]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅${NC} Default API Key Details"
else
    echo -e "${RED}❌${NC} Default API Key Details (Got: $API_KEY_INFO)"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo -e "\n${BLUE}📁 Frontend Files Verification${NC}"
if [ -f "frontend/src/components/settings/SettingsPage.tsx" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅${NC} Settings Page Component"
else
    echo -e "${RED}❌${NC} Settings Page Component"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

if [ -f "frontend/src/services/settingsService.ts" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅${NC} Settings Service"
else
    echo -e "${RED}❌${NC} Settings Service"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Summary
echo -e "\n========================================================"
echo -e "${BLUE}Results: $TESTS_PASSED/$TESTS_TOTAL tests passed${NC}"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}🎉 Settings System Successfully Configured!${NC}"
    echo -e "${GREEN}✅ Database schema created${NC}"
    echo -e "${GREEN}✅ Default settings populated${NC}"  
    echo -e "${GREEN}✅ API Key system ready${NC}"
    echo -e "${GREEN}✅ Frontend components created${NC}"
    echo -e "${GREEN}🚀 Ready for remote frontend deployment!${NC}"
else
    echo -e "${YELLOW}⚠️ Some issues detected - check configuration${NC}"
fi

echo -e "\n${BLUE}📖 Next Steps:${NC}"
echo "1. Fix backend TypeScript compilation issues"
echo "2. Test Settings API endpoints"
echo "3. Deploy frontend to remote location"
echo "4. Configure API keys for production"
echo "5. Test remote connectivity"