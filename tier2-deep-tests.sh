#!/bin/bash

# TIER 2: Production Stability - Test Suite Approfonditi
# Test completi di ogni componente con scenari edge case

echo "🧪 TIER 2: Production Stability - Deep Testing Suite"
echo "===================================================="
echo "Data test: $(date)"
echo "Environment: $(uname -s) $(uname -r)"
echo ""

# Funzioni helper
get_auth_token() {
    curl -s -X POST "http://localhost:3001/auth/login" \
         -H "Content-Type: application/json" \
         -d '{"email": "admin@n8n-mcp.local", "password": "admin123"}' | jq -r '.token'
}

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_field="$5"
    
    echo -n "  ➤ $name: "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -H "Authorization: Bearer $TOKEN" "$endpoint")
    else
        response=$(curl -s -X "$method" -H "Authorization: Bearer $TOKEN" \
                       -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    
    if [ -n "$expected_field" ]; then
        result=$(echo "$response" | jq -r "$expected_field" 2>/dev/null)
        if [ "$result" != "null" ] && [ "$result" != "" ]; then
            echo "✅ PASS ($result)"
            return 0
        else
            echo "❌ FAIL (Expected: $expected_field)"
            echo "    Response: $response" | head -c 200
            echo ""
            return 1
        fi
    else
        echo "✅ PASS (Response received)"
        return 0
    fi
}

# Avvia server in background
echo "🚀 Starting TIER 2 Production Server..."
DB_USER=tizianoannicchiarico JWT_SECRET=your-secret-key-here-at-least-32-chars-long \
    node build/server/express-server.js &
SERVER_PID=$!

# Aspetta avvio server
echo "⏳ Waiting for server startup..."
sleep 8

# Verifica server sia up (with retry)
for i in {1..5}; do
    if curl -s http://localhost:3001/health > /dev/null; then
        break
    fi
    echo "  Retry $i/5..."
    sleep 2
done

if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "✅ Server started successfully (PID: $SERVER_PID)"
echo ""

# Ottieni token autenticazione
echo "🔐 Getting authentication token..."
TOKEN=$(get_auth_token)
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get authentication token"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "✅ Authentication token obtained"
echo ""

# Contatori test
TOTAL_TESTS=0
PASSED_TESTS=0

# =====================================================
# TEST CATEGORY 1: HEALTH MONITORING SYSTEM
# =====================================================
echo "📊 TEST CATEGORY 1: Health Monitoring System"
echo "=============================================="

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Health Check Overall Status" "GET" \
    "http://localhost:3001/api/production/health" "" ".status"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Health Components Detail" "GET" \
    "http://localhost:3001/api/production/health" "" ".components.database"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Health Check Timestamp" "GET" \
    "http://localhost:3001/api/production/health" "" ".timestamp"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Health Metrics Process" "GET" \
    "http://localhost:3001/api/production/health" "" ".metrics.process.memory_rss_mb"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 2: PRODUCTION DASHBOARD
# =====================================================
echo "📈 TEST CATEGORY 2: Production Dashboard"
echo "========================================"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Dashboard Overall Status" "GET" \
    "http://localhost:3001/api/production/dashboard" "" ".status"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Dashboard System Uptime" "GET" \
    "http://localhost:3001/api/production/dashboard" "" ".system.uptime"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Dashboard Performance Metrics" "GET" \
    "http://localhost:3001/api/production/dashboard" "" ".performance.responseTime"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Dashboard Database Status" "GET" \
    "http://localhost:3001/api/production/dashboard" "" ".database.status"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Dashboard Business Metrics" "GET" \
    "http://localhost:3001/api/production/dashboard" "" ".business.workflows"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 3: DATABASE CONNECTION POOL
# =====================================================
echo "🏊‍♂️ TEST CATEGORY 3: Database Connection Pool"
echo "=============================================="

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Pool Metrics Status" "GET" \
    "http://localhost:3001/api/production/database/pool" "" ".metrics.healthStatus"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Pool Utilization" "GET" \
    "http://localhost:3001/api/production/database/pool" "" ".metrics.poolUtilization"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Pool Configuration" "GET" \
    "http://localhost:3001/api/production/database/pool" "" ".detailed.pool.configuration.min"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Pool Refresh Operation" "POST" \
    "http://localhost:3001/api/production/database/pool/refresh" "" ".success"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Pool Performance Metrics" "GET" \
    "http://localhost:3001/api/production/database/pool" "" ".detailed.performance.totalQueries"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 4: PRODUCTION METRICS COLLECTION
# =====================================================
echo "📊 TEST CATEGORY 4: Production Metrics Collection"
echo "================================================="

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Current Metrics Timestamp" "GET" \
    "http://localhost:3001/api/production/metrics" "" ".timestamp"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Metrics System Status" "GET" \
    "http://localhost:3001/api/production/metrics" "" ".system"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Metrics History (24h)" "GET" \
    "http://localhost:3001/api/production/metrics/history?hours=24" "" ".timeRange"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Metrics History Data Points" "GET" \
    "http://localhost:3001/api/production/metrics/history?hours=1" "" ".dataPoints"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 5: ALERT SYSTEM
# =====================================================
echo "🚨 TEST CATEGORY 5: Alert System"
echo "================================"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Active Alerts List" "GET" \
    "http://localhost:3001/api/production/alerts" "" ".summary.total"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Alert Summary Stats" "GET" \
    "http://localhost:3001/api/production/alerts" "" ".summary.critical"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Alert Statistics" "GET" \
    "http://localhost:3001/api/production/alerts" "" ".stats"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 6: BACKUP SYSTEM
# =====================================================
echo "💾 TEST CATEGORY 6: Backup System"
echo "================================="

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Backup System Status" "GET" \
    "http://localhost:3001/api/production/backup" "" ".health.status"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Backup Statistics" "GET" \
    "http://localhost:3001/api/production/backup" "" ".stats.totalBackups"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Recent Backups List" "GET" \
    "http://localhost:3001/api/production/backup" "" ".recentBackups"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

# Test backup trigger (senza pg_dump disponibile, dovrebbe fallire gracefully)
echo "  ➤ Backup Trigger Test (Expected to fail gracefully): "
response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
               -H "Content-Type: application/json" \
               -d '{"type": "incremental"}' \
               "http://localhost:3001/api/production/backup/trigger")
echo "⚠️  EXPECTED FAILURE (pg_dump not available)"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 7: GRACEFUL SHUTDOWN SYSTEM
# =====================================================
echo "🛑 TEST CATEGORY 7: Graceful Shutdown System"
echo "============================================"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Shutdown Manager Status" "GET" \
    "http://localhost:3001/api/production/shutdown/status" "" ".registered"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Shutdown Components List" "GET" \
    "http://localhost:3001/api/production/shutdown/status" "" ".components"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
test_endpoint "Shutdown Configuration" "GET" \
    "http://localhost:3001/api/production/shutdown/status" "" ".config.timeout"
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

# Test shutdown simulation (solo in development)
echo "  ➤ Shutdown Test Simulation: "
response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
               "http://localhost:3001/api/production/shutdown/test")
result=$(echo "$response" | jq -r ".testResult" 2>/dev/null)
if [ "$result" != "null" ] && [ "$result" != "" ]; then
    echo "✅ PASS (Simulation completed)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ FAIL (Simulation failed)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 8: EDGE CASES & ERROR HANDLING
# =====================================================
echo "⚠️  TEST CATEGORY 8: Edge Cases & Error Handling"
echo "=============================================="

# Test con endpoint inesistente
echo "  ➤ Non-existent Endpoint (404 Test): "
response=$(curl -s -H "Authorization: Bearer $TOKEN" \
               "http://localhost:3001/api/production/nonexistent")
status=$(echo "$response" | jq -r ".error" 2>/dev/null)
if [ "$status" != "null" ]; then
    echo "✅ PASS (Proper 404 handling)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ FAIL (404 not handled properly)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test senza autenticazione
echo "  ➤ Unauthorized Access Test: "
response=$(curl -s "http://localhost:3001/api/production/health")
status=$(echo "$response" | jq -r ".error" 2>/dev/null)
if [ "$status" != "null" ]; then
    echo "✅ PASS (Unauthorized access blocked)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ FAIL (Unauthorized access allowed)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test con token invalid
echo "  ➤ Invalid Token Test: "
response=$(curl -s -H "Authorization: Bearer invalid_token" \
               "http://localhost:3001/api/production/health")
status=$(echo "$response" | jq -r ".error" 2>/dev/null)
if [ "$status" != "null" ]; then
    echo "✅ PASS (Invalid token rejected)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ FAIL (Invalid token accepted)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# =====================================================
# TEST CATEGORY 9: PERFORMANCE & LOAD
# =====================================================
echo "🚀 TEST CATEGORY 9: Performance & Load Testing"
echo "=============================================="

# Test con richieste multiple rapide
echo "  ➤ Rapid Multiple Requests Test: "
start_time=$(date +%s)
for i in {1..5}; do
    curl -s -H "Authorization: Bearer $TOKEN" \
         "http://localhost:3001/api/production/health" > /dev/null &
done
wait
end_time=$(date +%s)
duration=$((end_time - start_time))
if [ $duration -lt 10 ]; then
    echo "✅ PASS (5 concurrent requests in ${duration}s)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ FAIL (Too slow: ${duration}s for 5 requests)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test dimensione response
echo "  ➤ Response Size Test: "
response=$(curl -s -H "Authorization: Bearer $TOKEN" \
               "http://localhost:3001/api/production/dashboard")
size=${#response}
if [ $size -gt 100 ] && [ $size -lt 10000 ]; then
    echo "✅ PASS (Response size: ${size} bytes - reasonable)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ FAIL (Response size: ${size} bytes - too large/small)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# =====================================================
# FINAL RESULTS & CLEANUP
# =====================================================
echo "📋 TEST SUMMARY"
echo "==============="
echo "Total Tests:  $TOTAL_TESTS"
echo "Passed Tests: $PASSED_TESTS"
echo "Failed Tests: $((TOTAL_TESTS - PASSED_TESTS))"
echo "Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo "🎉 ALL TESTS PASSED! TIER 2 Production Stability is FULLY FUNCTIONAL!"
    result=0
elif [ $PASSED_TESTS -gt $((TOTAL_TESTS * 80 / 100)) ]; then
    echo "✅ MOST TESTS PASSED! TIER 2 Production Stability is OPERATIONAL!"
    result=0
else
    echo "❌ MULTIPLE TEST FAILURES! TIER 2 needs investigation!"
    result=1
fi

echo ""
echo "🛑 Shutting down test server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "✅ Test suite completed at $(date)"
exit $result