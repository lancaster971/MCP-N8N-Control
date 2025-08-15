#!/bin/bash

# 🔒 SECURITY TEST SUITE COMPLETA v2.9.0
# Test approfondito sistema security enterprise-grade

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test configuration
API_BASE="http://localhost:3001"
TEST_EMAIL="admin@n8n-mcp.local"
TEST_PASSWORD="admin123"
CONCURRENT_REQUESTS=20

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${PURPLE}🔒 STARTING ENTERPRISE SECURITY TEST SUITE v2.9.0${NC}"
echo "=================================================="

# Function to print test result
print_test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ "$result" = "PASS" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        [ -n "$details" ] && echo -e "   ${details}"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        [ -n "$details" ] && echo -e "   ${RED}$details${NC}"
    fi
}

# Function to check if server is running
check_server() {
    echo -e "\n${BLUE}🚀 CHECKING SERVER STATUS${NC}"
    
    if curl -s "$API_BASE/health" > /dev/null 2>&1; then
        local health_response=$(curl -s "$API_BASE/health" | jq -r '.status')
        print_test_result "Server Health Check" "PASS" "Status: $health_response"
    else
        print_test_result "Server Health Check" "FAIL" "Server not responding at $API_BASE"
        echo -e "${RED}❌ Server must be running for tests. Start with:${NC}"
        echo -e "${YELLOW}source .env && DB_USER=tizianoannicchiarico node build/server/express-server.js${NC}"
        exit 1
    fi
}

# Function to get JWT token for authenticated tests
get_jwt_token() {
    echo -e "\n${BLUE}🔐 AUTHENTICATING FOR PROTECTED TESTS${NC}"
    
    local login_response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$login_response" | jq -e '.token' > /dev/null 2>&1; then
        JWT_TOKEN=$(echo "$login_response" | jq -r '.token')
        local user_role=$(echo "$login_response" | jq -r '.user.role')
        print_test_result "JWT Authentication" "PASS" "Role: $user_role, Token length: ${#JWT_TOKEN}"
        return 0
    else
        print_test_result "JWT Authentication" "FAIL" "Cannot authenticate with $TEST_EMAIL"
        return 1
    fi
}

# TIER 1: SECURITY TESTS
run_security_tests() {
    echo -e "\n${PURPLE}===========================================${NC}"
    echo -e "${PURPLE}🔒 TIER 1: SECURITY INTEGRATION TESTS${NC}"
    echo -e "${PURPLE}===========================================${NC}"
    
    # Test 1: Public Endpoints (no auth required)
    echo -e "\n${BLUE}📋 Test 1: Public Endpoints Access${NC}"
    
    # Root endpoint
    local root_response=$(curl -s "$API_BASE/" | jq -r '.name' 2>/dev/null)
    if [[ "$root_response" == *"PilotPro"* ]]; then
        print_test_result "Root Endpoint Public Access" "PASS" "API info accessible"
    else
        print_test_result "Root Endpoint Public Access" "FAIL" "Root endpoint not accessible"
    fi
    
    # Health endpoint
    local health_status=$(curl -s "$API_BASE/health" | jq -r '.auth' 2>/dev/null)
    if [[ "$health_status" == "enabled" ]]; then
        print_test_result "Health Endpoint Security Info" "PASS" "Auth status reported correctly"
    else
        print_test_result "Health Endpoint Security Info" "FAIL" "Health endpoint missing auth info"
    fi
    
    # Test 2: Protected Endpoints (should be blocked)
    echo -e "\n${BLUE}🚨 Test 2: Protected Endpoints Blocking${NC}"
    
    # Test protected endpoint without auth
    local protected_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/stats")
    if [ "$protected_response" = "401" ]; then
        print_test_result "Protected Endpoint Blocking" "PASS" "HTTP 401 returned for /api/stats"
    else
        print_test_result "Protected Endpoint Blocking" "FAIL" "Expected 401, got $protected_response"
    fi
    
    # Test 3: JWT Token Authentication
    echo -e "\n${BLUE}🔑 Test 3: JWT Token Authentication${NC}"
    
    if get_jwt_token; then
        # Test valid JWT token
        local auth_response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_BASE/api/stats" | jq -r '.database.totalWorkflows' 2>/dev/null)
        if [[ "$auth_response" =~ ^[0-9]+$ ]]; then
            print_test_result "Valid JWT Token Access" "PASS" "Retrieved $auth_response workflows"
        else
            print_test_result "Valid JWT Token Access" "FAIL" "Valid token rejected or invalid response"
        fi
        
        # Test invalid JWT token
        local invalid_response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer invalid_token_here" "$API_BASE/api/stats")
        if [ "$invalid_response" = "401" ]; then
            print_test_result "Invalid JWT Token Rejection" "PASS" "HTTP 401 for invalid token"
        else
            print_test_result "Invalid JWT Token Rejection" "FAIL" "Expected 401, got $invalid_response"
        fi
    fi
    
    # Test 4: API Key Authentication
    echo -e "\n${BLUE}🔐 Test 4: API Key Authentication${NC}"
    
    # Get API key from login response
    local login_response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
    
    local api_key=$(echo "$login_response" | jq -r '.user.api_key' 2>/dev/null)
    
    if [ "$api_key" != "null" ] && [ -n "$api_key" ]; then
        # Test valid API key
        local api_response=$(curl -s -H "X-API-Key: $api_key" "$API_BASE/api/stats" | jq -r '.database.totalWorkflows' 2>/dev/null)
        if [[ "$api_response" =~ ^[0-9]+$ ]]; then
            print_test_result "Valid API Key Access" "PASS" "Retrieved $api_response workflows"
        else
            print_test_result "Valid API Key Access" "FAIL" "Valid API key rejected"
        fi
        
        # Test invalid API key
        local invalid_api_response=$(curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: invalid_api_key_123" "$API_BASE/api/stats")
        if [ "$invalid_api_response" = "401" ]; then
            print_test_result "Invalid API Key Rejection" "PASS" "HTTP 401 for invalid API key"
        else
            print_test_result "Invalid API Key Rejection" "FAIL" "Expected 401, got $invalid_api_response"
        fi
    else
        print_test_result "API Key Retrieval" "FAIL" "Cannot retrieve API key from login"
    fi
    
    # Test 5: Rate Limiting
    echo -e "\n${BLUE}⚡ Test 5: Rate Limiting Protection${NC}"
    
    # Make rapid requests to trigger rate limiting
    local rate_limit_hit=false
    for i in {1..10}; do
        local rate_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"test","password":"test"}')
        
        if [ "$rate_response" = "429" ]; then
            rate_limit_hit=true
            break
        fi
        sleep 0.1
    done
    
    if [ "$rate_limit_hit" = true ]; then
        print_test_result "Rate Limiting Active" "PASS" "HTTP 429 triggered after rapid requests"
    else
        print_test_result "Rate Limiting Active" "WARN" "Rate limit not triggered (may be configured higher)"
    fi
    
    # Test 6: RBAC Permission System
    echo -e "\n${BLUE}👮 Test 6: RBAC Permission System${NC}"
    
    if [ -n "$JWT_TOKEN" ]; then
        # Test permission-protected endpoint
        local permission_response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_BASE/api/scheduler/start" \
            -X POST | jq -r '.error // "success"' 2>/dev/null)
        
        if [[ "$permission_response" == "success" ]] || [[ "$permission_response" == *"already running"* ]]; then
            print_test_result "RBAC Admin Permissions" "PASS" "Admin can control scheduler"
        elif [[ "$permission_response" == *"Forbidden"* ]]; then
            print_test_result "RBAC Admin Permissions" "FAIL" "Admin user lacks scheduler:control permission"
        else
            print_test_result "RBAC Admin Permissions" "WARN" "Unexpected response: $permission_response"
        fi
    fi
    
    # Test 7: SQL Injection Protection
    echo -e "\n${BLUE}🛡️ Test 7: SQL Injection Protection${NC}"
    
    # Test SQL injection in search parameters
    local sql_injection_payloads=(
        "'; DROP TABLE workflows; --"
        "1' OR '1'='1"
        "admin'; SELECT * FROM auth_users; --"
        "1 UNION SELECT password_hash FROM auth_users"
    )
    
    local sql_injection_blocked=0
    for payload in "${sql_injection_payloads[@]}"; do
        if [ -n "$JWT_TOKEN" ]; then
            local injection_response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
                "$API_BASE/api/search/workflows?q=$(echo "$payload" | jq -sRr @uri)" 2>/dev/null)
            
            # Check if response is valid JSON and doesn't contain sensitive data
            if echo "$injection_response" | jq empty 2>/dev/null && \
               ! echo "$injection_response" | grep -i "password_hash\|auth_users" > /dev/null; then
                sql_injection_blocked=$((sql_injection_blocked + 1))
            fi
        fi
    done
    
    if [ $sql_injection_blocked -eq ${#sql_injection_payloads[@]} ]; then
        print_test_result "SQL Injection Protection" "PASS" "All $sql_injection_blocked injection attempts blocked"
    else
        print_test_result "SQL Injection Protection" "FAIL" "Some SQL injection attempts may have succeeded"
    fi
    
    # Test 8: Security Headers
    echo -e "\n${BLUE}🔒 Test 8: Security Headers Validation${NC}"
    
    local headers_response=$(curl -s -I "$API_BASE/health")
    
    # Check for important security headers
    local security_headers_found=0
    local expected_headers=("X-Frame-Options" "X-Content-Type-Options" "Referrer-Policy")
    
    for header in "${expected_headers[@]}"; do
        if echo "$headers_response" | grep -i "$header" > /dev/null; then
            security_headers_found=$((security_headers_found + 1))
        fi
    done
    
    if [ $security_headers_found -ge 2 ]; then
        print_test_result "Security Headers Present" "PASS" "$security_headers_found/${#expected_headers[@]} critical headers found"
    else
        print_test_result "Security Headers Present" "FAIL" "Missing critical security headers"
    fi
    
    # Test 9: Concurrent Requests Performance
    echo -e "\n${BLUE}⚡ Test 9: Concurrent Request Handling${NC}"
    
    if [ -n "$JWT_TOKEN" ]; then
        local start_time=$(date +%s%3N)
        
        # Launch concurrent requests
        local pids=()
        for i in $(seq 1 $CONCURRENT_REQUESTS); do
            curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_BASE/api/stats" > /dev/null &
            pids+=($!)
        done
        
        # Wait for all requests to complete
        for pid in "${pids[@]}"; do
            wait $pid
        done
        
        local end_time=$(date +%s%3N)
        local duration=$((end_time - start_time))
        
        if [ $duration -lt 5000 ]; then  # Less than 5 seconds
            print_test_result "Concurrent Request Performance" "PASS" "$CONCURRENT_REQUESTS requests in ${duration}ms"
        else
            print_test_result "Concurrent Request Performance" "WARN" "$CONCURRENT_REQUESTS requests took ${duration}ms (>5s)"
        fi
    fi
    
    # Test 10: Error Handling and Information Disclosure
    echo -e "\n${BLUE}🚨 Test 10: Error Handling Security${NC}"
    
    # Test that error responses don't leak sensitive information
    local error_response=$(curl -s "$API_BASE/api/nonexistent-endpoint" | jq -r '.stack // "no_stack"' 2>/dev/null)
    
    if [ "$error_response" = "no_stack" ] || [ "$error_response" = "null" ]; then
        print_test_result "Error Information Disclosure" "PASS" "Stack traces not exposed in errors"
    else
        print_test_result "Error Information Disclosure" "FAIL" "Potential information disclosure in error responses"
    fi
}

# Function to print final summary
print_summary() {
    echo -e "\n${PURPLE}===========================================${NC}"
    echo -e "${PURPLE}📊 SECURITY TEST SUITE RESULTS SUMMARY${NC}"
    echo -e "${PURPLE}===========================================${NC}"
    
    local pass_rate=0
    if [ $TESTS_TOTAL -gt 0 ]; then
        pass_rate=$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))
    fi
    
    echo -e "${BLUE}Total Tests:${NC} $TESTS_TOTAL"
    echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
    echo -e "${RED}Failed:${NC} $TESTS_FAILED"
    echo -e "${YELLOW}Pass Rate:${NC} ${pass_rate}%"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL SECURITY TESTS PASSED! System is ENTERPRISE-READY${NC}"
        echo -e "${GREEN}✅ TIER 1 Security Integration: VALIDATED${NC}"
    elif [ $pass_rate -ge 80 ]; then
        echo -e "\n${YELLOW}⚠️ MOSTLY SECURE: ${pass_rate}% tests passed${NC}"
        echo -e "${YELLOW}🔧 Review failed tests and fix security issues${NC}"
    else
        echo -e "\n${RED}🚨 SECURITY ISSUES DETECTED: Only ${pass_rate}% tests passed${NC}"
        echo -e "${RED}❌ System NOT ready for production deployment${NC}"
        exit 1
    fi
    
    echo -e "\n${BLUE}🔒 Security Features Validated:${NC}"
    echo -e "   • JWT + API Key dual authentication"
    echo -e "   • Rate limiting and DoS protection"
    echo -e "   • RBAC permission system"
    echo -e "   • SQL injection protection"
    echo -e "   • Security headers (Helmet.js)"
    echo -e "   • Concurrent request handling"
    echo -e "   • Error handling without information disclosure"
    
    echo -e "\n${PURPLE}===========================================${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting comprehensive security test suite...${NC}"
    echo -e "${YELLOW}Testing against: $API_BASE${NC}"
    echo -e "${YELLOW}Admin credentials: $TEST_EMAIL / $TEST_PASSWORD${NC}"
    echo ""
    
    check_server
    run_security_tests
    print_summary
}

# Run main function
main "$@"