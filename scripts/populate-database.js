#!/usr/bin/env node

/**
 * Script per popolare completamente il database
 * Sincronizza workflows, executions e calcola KPI
 */

import dotenv from 'dotenv';
dotenv.config();

import { SyncManager } from '../build/backend/sync-manager.js';
import { defaultSyncConfig, SyncType } from '../build/backend/sync-config.js';
import { repositories } from '../build/database/repositories/index.js';
import { PeriodType } from '../build/database/models/index.js';

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function syncWorkflows() {
  log('\n📊 FASE 1: Sincronizzazione Workflows...', 'cyan');
  
  try {
    const manager = new SyncManager(defaultSyncConfig);
    await manager.initialize();
    
    // Sync completo dei workflow
    const result = await manager.syncWorkflows(SyncType.FULL);
    
    log(`✅ Workflows sincronizzati:`, 'green');
    log(`   - Processati: ${result.stats.workflowsProcessed}`, 'blue');
    log(`   - Creati: ${result.stats.workflowsCreated}`, 'blue');
    log(`   - Aggiornati: ${result.stats.workflowsUpdated}`, 'blue');
    log(`   - Falliti: ${result.stats.workflowsFailed}`, result.stats.workflowsFailed > 0 ? 'red' : 'blue');
    
    return result.stats.workflowsProcessed;
  } catch (error) {
    log(`❌ Errore sync workflows: ${error.message}`, 'red');
    return 0;
  }
}

async function syncExecutions() {
  log('\n📊 FASE 2: Sincronizzazione Executions...', 'cyan');
  
  try {
    const manager = new SyncManager({
      ...defaultSyncConfig,
      limits: {
        ...defaultSyncConfig.limits,
        maxExecutionsPerSync: 200 // Aumentiamo il limite
      }
    });
    await manager.initialize();
    
    // Sync esecuzioni ultime 7 giorni
    const result = await manager.syncExecutions(SyncType.FULL);
    
    log(`✅ Esecuzioni sincronizzate:`, 'green');
    log(`   - Processate: ${result.stats.executionsProcessed}`, 'blue');
    log(`   - Create: ${result.stats.executionsCreated}`, 'blue');
    log(`   - Aggiornate: ${result.stats.executionsUpdated}`, 'blue');
    log(`   - Fallite: ${result.stats.executionsFailed}`, result.stats.executionsFailed > 0 ? 'red' : 'blue');
    
    return result.stats.executionsProcessed;
  } catch (error) {
    log(`⚠️ Avviso sync executions: ${error.message}`, 'yellow');
    // Non è fatale se non ci sono esecuzioni
    return 0;
  }
}

async function calculateMetrics() {
  log('\n📊 FASE 3: Calcolo Metriche e Scores...', 'cyan');
  
  try {
    // Ottieni tutti i workflow
    const workflows = await repositories.workflows.findAll();
    
    for (const workflow of workflows) {
      // Calcola statistiche dalle esecuzioni
      const stats = await repositories.executions.getStats(workflow.id, 30);
      
      // Aggiorna metriche
      await repositories.workflows.updateMetrics(workflow.id, {
        execution_count: stats.totalExecutions,
        success_count: stats.successfulExecutions,
        failure_count: stats.failedExecutions,
        avg_duration_ms: stats.avgDurationMs,
        last_execution_at: stats.totalExecutions > 0 ? new Date() : undefined
      });
      
      // Calcola scores
      const reliabilityScore = Math.round(stats.successRate);
      const efficiencyScore = calculateEfficiencyScore(stats.avgDurationMs);
      const complexityScore = workflow.complexity_score || 50;
      const healthScore = Math.round((reliabilityScore + efficiencyScore + (100 - complexityScore)) / 3);
      
      await repositories.workflows.updateScores(workflow.id, {
        reliability_score: reliabilityScore,
        efficiency_score: efficiencyScore,
        health_score: healthScore
      });
    }
    
    log(`✅ Metriche calcolate per ${workflows.length} workflows`, 'green');
    return workflows.length;
  } catch (error) {
    log(`❌ Errore calcolo metriche: ${error.message}`, 'red');
    return 0;
  }
}

async function createKpiSnapshots() {
  log('\n📊 FASE 4: Creazione KPI Snapshots...', 'cyan');
  
  try {
    const workflows = await repositories.workflows.findAll();
    let snapshotsCreated = 0;
    
    // Crea snapshot globale
    const globalStats = await repositories.executions.getStats(undefined, 30);
    const globalSnapshot = await repositories.analytics.createSnapshot(
      null, // null = globale
      PeriodType.DAILY,
      {
        snapshot_date: new Date(),
        total_executions: globalStats.totalExecutions,
        successful_executions: globalStats.successfulExecutions,
        failed_executions: globalStats.failedExecutions,
        success_rate: globalStats.successRate,
        avg_duration_ms: globalStats.avgDurationMs,
        error_rate: globalStats.errorRate
      }
    );
    snapshotsCreated++;
    
    // Crea snapshot per ogni workflow attivo
    for (const workflow of workflows.filter(w => w.active)) {
      const workflowStats = await repositories.executions.getStats(workflow.id, 30);
      
      if (workflowStats.totalExecutions > 0) {
        await repositories.analytics.createSnapshot(
          workflow.id,
          PeriodType.DAILY,
          {
            snapshot_date: new Date(),
            total_executions: workflowStats.totalExecutions,
            successful_executions: workflowStats.successfulExecutions,
            failed_executions: workflowStats.failedExecutions,
            success_rate: workflowStats.successRate,
            avg_duration_ms: workflowStats.avgDurationMs,
            error_rate: workflowStats.errorRate,
            avg_complexity_score: workflow.complexity_score,
            avg_reliability_score: workflow.reliability_score,
            avg_efficiency_score: workflow.efficiency_score
          }
        );
        snapshotsCreated++;
      }
    }
    
    log(`✅ ${snapshotsCreated} KPI snapshots creati`, 'green');
    return snapshotsCreated;
  } catch (error) {
    log(`❌ Errore creazione KPI: ${error.message}`, 'red');
    return 0;
  }
}

async function createHourlyStats() {
  log('\n📊 FASE 5: Creazione Statistiche Orarie...', 'cyan');
  
  try {
    // Simula statistiche orarie per oggi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let statsCreated = 0;
    
    // Crea stats per le ultime 24 ore
    for (let hour = 0; hour < 24; hour++) {
      // Stats globali
      await repositories.analytics.saveHourlyStats({
        workflow_id: null,
        stat_date: today,
        stat_hour: hour,
        execution_count: Math.floor(Math.random() * 20),
        success_count: Math.floor(Math.random() * 18),
        failure_count: Math.floor(Math.random() * 2),
        avg_duration_ms: 1000 + Math.random() * 4000,
        min_duration_ms: 500 + Math.random() * 500,
        max_duration_ms: 5000 + Math.random() * 5000,
        concurrent_executions_max: Math.floor(Math.random() * 5)
      });
      statsCreated++;
    }
    
    log(`✅ ${statsCreated} statistiche orarie create`, 'green');
    return statsCreated;
  } catch (error) {
    log(`⚠️ Avviso statistiche orarie: ${error.message}`, 'yellow');
    return 0;
  }
}

async function createErrorLogs() {
  log('\n📊 FASE 6: Creazione Error Logs di esempio...', 'cyan');
  
  try {
    // Trova esecuzioni fallite
    const failedExecutions = await repositories.executions.findRecentFailures(24, 10);
    let errorsLogged = 0;
    
    for (const execution of failedExecutions) {
      await repositories.executions.logError({
        workflow_id: execution.workflow_id,
        execution_id: execution.id,
        error_type: 'ExecutionError',
        error_message: execution.error_message || 'Unknown error',
        error_stack: execution.error_stack,
        severity: 'medium',
        context: { mode: execution.mode, duration: execution.duration_ms }
      });
      errorsLogged++;
    }
    
    log(`✅ ${errorsLogged} error logs creati`, 'green');
    return errorsLogged;
  } catch (error) {
    log(`⚠️ Avviso error logs: ${error.message}`, 'yellow');
    return 0;
  }
}

async function showDatabaseStats() {
  log('\n📊 RIEPILOGO DATABASE:', 'magenta');
  
  try {
    const stats = await repositories.getRepositoryStats();
    
    log(`\n📁 Workflows:`, 'cyan');
    log(`   - Totali: ${stats.workflows.total}`, 'blue');
    log(`   - Attivi: ${stats.workflows.active}`, 'green');
    
    log(`\n⚡ Executions:`, 'cyan');
    log(`   - Totali: ${stats.executions.total}`, 'blue');
    log(`   - In corso: ${stats.executions.running}`, 'yellow');
    log(`   - Ultime 24h: ${stats.executions.last24h}`, 'green');
    
    log(`\n📈 KPI Snapshots:`, 'cyan');
    log(`   - Totali: ${stats.kpiSnapshots.total}`, 'blue');
    if (stats.kpiSnapshots.lastSnapshot) {
      log(`   - Ultimo: ${stats.kpiSnapshots.lastSnapshot.toLocaleString()}`, 'green');
    }
    
    // Query aggiuntive per più dettagli
    const errorCount = await repositories.executions.getUnresolvedErrors().then(e => e.length);
    const workflowHealth = await repositories.workflows.getWorkflowHealth();
    const healthyWorkflows = workflowHealth.filter(w => w.health_status === 'healthy').length;
    const warningWorkflows = workflowHealth.filter(w => w.health_status === 'warning').length;
    const criticalWorkflows = workflowHealth.filter(w => w.health_status === 'critical').length;
    
    log(`\n🏥 Health Status:`, 'cyan');
    log(`   - Healthy: ${healthyWorkflows}`, 'green');
    log(`   - Warning: ${warningWorkflows}`, 'yellow');
    log(`   - Critical: ${criticalWorkflows}`, 'red');
    log(`   - Errori non risolti: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
  } catch (error) {
    log(`❌ Errore statistiche: ${error.message}`, 'red');
  }
}

function calculateEfficiencyScore(avgDurationMs) {
  if (avgDurationMs < 1000) return 100;
  if (avgDurationMs < 5000) return 80;
  if (avgDurationMs < 10000) return 60;
  if (avgDurationMs < 30000) return 40;
  return 20;
}

async function main() {
  log('================================================', 'magenta');
  log('     POPOLAMENTO COMPLETO DATABASE N8N MCP     ', 'magenta');
  log('================================================', 'magenta');
  
  const startTime = Date.now();
  
  // Esegui tutte le fasi
  const workflowCount = await syncWorkflows();
  const executionCount = await syncExecutions();
  const metricsCount = await calculateMetrics();
  const snapshotCount = await createKpiSnapshots();
  const hourlyCount = await createHourlyStats();
  const errorCount = await createErrorLogs();
  
  // Mostra statistiche finali
  await showDatabaseStats();
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  log('\n================================================', 'magenta');
  log('              POPOLAMENTO COMPLETATO            ', 'magenta');
  log('================================================', 'magenta');
  log(`⏱️  Tempo totale: ${duration} secondi`, 'cyan');
  log(`✅ Database popolato con successo!`, 'green');
  
  process.exit(0);
}

// Gestione errori
process.on('unhandledRejection', (error) => {
  log(`\n❌ Errore non gestito: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Esegui
main().catch(error => {
  log(`\n❌ Errore fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});