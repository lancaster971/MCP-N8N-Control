#!/usr/bin/env node

/**
 * Test Performance JSONB Multi-Tenant
 * 
 * Questo script testa le performance del nuovo schema multi-tenant
 * simulando query su grandi volumi di dati JSONB per verificare
 * che sia adatto a 1000+ clienti.
 */

import dotenv from 'dotenv';
dotenv.config();

import { DatabaseConnection } from '../build/database/connection.js';
import fs from 'fs/promises';

class JsonbPerformanceTester {
  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        avgQueryTime: 0,
        recommendations: []
      }
    };
  }

  async runAllTests() {
    console.log('🚀 TEST PERFORMANCE JSONB MULTI-TENANT');
    console.log('='.repeat(50));
    
    try {
      await this.db.connect();
      
      // 1. Setup dati di test
      await this.setupTestData();
      
      // 2. Test query JSONB base
      await this.testBasicJsonbQueries();
      
      // 3. Test query su array JSONB
      await this.testJsonbArrayQueries();
      
      // 4. Test query con indici GIN
      await this.testGinIndexPerformance();
      
      // 5. Test query multi-tenant isolation
      await this.testMultiTenantIsolation();
      
      // 6. Test aggregazioni su JSONB
      await this.testJsonbAggregations();
      
      // 7. Test inserimenti batch JSONB
      await this.testJsonbBatchInserts();
      
      // 8. Test storage size JSONB
      await this.testJsonbStorageSize();
      
      // 9. Genera report finale
      await this.generatePerformanceReport();
      
      console.log('\n✅ Test performance completati!');
      
    } catch (error) {
      console.error(`❌ Errore durante test: ${error.message}`);
    } finally {
      await this.db.disconnect();
    }
  }

  /**
   * Setup dati di test simulando diversi tenant e scenari
   */
  async setupTestData() {
    console.log('\n📊 Setup dati di test...');
    
    // Crea tenant di test
    const testTenants = [
      { id: 'tenant_small', name: 'Small Company (10 workflows)', type: 'small' },
      { id: 'tenant_medium', name: 'Medium Company (100 workflows)', type: 'medium' },
      { id: 'tenant_large', name: 'Large Enterprise (1000 workflows)', type: 'large' }
    ];

    for (const tenant of testTenants) {
      await this.db.query(`
        INSERT INTO tenants (id, name, n8n_api_url, instance_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [tenant.id, tenant.name, 'http://test.local/api/v1', tenant.type]);
    }

    // Genera workflows di test con JSONB realistici
    await this.generateTestWorkflows('tenant_small', 10);
    await this.generateTestWorkflows('tenant_medium', 100);
    await this.generateTestWorkflows('tenant_large', 1000);

    // Genera executions di test
    await this.generateTestExecutions('tenant_small', 100);
    await this.generateTestExecutions('tenant_medium', 1000);
    await this.generateTestExecutions('tenant_large', 10000);

    console.log('✓ Dati di test creati');
  }

  /**
   * Genera workflows di test con JSONB realistici
   */
  async generateTestWorkflows(tenantId, count) {
    console.log(`   📝 Generando ${count} workflows per ${tenantId}...`);
    
    const workflows = [];
    for (let i = 1; i <= count; i++) {
      const workflow = {
        id: `wf_${tenantId}_${i.toString().padStart(4, '0')}`,
        tenant_id: tenantId,
        name: `Test Workflow ${i}`,
        active: Math.random() > 0.3, // 70% attivi
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        raw_data: this.generateRealisticWorkflowJsonb(i, tenantId)
      };
      
      workflows.push(workflow);

      // Batch insert ogni 100 record
      if (workflows.length >= 100 || i === count) {
        await this.insertWorkflowBatch(workflows);
        workflows.length = 0;
      }
    }
  }

  /**
   * Genera executions di test
   */
  async generateTestExecutions(tenantId, count) {
    console.log(`   ⚡ Generando ${count} executions per ${tenantId}...`);
    
    // Ottieni workflow IDs per questo tenant
    const workflows = await this.db.getMany(`
      SELECT id FROM tenant_workflows WHERE tenant_id = $1 LIMIT 50
    `, [tenantId]);

    if (workflows.length === 0) return;

    const executions = [];
    for (let i = 1; i <= count; i++) {
      const randomWorkflow = workflows[Math.floor(Math.random() * workflows.length)];
      const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.random() * 60000; // 0-60 secondi
      const stoppedAt = new Date(startedAt.getTime() + duration);
      
      const execution = {
        id: `exec_${tenantId}_${i.toString().padStart(6, '0')}`,
        tenant_id: tenantId,
        workflow_id: randomWorkflow.id,
        started_at: startedAt,
        status: this.getRandomExecutionStatus(),
        mode: this.getRandomExecutionMode(),
        raw_data: this.generateRealisticExecutionJsonb(duration, startedAt, stoppedAt)
      };
      
      executions.push(execution);

      // Batch insert ogni 200 record
      if (executions.length >= 200 || i === count) {
        await this.insertExecutionBatch(executions);
        executions.length = 0;
      }
    }
  }

  /**
   * Genera JSONB realistico per workflow
   */
  generateRealisticWorkflowJsonb(index, tenantId) {
    const nodeCount = Math.floor(Math.random() * 15) + 3; // 3-18 nodi
    const nodes = [];
    const connections = {};
    
    // Genera nodi realistici
    for (let i = 0; i < nodeCount; i++) {
      const nodeTypes = [
        'n8n-nodes-base.webhook',
        'n8n-nodes-base.httpRequest', 
        'n8n-nodes-base.code',
        'n8n-nodes-base.set',
        'n8n-nodes-base.if',
        'n8n-nodes-base.gmail',
        'n8n-nodes-base.googleSheets',
        'n8n-nodes-base.slack',
        'n8n-nodes-base.postgresql'
      ];
      
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      const nodeId = `node_${i}`;
      
      nodes.push({
        id: nodeId,
        name: `Node ${i + 1}`,
        type: nodeType,
        typeVersion: 1,
        position: [Math.random() * 2000, Math.random() * 1000],
        parameters: this.generateNodeParameters(nodeType),
        credentials: nodeType.includes('gmail') || nodeType.includes('slack') ? {
          [nodeType]: { id: `cred_${index}_${i}`, name: `Credential ${i}` }
        } : {},
        disabled: Math.random() > 0.95, // 5% disabilitati
        notes: Math.random() > 0.7 ? `Note for node ${i + 1}` : '',
        continueOnFail: Math.random() > 0.8,
        executeOnce: Math.random() > 0.9
      });

      // Genera connessioni
      if (i > 0) {
        const prevNodeId = `node_${i - 1}`;
        connections[prevNodeId] = {
          main: [[{ node: nodeId, type: 'main', index: 0 }]]
        };
      }
    }

    return {
      // Campi API standard
      description: `Test workflow ${index} for ${tenantId}`,
      isArchived: Math.random() > 0.9,
      nodes: nodes,
      connections: connections,
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner'
      },
      staticData: Math.random() > 0.5 ? {
        counter: Math.floor(Math.random() * 100),
        lastRun: new Date().toISOString()
      } : null,
      meta: {
        templateCredsSetupCompleted: true,
        instanceId: `instance_${tenantId}`,
        tags: Math.random() > 0.5 ? ['production', 'automated'] : []
      },
      pinData: Math.random() > 0.8 ? {
        [nodes[0]?.id]: [{ test: 'data' }]
      } : {},
      versionId: `v${Math.floor(Math.random() * 10) + 1}`,
      triggerCount: nodes.filter(n => n.type.includes('webhook')).length,
      shared: [{
        role: 'workflow:owner',
        workflowId: `wf_${tenantId}_${index.toString().padStart(4, '0')}`,
        projectId: `proj_${tenantId}`,
        project: {
          name: `${tenantId} Project`,
          type: 'personal'
        }
      }],
      // Campi custom per simulare diverse versioni n8n
      customFields: {
        [`field_${tenantId}`]: `value_${index}`,
        complexObject: {
          nested: {
            deeply: {
              level: index,
              data: Array.from({length: 5}, (_, i) => ({ index: i, value: Math.random() }))
            }
          }
        },
        arrayField: Array.from({length: Math.floor(Math.random() * 10) + 1}, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          metadata: { created: new Date().toISOString(), type: 'test' }
        }))
      }
    };
  }

  /**
   * Genera parametri nodo realistici
   */
  generateNodeParameters(nodeType) {
    const baseParams = {
      'n8n-nodes-base.webhook': {
        httpMethod: 'POST',
        path: `webhook_${Math.random().toString(36).substr(2, 9)}`,
        responseMode: 'onReceived'
      },
      'n8n-nodes-base.httpRequest': {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      'n8n-nodes-base.code': {
        language: 'javascript',
        code: `// Generated code\nreturn [{ test: ${Math.floor(Math.random() * 1000)} }];`
      }
    };
    
    return baseParams[nodeType] || {};
  }

  /**
   * Genera JSONB realistico per execution
   */
  generateRealisticExecutionJsonb(duration, startedAt, stoppedAt) {
    const nodeCount = Math.floor(Math.random() * 10) + 2;
    const runData = {};
    
    // Simula dati di esecuzione per ogni nodo
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node_${i}`;
      runData[nodeId] = [{
        startTime: startedAt.getTime() + (i * 1000),
        executionTime: Math.floor(Math.random() * 2000) + 100,
        executionStatus: Math.random() > 0.05 ? 'success' : 'error',
        source: [],
        data: {
          main: [[{
            json: {
              id: Math.floor(Math.random() * 10000),
              timestamp: new Date().toISOString(),
              data: `Generated data for node ${i}`,
              metadata: {
                processed: true,
                duration: Math.floor(Math.random() * 1000),
                items: Array.from({length: Math.floor(Math.random() * 5) + 1}, (_, j) => ({
                  index: j,
                  value: Math.random() * 100,
                  text: `Item ${j} data`
                }))
              }
            }
          }]]
        }
      }];
    }

    return {
      // Campi API standard
      finished: true,
      mode: 'trigger',
      retryOf: null,
      retrySuccessId: null,
      startedAt: startedAt.toISOString(),
      stoppedAt: stoppedAt.toISOString(),
      waitTill: null,
      data: {
        startData: {},
        resultData: {
          runData: runData,
          lastNodeExecuted: `node_${nodeCount - 1}`
        },
        executionData: {
          contextData: {},
          nodeExecutionStack: [],
          metadata: {},
          waitingExecution: {},
          waitingExecutionSource: {}
        }
      },
      workflowData: {
        id: `wf_test_${Math.floor(Math.random() * 1000)}`,
        name: 'Test Workflow for Execution',
        active: true,
        nodes: Array.from({length: nodeCount}, (_, i) => ({
          id: `node_${i}`,
          name: `Node ${i + 1}`,
          type: 'n8n-nodes-base.set'
        }))
      },
      // Campi per simulare errori
      errorMessage: Math.random() > 0.95 ? 'Simulated error for testing' : null,
      errorNodeId: Math.random() > 0.95 ? `node_${Math.floor(Math.random() * nodeCount)}` : null,
      // Dati custom per simulare diverse configurazioni
      customExecutionData: {
        environment: ['dev', 'staging', 'production'][Math.floor(Math.random() * 3)],
        version: `v${Math.floor(Math.random() * 5) + 1}`,
        metrics: {
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 1024,
          networkCalls: Math.floor(Math.random() * 20)
        },
        largeArray: Array.from({length: Math.floor(Math.random() * 100) + 10}, (_, i) => ({
          id: i,
          processed: Math.random() > 0.1,
          data: `Large data set item ${i}`,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }))
      }
    };
  }

  getRandomExecutionStatus() {
    const statuses = ['success', 'success', 'success', 'success', 'error', 'running', 'waiting'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getRandomExecutionMode() {
    const modes = ['trigger', 'manual', 'webhook', 'retry'];
    return modes[Math.floor(Math.random() * modes.length)];
  }

  /**
   * Inserimento batch workflows
   */
  async insertWorkflowBatch(workflows) {
    if (workflows.length === 0) return;
    
    const values = workflows.map((w, i) => {
      const baseIndex = i * 6;
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`;
    }).join(', ');
    
    const params = workflows.flatMap(w => [
      w.id, w.tenant_id, w.name, w.active, w.created_at, JSON.stringify(w.raw_data)
    ]);
    
    await this.db.query(`
      INSERT INTO tenant_workflows (id, tenant_id, name, active, created_at, raw_data)
      VALUES ${values}
      ON CONFLICT (tenant_id, id) DO NOTHING
    `, params);
  }

  /**
   * Inserimento batch executions
   */
  async insertExecutionBatch(executions) {
    if (executions.length === 0) return;
    
    const values = executions.map((e, i) => {
      const baseIndex = i * 7;
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7})`;
    }).join(', ');
    
    const params = executions.flatMap(e => [
      e.id, e.tenant_id, e.workflow_id, e.started_at, e.status, e.mode, JSON.stringify(e.raw_data)
    ]);
    
    await this.db.query(`
      INSERT INTO tenant_executions (id, tenant_id, workflow_id, started_at, status, mode, raw_data)
      VALUES ${values}
      ON CONFLICT (tenant_id, id) DO NOTHING
    `, params);
  }

  // =====================================================
  // TEST PERFORMANCE SPECIFICI
  // =====================================================

  /**
   * Test query JSONB base
   */
  async testBasicJsonbQueries() {
    console.log('\n🔍 Test query JSONB base...');
    
    const tests = [
      {
        name: 'Select con campo JSONB semplice',
        query: `SELECT id, name, raw_data->>'description' as description FROM tenant_workflows WHERE tenant_id = 'tenant_medium' LIMIT 10`,
        expectedTime: 50
      },
      {
        name: 'WHERE su campo JSONB',
        query: `SELECT COUNT(*) FROM tenant_workflows WHERE tenant_id = 'tenant_medium' AND raw_data->>'isArchived' = 'false'`,
        expectedTime: 100
      },
      {
        name: 'WHERE su campo JSONB nested',
        query: `SELECT COUNT(*) FROM tenant_workflows WHERE tenant_id = 'tenant_medium' AND raw_data->'settings'->>'executionOrder' = 'v1'`,
        expectedTime: 150
      },
      {
        name: 'Ordinamento per campo JSONB',
        query: `SELECT id, name FROM tenant_workflows WHERE tenant_id = 'tenant_large' ORDER BY (raw_data->>'description') LIMIT 20`,
        expectedTime: 200
      }
    ];

    for (const test of tests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test query su array JSONB
   */
  async testJsonbArrayQueries() {
    console.log('\n📊 Test query array JSONB...');
    
    const tests = [
      {
        name: 'Conteggio elementi array JSONB',
        query: `SELECT AVG(jsonb_array_length(raw_data->'nodes')) as avg_nodes FROM tenant_workflows WHERE tenant_id = 'tenant_medium'`,
        expectedTime: 100
      },
      {
        name: 'Ricerca in array JSONB con @>',
        query: `SELECT COUNT(*) FROM tenant_workflows WHERE tenant_id = 'tenant_medium' AND raw_data->'nodes' @> '[{"type": "n8n-nodes-base.webhook"}]'`,
        expectedTime: 200
      },
      {
        name: 'Estrazione primo elemento array',
        query: `SELECT id, raw_data->'nodes'->0->>'name' as first_node FROM tenant_workflows WHERE tenant_id = 'tenant_small' LIMIT 5`,
        expectedTime: 50
      }
    ];

    for (const test of tests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test performance indici GIN
   */
  async testGinIndexPerformance() {
    console.log('\n⚡ Test performance indici GIN...');
    
    // Prima testa senza indice
    await this.db.query('DROP INDEX IF EXISTS test_gin_index');
    
    const testWithoutIndex = {
      name: 'Query JSONB senza indice GIN',
      query: `SELECT COUNT(*) FROM tenant_workflows WHERE raw_data @> '{"active": true}'`,
      expectedTime: 500
    };
    
    await this.runSingleTest(testWithoutIndex);
    
    // Crea indice GIN
    await this.db.query('CREATE INDEX test_gin_index ON tenant_workflows USING GIN (raw_data)');
    
    const testWithIndex = {
      name: 'Query JSONB con indice GIN',
      query: `SELECT COUNT(*) FROM tenant_workflows WHERE raw_data @> '{"active": true}'`,
      expectedTime: 100
    };
    
    await this.runSingleTest(testWithIndex);
    
    // Cleanup
    await this.db.query('DROP INDEX test_gin_index');
  }

  /**
   * Test isolamento multi-tenant
   */
  async testMultiTenantIsolation() {
    console.log('\n🏢 Test isolamento multi-tenant...');
    
    const tests = [
      {
        name: 'Query isolata per tenant specifico',
        query: `SELECT COUNT(*) FROM tenant_workflows WHERE tenant_id = 'tenant_medium'`,
        expectedTime: 50
      },
      {
        name: 'Join cross-tenant (workflows + executions)',
        query: `
          SELECT w.tenant_id, COUNT(e.id) as execution_count
          FROM tenant_workflows w
          LEFT JOIN tenant_executions e ON w.tenant_id = e.tenant_id AND w.id = e.workflow_id
          WHERE w.tenant_id IN ('tenant_small', 'tenant_medium')
          GROUP BY w.tenant_id
        `,
        expectedTime: 200
      },
      {
        name: 'Aggregazione per tutti i tenant',
        query: `
          SELECT tenant_id, COUNT(*) as workflow_count,
                 AVG(jsonb_array_length(raw_data->'nodes')) as avg_nodes
          FROM tenant_workflows 
          GROUP BY tenant_id
        `,
        expectedTime: 300
      }
    ];

    for (const test of tests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test aggregazioni su JSONB
   */
  async testJsonbAggregations() {
    console.log('\n📈 Test aggregazioni JSONB...');
    
    const tests = [
      {
        name: 'Aggregazione campi JSONB numerici',
        query: `
          SELECT tenant_id,
                 COUNT(*) as total_workflows,
                 AVG((raw_data->>'triggerCount')::int) as avg_triggers,
                 SUM((raw_data->>'triggerCount')::int) as total_triggers
          FROM tenant_workflows 
          WHERE raw_data->>'triggerCount' IS NOT NULL
          GROUP BY tenant_id
        `,
        expectedTime: 200
      },
      {
        name: 'Conteggio valori JSONB distinti',
        query: `
          SELECT COUNT(DISTINCT raw_data->'settings'->>'executionOrder') as execution_orders
          FROM tenant_workflows
        `,
        expectedTime: 150
      }
    ];

    for (const test of tests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test inserimenti batch JSONB
   */
  async testJsonbBatchInserts() {
    console.log('\n💾 Test inserimenti batch JSONB...');
    
    const batchSizes = [10, 50, 100, 500];
    
    for (const size of batchSizes) {
      const startTime = Date.now();
      
      // Genera batch di test
      const testWorkflows = [];
      for (let i = 0; i < size; i++) {
        testWorkflows.push({
          id: `test_batch_${size}_${i}`,
          tenant_id: 'tenant_test_batch',
          name: `Batch Test ${i}`,
          active: true,
          created_at: new Date(),
          raw_data: this.generateRealisticWorkflowJsonb(i, 'batch_test')
        });
      }
      
      await this.insertWorkflowBatch(testWorkflows);
      
      const duration = Date.now() - startTime;
      
      this.testResults.tests.push({
        name: `Batch insert ${size} workflows JSONB`,
        duration,
        passed: duration < (size * 10), // 10ms per record
        details: { batchSize: size, avgPerRecord: duration / size }
      });
      
      console.log(`   ✓ Batch ${size}: ${duration}ms (${(duration/size).toFixed(1)}ms/record)`);
      
      // Cleanup
      await this.db.query(`DELETE FROM tenant_workflows WHERE tenant_id = 'tenant_test_batch'`);
    }
  }

  /**
   * Test dimensioni storage JSONB
   */
  async testJsonbStorageSize() {
    console.log('\n💿 Test dimensioni storage JSONB...');
    
    const storageTests = [
      {
        name: 'Dimensione totale tabelle multi-tenant',
        query: `
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
            pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
          FROM pg_tables 
          WHERE schemaname = 'public' AND tablename LIKE 'tenant_%'
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        `
      },
      {
        name: 'Dimensione media record JSONB workflows',
        query: `
          SELECT 
            tenant_id,
            COUNT(*) as record_count,
            pg_size_pretty(SUM(octet_length(raw_data::text))) as total_jsonb_size,
            pg_size_pretty(AVG(octet_length(raw_data::text))::bigint) as avg_jsonb_size
          FROM tenant_workflows 
          GROUP BY tenant_id
        `
      }
    ];

    for (const test of storageTests) {
      console.log(`\n📊 ${test.name}:`);
      
      const startTime = Date.now();
      const results = await this.db.getMany(test.query);
      const duration = Date.now() - startTime;
      
      results.forEach(row => {
        console.log('  ', Object.entries(row).map(([k,v]) => `${k}: ${v}`).join(', '));
      });
      
      this.testResults.tests.push({
        name: test.name,
        duration,
        passed: duration < 1000,
        details: { resultCount: results.length }
      });
    }
  }

  /**
   * Esegue singolo test di performance
   */
  async runSingleTest(test) {
    const startTime = Date.now();
    
    try {
      const result = await this.db.getMany(test.query);
      const duration = Date.now() - startTime;
      const passed = duration <= test.expectedTime;
      
      this.testResults.tests.push({
        name: test.name,
        duration,
        expectedTime: test.expectedTime,
        passed,
        resultCount: Array.isArray(result) ? result.length : 1,
        details: { query: test.query }
      });
      
      const status = passed ? '✅' : '⚠️';
      console.log(`   ${status} ${test.name}: ${duration}ms (expected: ≤${test.expectedTime}ms)`);
      
      if (!passed) {
        console.log(`      Query: ${test.query.substring(0, 80)}...`);
      }
      
    } catch (error) {
      this.testResults.tests.push({
        name: test.name,
        duration: Date.now() - startTime,
        passed: false,
        error: error.message,
        details: { query: test.query }
      });
      
      console.log(`   ❌ ${test.name}: ERROR - ${error.message}`);
    }
  }

  /**
   * Genera report finale performance
   */
  async generatePerformanceReport() {
    console.log('\n📊 Generazione report performance...');
    
    // Calcola statistiche
    this.testResults.summary.totalTests = this.testResults.tests.length;
    this.testResults.summary.passedTests = this.testResults.tests.filter(t => t.passed).length;
    this.testResults.summary.failedTests = this.testResults.summary.totalTests - this.testResults.summary.passedTests;
    this.testResults.summary.avgQueryTime = Math.round(
      this.testResults.tests.reduce((sum, t) => sum + t.duration, 0) / this.testResults.summary.totalTests
    );
    
    // Genera raccomandazioni
    const slowTests = this.testResults.tests.filter(t => t.duration > 200);
    const failedTests = this.testResults.tests.filter(t => !t.passed);
    
    if (slowTests.length > 0) {
      this.testResults.summary.recommendations.push(
        `${slowTests.length} query slow (>200ms) - considerare ottimizzazione indici`
      );
    }
    
    if (failedTests.length > 0) {
      this.testResults.summary.recommendations.push(
        `${failedTests.length} test falliti - verificare configurazione database`
      );
    }
    
    if (this.testResults.summary.avgQueryTime > 100) {
      this.testResults.summary.recommendations.push(
        'Tempo medio query alto - ottimizzare indici JSONB'
      );
    } else {
      this.testResults.summary.recommendations.push(
        'Performance JSONB ottime per ambiente multi-tenant'
      );
    }
    
    // Salva report
    const filename = `jsonb_performance_report_${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(this.testResults, null, 2));
    
    // Report console
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT PERFORMANCE JSONB MULTI-TENANT');
    console.log('='.repeat(60));
    console.log(`🧪 Test eseguiti: ${this.testResults.summary.totalTests}`);
    console.log(`✅ Test passati: ${this.testResults.summary.passedTests}`);
    console.log(`❌ Test falliti: ${this.testResults.summary.failedTests}`);
    console.log(`⏱️ Tempo medio query: ${this.testResults.summary.avgQueryTime}ms`);
    console.log(`📈 Success rate: ${Math.round((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100)}%`);
    
    console.log('\n📋 Raccomandazioni:');
    this.testResults.summary.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
    
    console.log('\n🐌 Top 5 query più lente:');
    this.testResults.tests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.duration}ms`);
      });
    
    console.log(`\n💾 Report completo salvato in: ${filename}`);
    
    // Verifica finale
    const successRate = (this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100;
    if (successRate >= 80) {
      console.log('\n🎉 JSONB MULTI-TENANT PRONTO PER PRODUZIONE!');
    } else {
      console.log('\n⚠️ Ottimizzazioni necessarie prima della produzione');
    }
    
    return this.testResults;
  }

  /**
   * Cleanup dati di test
   */
  async cleanup() {
    console.log('\n🧹 Cleanup dati di test...');
    
    const testTenants = ['tenant_small', 'tenant_medium', 'tenant_large', 'tenant_test_batch'];
    
    for (const tenantId of testTenants) {
      await this.db.query('DELETE FROM tenant_executions WHERE tenant_id = $1', [tenantId]);
      await this.db.query('DELETE FROM tenant_workflows WHERE tenant_id = $1', [tenantId]);
      await this.db.query('DELETE FROM tenants WHERE id = $1', [tenantId]);
    }
    
    console.log('✓ Cleanup completato');
  }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const args = process.argv.slice(2);
  const tester = new JsonbPerformanceTester();
  
  try {
    if (args.includes('--cleanup-only')) {
      await tester.cleanup();
      return;
    }
    
    console.log('🚀 Avvio test performance JSONB...');
    console.log('Questo test creerà dati temporanei per simulare carico multi-tenant.');
    
    if (!args.includes('--force')) {
      console.log('\nContinuare? (Ctrl+C per annullare, o usa --force per saltare)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    await tester.runAllTests();
    
    if (args.includes('--keep-data')) {
      console.log('ℹ️ Dati di test mantenuti (usa --cleanup-only per rimuoverli)');
    } else {
      await tester.cleanup();
    }
    
  } catch (error) {
    console.error('💥 Test fallito:', error.message);
    console.error('🔧 Prova: node test-jsonb-performance.js --cleanup-only');
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { JsonbPerformanceTester };