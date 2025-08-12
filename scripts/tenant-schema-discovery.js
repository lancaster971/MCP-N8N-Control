#!/usr/bin/env node

/**
 * Schema Discovery per Tenant Multi-N8N
 * 
 * Questo script analizza AUTOMATICAMENTE le capacità di ogni istanza n8n
 * per adattare il nostro sistema a 1000+ clienti diversi con versioni/config diverse.
 */

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import fs from 'fs/promises';
import crypto from 'crypto';

class TenantSchemaDiscovery {
  constructor(tenantConfig) {
    this.tenantId = tenantConfig.tenantId;
    this.apiUrl = tenantConfig.apiUrl;
    this.apiKey = tenantConfig.apiKey;
    this.config = {
      headers: { 'X-N8N-API-KEY': this.apiKey },
      timeout: 10000 // 10 secondi timeout
    };
    
    this.discoveryResult = {
      tenantId: this.tenantId,
      discoveryDate: new Date().toISOString(),
      n8nVersion: null,
      instanceType: 'unknown',
      availableEndpoints: [],
      workflowFields: [],
      executionFields: [],
      customNodes: [],
      capabilities: {
        supportsWebhooks: false,
        supportsCredentials: false,
        supportsTags: false,
        supportsProjects: false,
        supportsUsers: false,
        supportsVariables: false,
        supportsAudit: false
      },
      stats: {
        totalWorkflowsAnalyzed: 0,
        totalExecutionsAnalyzed: 0,
        customNodesDetected: 0
      },
      schemaSignature: null
    };
  }

  /**
   * Esegue il discovery completo per il tenant
   */
  async discoverTenantSchema() {
    console.log(`🔍 SCHEMA DISCOVERY per tenant: ${this.tenantId}`);
    console.log(`📡 API URL: ${this.apiUrl}`);
    console.log('='.repeat(60));

    try {
      // 1. Rilevamento versione n8n
      await this.detectN8nVersion();
      
      // 2. Test disponibilità endpoint
      await this.testEndpointAvailability();
      
      // 3. Analisi schema workflows
      await this.analyzeWorkflowSchema();
      
      // 4. Analisi schema executions
      await this.analyzeExecutionSchema();
      
      // 5. Rilevamento custom nodes
      await this.detectCustomNodes();
      
      // 6. Calcolo signature schema
      this.calculateSchemaSignature();
      
      console.log('\n✅ Discovery completato!');
      return this.discoveryResult;
      
    } catch (error) {
      console.error(`❌ Errore durante discovery: ${error.message}`);
      this.discoveryResult.error = error.message;
      return this.discoveryResult;
    }
  }

  /**
   * Rileva versione n8n e tipo istanza
   */
  async detectN8nVersion() {
    console.log('\n📋 Rilevamento versione n8n...');
    
    try {
      // Prova endpoint /version (potrebbe non esistere in versioni vecchie)
      const versionResponse = await axios.get(`${this.apiUrl}/version`, this.config);
      this.discoveryResult.n8nVersion = versionResponse.data.version;
      
      // Determina tipo istanza da headers o URL
      if (this.apiUrl.includes('n8n.cloud') || this.apiUrl.includes('app.n8n.io')) {
        this.discoveryResult.instanceType = 'cloud';
      } else if (this.apiUrl.includes('localhost') || this.apiUrl.includes('127.0.0.1')) {
        this.discoveryResult.instanceType = 'local';
      } else {
        this.discoveryResult.instanceType = 'self-hosted';
      }
      
      console.log(`✓ Versione: ${this.discoveryResult.n8nVersion}`);
      console.log(`✓ Tipo: ${this.discoveryResult.instanceType}`);
      
    } catch (error) {
      console.log('⚠️ Endpoint /version non disponibile (versione vecchia?)');
      this.discoveryResult.n8nVersion = 'unknown';
    }
  }

  /**
   * Testa disponibilità di tutti gli endpoint principali
   */
  async testEndpointAvailability() {
    console.log('\n🔌 Test endpoint disponibili...');
    
    const endpointsToTest = [
      { path: '/workflows', capability: 'workflows' },
      { path: '/executions', capability: 'executions' },
      { path: '/credentials', capability: 'supportsCredentials' },
      { path: '/tags', capability: 'supportsTags' },
      { path: '/node-types', capability: 'nodeTypes' },
      { path: '/users', capability: 'supportsUsers' },
      { path: '/variables', capability: 'supportsVariables' },
      { path: '/audit', capability: 'supportsAudit' },
      { path: '/health', capability: 'health' },
      { path: '/metrics', capability: 'metrics' }
    ];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await axios.get(`${this.apiUrl}${endpoint.path}`, {
          ...this.config,
          timeout: 5000
        });
        
        this.discoveryResult.availableEndpoints.push(endpoint.path);
        if (endpoint.capability.startsWith('supports')) {
          this.discoveryResult.capabilities[endpoint.capability] = true;
        }
        
        console.log(`✓ ${endpoint.path} - OK`);
        
      } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
          console.log(`✗ ${endpoint.path} - Non disponibile`);
        } else if (status === 401 || status === 403) {
          console.log(`⚠️ ${endpoint.path} - Accesso negato`);
        } else {
          console.log(`⚠️ ${endpoint.path} - Errore: ${error.message.substring(0, 50)}`);
        }
      }
    }
  }

  /**
   * Analizza schema dei workflow campionando alcuni record
   */
  async analyzeWorkflowSchema() {
    console.log('\n📊 Analisi schema workflows...');
    
    if (!this.discoveryResult.availableEndpoints.includes('/workflows')) {
      console.log('⚠️ Endpoint workflows non disponibile');
      return;
    }

    try {
      // Lista workflows (campione)
      const listResponse = await axios.get(`${this.apiUrl}/workflows?limit=10`, this.config);
      const workflows = listResponse.data.data || [];
      
      console.log(`✓ Trovati ${workflows.length} workflow campione`);
      this.discoveryResult.stats.totalWorkflowsAnalyzed = workflows.length;
      
      if (workflows.length === 0) return;
      
      // Analizza campi della lista
      const listFields = this.extractFieldsRecursive(workflows[0], 'workflows.list');
      this.discoveryResult.workflowFields.push(...listFields);
      
      // Prendi dettaglio di alcuni workflow per schema completo
      const sampleSize = Math.min(3, workflows.length);
      for (let i = 0; i < sampleSize; i++) {
        try {
          const detailResponse = await axios.get(`${this.apiUrl}/workflows/${workflows[i].id}`, this.config);
          const detailFields = this.extractFieldsRecursive(detailResponse.data, 'workflows.detail');
          this.discoveryResult.workflowFields.push(...detailFields);
          
          // Rileva webhook capabilities
          if (detailResponse.data.nodes) {
            const hasWebhook = detailResponse.data.nodes.some(node => 
              node.type && node.type.includes('webhook')
            );
            if (hasWebhook) {
              this.discoveryResult.capabilities.supportsWebhooks = true;
            }
          }
          
          console.log(`✓ Analizzato workflow: ${workflows[i].name}`);
          
        } catch (error) {
          console.log(`⚠️ Errore dettaglio workflow ${workflows[i].id}: ${error.message}`);
        }
      }
      
      // Rimuovi duplicati
      this.discoveryResult.workflowFields = this.removeDuplicateFields(this.discoveryResult.workflowFields);
      
      console.log(`✓ Schema workflows: ${this.discoveryResult.workflowFields.length} campi unici rilevati`);
      
    } catch (error) {
      console.log(`❌ Errore analisi workflows: ${error.message}`);
    }
  }

  /**
   * Analizza schema delle executions
   */
  async analyzeExecutionSchema() {
    console.log('\n📈 Analisi schema executions...');
    
    if (!this.discoveryResult.availableEndpoints.includes('/executions')) {
      console.log('⚠️ Endpoint executions non disponibile');
      return;
    }

    try {
      // Lista executions recenti
      const listResponse = await axios.get(`${this.apiUrl}/executions?limit=5`, this.config);
      const executions = listResponse.data.data || [];
      
      console.log(`✓ Trovate ${executions.length} execution campione`);
      this.discoveryResult.stats.totalExecutionsAnalyzed = executions.length;
      
      if (executions.length === 0) return;
      
      // Analizza campi della lista
      const listFields = this.extractFieldsRecursive(executions[0], 'executions.list');
      this.discoveryResult.executionFields.push(...listFields);
      
      // Analizza dettaglio di alcune executions
      const sampleSize = Math.min(2, executions.length);
      for (let i = 0; i < sampleSize; i++) {
        try {
          const detailResponse = await axios.get(`${this.apiUrl}/executions/${executions[i].id}`, this.config);
          const detailFields = this.extractFieldsRecursive(detailResponse.data, 'executions.detail');
          this.discoveryResult.executionFields.push(...detailFields);
          
          console.log(`✓ Analizzata execution: ${executions[i].id}`);
          
        } catch (error) {
          console.log(`⚠️ Errore dettaglio execution ${executions[i].id}: ${error.message}`);
        }
      }
      
      // Rimuovi duplicati
      this.discoveryResult.executionFields = this.removeDuplicateFields(this.discoveryResult.executionFields);
      
      console.log(`✓ Schema executions: ${this.discoveryResult.executionFields.length} campi unici rilevati`);
      
    } catch (error) {
      console.log(`❌ Errore analisi executions: ${error.message}`);
    }
  }

  /**
   * Rileva custom nodes installati
   */
  async detectCustomNodes() {
    console.log('\n🔧 Rilevamento custom nodes...');
    
    if (!this.discoveryResult.availableEndpoints.includes('/node-types')) {
      console.log('⚠️ Endpoint node-types non disponibile');
      return;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/node-types`, this.config);
      const nodeTypes = response.data.data || [];
      
      // Identifica custom nodes (non iniziano con n8n-nodes-base)
      const customNodes = nodeTypes.filter(node => 
        node.name && !node.name.startsWith('n8n-nodes-base')
      );
      
      this.discoveryResult.customNodes = customNodes.map(node => ({
        name: node.name,
        displayName: node.displayName,
        version: node.version,
        group: node.group
      }));
      
      this.discoveryResult.stats.customNodesDetected = customNodes.length;
      
      console.log(`✓ Rilevati ${customNodes.length} custom nodes`);
      if (customNodes.length > 0) {
        console.log('Custom nodes trovati:');
        customNodes.slice(0, 5).forEach(node => {
          console.log(`   - ${node.displayName} (${node.name})`);
        });
        if (customNodes.length > 5) {
          console.log(`   ... e altri ${customNodes.length - 5}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Errore rilevamento custom nodes: ${error.message}`);
    }
  }

  /**
   * Estrae campi ricorsivamente da un oggetto
   */
  extractFieldsRecursive(obj, prefix = '', depth = 0, maxDepth = 3) {
    const fields = [];
    
    if (depth > maxDepth || obj === null || obj === undefined) return fields;
    
    if (Array.isArray(obj)) {
      fields.push({
        path: prefix,
        type: 'array',
        example: obj.length > 0 ? 'Array with ' + obj.length + ' items' : 'Empty array'
      });
      
      if (obj.length > 0) {
        // Analizza primo elemento dell'array
        const subFields = this.extractFieldsRecursive(obj[0], `${prefix}[]`, depth + 1, maxDepth);
        fields.push(...subFields);
      }
      
    } else if (typeof obj === 'object') {
      if (prefix) {
        fields.push({
          path: prefix,
          type: 'object',
          example: 'Object with ' + Object.keys(obj).length + ' keys'
        });
      }
      
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        const subFields = this.extractFieldsRecursive(value, fieldPath, depth + 1, maxDepth);
        fields.push(...subFields);
      }
      
    } else {
      // Campo primitivo
      fields.push({
        path: prefix,
        type: typeof obj,
        example: this.truncateExample(obj)
      });
    }
    
    return fields;
  }

  /**
   * Rimuove campi duplicati mantenendo solo unici
   */
  removeDuplicateFields(fields) {
    const seen = new Set();
    return fields.filter(field => {
      const key = field.path;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Tronca esempio per evitare output troppo lunghi
   */
  truncateExample(value) {
    const str = String(value);
    return str.length > 100 ? str.substring(0, 100) + '...' : str;
  }

  /**
   * Calcola signature hash per identificare univocamente lo schema
   */
  calculateSchemaSignature() {
    const signatureData = {
      n8nVersion: this.discoveryResult.n8nVersion,
      endpoints: this.discoveryResult.availableEndpoints.sort(),
      capabilities: this.discoveryResult.capabilities,
      customNodesCount: this.discoveryResult.stats.customNodesDetected,
      workflowFieldsCount: this.discoveryResult.workflowFields.length,
      executionFieldsCount: this.discoveryResult.executionFields.length
    };
    
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(signatureData))
      .digest('hex');
    
    this.discoveryResult.schemaSignature = hash;
    
    console.log(`\n📝 Schema signature: ${hash}`);
  }

  /**
   * Salva risultato discovery su file
   */
  async saveDiscoveryResult() {
    const filename = `tenant_discovery_${this.tenantId}_${Date.now()}.json`;
    
    await fs.writeFile(
      filename,
      JSON.stringify(this.discoveryResult, null, 2)
    );
    
    console.log(`\n💾 Discovery salvato in: ${filename}`);
    return filename;
  }
}

/**
 * Classe per gestire discovery di multipli tenant
 */
class MultiTenantDiscovery {
  constructor() {
    this.results = [];
  }

  /**
   * Esegue discovery per lista di tenant
   */
  async discoverMultipleTenants(tenantConfigs) {
    console.log(`🚀 MULTI-TENANT DISCOVERY: ${tenantConfigs.length} tenant`);
    console.log('='.repeat(80));

    for (const config of tenantConfigs) {
      console.log(`\n${'='.repeat(20)} ${config.tenantId} ${'='.repeat(20)}`);
      
      const discovery = new TenantSchemaDiscovery(config);
      const result = await discovery.discoverTenantSchema();
      
      this.results.push(result);
      
      // Pausa tra tenant per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return this.results;
  }

  /**
   * Genera report comparativo
   */
  generateComparativeReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORT COMPARATIVO TENANT');
    console.log('='.repeat(80));

    // Analisi versioni
    const versions = {};
    const signatures = {};
    const capabilities = {};

    this.results.forEach(result => {
      // Versioni
      const version = result.n8nVersion || 'unknown';
      versions[version] = (versions[version] || 0) + 1;
      
      // Signatures
      const signature = result.schemaSignature || 'unknown';
      signatures[signature] = (signatures[signature] || 0) + 1;
      
      // Capabilities
      Object.entries(result.capabilities).forEach(([cap, supported]) => {
        if (!capabilities[cap]) capabilities[cap] = { supported: 0, total: 0 };
        capabilities[cap].total++;
        if (supported) capabilities[cap].supported++;
      });
    });

    console.log('\n📈 Distribuzione Versioni n8n:');
    Object.entries(versions).forEach(([version, count]) => {
      console.log(`   ${version}: ${count} tenant`);
    });

    console.log('\n🔧 Capabilities Support:');
    Object.entries(capabilities).forEach(([cap, stats]) => {
      const percentage = Math.round((stats.supported / stats.total) * 100);
      console.log(`   ${cap}: ${stats.supported}/${stats.total} (${percentage}%)`);
    });

    console.log('\n📝 Schema Signatures Uniche:');
    Object.entries(signatures).forEach(([sig, count]) => {
      console.log(`   ${sig}: ${count} tenant`);
    });

    const totalTenants = this.results.length;
    const uniqueSchemas = Object.keys(signatures).length;
    
    console.log(`\n✨ RIEPILOGO:`);
    console.log(`   - Tenant analizzati: ${totalTenants}`);
    console.log(`   - Schema unici rilevati: ${uniqueSchemas}`);
    console.log(`   - Compatibilità: ${uniqueSchemas < totalTenants ? 'BUONA' : 'CRITICA'}`);
    
    if (uniqueSchemas === 1) {
      console.log('   🎉 Tutti i tenant hanno lo stesso schema!');
    } else if (uniqueSchemas < totalTenants * 0.5) {
      console.log('   ✅ La maggior parte dei tenant è compatibile');
    } else {
      console.log('   ⚠️ Ogni tenant ha schema diverso - serve massima flessibilità');
    }

    return {
      totalTenants,
      uniqueSchemas,
      versions,
      capabilities,
      signatures
    };
  }

  /**
   * Salva report completo
   */
  async saveReport() {
    const report = this.generateComparativeReport();
    const fullReport = {
      timestamp: new Date().toISOString(),
      summary: report,
      tenantResults: this.results
    };

    const filename = `multi_tenant_discovery_${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(fullReport, null, 2));
    
    console.log(`\n💾 Report completo salvato in: ${filename}`);
    return filename;
  }
}

// =====================================================
// MAIN - Esempi di utilizzo
// =====================================================

async function main() {
  // Esempio 1: Discovery singolo tenant (current setup)
  console.log('🔍 ESEMPIO: Discovery tenant corrente');
  console.log('-'.repeat(50));
  
  const currentTenantDiscovery = new TenantSchemaDiscovery({
    tenantId: 'current_tenant',
    apiUrl: process.env.N8N_API_URL,
    apiKey: process.env.N8N_API_KEY
  });
  
  const result = await currentTenantDiscovery.discoverTenantSchema();
  await currentTenantDiscovery.saveDiscoveryResult();
  
  // Esempio 2: Discovery multipli tenant (per test)
  console.log('\n\n🏢 ESEMPIO: Discovery multi-tenant simulato');
  console.log('-'.repeat(50));
  
  const multiDiscovery = new MultiTenantDiscovery();
  
  // Simula diversi tenant (in produzione questi verrebbero dal database)
  const testTenants = [
    {
      tenantId: 'tenant_production',
      apiUrl: process.env.N8N_API_URL, // Stesso per test
      apiKey: process.env.N8N_API_KEY
    }
    // In produzione avresti:
    // {
    //   tenantId: 'client_a',
    //   apiUrl: 'https://client-a.n8n-instance.com/api/v1',
    //   apiKey: 'client_a_api_key'
    // },
    // {
    //   tenantId: 'client_b', 
    //   apiUrl: 'https://client-b-n8n.herokuapp.com/api/v1',
    //   apiKey: 'client_b_api_key'
    // }
  ];
  
  await multiDiscovery.discoverMultipleTenants(testTenants);
  await multiDiscovery.saveReport();
  
  console.log('\n✅ Discovery multi-tenant completato!');
  console.log('\n📋 Prossimi passi:');
  console.log('   1. Integrare discovery nel sync service');
  console.log('   2. Salvare risultati in tenant_schema_discoveries');
  console.log('   3. Usare signature per ottimizzare sync strategy');
  console.log('   4. Implementare auto-discovery schedulato');
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TenantSchemaDiscovery, MultiTenantDiscovery };