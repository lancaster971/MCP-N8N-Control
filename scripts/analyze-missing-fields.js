#!/usr/bin/env node

/**
 * Analizza campi mancanti confrontando API con database attuale
 */

import dotenv from 'dotenv';
dotenv.config();

import { DatabaseConnection } from '../build/database/connection.js';

async function analyzeMissingFields() {
  console.log('🔍 ANALISI CAMPI MANCANTI NEL DATABASE\n');
  console.log('=====================================\n');
  
  const db = DatabaseConnection.getInstance();
  await db.connect();
  
  // Campi identificati dall'API
  const apiWorkflowFields = [
    'id', 'name', 'active', 'isArchived', 'createdAt', 'updatedAt',
    'nodes', 'connections', 'settings', 'staticData', 'meta', 'pinData',
    'versionId', 'triggerCount', 'tags', 'shared', 'description'
  ];
  
  const apiExecutionFields = [
    'id', 'finished', 'mode', 'retryOf', 'retrySuccessId', 'startedAt',
    'stoppedAt', 'workflowId', 'waitTill', 'status', 'data', 'workflowData',
    'errorMessage', 'errorNodeId', 'errorNodeType'
  ];
  
  const apiNodeFields = [
    'id', 'name', 'type', 'typeVersion', 'position', 'parameters',
    'credentials', 'disabled', 'notes', 'color', 'continueOnFail',
    'executeOnce', 'notesInFlow', 'webhookId'
  ];
  
  // Query per ottenere colonne attuali
  const workflowColumns = await db.getMany(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'workflows'
    ORDER BY column_name
  `);
  
  const executionColumns = await db.getMany(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'executions'
    ORDER BY column_name
  `);
  
  const nodeColumns = await db.getMany(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'workflow_nodes'
    ORDER BY column_name
  `);
  
  // Mappa colonne esistenti
  const existingWorkflowFields = workflowColumns.map(c => c.column_name);
  const existingExecutionFields = executionColumns.map(c => c.column_name);
  const existingNodeFields = nodeColumns.map(c => c.column_name);
  
  console.log('📊 TABELLA WORKFLOWS');
  console.log('--------------------');
  console.log(`Campi nel DB: ${existingWorkflowFields.length}`);
  console.log(`Campi dall'API: ${apiWorkflowFields.length}`);
  
  // Mappa nomi campi API a nomi DB
  const fieldMapping = {
    'isArchived': 'is_archived',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'staticData': 'static_data',
    'pinData': 'pinned_data',
    'versionId': 'version_id',
    'triggerCount': 'trigger_count'
  };
  
  const missingWorkflowFields = [];
  for (const apiField of apiWorkflowFields) {
    const dbField = fieldMapping[apiField] || apiField.toLowerCase();
    if (!existingWorkflowFields.includes(dbField)) {
      missingWorkflowFields.push({ api: apiField, db: dbField });
    }
  }
  
  if (missingWorkflowFields.length > 0) {
    console.log('\n❌ Campi mancanti:');
    missingWorkflowFields.forEach(f => {
      console.log(`   - ${f.api} (dovrebbe essere: ${f.db})`);
    });
  } else {
    console.log('✅ Tutti i campi API sono presenti!');
  }
  
  // Campi extra nel DB non dall'API
  const extraFields = existingWorkflowFields.filter(f => {
    const apiName = Object.entries(fieldMapping).find(([api, db]) => db === f)?.[0] || f;
    return !apiWorkflowFields.includes(apiName) && 
           !['complexity_score', 'reliability_score', 'efficiency_score', 'health_score',
             'execution_count', 'success_count', 'failure_count', 'avg_duration_ms',
             'min_duration_ms', 'max_duration_ms', 'last_execution_at', 'last_success_at',
             'last_failure_at', 'node_count', 'connection_count', 'unique_node_types',
             'project_id', 'owner_email', 'workflow_type', 'has_error_handler',
             'ai_node_count', 'database_node_count', 'http_node_count', 'modified_by',
             'template_id', 'is_latest'].includes(f);
  });
  
  if (extraFields.length > 0) {
    console.log('\n📌 Campi calcolati/extra nel DB:');
    console.log(`   ${extraFields.join(', ')}`);
  }
  
  console.log('\n📊 TABELLA EXECUTIONS');
  console.log('---------------------');
  console.log(`Campi nel DB: ${existingExecutionFields.length}`);
  console.log(`Campi dall'API: ${apiExecutionFields.length}`);
  
  const executionMapping = {
    'retryOf': 'retry_of',
    'retrySuccessId': 'retry_success_id',
    'startedAt': 'started_at',
    'stoppedAt': 'stopped_at',
    'workflowId': 'workflow_id',
    'waitTill': 'wait_till',
    'errorMessage': 'error_message',
    'errorNodeId': 'error_node_id',
    'errorNodeType': 'error_node_type',
    'workflowData': 'workflow_data'
  };
  
  const missingExecutionFields = [];
  for (const apiField of apiExecutionFields) {
    const dbField = executionMapping[apiField] || apiField.toLowerCase();
    if (!existingExecutionFields.includes(dbField)) {
      missingExecutionFields.push({ api: apiField, db: dbField });
    }
  }
  
  if (missingExecutionFields.length > 0) {
    console.log('\n❌ Campi mancanti:');
    missingExecutionFields.forEach(f => {
      console.log(`   - ${f.api} (dovrebbe essere: ${f.db})`);
    });
  } else {
    console.log('✅ Tutti i campi API sono presenti!');
  }
  
  // Genera SQL per campi mancanti
  console.log('\n📝 SQL PER AGGIUNGERE CAMPI MANCANTI:');
  console.log('--------------------------------------\n');
  
  if (missingWorkflowFields.length > 0) {
    console.log('-- Workflows');
    missingWorkflowFields.forEach(f => {
      let sqlType = 'TEXT';
      if (f.api === 'nodes' || f.api === 'connections') sqlType = 'JSONB';
      if (f.api === 'tags') sqlType = 'JSONB';
      console.log(`ALTER TABLE workflows ADD COLUMN IF NOT EXISTS ${f.db} ${sqlType};`);
    });
    console.log('');
  }
  
  if (missingExecutionFields.length > 0) {
    console.log('-- Executions');
    missingExecutionFields.forEach(f => {
      let sqlType = 'TEXT';
      if (f.api === 'data' || f.api === 'workflowData') sqlType = 'JSONB';
      if (f.api.includes('Time') || f.api.includes('At')) sqlType = 'BIGINT';
      console.log(`ALTER TABLE executions ADD COLUMN IF NOT EXISTS ${f.db} ${sqlType};`);
    });
  }
  
  console.log('\n✅ Analisi completata!');
  
  await db.disconnect();
}

analyzeMissingFields().catch(console.error);