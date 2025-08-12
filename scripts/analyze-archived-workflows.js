#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function analyzeArchivedWorkflows() {
  try {
    const config = {
      headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
    };
    
    // Prendi tutti i workflow
    const response = await axios.get(process.env.N8N_API_URL + '/workflows', config);
    const workflows = response.data.data;
    
    // Conta per stato
    let active = 0;
    let inactive = 0;
    let archived = 0;
    let activeArchived = 0;
    
    const archivedWorkflows = [];
    const visibleWorkflows = [];
    
    for (const w of workflows) {
      // Prendi dettagli completi per ogni workflow
      const detailResponse = await axios.get(
        `${process.env.N8N_API_URL}/workflows/${w.id}`, 
        config
      );
      const detail = detailResponse.data;
      
      if (detail.isArchived) {
        archived++;
        archivedWorkflows.push({
          id: detail.id,
          name: detail.name,
          active: detail.active,
          isArchived: detail.isArchived
        });
        if (detail.active) activeArchived++;
      } else {
        visibleWorkflows.push({
          id: detail.id,
          name: detail.name,
          active: detail.active,
          isArchived: detail.isArchived || false
        });
      }
      
      if (detail.active) active++;
      else inactive++;
    }
    
    console.log('\n📊 ANALISI COMPLETA STATO WORKFLOW:');
    console.log('=====================================');
    console.log(`Totale workflow via API: ${workflows.length}`);
    console.log(`├─ Attivi: ${active}`);
    console.log(`└─ Inattivi: ${inactive}`);
    console.log('');
    console.log(`Workflow VISIBILI nell'UI: ${visibleWorkflows.length}`);
    console.log(`├─ Attivi: ${visibleWorkflows.filter(w => w.active).length}`);
    console.log(`└─ Inattivi: ${visibleWorkflows.filter(w => !w.active).length}`);
    console.log('');
    console.log(`Workflow ARCHIVIATI: ${archived}`);
    console.log(`├─ Attivi (archiviati ma attivi): ${activeArchived}`);
    console.log(`└─ Inattivi: ${archived - activeArchived}`);
    
    if (archivedWorkflows.length > 0) {
      console.log('\n📦 WORKFLOW ARCHIVIATI:');
      archivedWorkflows.slice(0, 5).forEach(w => {
        console.log(`  - ${w.id}: ${w.name} (active: ${w.active})`);
      });
      if (archivedWorkflows.length > 5) {
        console.log(`  ... e altri ${archivedWorkflows.length - 5} workflow archiviati`);
      }
    }
    
  } catch (error) {
    console.error('Errore:', error.message);
  }
}

analyzeArchivedWorkflows();