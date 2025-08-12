#!/usr/bin/env node

/**
 * Test API Server
 * 
 * Questo script testa le API REST del server multi-tenant
 */

import dotenv from 'dotenv';
dotenv.config();

class ApiServerTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  async runAllTests() {
    console.log('🚀 TEST API SERVER');
    console.log('='.repeat(50));
    
    try {
      // 1. Test health endpoint
      await this.testHealthEndpoint();
      
      // 2. Test scheduler status
      await this.testSchedulerStatus();
      
      // 3. Test tenants endpoint
      await this.testTenantsEndpoint();
      
      // 4. Test stats endpoint
      await this.testStatsEndpoint();
      
      // 5. Test logs endpoint
      await this.testLogsEndpoint();
      
      // 6. Test sync endpoint
      await this.testSyncEndpoint();
      
      // Report finale
      this.generateReport();
      
      console.log('\n✅ Test API server completati!');
      
    } catch (error) {
      console.error(`❌ Errore durante test: ${error.message}`);
      throw error;
    }
  }

  async testHealthEndpoint() {
    console.log('\n💊 Test health endpoint...');
    
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      const passed = response.ok && data.status === 'healthy';
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Health: ${data.status}`);
      console.log(`   Uptime: ${data.uptime}s`);
      
      this.addTestResult('Health endpoint', passed, 
        `Status: ${response.status}, Health: ${data.status}`);
      
    } catch (error) {
      console.error('   ❌ Errore health check:', error.message);
      this.addTestResult('Health endpoint', false, error.message);
    }
  }

  async testSchedulerStatus() {
    console.log('\n⚙️ Test scheduler status...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/scheduler/status`);
      const data = await response.json();
      
      const passed = response.ok && 
                     typeof data.scheduler === 'object' &&
                     typeof data.health === 'object';
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Running: ${data.scheduler?.isRunning || 'unknown'}`);
      console.log(`   Health: ${data.health?.status || 'unknown'}`);
      console.log(`   Tasks: ${data.scheduler?.scheduledTasks?.join(', ') || 'none'}`);
      
      this.addTestResult('Scheduler status', passed, 
        `Status: ${response.status}, Running: ${data.scheduler?.isRunning}`);
      
    } catch (error) {
      console.error('   ❌ Errore scheduler status:', error.message);
      this.addTestResult('Scheduler status', false, error.message);
    }
  }

  async testTenantsEndpoint() {
    console.log('\n🏢 Test tenants endpoint...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/tenants`);
      const data = await response.json();
      
      const passed = response.ok && 
                     Array.isArray(data.tenants) &&
                     typeof data.total === 'number';
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Tenants: ${data.total || 0}`);
      
      if (data.tenants && data.tenants.length > 0) {
        console.log('   Tenant list:');
        data.tenants.slice(0, 3).forEach(tenant => {
          console.log(`      - ${tenant.id}: ${tenant.stats?.workflows || 0}w, ${tenant.stats?.executions || 0}e`);
        });
      }
      
      this.addTestResult('Tenants endpoint', passed, 
        `Status: ${response.status}, Count: ${data.total || 0}`);
      
    } catch (error) {
      console.error('   ❌ Errore tenants:', error.message);
      this.addTestResult('Tenants endpoint', false, error.message);
    }
  }

  async testStatsEndpoint() {
    console.log('\n📊 Test stats endpoint...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`);
      const data = await response.json();
      
      const passed = response.ok && 
                     typeof data.database === 'object' &&
                     typeof data.scheduler === 'object';
      
      console.log(`   Status: ${response.status}`);
      console.log(`   DB Tenants: ${data.database?.totalTenants || 0}`);
      console.log(`   DB Workflows: ${data.database?.totalWorkflows || 0}`);
      console.log(`   DB Executions: ${data.database?.totalExecutions || 0}`);
      console.log(`   Scheduler Runs: ${data.scheduler?.totalSyncRuns || 0}`);
      
      this.addTestResult('Stats endpoint', passed, 
        `Status: ${response.status}, Tenants: ${data.database?.totalTenants || 0}`);
      
    } catch (error) {
      console.error('   ❌ Errore stats:', error.message);
      this.addTestResult('Stats endpoint', false, error.message);
    }
  }

  async testLogsEndpoint() {
    console.log('\n📋 Test logs endpoint...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/logs?limit=5`);
      const data = await response.json();
      
      const passed = response.ok && 
                     Array.isArray(data.logs) &&
                     typeof data.pagination === 'object';
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Logs found: ${data.logs?.length || 0}`);
      console.log(`   Pagination: limit=${data.pagination?.limit}, offset=${data.pagination?.offset}`);
      
      if (data.logs && data.logs.length > 0) {
        console.log('   Recent logs:');
        data.logs.slice(0, 2).forEach(log => {
          console.log(`      - ${log.tenant_name}: ${log.sync_type} (${log.status})`);
        });
      }
      
      this.addTestResult('Logs endpoint', passed, 
        `Status: ${response.status}, Logs: ${data.logs?.length || 0}`);
      
    } catch (error) {
      console.error('   ❌ Errore logs:', error.message);
      this.addTestResult('Logs endpoint', false, error.message);
    }
  }

  async testSyncEndpoint() {
    console.log('\n🔄 Test sync endpoint (manual trigger)...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/scheduler/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Sync di tutti i tenant
      });
      
      const data = await response.json();
      
      const passed = response.ok && typeof data.result === 'object';
      
      console.log(`   Status: ${response.status}`);
      
      if (data.result) {
        console.log(`   Total tenants: ${data.result.totalTenants || 0}`);
        console.log(`   Successful: ${data.result.successfulTenants || 0}`);
        console.log(`   Failed: ${data.result.failedTenants || 0}`);
        console.log(`   Duration: ${data.result.duration_ms || 0}ms`);
      }
      
      this.addTestResult('Manual sync', passed, 
        `Status: ${response.status}, Tenants: ${data.result?.successfulTenants}/${data.result?.totalTenants}`);
      
    } catch (error) {
      console.error('   ❌ Errore sync:', error.message);
      this.addTestResult('Manual sync', false, error.message);
    }
  }

  addTestResult(name, passed, details) {
    this.testResults.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
    
    this.testResults.summary.totalTests++;
    if (passed) {
      this.testResults.summary.passedTests++;
    } else {
      this.testResults.summary.failedTests++;
    }
  }

  generateReport() {
    const successRate = Math.round((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT TEST API SERVER');
    console.log('='.repeat(60));
    console.log(`🧪 Test totali: ${this.testResults.summary.totalTests}`);
    console.log(`✅ Test passati: ${this.testResults.summary.passedTests}`);
    console.log(`❌ Test falliti: ${this.testResults.summary.failedTests}`);
    console.log(`📈 Success rate: ${successRate}%`);
    
    if (this.testResults.summary.failedTests > 0) {
      console.log('\n❌ Test falliti:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }
    
    if (successRate >= 80) {
      console.log('\n🎉 API SERVER FUNZIONANTE!');
    } else {
      console.log('\n⚠️ API server richiede correzioni');
    }
  }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const tester = new ApiServerTester();
  
  try {
    console.log('🚀 Avvio test API server...');
    console.log('NOTA: Assicurati che il server API sia in esecuzione su localhost:3001');
    console.log('Puoi avviarlo con: node build/server/express-server.js\n');
    
    await tester.runAllTests();
    
  } catch (error) {
    console.error('💥 Test fallito:', error.message);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ApiServerTester };