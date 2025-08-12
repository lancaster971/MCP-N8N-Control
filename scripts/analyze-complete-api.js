#!/usr/bin/env node

/**
 * Script per analisi COMPLETA di TUTTE le API n8n
 * Genera documentazione dettagliata di ogni endpoint e campo
 */

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import fs from 'fs/promises';

class N8nApiAnalyzer {
  constructor() {
    this.apiUrl = process.env.N8N_API_URL;
    this.apiKey = process.env.N8N_API_KEY;
    this.config = {
      headers: { 'X-N8N-API-KEY': this.apiKey }
    };
    this.results = {};
  }

  /**
   * Analizza struttura di un oggetto e ritorna schema
   */
  analyzeStructure(obj, depth = 0) {
    if (depth > 3) return { type: 'object', description: 'nested object (depth limit)' };
    
    if (obj === null) return { type: 'null' };
    if (obj === undefined) return { type: 'undefined' };
    
    const type = Array.isArray(obj) ? 'array' : typeof obj;
    
    if (type === 'array' && obj.length > 0) {
      return {
        type: 'array',
        length: obj.length,
        items: this.analyzeStructure(obj[0], depth + 1)
      };
    }
    
    if (type === 'object') {
      const schema = { type: 'object', properties: {} };
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'data' && Array.isArray(value) && value.length > 100) {
          schema.properties[key] = { type: 'array', description: 'large data array' };
        } else {
          schema.properties[key] = this.analyzeStructure(value, depth + 1);
        }
      }
      return schema;
    }
    
    if (type === 'string' && obj.length > 100) {
      return { type: 'string', example: obj.substring(0, 100) + '...' };
    }
    
    return { type, value: obj };
  }

  /**
   * Test endpoint e analizza risposta
   */
  async testEndpoint(method, endpoint, params = {}) {
    try {
      console.log(`  Testing ${method} ${endpoint}...`);
      
      let response;
      const url = `${this.apiUrl}${endpoint}`;
      
      switch(method) {
        case 'GET':
          response = await axios.get(url, { ...this.config, params });
          break;
        case 'POST':
          response = await axios.post(url, params, this.config);
          break;
        case 'PUT':
          response = await axios.put(url, params, this.config);
          break;
        case 'DELETE':
          response = await axios.delete(url, this.config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
        structure: this.analyzeStructure(response.data)
      };
    } catch (error) {
      return {
        status: error.response?.status || 'error',
        error: error.message,
        data: error.response?.data
      };
    }
  }

  /**
   * Analizza tutti gli endpoint dei workflow
   */
  async analyzeWorkflowEndpoints() {
    console.log('\n🔍 ANALYZING WORKFLOW ENDPOINTS...');
    const results = {};
    
    // GET /workflows - Lista workflow
    results['GET /workflows'] = await this.testEndpoint('GET', '/workflows', { limit: 2 });
    
    // GET /workflows/{id} - Dettaglio workflow
    const workflows = results['GET /workflows'].data?.data;
    if (workflows && workflows.length > 0) {
      results['GET /workflows/{id}'] = await this.testEndpoint('GET', `/workflows/${workflows[0].id}`);
    }
    
    // GET /workflows/{id}/execute - Esegue workflow
    // Non testato per evitare esecuzioni indesiderate
    results['POST /workflows/{id}/execute'] = {
      status: 'not_tested',
      description: 'Executes a workflow',
      expected_params: {
        body: {
          data: 'object - Input data for workflow'
        }
      }
    };
    
    // POST /workflows/{id}/activate
    results['POST /workflows/{id}/activate'] = {
      status: 'not_tested',
      description: 'Activates a workflow',
      expected_response: { success: true }
    };
    
    // POST /workflows/{id}/deactivate
    results['POST /workflows/{id}/deactivate'] = {
      status: 'not_tested',
      description: 'Deactivates a workflow',
      expected_response: { success: true }
    };
    
    return results;
  }

  /**
   * Analizza tutti gli endpoint delle esecuzioni
   */
  async analyzeExecutionEndpoints() {
    console.log('\n🔍 ANALYZING EXECUTION ENDPOINTS...');
    const results = {};
    
    // GET /executions - Lista esecuzioni
    results['GET /executions'] = await this.testEndpoint('GET', '/executions', { limit: 2 });
    
    // GET /executions/{id} - Dettaglio esecuzione
    const executions = results['GET /executions'].data?.data;
    if (executions && executions.length > 0) {
      results['GET /executions/{id}'] = await this.testEndpoint('GET', `/executions/${executions[0].id}`);
    }
    
    // DELETE /executions/{id}
    results['DELETE /executions/{id}'] = {
      status: 'not_tested',
      description: 'Deletes an execution',
      expected_response: { success: true }
    };
    
    // GET /executions-current
    results['GET /executions-current'] = await this.testEndpoint('GET', '/executions-current', { limit: 2 });
    
    return results;
  }

  /**
   * Analizza endpoint delle credenziali
   */
  async analyzeCredentialEndpoints() {
    console.log('\n🔍 ANALYZING CREDENTIAL ENDPOINTS...');
    const results = {};
    
    // GET /credentials
    results['GET /credentials'] = await this.testEndpoint('GET', '/credentials', { limit: 2 });
    
    // GET /credentials/schema
    results['GET /credentials/schema'] = await this.testEndpoint('GET', '/credentials/schema');
    
    return results;
  }

  /**
   * Analizza endpoint utente e sistema
   */
  async analyzeSystemEndpoints() {
    console.log('\n🔍 ANALYZING SYSTEM ENDPOINTS...');
    const results = {};
    
    // GET /version
    results['GET /version'] = await this.testEndpoint('GET', '/version');
    
    // GET /health
    results['GET /health'] = await this.testEndpoint('GET', '/health');
    
    // GET /metrics
    results['GET /metrics'] = await this.testEndpoint('GET', '/metrics');
    
    return results;
  }

  /**
   * Analizza endpoint dei nodi
   */
  async analyzeNodeEndpoints() {
    console.log('\n🔍 ANALYZING NODE ENDPOINTS...');
    const results = {};
    
    // GET /node-types
    results['GET /node-types'] = await this.testEndpoint('GET', '/node-types');
    
    return results;
  }

  /**
   * Analizza endpoint dei tag
   */
  async analyzeTagEndpoints() {
    console.log('\n🔍 ANALYZING TAG ENDPOINTS...');
    const results = {};
    
    // GET /tags
    results['GET /tags'] = await this.testEndpoint('GET', '/tags');
    
    return results;
  }

  /**
   * Genera documentazione markdown
   */
  generateMarkdown() {
    let md = '# N8N API Complete Field Analysis\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += '## Table of Contents\n\n';
    
    const sections = Object.keys(this.results);
    sections.forEach((section, idx) => {
      md += `${idx + 1}. [${section}](#${section.toLowerCase().replace(/ /g, '-')})\n`;
    });
    
    md += '\n---\n\n';
    
    // Per ogni sezione
    for (const [section, endpoints] of Object.entries(this.results)) {
      md += `## ${section}\n\n`;
      
      // Per ogni endpoint
      for (const [endpoint, data] of Object.entries(endpoints)) {
        md += `### ${endpoint}\n\n`;
        
        if (data.status === 'not_tested') {
          md += `**Status:** Not tested (to avoid side effects)\n\n`;
          md += `**Description:** ${data.description || 'N/A'}\n\n`;
          if (data.expected_params) {
            md += '**Expected Parameters:**\n```json\n';
            md += JSON.stringify(data.expected_params, null, 2);
            md += '\n```\n\n';
          }
          if (data.expected_response) {
            md += '**Expected Response:**\n```json\n';
            md += JSON.stringify(data.expected_response, null, 2);
            md += '\n```\n\n';
          }
        } else {
          md += `**Status:** ${data.status}\n\n`;
          
          if (data.error) {
            md += `**Error:** ${data.error}\n\n`;
          }
          
          if (data.structure) {
            md += '**Response Structure:**\n```json\n';
            md += JSON.stringify(data.structure, null, 2);
            md += '\n```\n\n';
          }
          
          // Genera tabella dei campi
          if (data.structure?.properties || data.structure?.items?.properties) {
            md += '**Fields:**\n\n';
            md += '| Field | Type | Description |\n';
            md += '|-------|------|-------------|\n';
            
            const props = data.structure.properties || data.structure.items?.properties || {};
            for (const [field, schema] of Object.entries(props)) {
              const type = schema.type || 'unknown';
              const desc = this.getFieldDescription(field, schema);
              md += `| ${field} | ${type} | ${desc} |\n`;
            }
            md += '\n';
          }
        }
        
        md += '---\n\n';
      }
    }
    
    return md;
  }

  /**
   * Genera descrizione per campo
   */
  getFieldDescription(field, schema) {
    const descriptions = {
      id: 'Unique identifier',
      name: 'Name of the resource',
      active: 'Whether resource is active',
      createdAt: 'Creation timestamp',
      updatedAt: 'Last update timestamp',
      nodes: 'Array of workflow nodes',
      connections: 'Node connections mapping',
      settings: 'Workflow settings',
      staticData: 'Static data storage',
      pinData: 'Pinned data for testing',
      versionId: 'Version identifier',
      triggerCount: 'Number of triggers',
      meta: 'Metadata object',
      shared: 'Sharing information',
      tags: 'Associated tags',
      isArchived: 'Whether workflow is archived',
      mode: 'Execution mode',
      finished: 'Whether execution finished',
      startedAt: 'Execution start time',
      stoppedAt: 'Execution stop time',
      workflowId: 'Associated workflow ID',
      retryOf: 'ID of execution being retried',
      retrySuccessId: 'ID of successful retry',
      waitTill: 'Wait until timestamp',
      data: 'Execution data',
      type: 'Resource type',
      typeVersion: 'Type version number',
      position: 'Node position coordinates',
      parameters: 'Node parameters',
      credentials: 'Associated credentials',
      disabled: 'Whether node is disabled',
      notes: 'Node notes',
      color: 'Node color',
      continueOnFail: 'Continue workflow on node failure',
      executeOnce: 'Execute node only once',
      notesInFlow: 'Show notes in flow',
      status: 'Execution status',
      errorMessage: 'Error message if failed',
      executionTime: 'Total execution time in ms'
    };
    
    return descriptions[field] || (schema.description || 'N/A');
  }

  /**
   * Genera schema SQL suggerito
   */
  generateSQLSchema() {
    let sql = '-- N8N Database Schema\n';
    sql += '-- Generated from API analysis\n\n';
    
    // Analizza strutture uniche per creare tabelle
    const tables = this.identifyTables();
    
    for (const [tableName, fields] of Object.entries(tables)) {
      sql += `-- Table: ${tableName}\n`;
      sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const fieldDefs = [];
      for (const [field, type] of Object.entries(fields)) {
        fieldDefs.push(`  ${field} ${this.mapToSQLType(type)}`);
      }
      
      sql += fieldDefs.join(',\n');
      sql += '\n);\n\n';
    }
    
    return sql;
  }

  /**
   * Identifica tabelle dai dati
   */
  identifyTables() {
    const tables = {};
    
    // Analizza workflow
    if (this.results['Workflow Endpoints']?.['GET /workflows/{id}']?.structure?.properties) {
      tables.workflows = this.extractTableFields(
        this.results['Workflow Endpoints']['GET /workflows/{id}'].structure.properties
      );
    }
    
    // Analizza esecuzioni
    if (this.results['Execution Endpoints']?.['GET /executions/{id}']?.structure?.properties) {
      tables.executions = this.extractTableFields(
        this.results['Execution Endpoints']['GET /executions/{id}'].structure.properties
      );
    }
    
    return tables;
  }

  /**
   * Estrae campi per tabella
   */
  extractTableFields(properties) {
    const fields = {};
    
    for (const [field, schema] of Object.entries(properties)) {
      if (schema.type !== 'array' && schema.type !== 'object') {
        fields[field] = schema.type;
      } else if (schema.type === 'object') {
        fields[field] = 'jsonb';
      } else if (schema.type === 'array') {
        // Skip arrays as they'll be separate tables
      }
    }
    
    return fields;
  }

  /**
   * Mappa tipo JS a SQL
   */
  mapToSQLType(jsType) {
    const mapping = {
      'string': 'VARCHAR(255)',
      'number': 'INTEGER',
      'boolean': 'BOOLEAN',
      'null': 'VARCHAR(255)',
      'jsonb': 'JSONB',
      'undefined': 'VARCHAR(255)'
    };
    
    return mapping[jsType] || 'TEXT';
  }

  /**
   * Esegue analisi completa
   */
  async analyze() {
    console.log('🚀 Starting complete N8N API analysis...\n');
    
    // Verifica configurazione
    if (!this.apiUrl || !this.apiKey) {
      console.error('❌ Missing N8N_API_URL or N8N_API_KEY');
      return;
    }
    
    console.log(`API URL: ${this.apiUrl}`);
    console.log(`API Key: ${this.apiKey.substring(0, 20)}...`);
    
    // Analizza tutti gli endpoint
    this.results['Workflow Endpoints'] = await this.analyzeWorkflowEndpoints();
    this.results['Execution Endpoints'] = await this.analyzeExecutionEndpoints();
    this.results['Credential Endpoints'] = await this.analyzeCredentialEndpoints();
    this.results['Node Endpoints'] = await this.analyzeNodeEndpoints();
    this.results['Tag Endpoints'] = await this.analyzeTagEndpoints();
    this.results['System Endpoints'] = await this.analyzeSystemEndpoints();
    
    // Genera documentazione
    console.log('\n📝 Generating documentation...');
    
    // Salva JSON raw
    await fs.writeFile(
      'API_Fields_Raw.json',
      JSON.stringify(this.results, null, 2)
    );
    console.log('✅ Saved raw data to API_Fields_Raw.json');
    
    // Genera e salva Markdown
    const markdown = this.generateMarkdown();
    await fs.writeFile('API_Fields.md', markdown);
    console.log('✅ Saved documentation to API_Fields.md');
    
    // Genera schema SQL
    const sqlSchema = this.generateSQLSchema();
    await fs.writeFile('API_Schema.sql', sqlSchema);
    console.log('✅ Saved SQL schema to API_Schema.sql');
    
    // Stampa riepilogo
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log('====================');
    
    let totalEndpoints = 0;
    let totalFields = new Set();
    
    for (const [section, endpoints] of Object.entries(this.results)) {
      const endpointCount = Object.keys(endpoints).length;
      totalEndpoints += endpointCount;
      
      // Conta campi unici
      for (const data of Object.values(endpoints)) {
        if (data.structure?.properties) {
          Object.keys(data.structure.properties).forEach(field => totalFields.add(field));
        }
      }
      
      console.log(`  ${section}: ${endpointCount} endpoints`);
    }
    
    console.log(`\nTotal Endpoints Analyzed: ${totalEndpoints}`);
    console.log(`Total Unique Fields Found: ${totalFields.size}`);
    console.log('\n✅ Analysis complete!');
  }
}

// Esegui analisi
const analyzer = new N8nApiAnalyzer();
analyzer.analyze().catch(console.error);