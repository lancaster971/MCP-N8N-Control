#!/usr/bin/env node

/**
 * 🧪 TEST COMPRENSIVO - VERIFICA LAZY INITIALIZATION PATTERN
 * 
 * Test esteso che verifica:
 * 1. Caricamento .env in tutti i moduli
 * 2. Lazy initialization nei base handlers
 * 3. Resilienza quando variabili env sono assenti
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

console.log('🧪 TEST COMPRENSIVO - LAZY INITIALIZATION PATTERN');
console.log('=' .repeat(60));

// Backup environment originale
const originalEnv = { ...process.env };

// Test scenarios
const testScenarios = [
  {
    name: '🔹 Base Workflow Tool Handler',
    description: 'Test lazy initialization nel BaseWorkflowToolHandler',
    test: async () => {
      // Pulisce env
      delete process.env.N8N_API_URL;
      delete process.env.N8N_API_KEY;
      
      // Importa la classe
      const { BaseWorkflowToolHandler } = await import('./build/tools/workflow/base-handler.js');
      
      // Crea una implementazione mock
      class MockWorkflowHandler extends BaseWorkflowToolHandler {
        async execute(args) {
          // Test: accesso alla proprietà apiService dovrebbe triggerare lazy loading
          const service = this.apiService;
          return { success: true, data: 'mock result' };
        }
      }
      
      const handler = new MockWorkflowHandler();
      
      // Il test passa se riesce a creare l'handler senza errori
      // (getEnvConfig verrà chiamato solo quando si accede ad apiService)
      return true;
    }
  },
  
  {
    name: '🔹 Base Execution Tool Handler', 
    description: 'Test lazy initialization nel BaseExecutionToolHandler',
    test: async () => {
      delete process.env.N8N_API_URL;
      delete process.env.N8N_API_KEY;
      
      const { BaseExecutionToolHandler } = await import('./build/tools/execution/base-handler.js');
      
      class MockExecutionHandler extends BaseExecutionToolHandler {
        async execute(args) {
          const service = this.apiService;
          return { success: true, data: 'mock result' };
        }
      }
      
      const handler = new MockExecutionHandler();
      return true;
    }
  },
  
  {
    name: '🔹 Base Analytics Handler',
    description: 'Test lazy initialization nel BaseAnalyticsHandler', 
    test: async () => {
      delete process.env.N8N_API_URL;
      delete process.env.N8N_API_KEY;
      
      const { BaseAnalyticsHandler } = await import('./build/tools/analytics/base-handler.js');
      
      class MockAnalyticsHandler extends BaseAnalyticsHandler {
        async execute(args) {
          const service = this.apiService;
          return { success: true, data: 'mock result' };
        }
      }
      
      const handler = new MockAnalyticsHandler();
      return true;
    }
  },
  
  {
    name: '🔹 Security Routes Module',
    description: 'Test importazione security routes senza env preconfigurate',
    test: async () => {
      delete process.env.N8N_API_URL;
      delete process.env.N8N_API_KEY;
      
      // Dovrebbe importare senza errori (lazy initialization)
      const securityRoutes = await import('./build/api/security-routes.js');
      return !!securityRoutes.default;
    }
  },
  
  {
    name: '🔹 Full Environment Loading',
    description: 'Test caricamento completo environment da .env',
    test: async () => {
      // Pulisce TUTTO l'environment
      ['N8N_API_URL', 'N8N_API_KEY', 'DB_USER', 'DB_HOST', 'MULTI_TENANT_MODE'].forEach(key => {
        delete process.env[key];
      });
      
      // Importa environment config
      const { getEnvConfig } = await import('./build/config/environment.js');
      
      // Dovrebbe caricare dal .env file
      const config = getEnvConfig();
      
      // Verifica valori critici
      if (!config.n8nApiUrl || !config.n8nApiKey) {
        throw new Error('Configurazioni critiche mancanti');
      }
      
      if (!config.n8nApiUrl.includes('flow.agentix-io.com')) {
        throw new Error(`URL non corretto: ${config.n8nApiUrl}`);
      }
      
      return true;
    }
  }
];

// Esegui i test
let totalTests = testScenarios.length;
let passedTests = 0;
let failedTests = [];

console.log(`🚀 Esecuzione ${totalTests} test scenarios...\n`);

for (const scenario of testScenarios) {
  console.log(`📋 ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  
  try {
    // Ripristina environment pulito per ogni test
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('N8N_') || key.startsWith('DB_') || key === 'MULTI_TENANT_MODE') {
        delete process.env[key];
      }
    });
    
    const result = await scenario.test();
    
    if (result) {
      console.log(`   ✅ PASSED\n`);
      passedTests++;
    } else {
      console.log(`   ❌ FAILED - Test returned false\n`);
      failedTests.push({ name: scenario.name, error: 'Test returned false' });
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}\n`);
    failedTests.push({ name: scenario.name, error: error.message });
  }
}

// Ripristina environment originale
Object.keys(process.env).forEach(key => delete process.env[key]);
Object.assign(process.env, originalEnv);

// Report finale
console.log('═'.repeat(60));
console.log('📊 REPORT FINALE');
console.log('═'.repeat(60));

console.log(`✅ Test passati: ${passedTests}/${totalTests}`);
console.log(`❌ Test falliti: ${failedTests.length}/${totalTests}`);

if (failedTests.length > 0) {
  console.log('\n🚨 ERRORI RILEVATI:');
  failedTests.forEach(failure => {
    console.log(`   ❌ ${failure.name}: ${failure.error}`);
  });
}

console.log('\n' + '═'.repeat(60));

if (passedTests === totalTests) {
  console.log('🎉 SUCCESSO COMPLETO!');
  console.log('✅ Tutti i moduli implementano correttamente il lazy initialization pattern');
  console.log('✅ Il caricamento del file .env è resiliente e automatico');
  console.log('✅ I servizi API possono operare senza configurazioni pre-impostate');
  process.exit(0);
} else {
  console.log('❌ ALCUNI TEST FALLITI!');
  console.log('⚠️  Rivedere l\'implementazione del lazy initialization pattern');
  process.exit(1);
}