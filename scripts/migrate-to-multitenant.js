#!/usr/bin/env node

/**
 * Script di Migrazione: Da Schema Singolo a Multi-Tenant
 * 
 * Questo script migra i dati esistenti dal schema "single-tenant" attuale 
 * al nuovo schema multi-tenant con JSONB storage, preservando tutti i dati.
 */

import dotenv from 'dotenv';
dotenv.config();

import { DatabaseConnection } from '../build/database/connection.js';
import fs from 'fs/promises';

class MultiTenantMigration {
  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.migrationStats = {
      startTime: new Date(),
      endTime: null,
      workflowsMigrated: 0,
      executionsMigrated: 0,
      errors: []
    };
  }

  async migrate() {
    console.log('🔄 MIGRAZIONE A MULTI-TENANT');
    console.log('='.repeat(50));
    
    try {
      await this.db.connect();
      
      // 1. Verifica prerequisiti
      await this.verifyPrerequisites();
      
      // 2. Esegui migrazione schema
      await this.runSchemaMigration();
      
      // 3. Crea tenant di default
      const defaultTenantId = await this.createDefaultTenant();
      
      // 4. Migra dati esistenti
      await this.migrateExistingData(defaultTenantId);
      
      // 5. Verifica migrazione
      await this.verifyMigration(defaultTenantId);
      
      // 6. Genera report
      await this.generateMigrationReport();
      
      console.log('\n✅ Migrazione completata con successo!');
      
    } catch (error) {
      console.error(`❌ Errore durante migrazione: ${error.message}`);
      this.migrationStats.errors.push(error.message);
      throw error;
    } finally {
      await this.db.disconnect();
      this.migrationStats.endTime = new Date();
    }
  }

  /**
   * Verifica che tutto sia pronto per la migrazione
   */
  async verifyPrerequisites() {
    console.log('\n🔍 Verifica prerequisiti...');
    
    // Verifica connessione database
    const result = await this.db.getOne('SELECT version() as version');
    console.log(`✓ Database connesso: PostgreSQL ${result.version.split(' ')[1]}`);
    
    // Verifica tabelle esistenti
    const tables = await this.db.getMany(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('workflows', 'executions')
      ORDER BY table_name
    `);
    
    if (tables.length < 2) {
      throw new Error('Tabelle workflows/executions non trovate - migrazione non possibile');
    }
    console.log(`✓ Tabelle esistenti: ${tables.map(t => t.table_name).join(', ')}`);
    
    // Conta record da migrare
    const workflowCount = await this.db.getOne('SELECT COUNT(*) as count FROM workflows');
    const executionCount = await this.db.getOne('SELECT COUNT(*) as count FROM executions');
    
    console.log(`✓ Da migrare: ${workflowCount.count} workflows, ${executionCount.count} executions`);
    
    if (parseInt(workflowCount.count) === 0) {
      console.log('⚠️ Nessun workflow da migrare - continuo comunque per setup schema');
    }
  }

  /**
   * Esegue la migrazione schema 005
   */
  async runSchemaMigration() {
    console.log('\n📊 Esecuzione migrazione schema...');
    
    try {
      // Leggi e esegui migrazione 005
      const migrationSQL = await fs.readFile(
        '/Volumes/BK12/Dropbox/Dropbox/TIZIANO/AI/MCP-N8N-Control/src/database/migrations/005_multi_tenant_schema.sql',
        'utf-8'
      );
      
      await this.db.query(migrationSQL);
      console.log('✓ Schema multi-tenant creato');
      
      // Verifica che le tabelle siano state create
      const newTables = await this.db.getMany(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'tenant_%'
        ORDER BY table_name
      `);
      
      console.log(`✓ Tabelle multi-tenant create: ${newTables.length}`);
      newTables.forEach(table => console.log(`   - ${table.table_name}`));
      
    } catch (error) {
      console.error('❌ Errore esecuzione migrazione schema:', error.message);
      throw error;
    }
  }

  /**
   * Crea tenant di default per i dati esistenti
   */
  async createDefaultTenant() {
    console.log('\n🏢 Creazione tenant di default...');
    
    const tenantId = 'default_tenant';
    const tenantName = 'Default Tenant (Legacy Migration)';
    const apiUrl = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
    
    try {
      await this.db.query(`
        INSERT INTO tenants (id, name, n8n_api_url, schema_signature, instance_type)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          updated_at = CURRENT_TIMESTAMP
      `, [tenantId, tenantName, apiUrl, 'legacy_migration', 'unknown']);
      
      console.log(`✓ Tenant creato: ${tenantId}`);
      return tenantId;
      
    } catch (error) {
      console.error('❌ Errore creazione tenant:', error.message);
      throw error;
    }
  }

  /**
   * Migra tutti i dati esistenti usando la stored procedure
   */
  async migrateExistingData(tenantId) {
    console.log('\n📦 Migrazione dati esistenti...');
    
    try {
      // Usa la stored procedure per migrazione atomica
      await this.db.query(`
        SELECT migrate_to_multitenant($1, $2, $3)
      `, [tenantId, 'Default Tenant (Migrated)', process.env.N8N_API_URL]);
      
      console.log('✓ Migrazione dati completata via stored procedure');
      
      // Conta risultati
      const workflowsResult = await this.db.getOne(`
        SELECT COUNT(*) as count FROM tenant_workflows WHERE tenant_id = $1
      `, [tenantId]);
      
      const executionsResult = await this.db.getOne(`
        SELECT COUNT(*) as count FROM tenant_executions WHERE tenant_id = $1
      `, [tenantId]);
      
      this.migrationStats.workflowsMigrated = parseInt(workflowsResult.count);
      this.migrationStats.executionsMigrated = parseInt(executionsResult.count);
      
      console.log(`✓ Migrati: ${this.migrationStats.workflowsMigrated} workflows`);
      console.log(`✓ Migrati: ${this.migrationStats.executionsMigrated} executions`);
      
    } catch (error) {
      console.error('❌ Errore migrazione dati:', error.message);
      this.migrationStats.errors.push(`Data migration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica che la migrazione sia avvenuta correttamente
   */
  async verifyMigration(tenantId) {
    console.log('\n✅ Verifica migrazione...');
    
    try {
      // Verifica tenant
      const tenant = await this.db.getOne(`
        SELECT * FROM tenants WHERE id = $1
      `, [tenantId]);
      
      if (!tenant) {
        throw new Error('Tenant non trovato dopo migrazione');
      }
      console.log(`✓ Tenant verificato: ${tenant.name}`);
      
      // Verifica workflows
      const workflowSample = await this.db.getOne(`
        SELECT id, name, raw_data FROM tenant_workflows 
        WHERE tenant_id = $1 
        LIMIT 1
      `, [tenantId]);
      
      if (workflowSample && this.migrationStats.workflowsMigrated > 0) {
        console.log(`✓ Workflow campione: ${workflowSample.name}`);
        console.log(`✓ JSONB raw_data presente: ${Object.keys(workflowSample.raw_data).length} campi`);
        
        // Verifica campi calcolati
        const calculatedFields = await this.db.getOne(`
          SELECT node_count, has_webhook, is_archived 
          FROM tenant_workflows 
          WHERE tenant_id = $1 AND id = $2
        `, [tenantId, workflowSample.id]);
        
        console.log(`✓ Campi calcolati: node_count=${calculatedFields.node_count}, has_webhook=${calculatedFields.has_webhook}`);
      } else {
        console.log('ℹ️ Nessun workflow campione da verificare');
      }
      
      // Verifica executions
      const executionSample = await this.db.getOne(`
        SELECT id, status, raw_data FROM tenant_executions 
        WHERE tenant_id = $1 
        LIMIT 1
      `, [tenantId]);
      
      if (executionSample && this.migrationStats.executionsMigrated > 0) {
        console.log(`✓ Execution campione: ${executionSample.id} (${executionSample.status})`);
        console.log(`✓ JSONB raw_data presente: ${Object.keys(executionSample.raw_data).length} campi`);
      } else {
        console.log('ℹ️ Nessuna execution campione da verificare');
      }
      
      // Test query JSONB
      const jsonbTest = await this.db.getMany(`
        SELECT 
          id, 
          name,
          raw_data->>'description' as description,
          raw_data->'settings'->>'executionOrder' as execution_order
        FROM tenant_workflows 
        WHERE tenant_id = $1 
        LIMIT 3
      `, [tenantId]);
      
      console.log(`✓ Test query JSONB: ${jsonbTest.length} risultati`);
      
    } catch (error) {
      console.error('❌ Errore verifica migrazione:', error.message);
      this.migrationStats.errors.push(`Verification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera report dettagliato della migrazione
   */
  async generateMigrationReport() {
    console.log('\n📋 Generazione report migrazione...');
    
    const duration = this.migrationStats.endTime - this.migrationStats.startTime;
    const durationSeconds = Math.round(duration / 1000);
    
    const report = {
      timestamp: new Date().toISOString(),
      migration: {
        startTime: this.migrationStats.startTime.toISOString(),
        endTime: this.migrationStats.endTime?.toISOString(),
        durationSeconds,
        success: this.migrationStats.errors.length === 0
      },
      results: {
        workflowsMigrated: this.migrationStats.workflowsMigrated,
        executionsMigrated: this.migrationStats.executionsMigrated,
        totalRecordsMigrated: this.migrationStats.workflowsMigrated + this.migrationStats.executionsMigrated
      },
      errors: this.migrationStats.errors,
      recommendations: [
        'Testare le query JSONB per verificare performance',
        'Configurare backup incrementali',
        'Monitorare utilizzo storage JSONB',
        'Implementare cleanup automatico vecchie executions',
        'Testare API client con nuovo schema'
      ]
    };
    
    const filename = `migration_report_${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(report, null, 2));
    
    console.log(`✓ Report salvato: ${filename}`);
    
    // Report console
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT MIGRAZIONE MULTI-TENANT');
    console.log('='.repeat(60));
    console.log(`⏱️ Durata: ${durationSeconds} secondi`);
    console.log(`📊 Workflows migrati: ${report.results.workflowsMigrated}`);
    console.log(`📊 Executions migrate: ${report.results.executionsMigrated}`);
    console.log(`📊 Totale record: ${report.results.totalRecordsMigrated}`);
    console.log(`❌ Errori: ${report.errors.length}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ Errori riscontrati:');
      report.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n📋 Raccomandazioni post-migrazione:');
    report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    
    return report;
  }

  /**
   * Rollback della migrazione (emergenza)
   */
  async rollback() {
    console.log('\n⚠️ ROLLBACK MIGRAZIONE');
    console.log('='.repeat(40));
    
    try {
      await this.db.connect();
      
      console.log('🗑️ Eliminazione tabelle multi-tenant...');
      
      const tablesToDrop = [
        'tenant_sync_logs',
        'tenant_schema_discoveries', 
        'tenant_executions',
        'tenant_workflows',
        'tenants'
      ];
      
      for (const table of tablesToDrop) {
        try {
          await this.db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
          console.log(`✓ Eliminata: ${table}`);
        } catch (error) {
          console.log(`⚠️ Errore eliminazione ${table}: ${error.message}`);
        }
      }
      
      console.log('✅ Rollback completato - schema ripristinato');
      
    } catch (error) {
      console.error('❌ Errore durante rollback:', error.message);
      throw error;
    } finally {
      await this.db.disconnect();
    }
  }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  const args = process.argv.slice(2);
  const migration = new MultiTenantMigration();
  
  try {
    if (args.includes('--rollback')) {
      console.log('⚠️ MODALITÀ ROLLBACK - Annullerà la migrazione multi-tenant');
      console.log('Continuare? (Ctrl+C per annullare)');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await migration.rollback();
      
    } else {
      console.log('🚀 Avvio migrazione multi-tenant...');
      console.log('Questa operazione modificherà la struttura del database.');
      console.log('Assicurarsi di aver fatto un backup!');
      
      if (!args.includes('--force')) {
        console.log('\nContinuare? (Ctrl+C per annullare, o usa --force per saltare)');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      await migration.migrate();
    }
    
  } catch (error) {
    console.error('💥 Migrazione fallita:', error.message);
    console.error('\n🔧 Opzioni di recovery:');
    console.error('   - Ripristinare backup database');
    console.error('   - Eseguire rollback: node migrate-to-multitenant.js --rollback');
    console.error('   - Correggere errore e riprovare');
    
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MultiTenantMigration };