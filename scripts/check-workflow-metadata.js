#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function checkWorkflowMetadata() {
  try {
    const config = {
      headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
    };
    
    // Prendi tutti i workflow
    const response = await axios.get(process.env.N8N_API_URL + '/workflows', config);
    const workflows = response.data.data;
    
    console.log('\n📊 ANALISI COMPLETA WORKFLOW N8N:');
    console.log('===================================');
    console.log(`Totale workflow via API: ${workflows.length}`);
    console.log(`Workflow visibili nell'UI: 49`);
    console.log(`Workflow archiviati (nascosti): ${workflows.length - 49}`);
    
    // Prendi un workflow dettagliato per vedere tutti i campi
    if (workflows.length > 0) {
      const detailResponse = await axios.get(
        `${process.env.N8N_API_URL}/workflows/${workflows[0].id}`, 
        config
      );
      
      console.log('\n📋 CAMPI DISPONIBILI NEL WORKFLOW:');
      const sampleWorkflow = detailResponse.data;
      const fields = Object.keys(sampleWorkflow).filter(k => 
        !['nodes', 'connections', 'settings', 'staticData', 'pinData'].includes(k)
      );
      
      fields.forEach(field => {
        const value = sampleWorkflow[field];
        console.log(`  - ${field}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
      });
      
      // Controlla se c'è un campo meta o archived
      if (sampleWorkflow.meta) {
        console.log('\n🏷️ METADATA TROVATI:');
        console.log(JSON.stringify(sampleWorkflow.meta, null, 2));
      }
      
      // Analizza tutti i workflow per pattern
      console.log('\n🔍 ANALISI STATI E METADATI:');
      
      const states = {};
      workflows.forEach(w => {
        // Controlla vari possibili indicatori di archiviazione
        const key = `active:${w.active}|versionId:${w.versionId}|meta:${!!w.meta}`;
        states[key] = (states[key] || 0) + 1;
      });
      
      Object.entries(states).forEach(([key, count]) => {
        console.log(`  ${key}: ${count} workflow`);
      });
      
    }
    
  } catch (error) {
    console.error('Errore:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkWorkflowMetadata();