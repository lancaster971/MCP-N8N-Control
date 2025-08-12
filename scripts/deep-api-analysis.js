#!/usr/bin/env node

/**
 * Analisi PROFONDA di OGNI singolo campo API
 */

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import fs from 'fs/promises';

class DeepApiAnalyzer {
  constructor() {
    this.apiUrl = process.env.N8N_API_URL;
    this.apiKey = process.env.N8N_API_KEY;
    this.config = {
      headers: { 'X-N8N-API-KEY': this.apiKey }
    };
    this.allFields = new Map();
    this.fieldTypes = new Map();
    this.fieldExamples = new Map();
  }

  extractAllFields(obj, prefix = '', depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return;
    
    if (obj === null || obj === undefined) return;
    
    if (Array.isArray(obj)) {
      this.recordField(prefix, 'array', obj.length);
      if (obj.length > 0) {
        // Analizza tutti gli elementi dell'array per trovare tutti i campi possibili
        const allKeys = new Set();
        obj.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => allKeys.add(key));
          }
        });
        
        // Analizza struttura completa
        allKeys.forEach(key => {
          const examples = obj
            .filter(item => item && typeof item === 'object' && key in item)
            .map(item => item[key])
            .slice(0, 3);
          
          examples.forEach(example => {
            this.extractAllFields(example, `${prefix}[].${key}`, depth + 1, maxDepth);
          });
        });
      }
    } else if (typeof obj === 'object') {
      this.recordField(prefix, 'object', Object.keys(obj).length);
      
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        this.extractAllFields(value, fieldPath, depth + 1, maxDepth);
      }
    } else {
      // Campo primitivo
      this.recordField(prefix, typeof obj, obj);
    }
  }

  recordField(path, type, example) {
    if (!path) return;
    
    if (!this.allFields.has(path)) {
      this.allFields.set(path, {
        path,
        type,
        examples: [],
        occurrences: 0
      });
    }
    
    const field = this.allFields.get(path);
    field.occurrences++;
    
    // Salva esempi unici
    if (example !== undefined && example !== null) {
      const exampleStr = typeof example === 'object' ? 
        JSON.stringify(example).substring(0, 100) : 
        String(example).substring(0, 100);
      
      if (!field.examples.some(e => e === exampleStr) && field.examples.length < 5) {
        field.examples.push(exampleStr);
      }
    }
  }

  async analyzeAllEndpoints() {
    console.log('🔬 ANALISI PROFONDA DI TUTTI I CAMPI API N8N\n');
    console.log('=' .repeat(60) + '\n');
    
    const results = {
      workflows: {},
      executions: {},
      credentials: {},
      tags: {},
      nodeTypes: {},
      users: {},
      variables: {},
      settings: {}
    };
    
    try {
      // 1. WORKFLOWS - Analisi completa
      console.log('📁 WORKFLOWS');
      console.log('-'.repeat(40));
      
      // Lista workflow
      const workflowList = await axios.get(`${this.apiUrl}/workflows`, this.config);
      console.log(`✓ GET /workflows - ${workflowList.data.data.length} workflows trovati`);
      
      // Analizza struttura lista
      workflowList.data.data.forEach(w => {
        this.extractAllFields(w, 'workflows.list');
      });
      
      // Dettaglio di OGNI workflow per trovare TUTTI i campi possibili
      const sampleSize = Math.min(5, workflowList.data.data.length);
      for (let i = 0; i < sampleSize; i++) {
        const wf = workflowList.data.data[i];
        const detail = await axios.get(`${this.apiUrl}/workflows/${wf.id}`, this.config);
        console.log(`✓ GET /workflows/${wf.id} - ${wf.name}`);
        this.extractAllFields(detail.data, 'workflows.detail');
      }
      
      // 2. EXECUTIONS - Analisi completa
      console.log('\n📊 EXECUTIONS');
      console.log('-'.repeat(40));
      
      // Lista esecuzioni
      const execList = await axios.get(`${this.apiUrl}/executions?limit=10`, this.config);
      console.log(`✓ GET /executions - ${execList.data.data.length} esecuzioni trovate`);
      
      execList.data.data.forEach(e => {
        this.extractAllFields(e, 'executions.list');
      });
      
      // Dettaglio esecuzioni
      if (execList.data.data.length > 0) {
        const sampleExecs = execList.data.data.slice(0, 3);
        for (const exec of sampleExecs) {
          try {
            const detail = await axios.get(`${this.apiUrl}/executions/${exec.id}`, this.config);
            console.log(`✓ GET /executions/${exec.id}`);
            this.extractAllFields(detail.data, 'executions.detail');
          } catch (e) {
            console.log(`✗ GET /executions/${exec.id} - ${e.message}`);
          }
        }
      }
      
      // 3. CREDENTIALS
      console.log('\n🔑 CREDENTIALS');
      console.log('-'.repeat(40));
      
      try {
        const credList = await axios.get(`${this.apiUrl}/credentials`, this.config);
        console.log(`✓ GET /credentials - ${credList.data.data?.length || 0} credenziali`);
        if (credList.data.data) {
          credList.data.data.forEach(c => {
            this.extractAllFields(c, 'credentials');
          });
        }
      } catch (e) {
        console.log(`✗ GET /credentials - ${e.message}`);
      }
      
      // 4. TAGS
      console.log('\n🏷️ TAGS');
      console.log('-'.repeat(40));
      
      try {
        const tagList = await axios.get(`${this.apiUrl}/tags`, this.config);
        console.log(`✓ GET /tags - ${tagList.data.data?.length || 0} tags`);
        if (tagList.data.data) {
          tagList.data.data.forEach(t => {
            this.extractAllFields(t, 'tags');
          });
        }
      } catch (e) {
        console.log(`✗ GET /tags - ${e.message}`);
      }
      
      // 5. NODE-TYPES
      console.log('\n🔧 NODE TYPES');
      console.log('-'.repeat(40));
      
      try {
        const nodeTypes = await axios.get(`${this.apiUrl}/node-types`, this.config);
        console.log(`✓ GET /node-types - ${nodeTypes.data.data?.length || 0} tipi di nodi`);
        // Solo primi 3 per non appesantire
        if (nodeTypes.data.data) {
          nodeTypes.data.data.slice(0, 3).forEach(nt => {
            this.extractAllFields(nt, 'nodeTypes');
          });
        }
      } catch (e) {
        console.log(`✗ GET /node-types - ${e.message}`);
      }
      
      // 6. USERS (se disponibile)
      console.log('\n👤 USERS');
      console.log('-'.repeat(40));
      
      try {
        const users = await axios.get(`${this.apiUrl}/users`, this.config);
        console.log(`✓ GET /users - ${users.data.data?.length || 0} utenti`);
        if (users.data.data) {
          users.data.data.forEach(u => {
            this.extractAllFields(u, 'users');
          });
        }
      } catch (e) {
        console.log(`✗ GET /users - ${e.response?.status === 404 ? 'Endpoint non disponibile' : e.message}`);
      }
      
      // 7. VARIABLES (se disponibile)
      console.log('\n🔤 VARIABLES');
      console.log('-'.repeat(40));
      
      try {
        const vars = await axios.get(`${this.apiUrl}/variables`, this.config);
        console.log(`✓ GET /variables`);
        this.extractAllFields(vars.data, 'variables');
      } catch (e) {
        console.log(`✗ GET /variables - ${e.response?.status === 404 ? 'Endpoint non disponibile' : e.message}`);
      }
      
      // 8. AUDIT LOGS (se disponibile)
      console.log('\n📝 AUDIT LOGS');
      console.log('-'.repeat(40));
      
      try {
        const audit = await axios.get(`${this.apiUrl}/audit`, this.config);
        console.log(`✓ GET /audit`);
        this.extractAllFields(audit.data, 'audit');
      } catch (e) {
        console.log(`✗ GET /audit - ${e.response?.status === 404 ? 'Endpoint non disponibile' : e.message}`);
      }
      
      // 9. WORKFLOW STATISTICS
      console.log('\n📈 STATISTICS');
      console.log('-'.repeat(40));
      
      if (workflowList.data.data.length > 0) {
        const wfId = workflowList.data.data[0].id;
        try {
          const stats = await axios.get(`${this.apiUrl}/workflows/${wfId}/statistics`, this.config);
          console.log(`✓ GET /workflows/{id}/statistics`);
          this.extractAllFields(stats.data, 'statistics');
        } catch (e) {
          console.log(`✗ GET /workflows/{id}/statistics - ${e.response?.status === 404 ? 'Non disponibile' : e.message}`);
        }
      }
      
    } catch (error) {
      console.error('Errore generale:', error.message);
    }
    
    return this.allFields;
  }

  generateReport() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📋 REPORT COMPLETO DEI CAMPI');
    console.log('='.repeat(60) + '\n');
    
    // Raggruppa per categoria
    const categories = new Map();
    
    this.allFields.forEach((field, path) => {
      const category = path.split('.')[0];
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push(field);
    });
    
    // Report per categoria
    let totalFields = 0;
    const report = [];
    
    categories.forEach((fields, category) => {
      report.push(`\n### ${category.toUpperCase()}`);
      report.push(`Campi trovati: ${fields.length}\n`);
      
      // Ordina per path
      fields.sort((a, b) => a.path.localeCompare(b.path));
      
      fields.forEach(field => {
        const examples = field.examples.length > 0 ? 
          ` (es: ${field.examples[0]})` : '';
        report.push(`  ${field.path} [${field.type}]${examples}`);
      });
      
      totalFields += fields.length;
    });
    
    console.log(`TOTALE CAMPI UNICI TROVATI: ${totalFields}`);
    console.log(report.join('\n'));
    
    return {
      totalFields,
      categories: Array.from(categories.keys()),
      fields: Array.from(this.allFields.values())
    };
  }

  async saveResults() {
    const data = {
      timestamp: new Date().toISOString(),
      stats: this.generateReport(),
      allFields: Array.from(this.allFields.values())
    };
    
    // Salva JSON completo
    await fs.writeFile(
      'API_Deep_Analysis.json',
      JSON.stringify(data, null, 2)
    );
    
    // Genera Markdown dettagliato
    let md = '# 🔬 Analisi Profonda API N8N - TUTTI I CAMPI\n\n';
    md += `Data: ${data.timestamp}\n\n`;
    md += `## Statistiche\n\n`;
    md += `- **Campi totali trovati:** ${data.stats.totalFields}\n`;
    md += `- **Categorie:** ${data.stats.categories.join(', ')}\n\n`;
    
    md += '## Dettaglio Campi per Categoria\n\n';
    
    const byCategory = {};
    data.allFields.forEach(field => {
      const cat = field.path.split('.')[0];
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(field);
    });
    
    for (const [category, fields] of Object.entries(byCategory)) {
      md += `### ${category}\n\n`;
      md += '| Path | Type | Examples | Occurrences |\n';
      md += '|------|------|----------|-------------|\n';
      
      fields.forEach(field => {
        const examples = field.examples.slice(0, 2).join(', ') || 'N/A';
        md += `| ${field.path} | ${field.type} | ${examples} | ${field.occurrences} |\n`;
      });
      
      md += '\n';
    }
    
    await fs.writeFile('API_Deep_Analysis.md', md);
    
    console.log('\n✅ Risultati salvati in:');
    console.log('   - API_Deep_Analysis.json');
    console.log('   - API_Deep_Analysis.md');
  }
}

// Esegui analisi
async function main() {
  const analyzer = new DeepApiAnalyzer();
  await analyzer.analyzeAllEndpoints();
  analyzer.generateReport();
  await analyzer.saveResults();
}

main().catch(console.error);