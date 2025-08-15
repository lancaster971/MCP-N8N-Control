#!/bin/bash

# ⚡ QUICK TEST SUITE - Fast System Validation
# Test rapido per verifiche durante sviluppo

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE="http://localhost:3001"
TESTS_PASSED=0
TESTS_TOTAL=0

echo -e "${BLUE}⚡ QUICK TEST SUITE - Fast System Check${NC}"
echo "========================================"

# Quick test function
quick_test() {
    local test_name="$1"
    local test_command="$2"
    local expected="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    local result=$(eval "$test_command" 2>/dev/null)
    
    if [[ "$result" == *"$expected"* ]] || [ "$expected" = "any" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✅${NC} $test_name"
    else
        echo -e "${RED}❌${NC} $test_name (Expected: $expected, Got: $result)"
    fi
}

# Quick tests
echo -e "\n${BLUE}🚀 System Health${NC}"
quick_test "Server Running" "curl -s $API_BASE/health | jq -r '.status'" "healthy"

echo -e "\n${BLUE}🔒 Security${NC}"
quick_test "Auth Protection" "curl -s -o /dev/null -w '%{http_code}' $API_BASE/api/stats" "401"

echo -e "\n${BLUE}🔐 Authentication${NC}"
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@n8n-mcp.local","password":"admin123"}' | jq -r '.token // "none"' 2>/dev/null)

if [ "$TOKEN" != "none" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅${NC} JWT Login Success"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo -e "\n${BLUE}📡 Core APIs${NC}"
    quick_test "Workflows API" "curl -s -H 'Authorization: Bearer $TOKEN' $API_BASE/api/workflows | jq -r '.total'" "any"
    quick_test "Stats API" "curl -s -H 'Authorization: Bearer $TOKEN' $API_BASE/api/stats | jq -r '.database'" "any"
else
    echo -e "${RED}❌${NC} JWT Login Failed"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

# Summary
echo -e "\n========================================"
echo -e "${BLUE}Results: $TESTS_PASSED/$TESTS_TOTAL tests passed${NC}"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}🎉 System OK - All quick tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️ Some issues detected - run full test suite${NC}"
    exit 1
fi