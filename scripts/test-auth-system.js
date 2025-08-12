#!/usr/bin/env node

/**
 * Test Authentication System
 * 
 * Questo script testa il sistema di autenticazione JWT
 */

import dotenv from 'dotenv';
dotenv.config();

class AuthSystemTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.adminToken = null;
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  async runAllTests() {
    console.log('🔐 TEST AUTHENTICATION SYSTEM');
    console.log('='.repeat(50));
    
    try {
      // 1. Test login con utente admin default
      await this.testAdminLogin();
      
      // 2. Test profile endpoint
      if (this.adminToken) {
        await this.testProfile();
        
        // 3. Test endpoint protetti
        await this.testProtectedEndpoints();
        
        // 4. Test gestione utenti
        await this.testUserManagement();
      }
      
      // 5. Test autenticazione con API Key
      await this.testApiKeyAuth();
      
      // Report finale
      this.generateReport();
      
      console.log('\n✅ Test sistema autenticazione completati!');
      
    } catch (error) {
      console.error(`❌ Errore durante test: ${error.message}`);
      throw error;
    }
  }

  async testAdminLogin() {
    console.log('\n👤 Test login admin...');
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@n8n-mcp.local',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      
      const passed = response.ok && data.token && data.user;
      
      if (passed) {
        this.adminToken = data.token;
        console.log(`   ✅ Login successful`);
        console.log(`   User: ${data.user.email} (${data.user.role})`);
        console.log(`   Permissions: ${data.user.permissions.length}`);
        console.log(`   Token: ${data.token.substring(0, 20)}...`);
      } else {
        console.log(`   ❌ Login failed: ${data.message}`);
      }
      
      this.addTestResult('Admin login', passed, 
        passed ? `${data.user?.email} (${data.user?.role})` : data.message);
      
    } catch (error) {
      console.error('   ❌ Errore login:', error.message);
      this.addTestResult('Admin login', false, error.message);
    }
  }

  async testProfile() {
    console.log('\n👤 Test profile endpoint...');
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      });
      
      const data = await response.json();
      
      const passed = response.ok && data.user && data.user.email;
      
      console.log(`   Status: ${response.status}`);
      if (passed) {
        console.log(`   Email: ${data.user.email}`);
        console.log(`   Role: ${data.user.role}`);
        console.log(`   Permissions: ${data.user.permissions.length}`);
      }
      
      this.addTestResult('Profile endpoint', passed, 
        passed ? `${data.user?.email}` : data.message);
      
    } catch (error) {
      console.error('   ❌ Errore profile:', error.message);
      this.addTestResult('Profile endpoint', false, error.message);
    }
  }

  async testProtectedEndpoints() {
    console.log('\n🔒 Test endpoint protetti...');
    
    const endpoints = [
      { url: '/api/scheduler/start', method: 'POST', permission: 'scheduler:control' },
      { url: '/api/tenants', method: 'GET', permission: 'tenants:read' },
      { url: '/auth/users', method: 'GET', permission: 'users:read' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          },
          ...(endpoint.method === 'POST' && { body: JSON.stringify({}) })
        });

        const passed = response.status !== 401 && response.status !== 403;
        
        console.log(`   ${endpoint.method} ${endpoint.url}: ${response.status} ${passed ? '✅' : '❌'}`);
        
        this.addTestResult(`Protected ${endpoint.url}`, passed, 
          `Status: ${response.status}, Permission: ${endpoint.permission}`);
        
      } catch (error) {
        console.log(`   ${endpoint.method} ${endpoint.url}: Error ❌`);
        this.addTestResult(`Protected ${endpoint.url}`, false, error.message);
      }
    }
  }

  async testUserManagement() {
    console.log('\n👥 Test gestione utenti...');
    
    try {
      // Test lista utenti
      const listResponse = await fetch(`${this.baseUrl}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      });
      
      const listData = await listResponse.json();
      
      const listPassed = listResponse.ok && Array.isArray(listData.users);
      
      console.log(`   Lista utenti: ${listResponse.status} ${listPassed ? '✅' : '❌'}`);
      if (listPassed) {
        console.log(`   Utenti trovati: ${listData.total}`);
      }
      
      this.addTestResult('Lista utenti', listPassed, 
        listPassed ? `${listData.total} utenti` : listData.message);
      
      // Test creazione nuovo utente readonly
      const createResponse = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123',
          role: 'readonly'
        })
      });
      
      const createData = await createResponse.json();
      
      const createPassed = createResponse.ok && createData.user;
      
      console.log(`   Creazione utente: ${createResponse.status} ${createPassed ? '✅' : '❌'}`);
      if (createPassed) {
        console.log(`   Nuovo utente: ${createData.user.email} (${createData.user.role})`);
      }
      
      this.addTestResult('Creazione utente', createPassed, 
        createPassed ? `${createData.user?.email}` : createData.message);
      
    } catch (error) {
      console.error('   ❌ Errore gestione utenti:', error.message);
      this.addTestResult('Gestione utenti', false, error.message);
    }
  }

  async testApiKeyAuth() {
    console.log('\n🔑 Test autenticazione API Key...');
    
    try {
      // Prima otteniamo l'API key dell'admin
      const profileResponse = await fetch(`${this.baseUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Cannot get admin profile');
      }
      
      const profileData = await profileResponse.json();
      const adminApiKey = profileData.user.apiKey;
      
      if (!adminApiKey) {
        console.log('   ⚠️ Admin non ha API Key, skip test');
        return;
      }
      
      // Test endpoint con API Key
      const apiKeyResponse = await fetch(`${this.baseUrl}/api/scheduler/status`, {
        headers: {
          'X-API-Key': adminApiKey
        }
      });
      
      const passed = apiKeyResponse.ok;
      
      console.log(`   API Key auth: ${apiKeyResponse.status} ${passed ? '✅' : '❌'}`);
      console.log(`   API Key: ${adminApiKey.substring(0, 16)}...`);
      
      this.addTestResult('API Key authentication', passed, 
        `Status: ${apiKeyResponse.status}`);
      
    } catch (error) {
      console.error('   ❌ Errore API Key auth:', error.message);
      this.addTestResult('API Key authentication', false, error.message);
    }
  }

  addTestResult(name, passed, details) {
    this.testResults.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
    
    this.testResults.summary.totalTests++;
    if (passed) {
      this.testResults.summary.passedTests++;
    } else {
      this.testResults.summary.failedTests++;
    }
  }

  generateReport() {
    const successRate = Math.round((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT TEST AUTHENTICATION SYSTEM');
    console.log('='.repeat(60));
    console.log(`🧪 Test totali: ${this.testResults.summary.totalTests}`);
    console.log(`✅ Test passati: ${this.testResults.summary.passedTests}`);
    console.log(`❌ Test falliti: ${this.testResults.summary.failedTests}`);
    console.log(`📈 Success rate: ${successRate}%`);
    
    if (this.testResults.summary.failedTests > 0) {
      console.log('\n❌ Test falliti:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }
    
    if (successRate >= 80) {
      console.log('\n🎉 SISTEMA AUTENTICAZIONE FUNZIONANTE!');
      console.log('\n📋 Credenziali default:');
      console.log('   Email: admin@n8n-mcp.local');
      console.log('   Password: admin123');
      console.log('   Ruolo: admin (accesso completo)');
    } else {
      console.log('\n⚠️ Sistema autenticazione richiede correzioni');
    }
  }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const tester = new AuthSystemTester();
  
  try {
    console.log('🚀 Avvio test sistema autenticazione...');
    console.log('NOTA: Assicurati che il server API sia in esecuzione su localhost:3001');
    console.log('Puoi avviarlo con: node build/server/express-server.js\n');
    
    await tester.runAllTests();
    
  } catch (error) {
    console.error('💥 Test fallito:', error.message);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AuthSystemTester };