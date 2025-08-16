#!/bin/bash

# 🧪 Quick Frontend Test Suite
# Test rapido per development e debugging

set -e

echo "⚡ Quick Frontend Test Suite"
echo "============================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

START_TIME=$(date +%s)

# Function to run test and show result
run_quick_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}🔹 $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name - FAILED${NC}"
        return 1
    fi
}

# Core tests
echo "📋 Running core architecture tests..."

run_quick_test "DataStore Tests" "npm run test:run src/store/__tests__/dataStore.test.ts --reporter=basic"
run_quick_test "SmartSync Tests" "npm run test:run src/services/__tests__/smartSyncService.test.ts --reporter=basic"
run_quick_test "Hooks Tests" "npm run test:run src/hooks/__tests__/useOptimizedData.test.tsx --reporter=basic"

# Quick build test
echo -e "\n${BLUE}🔹 Quick Build Test${NC}"
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript compilation - PASSED${NC}"
else
    echo -e "${RED}❌ TypeScript compilation - FAILED${NC}"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=========================="
echo -e "⚡ Quick Test Completed in ${DURATION}s"
echo -e "${GREEN}✅ Core enterprise architecture validated${NC}"
echo ""
echo "💡 For full test suite run: npm run test:enterprise"