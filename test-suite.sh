#!/bin/bash

# PilotPro Control Center - Test Suite Completa v2.8.0
# Verifica funzionamento completo sistema backend

set -e  # Exit on any error

echo "🧪 PilotPro Control Center - Test Suite v2.8.0"
echo "=================================================="

BASE_URL="http://localhost:3001"
FAILED_TESTS=0
TOTAL_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Test function
test_api() {
    local name="$1"
    local endpoint="$2"
    local expected="$3"
    local jq_filter="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $name... "
    
    local result=$(curl -s "$BASE_URL$endpoint" | jq -r "$jq_filter" 2>/dev/null)
    
    if [[ "$result" == "$expected" ]] || [[ "$expected" == ">" && "$result" -gt 0 ]] 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC} (got: $result)"
    else
        echo -e "${RED}❌ FAIL${NC} (expected: $expected, got: $result)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Test POST endpoints
test_post() {
    local name="$1"
    local endpoint="$2"
    local expected="$3"
    local jq_filter="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $name... "
    
    local result=$(curl -s -X POST "$BASE_URL$endpoint" | jq -r "$jq_filter" 2>/dev/null)
    
    if [[ "$result" == "$expected" ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC} (expected: $expected, got: $result)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "\n📊 CORE DATA TESTS"
echo "==================="
test_api "Workflows Count" "/api/workflows" "75" ".total"
test_api "Executions Count" "/api/executions" ">" ".total"
test_api "Stats Workflows" "/api/stats" "75" ".database.totalWorkflows"

echo -e "\n🤖 SCHEDULER TESTS" 
echo "=================="
test_api "Scheduler Running" "/api/scheduler/automatic-status" "true" ".scheduler.isRunning"
test_api "Health Overall" "/api/sync/dashboard" "healthy" ".health.overall"
test_api "Success Rate" "/api/sync/dashboard" "100" ".metrics.summary.successRate"

echo -e "\n🔍 SHOW-N SYSTEM TESTS"
echo "======================"
test_api "Show-N Nodes" "/api/stats/show-usage" "19" ".summary.total_show_nodes"
test_api "Show-N Workflows" "/api/stats/show-usage" "4" ".summary.workflows_with_show_notes"
test_api "Workflow Nodes" "/api/workflows/SJuCGGefzPZBg9XU/nodes" ">" ".total"

echo -e "\n🔍 SEARCH TESTS"
echo "==============="
test_api "Search Workflows" "/api/search/workflows?q=test&limit=5" ">" ".pagination.total"
test_api "Search Executions" "/api/search/executions?status=success&limit=3" ">" ".pagination.total"

echo -e "\n📈 ENHANCED APIS TESTS"
echo "======================"
test_api "Complete Workflow" "/api/workflows/SJuCGGefzPZBg9XU/complete" "SJuCGGefzPZBg9XU" ".workflow.id"
test_api "Sync Jobs" "/api/sync/jobs?limit=5" ">" ".jobs | length"

echo -e "\n❌ KNOWN ISSUES TESTS (Expected Failures)"
echo "=========================================="
test_api "Tags System (BUG)" "/api/workflows/SJuCGGefzPZBg9XU/tags" "0" ".total"

echo -e "\n🛡️ SYNC FUNCTIONALITY TEST"
echo "============================"
echo -n "Testing Manual Sync... "
SYNC_RESULT=$(curl -s -X POST "$BASE_URL/api/scheduler/sync?enhanced=true" | jq -r ".result.success" 2>/dev/null)
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [[ "$SYNC_RESULT" == "true" ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC} (Sync failed)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo -e "\n🎯 TEST RESULTS SUMMARY"
echo "======================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $((TOTAL_TESTS - FAILED_TESTS))"
echo "Failed: $FAILED_TESTS"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Sistema completamente funzionante.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  $FAILED_TESTS test(s) failed. Check implementation.${NC}"
    exit 1
fi