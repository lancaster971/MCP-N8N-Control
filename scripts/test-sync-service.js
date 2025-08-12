#!/usr/bin/env node

/**
 * Script di test per Backend Sync Service
 * Verifica connettività e funzionalità base
 */

// Carica variabili ambiente
import dotenv from 'dotenv';
dotenv.config();

import { getSyncService } from '../build/backend/sync-service.js';
import { DatabaseConnection } from '../build/database/connection.js';
import { repositories } from '../build/database/repositories/index.js';

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n📊 Test connessione database...', 'yellow');
  
  try {
    const db = DatabaseConnection.getInstance();
    await db.connect();
    
    // Test query semplice
    const result = await db.query('SELECT 1 as test');
    if (result.rows[0].test === 1) {
      log('✅ Database connesso correttamente', 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Errore connessione database: ${error.message}`, 'red');
    log('   Assicurati che PostgreSQL sia in esecuzione e il database sia configurato', 'yellow');
    return false;
  }
  
  return false;
}

async function testApiConnection() {
  log('\n🔌 Test connessione API n8n...', 'yellow');
  
  try {
    const { ApiFetcher } = await import('../build/backend/api-fetcher.js');
    const { defaultSyncConfig } = await import('../build/backend/sync-config.js');
    
    const fetcher = new ApiFetcher(defaultSyncConfig);
    const connected = await fetcher.testConnection();
    
    if (connected) {
      log('✅ API n8n raggiungibile', 'green');
      
      // Prova a fetchare workflow
      const workflows = await fetcher.getWorkflows(1);
      log(`   Trovati ${workflows.length} workflow`, 'blue');
      
      return true;
    } else {
      log('❌ Impossibile connettersi all\'API n8n', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Errore connessione API: ${error.message}`, 'red');
    log('   Verifica N8N_API_URL e N8N_API_KEY', 'yellow');
    return false;
  }
}

async function testRepositories() {
  log('\n🗃️  Test repositories...', 'yellow');
  
  try {
    // Test conteggi base
    const workflowCount = await repositories.workflows.count();
    const executionCount = await repositories.executions.count();
    const snapshotCount = await repositories.analytics.count();
    
    log(`✅ Repositories funzionanti:`, 'green');
    log(`   - Workflows: ${workflowCount} record`, 'blue');
    log(`   - Executions: ${executionCount} record`, 'blue');
    log(`   - KPI Snapshots: ${snapshotCount} record`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Errore test repositories: ${error.message}`, 'red');
    return false;
  }
}

async function testSyncService() {
  log('\n🔄 Test Sync Service...', 'yellow');
  
  try {
    const service = getSyncService({
      intervals: {
        // Disabilita scheduling automatico per test
        workflows: 0,
        executions: 0,
        fullSync: 0,
        kpiHourly: 0,
        kpiDaily: 0,
        cleanup: 0
      }
    });
    
    // Health check
    const health = await service.healthCheck();
    log(`✅ Health check: ${health.status}`, health.status === 'healthy' ? 'green' : 'yellow');
    
    Object.entries(health.checks).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌';
      const color = passed ? 'green' : 'red';
      log(`   ${icon} ${check}: ${passed}`, color);
    });
    
    // Stats
    const stats = service.getStats();
    log('\n📈 Statistiche Sync:', 'blue');
    log(`   - Servizio attivo: ${stats.isRunning}`, 'blue');
    log(`   - Sync totali: ${stats.syncStats.state.totalSyncs}`, 'blue');
    log(`   - Success rate: ${stats.syncStats.state.successRate.toFixed(2)}%`, 'blue');
    
    return health.status !== 'unhealthy';
  } catch (error) {
    log(`❌ Errore test sync service: ${error.message}`, 'red');
    return false;
  }
}

async function testIncrementalSync() {
  log('\n🚀 Test sync incrementale...', 'yellow');
  
  const confirmSync = process.argv.includes('--sync');
  
  if (!confirmSync) {
    log('⚠️  Sync non eseguito (usa --sync per eseguire)', 'yellow');
    return true;
  }
  
  try {
    const { SyncManager } = await import('../build/backend/sync-manager.js');
    const { defaultSyncConfig, SyncType } = await import('../build/backend/sync-config.js');
    
    const manager = new SyncManager(defaultSyncConfig);
    await manager.initialize();
    
    // Esegui sync workflow
    log('   Esecuzione sync workflow...', 'blue');
    const workflowResult = await manager.syncWorkflows(SyncType.INCREMENTAL);
    log(`   ✅ Workflow processati: ${workflowResult.stats.workflowsProcessed}`, 'green');
    
    // Esegui sync esecuzioni
    log('   Esecuzione sync esecuzioni...', 'blue');
    const executionResult = await manager.syncExecutions(SyncType.INCREMENTAL);
    log(`   ✅ Esecuzioni processate: ${executionResult.stats.executionsProcessed}`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Errore durante sync: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('====================================', 'blue');
  log('  Test Backend Sync Service n8n MCP', 'blue');
  log('====================================', 'blue');
  
  // Verifica variabili ambiente
  log('\n🔧 Configurazione ambiente:', 'yellow');
  log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurato' : '❌ Mancante'}`, 'blue');
  log(`   N8N_API_URL: ${process.env.N8N_API_URL ? '✅ Configurato' : '❌ Mancante'}`, 'blue');
  log(`   N8N_API_KEY: ${process.env.N8N_API_KEY ? '✅ Configurato' : '❌ Mancante'}`, 'blue');
  
  let allTestsPassed = true;
  
  // Test database
  const dbOk = await testDatabaseConnection();
  allTestsPassed = allTestsPassed && dbOk;
  
  // Test API
  const apiOk = await testApiConnection();
  allTestsPassed = allTestsPassed && apiOk;
  
  if (dbOk) {
    // Test repositories
    const repoOk = await testRepositories();
    allTestsPassed = allTestsPassed && repoOk;
  }
  
  if (dbOk && apiOk) {
    // Test sync service
    const serviceOk = await testSyncService();
    allTestsPassed = allTestsPassed && serviceOk;
    
    // Test sync (opzionale)
    const syncOk = await testIncrementalSync();
    allTestsPassed = allTestsPassed && syncOk;
  }
  
  // Risultato finale
  log('\n====================================', 'blue');
  if (allTestsPassed) {
    log('✅ TUTTI I TEST PASSATI', 'green');
    log('\nIl Backend Sync Service è pronto per l\'uso!', 'green');
    log('\nPer avviare il servizio:', 'yellow');
    log('  node build/backend/sync-service.js', 'blue');
  } else {
    log('❌ ALCUNI TEST FALLITI', 'red');
    log('\nCorreggi gli errori sopra indicati prima di procedere.', 'yellow');
  }
  log('====================================', 'blue');
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Esegui test
main().catch(error => {
  log(`\n❌ Errore fatale: ${error.message}`, 'red');
  process.exit(1);
});