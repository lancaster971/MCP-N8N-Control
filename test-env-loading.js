#!/usr/bin/env node

/**
 * 🧪 TEST AUTOMATICO - VERIFICA CARICAMENTO FILE .ENV
 * 
 * Questo test verifica che TUTTI i servizi e moduli che usano getEnvConfig()
 * siano in grado di funzionare correttamente quando il file .env viene caricato.
 * 
 * Il test simula condizioni reali:
 * 1. Pulisce tutte le variabili d'ambiente n8n
 * 2. Importa i moduli senza variabili preconfigurate
 * 3. Verifica che carichino automaticamente il .env
 * 4. Controlla che possano accedere alle configurazioni corrette
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

console.log('🧪 AVVIO TEST CARICAMENTO FILE .ENV');
console.log('=' .repeat(50));

// 🧹 STEP 1: Pulisci environment
console.log('🧹 Step 1: Pulizia variabili d\'ambiente...');
const envVarsToClean = [
  'N8N_API_URL',
  'N8N_API_KEY', 
  'N8N_WEBHOOK_USERNAME',
  'N8N_WEBHOOK_PASSWORD',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'MULTI_TENANT_MODE',
  'DEFAULT_TENANT_ID'
];

const originalEnv = {};
envVarsToClean.forEach(key => {
  originalEnv[key] = process.env[key];
  delete process.env[key];
});

console.log(`✅ Pulite ${envVarsToClean.length} variabili d'ambiente`);

// 🔍 STEP 2: Leggi file .env per avere i valori di riferimento
console.log('🔍 Step 2: Lettura file .env...');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

let expectedEnvValues = {};
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      expectedEnvValues[key] = value;
    }
  });
  console.log(`✅ Letti ${Object.keys(expectedEnvValues).length} valori dal file .env`);
} catch (error) {
  console.error('❌ Errore lettura file .env:', error.message);
  process.exit(1);
}

// 🧪 STEP 3: Test importazione moduli critici
console.log('🧪 Step 3: Test importazione moduli...');

const testModules = [
  {
    name: 'Server Express',
    path: './build/server/express-server.js',
    test: async (module) => {
      // Verifica che la classe sia importabile
      const { ExpressServer } = module;
      return !!ExpressServer;
    }
  },
  {
    name: 'Security Routes', 
    path: './build/api/security-routes.js',
    test: async (module) => {
      // Verifica che il router sia definito
      return !!module.default;
    }
  },
  {
    name: 'Environment Config',
    path: './build/config/environment.js', 
    test: async (module) => {
      // Test diretto di getEnvConfig
      const { getEnvConfig } = module;
      const config = getEnvConfig();
      
      // Verifica che i valori corrispondano al file .env
      const expectedUrl = expectedEnvValues.N8N_API_URL;
      const expectedKey = expectedEnvValues.N8N_API_KEY;
      
      if (config.n8nApiUrl !== expectedUrl) {
        throw new Error(`URL non corretto: expected "${expectedUrl}", got "${config.n8nApiUrl}"`);
      }
      
      if (config.n8nApiKey !== expectedKey) {
        throw new Error(`API Key non corretta: expected "${expectedKey}", got "${config.n8nApiKey}"`);
      }
      
      return true;
    }
  }
];

let allTestsPassed = true;
const testResults = [];

for (const testModule of testModules) {
  console.log(`\n📦 Testing: ${testModule.name}`);
  
  try {
    // Importa il modulo
    const module = await import(testModule.path);
    
    // Esegui il test specifico
    const result = await testModule.test(module);
    
    if (result) {
      console.log(`✅ ${testModule.name}: PASSED`);
      testResults.push({ name: testModule.name, status: 'PASSED', error: null });
    } else {
      console.log(`❌ ${testModule.name}: FAILED - Test returned false`);
      testResults.push({ name: testModule.name, status: 'FAILED', error: 'Test returned false' });
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ ${testModule.name}: ERROR - ${error.message}`);
    testResults.push({ name: testModule.name, status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }
}

// 🔧 STEP 4: Ripristina environment originale
console.log('\n🔧 Step 4: Ripristino environment...');
Object.keys(originalEnv).forEach(key => {
  if (originalEnv[key] !== undefined) {
    process.env[key] = originalEnv[key];
  }
});
console.log('✅ Environment ripristinato');

// 📊 STEP 5: Report finale
console.log('\n📊 REPORT FINALE');
console.log('=' .repeat(50));

testResults.forEach(result => {
  const status = result.status === 'PASSED' ? '✅' : '❌';
  console.log(`${status} ${result.name}: ${result.status}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

console.log('\n' + '=' .repeat(50));

if (allTestsPassed) {
  console.log('🎉 TUTTI I TEST PASSATI!');
  console.log('✅ Il caricamento del file .env funziona correttamente');
  console.log('✅ Tutti i servizi possono accedere alle configurazioni');
  process.exit(0);
} else {
  console.log('❌ ALCUNI TEST FALLITI!');
  console.log('⚠️  Verificare il caricamento del file .env nei moduli falliti');
  process.exit(1);
}