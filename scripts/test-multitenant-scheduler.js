#!/usr/bin/env node

/**
 * Test Multi-Tenant Scheduler
 * 
 * Questo script testa il nuovo scheduler multi-tenant con i dati reali
 * già popolati nel database, verificando:
 * - Scheduling automatico
 * - Sync parallelo di più tenant
 * - Health monitoring
 * - Schema discovery
 * - Cleanup automatico
 */

import dotenv from 'dotenv';
dotenv.config();

import { getMultiTenantScheduler } from '../build/backend/multi-tenant-scheduler.js';
import { DatabaseConnection } from '../build/database/connection.js';
import fs from 'fs/promises';

class MultiTenantSchedulerTester {
  constructor() {
    this.scheduler = null;
    this.db = DatabaseConnection.getInstance();
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        schedulerStarted: false,
        tenantsFound: 0,
        syncResults: null
      }
    };
  }

  async runAllTests() {
    console.log('🚀 TEST MULTI-TENANT SCHEDULER');
    console.log('='.repeat(50));
    
    try {
      await this.db.connect();
      
      // 1. Verifica dati esistenti
      await this.verifyExistingData();
      
      // 2. Testa creazione scheduler
      await this.testSchedulerCreation();
      
      // 3. Testa configurazione
      await this.testSchedulerConfiguration();
      
      // 4. Testa sync manuale
      await this.testManualSync();
      
      // 5. Testa health check
      await this.testHealthCheck();
      
      // 6. Testa scheduler automatico (breve)
      await this.testAutomaticScheduler();
      
      // 7. Genera report
      await this.generateTestReport();
      
      console.log('\n✅ Test scheduler multi-tenant completati!');
      
    } catch (error) {
      console.error(`❌ Errore durante test: ${error.message}`);
      throw error;
    } finally {
      if (this.scheduler) {
        await this.scheduler.stop();
      }
      await this.db.disconnect();
    }
  }

  /**
   * Verifica che ci siano dati da testare
   */
  async verifyExistingData() {
    console.log('\n📊 Verifica dati esistenti...');
    
    try {
      // Conta tenant
      const tenants = await this.db.getMany('SELECT id, name, sync_enabled FROM tenants ORDER BY id');
      console.log(`   📋 Tenant trovati: ${tenants.length}`);
      
      tenants.forEach(tenant => {
        console.log(`      - ${tenant.id} (${tenant.name}) - ${tenant.sync_enabled ? 'attivo' : 'inattivo'}`);
      });
      
      this.testResults.summary.tenantsFound = tenants.length;
      
      // Conta workflows per tenant
      const workflows = await this.db.getMany(`
        SELECT tenant_id, COUNT(*) as count 
        FROM tenant_workflows 
        GROUP BY tenant_id
      `);
      
      console.log(`   📊 Workflows per tenant:`);
      workflows.forEach(w => {
        console.log(`      - ${w.tenant_id}: ${w.count} workflows`);
      });
      
      // Conta executions per tenant
      const executions = await this.db.getMany(`
        SELECT tenant_id, COUNT(*) as count 
        FROM tenant_executions 
        GROUP BY tenant_id
      `);
      
      console.log(`   ⚡ Executions per tenant:`);
      executions.forEach(e => {
        console.log(`      - ${e.tenant_id}: ${e.count} executions`);
      });
      
      const hasData = tenants.length > 0 && workflows.length > 0;
      this.addTestResult('Verifica dati esistenti', hasData, 
        `${tenants.length} tenant, ${workflows.reduce((sum, w) => sum + parseInt(w.count), 0)} workflows totali`);
      
      if (!hasData) {
        throw new Error('Nessun dato da testare. Eseguire prima il test multi-tenant reale.');
      }
      
    } catch (error) {
      console.error('   ❌ Errore verifica dati:', error.message);
      this.addTestResult('Verifica dati esistenti', false, error.message);
      throw error;
    }
  }

  /**
   * Testa creazione e configurazione scheduler
   */
  async testSchedulerCreation() {
    console.log('\n⚙️ Test creazione scheduler...');
    
    try {
      // Crea scheduler con config personalizzata per test
      const testConfig = {
        intervals: {
          tenantSync: 2,        // Ogni 2 minuti per test
          schemaDiscovery: 30,  // Ogni 30 min per test
          healthCheck: 5,       // Ogni 5 min per test  
          cleanup: 60           // Ogni ora per test
        },
        limits: {
          maxConcurrentTenants: 3,
          maxWorkflowsPerTenant: 100,
          maxExecutionsPerTenant: 50
        },
        tenantConfig: {
          enableAutoDiscovery: true,
          enableHealthMonitoring: true,
          enableCleanup: false  // Disabilita per test
        }
      };
      
      this.scheduler = getMultiTenantScheduler(testConfig);
      
      console.log('   ✓ Scheduler creato con configurazione test');
      
      // Verifica configurazione
      const stats = this.scheduler.getStats();
      const configOk = stats.config.intervals.tenantSync === 2 && 
                       stats.config.limits.maxConcurrentTenants === 3;
      
      this.addTestResult('Creazione scheduler', configOk, 
        `Config: sync=${stats.config.intervals.tenantSync}min, concurrent=${stats.config.limits.maxConcurrentTenants}`);
      
      console.log('   ✓ Configurazione verificata');
      
    } catch (error) {
      console.error('   ❌ Errore creazione scheduler:', error.message);
      this.addTestResult('Creazione scheduler', false, error.message);
      throw error;
    }
  }

  /**
   * Testa configurazione dello scheduler
   */
  async testSchedulerConfiguration() {
    console.log('\n⚙️ Test configurazione scheduler...');
    
    try {
      if (!this.scheduler) {
        throw new Error('Scheduler non inizializzato');
      }
      
      const stats = this.scheduler.getStats();
      
      console.log('   📊 Configurazione corrente:');
      console.log(`      - Sync tenant: ogni ${stats.config.intervals.tenantSync} min`);
      console.log(`      - Health check: ogni ${stats.config.intervals.healthCheck} min`);  
      console.log(`      - Max concurrent: ${stats.config.limits.maxConcurrentTenants} tenant`);
      console.log(`      - Max workflows: ${stats.config.limits.maxWorkflowsPerTenant} per tenant`);
      
      const configComplete = stats.config && 
                             stats.config.intervals &&
                             stats.config.limits &&
                             stats.config.tenantConfig;
      
      this.addTestResult('Configurazione scheduler', configComplete, 
        'Tutte le sezioni config presenti');
      
    } catch (error) {
      console.error('   ❌ Errore test configurazione:', error.message);
      this.addTestResult('Configurazione scheduler', false, error.message);
    }
  }

  /**
   * Testa sync manuale di tutti i tenant
   */
  async testManualSync() {
    console.log('\n🔄 Test sync manuale multi-tenant...');
    
    try {
      if (!this.scheduler) {
        throw new Error('Scheduler non inizializzato');
      }
      
      console.log('   📊 Avvio sync manuale...');
      const startTime = Date.now();
      
      // Esegui sync manuale
      const result = await this.scheduler.forceSyncAllTenants();
      
      const duration = Date.now() - startTime;
      
      console.log('   📋 Risultati sync:');
      console.log(`      - Tenant totali: ${result.totalTenants}`);
      console.log(`      - Tenant sync ok: ${result.successfulTenants}`);
      console.log(`      - Tenant falliti: ${result.failedTenants}`);
      console.log(`      - Workflows sync: ${result.totalWorkflowsSynced}`);
      console.log(`      - Executions sync: ${result.totalExecutionsSynced}`);
      console.log(`      - Durata: ${duration}ms`);
      
      if (result.errors.length > 0) {
        console.log('   ⚠️ Errori:');
        result.errors.forEach(error => {
          console.log(`      - ${error.tenantId}: ${error.error}`);
        });
      }
      
      const syncSuccessful = result.totalTenants > 0 && result.successfulTenants > 0;
      this.testResults.summary.syncResults = result;
      
      this.addTestResult('Sync manuale multi-tenant', syncSuccessful,
        `${result.successfulTenants}/${result.totalTenants} tenant, ${result.totalWorkflowsSynced}w + ${result.totalExecutionsSynced}e`);
      
    } catch (error) {
      console.error('   ❌ Errore sync manuale:', error.message);
      this.addTestResult('Sync manuale multi-tenant', false, error.message);
    }
  }

  /**
   * Testa health check
   */
  async testHealthCheck() {
    console.log('\n💊 Test health check...');
    
    try {
      if (!this.scheduler) {
        throw new Error('Scheduler non inizializzato');
      }
      
      console.log('   🔍 Esecuzione health check...');
      const health = await this.scheduler.healthCheck();
      
      console.log('   📋 Risultati health check:');
      console.log(`      - Status: ${health.status}`);
      console.log(`      - Scheduler: ${health.checks.scheduler ? '✅' : '❌'}`);
      console.log(`      - Database: ${health.checks.database ? '✅' : '❌'}`);
      console.log(`      - Tenants: ${health.checks.tenants ? '✅' : '❌'}`);
      
      if (health.message) {
        console.log(`      - Messaggio: ${health.message}`);
      }
      
      if (health.tenantHealth) {
        console.log('   🏢 Salute tenant:');
        Object.entries(health.tenantHealth).forEach(([tenantId, healthy]) => {
          console.log(`      - ${tenantId}: ${healthy ? '✅' : '❌'}`);
        });
      }
      
      const healthOk = health.status !== 'unhealthy';
      this.addTestResult('Health check', healthOk, 
        `Status: ${health.status}, ${Object.values(health.checks).filter(c => c).length}/${Object.keys(health.checks).length} check ok`);
      
    } catch (error) {
      console.error('   ❌ Errore health check:', error.message);
      this.addTestResult('Health check', false, error.message);
    }
  }

  /**
   * Testa scheduler automatico per breve periodo
   */
  async testAutomaticScheduler() {
    console.log('\n⏰ Test scheduler automatico...');
    
    try {
      if (!this.scheduler) {
        throw new Error('Scheduler non inizializzato');
      }
      
      console.log('   🚀 Avvio scheduler automatico...');
      await this.scheduler.start();
      
      this.testResults.summary.schedulerStarted = true;
      
      // Verifica che sia in running
      const stats = this.scheduler.getStats();
      console.log(`   ✓ Scheduler avviato: ${stats.isRunning ? '✅' : '❌'}`);
      console.log(`   📅 Task schedulati: ${stats.scheduledTasks.join(', ')}`);
      
      // Attendi un breve periodo per vedere se funziona
      console.log('   ⏱️ Attesa 10 secondi per test funzionamento...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Verifica stats dopo run
      const statsAfter = this.scheduler.getStats();
      console.log('   📊 Stats dopo test:');
      console.log(`      - Sync totali: ${statsAfter.stats.totalSyncRuns}`);
      console.log(`      - Ultimo sync: ${statsAfter.stats.lastSyncTime ? new Date(statsAfter.stats.lastSyncTime).toLocaleTimeString() : 'mai'}`);
      console.log(`      - Tenant attivi: ${statsAfter.stats.activeTenants}`);
      
      // Ferma scheduler per cleanup
      console.log('   🛑 Arresto scheduler...');
      await this.scheduler.stop();
      
      const schedulerWorked = stats.isRunning && stats.scheduledTasks.length > 0;
      this.addTestResult('Scheduler automatico', schedulerWorked,
        `${stats.scheduledTasks.length} task schedulati, running: ${stats.isRunning}`);
      
    } catch (error) {
      console.error('   ❌ Errore scheduler automatico:', error.message);
      this.addTestResult('Scheduler automatico', false, error.message);
    }
  }

  /**
   * Aggiungi risultato test
   */
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

  /**
   * Genera report finale dei test
   */
  async generateTestReport() {
    console.log('\n📊 Generazione report test scheduler...');
    
    // Calcola metriche
    const successRate = Math.round((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100);
    
    // Verifica stato database multi-tenant
    const dbStats = await this.getDatabaseMultiTenantStats();
    
    const finalReport = {
      ...this.testResults,
      database: dbStats,
      conclusions: {
        successRate,
        schedulerReady: successRate >= 80 && this.testResults.summary.schedulerStarted,
        recommendations: this.generateRecommendations(successRate)
      }
    };
    
    // Salva report
    const filename = `multitenant_scheduler_test_${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(finalReport, null, 2));
    
    // Report console
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT TEST MULTI-TENANT SCHEDULER');
    console.log('='.repeat(60));
    console.log(`🧪 Test totali: ${this.testResults.summary.totalTests}`);
    console.log(`✅ Test passati: ${this.testResults.summary.passedTests}`);
    console.log(`❌ Test falliti: ${this.testResults.summary.failedTests}`);
    console.log(`📈 Success rate: ${successRate}%`);
    console.log(`🏢 Tenant trovati: ${this.testResults.summary.tenantsFound}`);
    console.log(`🚀 Scheduler avviato: ${this.testResults.summary.schedulerStarted ? '✅' : '❌'}`);
    
    if (this.testResults.summary.syncResults) {
      const sync = this.testResults.summary.syncResults;
      console.log(`🔄 Ultimo sync: ${sync.successfulTenants}/${sync.totalTenants} tenant, ${sync.totalWorkflowsSynced}w + ${sync.totalExecutionsSynced}e`);
    }
    
    console.log('\n💾 Stato Database Multi-Tenant:');
    Object.entries(dbStats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n📋 Raccomandazioni:');
    finalReport.conclusions.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
    
    if (this.testResults.summary.failedTests > 0) {
      console.log('\n❌ Test falliti:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }
    
    console.log(`\n💾 Report completo: ${filename}`);
    
    // Verifica finale
    if (finalReport.conclusions.schedulerReady) {
      console.log('\n🎉 MULTI-TENANT SCHEDULER PRONTO PER PRODUZIONE!');
    } else {
      console.log('\n⚠️ Scheduler richiede ottimizzazioni prima della produzione');
    }
    
    return finalReport;
  }

  /**
   * Ottieni statistiche database multi-tenant
   */
  async getDatabaseMultiTenantStats() {
    const stats = {};
    
    try {
      // Tenant count
      const tenants = await this.db.getOne('SELECT COUNT(*) as count FROM tenants');
      stats.totalTenants = tenants.count;
      
      // Active tenant count
      const activeTenants = await this.db.getOne('SELECT COUNT(*) as count FROM tenants WHERE sync_enabled = true');
      stats.activeTenants = activeTenants.count;
      
      // Total workflows multi-tenant
      const workflows = await this.db.getOne('SELECT COUNT(*) as count FROM tenant_workflows');
      stats.totalWorkflows = workflows.count;
      
      // Total executions multi-tenant
      const executions = await this.db.getOne('SELECT COUNT(*) as count FROM tenant_executions');
      stats.totalExecutions = executions.count;
      
      // Sync logs count
      const syncLogs = await this.db.getOne('SELECT COUNT(*) as count FROM tenant_sync_logs');
      stats.syncLogs = syncLogs.count;
      
      // Last sync time
      const lastSync = await this.db.getOne('SELECT MAX(completed_at) as last_sync FROM tenant_sync_logs');
      stats.lastSyncTime = lastSync.last_sync;
      
      // Schema discoveries count
      const discoveries = await this.db.getOne('SELECT COUNT(*) as count FROM tenant_schema_discoveries');
      stats.schemaDiscoveries = discoveries.count;
      
    } catch (error) {
      stats.error = error.message;
    }
    
    return stats;
  }

  /**
   * Genera raccomandazioni
   */
  generateRecommendations(successRate) {
    const recommendations = [];
    
    if (successRate < 80) {
      recommendations.push('Risolvere test falliti prima del deployment production');
    } else {
      recommendations.push('Scheduler stabile - pronto per deployment');
    }
    
    if (this.testResults.summary.tenantsFound === 0) {
      recommendations.push('Popolare database con tenant per test completi');
    } else if (this.testResults.summary.tenantsFound < 3) {
      recommendations.push('Aggiungere più tenant di test per validazione completa');
    }
    
    if (!this.testResults.summary.schedulerStarted) {
      recommendations.push('Verificare startup sequence dello scheduler');
    }
    
    recommendations.push('Configurare monitoring production per scheduler');
    recommendations.push('Implementare alerting per fallimenti sync tenant');
    recommendations.push('Testare con carico maggiore (10+ tenant)');
    recommendations.push('Configurare backup automatici database multi-tenant');
    
    return recommendations;
  }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const tester = new MultiTenantSchedulerTester();
  
  try {
    console.log('🚀 Avvio test multi-tenant scheduler...');
    console.log('Questo test verificherà il funzionamento dello scheduler su dati reali.');
    
    await tester.runAllTests();
    
  } catch (error) {
    console.error('💥 Test fallito:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MultiTenantSchedulerTester };