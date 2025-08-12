#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function checkWorkflowStates() {
  try {
    const config = {
      headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
    };
    
    const response = await axios.get(process.env.N8N_API_URL + '/workflows', config);
    const workflows = response.data.data;
    
    const active = workflows.filter(w => w.active).length;
    const inactive = workflows.filter(w => !w.active).length;
    
    console.log('\n📊 STATO WORKFLOW DALL\'API N8N:');
    console.log('================================');
    console.log(`Totali: ${workflows.length}`);
    console.log(`Attivi: ${active} (${(active * 100 / workflows.length).toFixed(1)}%)`);
    console.log(`Inattivi: ${inactive} (${(inactive * 100 / workflows.length).toFixed(1)}%)`);
    
    // Mostra alcuni esempi
    console.log('\nEsempi workflow ATTIVI:');
    workflows.filter(w => w.active).slice(0, 3).forEach(w => {
      console.log(`  - ${w.id}: ${w.name}`);
    });
    
    console.log('\nEsempi workflow INATTIVI:');
    workflows.filter(w => !w.active).slice(0, 3).forEach(w => {
      console.log(`  - ${w.id}: ${w.name}`);
    });
    
  } catch (error) {
    console.error('Errore:', error.message);
  }
}

checkWorkflowStates();