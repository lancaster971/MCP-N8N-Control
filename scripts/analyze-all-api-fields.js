#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import fs from 'fs/promises';

async function analyzeAllApiFields() {
  try {
    const config = {
      headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
    };
    
    console.log('🔍 ANALISI COMPLETA CAMPI API N8N');
    console.log('=====================================\n');
    
    // 1. ANALIZZA LISTA WORKFLOW
    console.log('📋 1. CAMPI DALLA LISTA WORKFLOW (/workflows):');
    console.log('------------------------------------------------');
    const listResponse = await axios.get(process.env.N8N_API_URL + '/workflows', config);
    const workflows = listResponse.data.data;
    
    if (workflows.length > 0) {
      const sampleFromList = workflows[0];
      console.log('Esempio workflow dalla lista:');
      Object.entries(sampleFromList).forEach(([key, value]) => {
        const type = Array.isArray(value) ? 'array' : typeof value;
        const preview = type === 'string' ? value.substring(0, 50) : 
                       type === 'object' ? JSON.stringify(value).substring(0, 50) : value;
        console.log(`  - ${key}: [${type}] ${preview}${preview?.length >= 50 ? '...' : ''}`);
      });
    }
    
    // 2. ANALIZZA WORKFLOW DETTAGLIATO
    console.log('\n📋 2. CAMPI DAL DETTAGLIO WORKFLOW (/workflows/{id}):');
    console.log('--------------------------------------------------------');
    
    // Prendi diversi workflow per vedere tutte le varianti
    const sampleWorkflows = workflows.slice(0, 3);
    const allFields = new Map();
    const fieldValues = new Map();
    
    for (const w of sampleWorkflows) {
      const detailResponse = await axios.get(
        `${process.env.N8N_API_URL}/workflows/${w.id}`, 
        config
      );
      const detail = detailResponse.data;
      
      // Raccogli tutti i campi
      Object.entries(detail).forEach(([key, value]) => {
        if (!allFields.has(key)) {
          allFields.set(key, {
            type: Array.isArray(value) ? 'array' : typeof value,
            nullable: value === null,
            examples: []
          });
        }
        
        const field = allFields.get(key);
        
        // Aggiorna tipo se trovato non-null
        if (value !== null && !field.nullable) {
          field.type = Array.isArray(value) ? 'array' : typeof value;
        }
        
        // Raccogli esempi unici
        if (value !== null && !['nodes', 'connections', 'settings', 'staticData', 'pinData'].includes(key)) {
          const example = typeof value === 'object' ? JSON.stringify(value) : value;
          if (!field.examples.some(e => e === example) && field.examples.length < 3) {
            field.examples.push(example);
          }
        }
      });
    }
    
    // Mostra tutti i campi trovati
    console.log('\n🔍 TUTTI I CAMPI TROVATI:');
    const sortedFields = Array.from(allFields.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    for (const [fieldName, fieldInfo] of sortedFields) {
      console.log(`\n📌 ${fieldName}:`);
      console.log(`   Tipo: ${fieldInfo.type}`);
      console.log(`   Nullable: ${fieldInfo.nullable ? 'Sì' : 'No'}`);
      
      if (fieldInfo.examples.length > 0) {
        console.log(`   Esempi:`);
        fieldInfo.examples.forEach(ex => {
          const preview = String(ex).substring(0, 100);
          console.log(`     • ${preview}${preview.length >= 100 ? '...' : ''}`);
        });
      }
    }
    
    // 3. ANALIZZA STRUTTURA NODI
    console.log('\n📋 3. ANALISI STRUTTURA NODI:');
    console.log('--------------------------------');
    
    // Prendi un workflow con molti nodi
    const complexWorkflow = workflows.find(w => w.name.includes('Flow')) || workflows[0];
    const complexDetail = await axios.get(
      `${process.env.N8N_API_URL}/workflows/${complexWorkflow.id}`, 
      config
    );
    
    if (complexDetail.data.nodes && complexDetail.data.nodes.length > 0) {
      const sampleNode = complexDetail.data.nodes[0];
      console.log('\nCampi di un nodo:');
      Object.entries(sampleNode).forEach(([key, value]) => {
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  - ${key}: [${type}]`);
      });
      
      // Analizza tipi di nodi unici
      const nodeTypes = new Set();
      complexDetail.data.nodes.forEach(node => {
        nodeTypes.add(node.type);
      });
      
      console.log('\nTipi di nodi trovati:');
      Array.from(nodeTypes).sort().forEach(type => {
        console.log(`  • ${type}`);
      });
    }
    
    // 4. ANALIZZA CONNESSIONI
    console.log('\n📋 4. ANALISI STRUTTURA CONNESSIONI:');
    console.log('---------------------------------------');
    
    if (complexDetail.data.connections && Object.keys(complexDetail.data.connections).length > 0) {
      const firstConnection = Object.entries(complexDetail.data.connections)[0];
      console.log('Struttura connessione:');
      console.log(JSON.stringify(firstConnection, null, 2).substring(0, 500));
    }
    
    // 5. ANALIZZA ESECUZIONI
    console.log('\n📋 5. CAMPI DALLE ESECUZIONI (/executions):');
    console.log('----------------------------------------------');
    
    const execResponse = await axios.get(process.env.N8N_API_URL + '/executions?limit=5', config);
    if (execResponse.data.data && execResponse.data.data.length > 0) {
      const sampleExecution = execResponse.data.data[0];
      console.log('\nCampi di una esecuzione:');
      Object.entries(sampleExecution).forEach(([key, value]) => {
        if (key !== 'data') { // Skip data field as it's huge
          const type = Array.isArray(value) ? 'array' : typeof value;
          const preview = type === 'string' ? value.substring(0, 50) : 
                         type === 'object' ? JSON.stringify(value).substring(0, 50) : value;
          console.log(`  - ${key}: [${type}] ${preview}`);
        }
      });
    }
    
    // 6. METADATA E CAMPI SPECIALI
    console.log('\n📋 6. CAMPI SPECIALI E METADATA:');
    console.log('-----------------------------------');
    
    // Cerca workflow con metadata speciali
    for (const w of workflows) {
      const detail = await axios.get(
        `${process.env.N8N_API_URL}/workflows/${w.id}`, 
        config
      );
      
      if (detail.data.meta && Object.keys(detail.data.meta).length > 0) {
        console.log(`\nMetadata trovati in ${w.name}:`);
        console.log(JSON.stringify(detail.data.meta, null, 2));
        break;
      }
    }
    
    // 7. GENERA REPORT
    console.log('\n📊 GENERAZIONE REPORT...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalWorkflows: workflows.length,
      fieldsFound: Array.from(allFields.entries()).map(([name, info]) => ({
        name,
        ...info
      })),
      recommendations: []
    };
    
    // Raccomandazioni per nuovi campi
    const currentDbFields = [
      'id', 'name', 'active', 'is_archived', 'description', 'created_at', 'updated_at',
      'node_count', 'complexity_score', 'execution_count', 'settings', 'static_data'
    ];
    
    report.fieldsFound.forEach(field => {
      if (!currentDbFields.includes(field.name)) {
        report.recommendations.push({
          field: field.name,
          type: field.type,
          reason: 'Campo disponibile nell\'API ma non nel database'
        });
      }
    });
    
    // Salva report
    await fs.writeFile(
      'api-fields-analysis.json', 
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ Report salvato in api-fields-analysis.json');
    console.log(`\n📌 RACCOMANDAZIONI: ${report.recommendations.length} nuovi campi da aggiungere`);
    
    if (report.recommendations.length > 0) {
      console.log('\nCampi mancanti nel database:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec.field} (${rec.type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

analyzeAllApiFields();