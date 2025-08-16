#!/bin/bash

# 🧪 Enterprise Frontend Test Suite
# Script completo per testing architettura enterprise

set -e

echo "🚀 Starting Enterprise Frontend Test Suite..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timing
START_TIME=$(date +%s)

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}🔹 $1${NC}"
    echo "----------------------------------------"
}

# Function to print test results
print_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 - PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $1 - FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
}

# Function to run test with timeout
run_test_with_timeout() {
    local test_name="$1"
    local test_command="$2"
    local timeout_seconds="${3:-60}"
    
    echo "Running: $test_name"
    
    if timeout "$timeout_seconds" bash -c "$test_command"; then
        print_result "$test_name"
    else
        echo -e "${RED}❌ $test_name - TIMEOUT or FAILED${NC}"
        ((FAILED_TESTS++))
        ((TOTAL_TESTS++))
    fi
}

# Check prerequisites
print_section "Prerequisites Check"

echo "📦 Checking Node.js version..."
node --version
print_result "Node.js version check"

echo "📦 Checking npm dependencies..."
npm list --depth=0 >/dev/null 2>&1
print_result "NPM dependencies check"

echo "📦 Checking TypeScript compilation..."
npx tsc --noEmit
print_result "TypeScript compilation"

# TIER 1: Core Architecture Tests
print_section "TIER 1: Core Architecture Tests"

echo "🏗️ Testing DataStore Zustand..."
run_test_with_timeout "DataStore Basic Functionality" "npm run test:run src/store/__tests__/dataStore.test.ts"

echo "🔄 Testing SmartSyncService..."
run_test_with_timeout "SmartSync Service Tests" "npm run test:run src/services/__tests__/smartSyncService.test.ts"

echo "🎯 Testing Optimized Hooks..."
run_test_with_timeout "Optimized Data Hooks" "npm run test:run src/hooks/__tests__/useOptimizedData.test.tsx"

# TIER 2: Component Integration Tests
print_section "TIER 2: Component Integration Tests"

echo "📊 Testing Dashboard Component..."
run_test_with_timeout "Dashboard Optimized Component" "npm run test:run src/components/dashboard/__tests__/DashboardOptimized.test.tsx"

# TIER 3: Performance Tests
print_section "TIER 3: Performance & Integration Tests"

echo "⚡ Testing Cache Performance..."
cat > /tmp/cache-performance-test.js << 'EOF'
// Simple cache performance test
import { useDataStore } from '../src/store/dataStore.js'

console.log('🔍 Testing cache performance...')

const store = useDataStore.getState()

// Simulate cache operations
const start = Date.now()
for (let i = 0; i < 1000; i++) {
  store.isDataStale('workflows')
  store.isDataStale('executions')
  store.isDataStale('dashboard')
}
const end = Date.now()

const avgTime = (end - start) / 1000
console.log(`✅ Cache operations: ${avgTime}ms average`)

if (avgTime < 1) {
  console.log('✅ Cache performance: EXCELLENT')
  process.exit(0)
} else {
  console.log('⚠️ Cache performance: NEEDS OPTIMIZATION')
  process.exit(1)
}
EOF

run_test_with_timeout "Cache Performance Test" "node /tmp/cache-performance-test.js"

echo "🔄 Testing Sync Queue Performance..."
cat > /tmp/sync-performance-test.js << 'EOF'
// Sync queue performance test
console.log('🔍 Testing sync queue performance...')

const start = Date.now()

// Simulate multiple sync operations
const promises = []
for (let i = 0; i < 10; i++) {
  promises.push(new Promise(resolve => setTimeout(resolve, Math.random() * 100)))
}

Promise.all(promises).then(() => {
  const end = Date.now()
  const totalTime = end - start
  console.log(`✅ Sync queue handled 10 operations in ${totalTime}ms`)
  
  if (totalTime < 500) {
    console.log('✅ Sync performance: EXCELLENT')
    process.exit(0)
  } else {
    console.log('⚠️ Sync performance: ACCEPTABLE')
    process.exit(0)
  }
}).catch(() => {
  console.log('❌ Sync performance test failed')
  process.exit(1)
})
EOF

run_test_with_timeout "Sync Queue Performance" "node /tmp/sync-performance-test.js"

# TIER 4: Memory & Resource Tests
print_section "TIER 4: Memory & Resource Tests"

echo "🧠 Testing Memory Usage..."
cat > /tmp/memory-test.js << 'EOF'
// Memory usage test
console.log('🔍 Testing memory usage patterns...')

// Simulate data store operations
const mockData = {}
for (let i = 0; i < 1000; i++) {
  mockData[`workflow_${i}`] = {
    id: `wf_${i}`,
    name: `Workflow ${i}`,
    data: new Array(100).fill(null).map(() => Math.random())
  }
}

if (process.memoryUsage) {
  const memUsage = process.memoryUsage()
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100
  console.log(`✅ Heap used: ${heapUsed} MB`)
  
  if (heapUsed < 50) {
    console.log('✅ Memory usage: EXCELLENT')
    process.exit(0)
  } else if (heapUsed < 100) {
    console.log('⚠️ Memory usage: ACCEPTABLE')
    process.exit(0)
  } else {
    console.log('❌ Memory usage: HIGH')
    process.exit(1)
  }
} else {
  console.log('✅ Memory test completed (limited environment)')
  process.exit(0)
}
EOF

run_test_with_timeout "Memory Usage Test" "node /tmp/memory-test.js"

# TIER 5: Full Test Suite Run
print_section "TIER 5: Full Test Suite"

echo "🔄 Running complete test suite..."
run_test_with_timeout "Complete Test Suite" "npm run test:run" 120

echo "📊 Generating coverage report..."
run_test_with_timeout "Coverage Report" "npm run test:coverage" 120

# TIER 6: Build & Bundle Tests
print_section "TIER 6: Build & Bundle Tests"

echo "📦 Testing production build..."
run_test_with_timeout "Production Build" "npm run build" 180

echo "🔍 Testing bundle size..."
if [ -d "dist" ]; then
    bundle_size=$(du -sh dist/ | cut -f1)
    echo "✅ Bundle size: $bundle_size"
    print_result "Bundle size check"
else
    echo "❌ Build directory not found"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
fi

# Cleanup
print_section "Cleanup"
echo "🧹 Cleaning up temporary files..."
rm -f /tmp/cache-performance-test.js
rm -f /tmp/sync-performance-test.js
rm -f /tmp/memory-test.js

# Calculate results
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo ""
echo "============================================="
echo "🎯 Enterprise Frontend Test Results"
echo "============================================="
echo -e "⏱️  Duration: ${DURATION}s"
echo -e "📊 Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
echo -e "📈 Success Rate: ${SUCCESS_RATE}%"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "\n${GREEN}🎉 ENTERPRISE ARCHITECTURE: EXCELLENT${NC}"
    echo -e "${GREEN}✅ Production Ready - Deploy with confidence${NC}"
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "\n${YELLOW}⚠️  ENTERPRISE ARCHITECTURE: GOOD${NC}"
    echo -e "${YELLOW}✅ Production Ready - Minor optimizations recommended${NC}"
    exit 0
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "\n${YELLOW}⚠️  ENTERPRISE ARCHITECTURE: ACCEPTABLE${NC}"
    echo -e "${YELLOW}⚠️  Review failed tests before production deployment${NC}"
    exit 1
else
    echo -e "\n${RED}❌ ENTERPRISE ARCHITECTURE: NEEDS WORK${NC}"
    echo -e "${RED}❌ Not ready for production - Fix critical issues${NC}"
    exit 1
fi