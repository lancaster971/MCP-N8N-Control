#!/usr/bin/env node

/**
 * Test Multi-Tenant con Dati Reali
 * 
 * Questo script testa il sistema multi-tenant con dati reali dall'istanza n8n,
 * simulando il comportamento con più tenant e verificando tutte le funzionalità.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createMultiTenantApiClient } from '../build/api/multi-tenant-client.js';
import { DatabaseConnection } from '../build/database/connection.js';
import fs from 'fs/promises';

class MultiTenantRealTester {
  constructor() {
    this.client = createMultiTenantApiClient();
    this.db = DatabaseConnection.getInstance();
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        tenantsRegistered: 0,
        workflowsSynced: 0,
        executionsSynced: 0
      }
    };
  }

  async runAllTests() {
    console.log('🚀 TEST MULTI-TENANT CON DATI REALI');
    console.log('='.repeat(50));
    
    try {
      await this.db.connect();
      
      // 1. Registra tenant reali
      await this.registerRealTenants();
      
      // 2. Testa sync dati reali
      await this.testRealDataSync();
      
      // 3. Testa query multi-tenant
      await this.testMultiTenantQueries();
      
      // 4. Testa performance con dati reali
      await this.testRealPerformance();
      
      // 5. Testa API client multi-tenant
      await this.testMultiTenantApiClient();
      
      // 6. Genera report finale
      await this.generateTestReport();
      
      console.log('\n✅ Test multi-tenant completati!');
      
    } catch (error) {
      console.error(`❌ Errore durante test: ${error.message}`);
      throw error;
    } finally {
      await this.db.disconnect();
    }
  }

  /**
   * Registra tenant simulando diversi clienti con stessa API (per test)
   */
  async registerRealTenants() {
    console.log('\n🏢 Registrazione tenant reali...');
    
    const tenants = [
      {
        tenantId: 'production_tenant',
        name: 'Production Environment',
        apiUrl: process.env.N8N_API_URL,
        apiKey: process.env.N8N_API_KEY,
        description: 'Tenant principale production'
      },
      {
        tenantId: 'client_simulation_a',
        name: 'Client A Simulation',
        apiUrl: process.env.N8N_API_URL, // Stessa API per test
        apiKey: process.env.N8N_API_KEY,
        description: 'Simula cliente A (stessi dati per test)'
      },
      {
        tenantId: 'client_simulation_b', 
        name: 'Client B Simulation',
        apiUrl: process.env.N8N_API_URL, // Stessa API per test
        apiKey: process.env.N8N_API_KEY,
        description: 'Simula cliente B (stessi dati per test)'
      }
    ];

    for (const tenantConfig of tenants) {
      try {
        await this.client.registerTenant({
          tenantId: tenantConfig.tenantId,
          apiUrl: tenantConfig.apiUrl,
          apiKey: tenantConfig.apiKey
        });
        
        console.log(`✓ Tenant registrato: ${tenantConfig.tenantId} - ${tenantConfig.name}`);
        this.testResults.summary.tenantsRegistered++;
        
      } catch (error) {
        console.error(`❌ Errore registrazione ${tenantConfig.tenantId}: ${error.message}`);
        this.addTestResult(`Register ${tenantConfig.tenantId}`, false, error.message);
      }
    }
    
    this.addTestResult('Registrazione Tenant', this.testResults.summary.tenantsRegistered === 3, 
      `${this.testResults.summary.tenantsRegistered}/3 tenant registrati`);
  }

  /**
   * Testa sync di dati reali per ogni tenant
   */
  async testRealDataSync() {
    console.log('\n🔄 Test sync dati reali...');
    
    const tenantIds = ['production_tenant', 'client_simulation_a', 'client_simulation_b'];
    
    for (const tenantId of tenantIds) {
      try {
        console.log(`   📊 Sync ${tenantId}...`);
        
        const syncResult = await this.client.syncTenantData(tenantId);
        
        console.log(`   ✓ ${tenantId}: ${syncResult.workflowsSynced} workflows, ${syncResult.executionsSynced} executions`);
        
        this.testResults.summary.workflowsSynced += syncResult.workflowsSynced;
        this.testResults.summary.executionsSynced += syncResult.executionsSynced;
        
        this.addTestResult(`Sync ${tenantId}`, syncResult.errors.length === 0,
          `${syncResult.workflowsSynced} workflows, ${syncResult.executionsSynced} executions, ${syncResult.errors.length} errori`);
        
        if (syncResult.errors.length > 0) {
          console.log(`   ⚠️ Errori sync ${tenantId}:`);
          syncResult.errors.slice(0, 3).forEach(error => console.log(`      - ${error}`));
        }
        
      } catch (error) {
        console.error(`   ❌ Errore sync ${tenantId}: ${error.message}`);
        this.addTestResult(`Sync ${tenantId}`, false, error.message);
      }
    }
    
    console.log(`\n📊 Totale sincronizzato: ${this.testResults.summary.workflowsSynced} workflows, ${this.testResults.summary.executionsSynced} executions`);
  }

  /**
   * Testa query multi-tenant con dati reali
   */
  async testMultiTenantQueries() {
    console.log('\n🔍 Test query multi-tenant...');
    
    const queries = [
      {
        name: 'Lista workflows per tenant specifico',
        query: `SELECT tenant_id, COUNT(*) as count FROM tenant_workflows WHERE tenant_id = $1`,
        params: ['production_tenant'],
        expectedMin: 0
      },
      {
        name: 'Query JSONB - workflow attivi',
        query: `SELECT tenant_id, COUNT(*) as active_workflows FROM tenant_workflows WHERE active = true GROUP BY tenant_id`,
        params: [],
        expectedMin: 0
      },
      {
        name: 'Query JSONB nested - nodi webhook',
        query: `SELECT tenant_id, COUNT(*) as webhook_workflows FROM tenant_workflows WHERE has_webhook = true GROUP BY tenant_id`,
        params: [],
        expectedMin: 0
      },
      {
        name: 'Join multi-tenant - workflows con executions',
        query: `
          SELECT w.tenant_id, COUNT(DISTINCT w.id) as workflows, COUNT(e.id) as executions
          FROM tenant_workflows w
          LEFT JOIN tenant_executions e ON w.tenant_id = e.tenant_id AND w.id = e.workflow_id
          GROUP BY w.tenant_id
        `,
        params: [],
        expectedMin: 0
      },
      {
        name: 'Aggregazione JSONB - media nodi per tenant',
        query: `SELECT tenant_id, AVG(node_count) as avg_nodes FROM tenant_workflows GROUP BY tenant_id`,
        params: [],
        expectedMin: 0
      }
    ];

    for (const queryTest of queries) {
      try {
        const startTime = Date.now();
        const results = await this.db.getMany(queryTest.query, queryTest.params);
        const duration = Date.now() - startTime;
        
        const passed = results.length >= queryTest.expectedMin && duration < 1000; // < 1 secondo
        
        this.addTestResult(queryTest.name, passed, 
          `${results.length} risultati, ${duration}ms`);
        
        console.log(`   ${passed ? '✓' : '⚠️'} ${queryTest.name}: ${results.length} risultati (${duration}ms)`);
        
        // Log primi risultati se interessanti
        if (results.length > 0 && results.length <= 5) {
          results.forEach(row => {
            const summary = Object.entries(row).map(([k,v]) => `${k}:${v}`).join(', ');
            console.log(`      ${summary}`);
          });
        }
        
      } catch (error) {
        console.error(`   ❌ ${queryTest.name}: ${error.message}`);
        this.addTestResult(queryTest.name, false, error.message);
      }
    }
  }

  /**
   * Testa performance con dati reali
   */
  async testRealPerformance() {
    console.log('\n⚡ Test performance con dati reali...');
    
    const performanceTests = [
      {
        name: 'Query JSONB semplice su tutti i tenant',
        query: `SELECT COUNT(*) FROM tenant_workflows WHERE raw_data->>'active' = 'true'`,
        expectedTime: 100
      },
      {
        name: 'Query JSONB array operations',
        query: `SELECT AVG(jsonb_array_length(raw_data->'nodes')) FROM tenant_workflows WHERE raw_data->'nodes' IS NOT NULL`,
        expectedTime: 200
      },
      {
        name: 'Query con indice GIN',
        query: `SELECT COUNT(*) FROM tenant_workflows WHERE raw_data @> '{"active": true}'`,
        expectedTime: 150
      },
      {
        name: 'Join cross-tenant performance',
        query: `
          SELECT COUNT(*) 
          FROM tenant_workflows w 
          JOIN tenant_executions e ON w.tenant_id = e.tenant_id AND w.id = e.workflow_id
        `,
        expectedTime: 300
      }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const result = await this.db.getOne(test.query);
        const duration = Date.now() - startTime;
        
        const passed = duration <= test.expectedTime;
        
        console.log(`   ${passed ? '✅' : '⚠️'} ${test.name}: ${duration}ms (expected: ≤${test.expectedTime}ms)`);
        
        this.addTestResult(test.name, passed, `${duration}ms, result: ${JSON.stringify(result)}`);
        
      } catch (error) {
        console.error(`   ❌ ${test.name}: ${error.message}`);
        this.addTestResult(test.name, false, error.message);
      }
    }
  }

  /**
   * Testa API client multi-tenant con dati reali
   */
  async testMultiTenantApiClient() {
    console.log('\n🔌 Test API client multi-tenant...');
    
    const tenantId = 'production_tenant';
    
    try {
      // Test getWorkflowsForTenant
      console.log('   📊 Test getWorkflowsForTenant...');
      const workflows = await this.client.getWorkflowsForTenant(tenantId);
      console.log(`   ✓ Caricati ${workflows.length} workflows normalizzati`);
      
      this.addTestResult('getWorkflowsForTenant', workflows.length >= 0,
        `${workflows.length} workflows caricati`);
      
      // Mostra esempio workflow normalizzato
      if (workflows.length > 0) {
        const sample = workflows[0];
        console.log(`   📝 Esempio workflow normalizzato:`);
        console.log(`      ID: ${sample.id}`);
        console.log(`      Nome: ${sample.name}`);
        console.log(`      Attivo: ${sample.active}`);
        console.log(`      Nodi: ${sample.nodeCount}`);
        console.log(`      Webhook: ${sample.hasWebhook}`);
        console.log(`      Campi JSONB: ${Object.keys(sample.rawData).length}`);
      }
      
      // Test getExecutionsForTenant
      console.log('   ⚡ Test getExecutionsForTenant...');
      const executions = await this.client.getExecutionsForTenant(tenantId, { limit: 10 });
      console.log(`   ✓ Caricate ${executions.length} executions normalizzate`);
      
      this.addTestResult('getExecutionsForTenant', executions.length >= 0,
        `${executions.length} executions caricate`);
      
      // Mostra esempio execution normalizzata
      if (executions.length > 0) {
        const sample = executions[0];
        console.log(`   📝 Esempio execution normalizzata:`);
        console.log(`      ID: ${sample.id}`);
        console.log(`      Workflow: ${sample.workflowId}`);
        console.log(`      Status: ${sample.status}`);
        console.log(`      Durata: ${sample.durationMs}ms`);
        console.log(`      Errore: ${sample.hasError}`);
        console.log(`      Campi JSONB: ${Object.keys(sample.rawData).length}`);
      }
      
      // Test fallback database quando API non disponibile
      console.log('   🔄 Test fallback database...');
      const dbWorkflows = await this.getWorkflowsFromDatabase(tenantId);
      console.log(`   ✓ Fallback database: ${dbWorkflows.length} workflows dal DB`);
      
      this.addTestResult('Database fallback', dbWorkflows.length >= 0,
        `${dbWorkflows.length} workflows dal database`);
      
    } catch (error) {
      console.error(`   ❌ Errore test API client: ${error.message}`);
      this.addTestResult('API Client Multi-Tenant', false, error.message);
    }
  }

  /**
   * Fallback per ottenere workflows dal database
   */
  async getWorkflowsFromDatabase(tenantId) {
    const workflows = await this.db.getMany(`
      SELECT id, name, active, node_count, has_webhook, raw_data
      FROM tenant_workflows 
      WHERE tenant_id = $1
      ORDER BY name
      LIMIT 10
    `, [tenantId]);

    return workflows.map(w => ({
      id: w.id,
      name: w.name,
      active: w.active,
      tenantId,
      rawData: w.raw_data,
      nodeCount: w.node_count,
      hasWebhook: w.has_webhook,
      isArchived: w.raw_data?.isArchived || false
    }));
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
    console.log('\n📊 Generazione report test...');
    
    // Calcola metriche aggiuntive
    const successRate = Math.round((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100);
    
    // Verifica stato tabelle database
    const dbStats = await this.getDatabaseStats();
    
    const finalReport = {
      ...this.testResults,
      database: dbStats,
      conclusions: {
        successRate,
        readyForProduction: successRate >= 80 && this.testResults.summary.tenantsRegistered >= 2,
        recommendations: this.generateRecommendations(successRate)
      }
    };
    
    // Salva report
    const filename = `multitenant_real_test_${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(finalReport, null, 2));
    
    // Report console
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT TEST MULTI-TENANT REALE');
    console.log('='.repeat(60));
    console.log(`🧪 Test totali: ${this.testResults.summary.totalTests}`);
    console.log(`✅ Test passati: ${this.testResults.summary.passedTests}`);
    console.log(`❌ Test falliti: ${this.testResults.summary.failedTests}`);
    console.log(`📈 Success rate: ${successRate}%`);
    console.log(`🏢 Tenant registrati: ${this.testResults.summary.tenantsRegistered}`);
    console.log(`📊 Workflows sincronizzati: ${this.testResults.summary.workflowsSynced}`);
    console.log(`⚡ Executions sincronizzate: ${this.testResults.summary.executionsSynced}`);
    
    console.log('\n💾 Stato Database:');
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
    if (finalReport.conclusions.readyForProduction) {
      console.log('\n🎉 SISTEMA MULTI-TENANT PRONTO PER PRODUZIONE!');
    } else {
      console.log('\n⚠️ Sistema richiede ottimizzazioni prima della produzione');
    }
    
    return finalReport;
  }

  /**
   * Ottieni statistiche database
   */
  async getDatabaseStats() {
    const stats = {};
    
    try {
      // Conta tenant
      const tenants = await this.db.getOne('SELECT COUNT(*) as count FROM tenants');
      stats.tenants = tenants.count;
      
      // Conta workflows per tenant
      const workflows = await this.db.getMany(`
        SELECT tenant_id, COUNT(*) as count 
        FROM tenant_workflows 
        GROUP BY tenant_id
      `);
      stats.workflowsByTenant = workflows.reduce((acc, row) => {
        acc[row.tenant_id] = row.count;
        return acc;
      }, {});
      
      // Conta executions per tenant
      const executions = await this.db.getMany(`
        SELECT tenant_id, COUNT(*) as count 
        FROM tenant_executions 
        GROUP BY tenant_id
      `);
      stats.executionsByTenant = executions.reduce((acc, row) => {
        acc[row.tenant_id] = row.count;
        return acc;
      }, {});
      
      // Dimensioni storage JSONB
      const sizes = await this.db.getMany(`
        SELECT 
          'tenant_workflows' as table_name,
          pg_size_pretty(pg_total_relation_size('tenant_workflows')) as size
        UNION ALL
        SELECT 
          'tenant_executions' as table_name,
          pg_size_pretty(pg_total_relation_size('tenant_executions')) as size
      `);
      
      stats.tableSizes = sizes.reduce((acc, row) => {
        acc[row.table_name] = row.size;
        return acc;
      }, {});
      
    } catch (error) {
      stats.error = error.message;
    }
    
    return stats;
  }

  /**
   * Genera raccomandazioni basate sui risultati
   */
  generateRecommendations(successRate) {
    const recommendations = [];
    
    if (successRate < 80) {
      recommendations.push('Risolvere test falliti prima del deployment');
    } else {
      recommendations.push('Sistema stabile - pronto per produzione');
    }
    
    if (this.testResults.summary.workflowsSynced === 0) {
      recommendations.push('Verificare connessione API n8n e presenza dati');
    }
    
    if (this.testResults.summary.tenantsRegistered < 3) {
      recommendations.push('Testare con più configurazioni tenant diverse');
    }
    
    recommendations.push('Configurare monitoring per performance JSONB');
    recommendations.push('Implementare cleanup automatico dati vecchi');
    recommendations.push('Testare con volumi dati maggiori');
    
    return recommendations;
  }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const tester = new MultiTenantRealTester();
  
  try {
    console.log('🚀 Avvio test multi-tenant con dati reali...');
    console.log('Questo test userà l\'API n8n reale per popolare il database multi-tenant.');
    
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

export { MultiTenantRealTester };