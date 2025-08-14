/**
 * Mono-Tenant Sync Service - ROBUSTO E AFFIDABILE
 * 
 * Sistema di sincronizzazione diretta n8n -> PostgreSQL
 * Con tracking modifiche, retry logic e logging completo
 */

import 'dotenv/config';

export interface SyncResult {
  workflowsSynced: number;
  executionsSynced: number;
  workflowsUpdated: number;
  executionsUpdated: number;
  errors: string[];
  warnings: string[];
  timestamp: string;
  duration: number;
}

export interface SyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
  forceRefresh?: boolean;
}

export class MonoSyncService {
  private apiUrl: string;
  private apiKey: string;
  private db: any;
  private defaultOptions: SyncOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    batchSize: 50,
    forceRefresh: false
  };

  constructor(db: any) {
    // SEMPRE dal .env - GARANTITO
    this.apiUrl = process.env.N8N_API_URL!;
    this.apiKey = process.env.N8N_API_KEY!;
    this.db = db;
    
    if (!this.apiUrl || !this.apiKey) {
      throw new Error(`❌ CRITICAL: Missing .env credentials! N8N_API_URL=${!!this.apiUrl} N8N_API_KEY=${!!this.apiKey}`);
    }
    
    console.log(`✅ MonoSync initialized - API: ${this.apiUrl}`);
  }

  /**
   * Sync completo ROBUSTO E AFFIDABILE
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    
    const result: SyncResult = {
      workflowsSynced: 0,
      executionsSynced: 0,
      workflowsUpdated: 0,
      executionsUpdated: 0,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
      duration: 0
    };

    console.log(`🚀 ROBUST SYNC START - API: ${this.apiUrl} | Force: ${opts.forceRefresh} | Retries: ${opts.maxRetries}`);
    
    try {
      // 1. SYNC WORKFLOWS con retry logic
      const workflowResult = await this.syncWorkflowsRobust(opts);
      result.workflowsSynced = workflowResult.synced;
      result.workflowsUpdated = workflowResult.updated;
      result.warnings.push(...workflowResult.warnings);
      
      // 2. SYNC EXECUTIONS con retry logic  
      const executionResult = await this.syncExecutionsRobust(opts);
      result.executionsSynced = executionResult.synced;
      result.executionsUpdated = executionResult.updated;
      result.warnings.push(...executionResult.warnings);
      
      result.duration = Date.now() - startTime;
      
      console.log(`✅ ROBUST SYNC SUCCESS: ${result.workflowsSynced}w (${result.workflowsUpdated} updated), ${result.executionsSynced}e (${result.executionsUpdated} updated) in ${result.duration}ms`);
      
    } catch (error) {
      result.duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown sync error';
      result.errors.push(message);
      console.error(`❌ ROBUST SYNC FAILED after ${result.duration}ms:`, message);
    }

    return result;
  }

  /**
   * SYNC WORKFLOWS ROBUSTO con tracking modifiche
   */
  private async syncWorkflowsRobust(options: SyncOptions): Promise<{synced: number, updated: number, warnings: string[]}> {
    const warnings: string[] = [];
    let synced = 0;
    let updated = 0;
    
    try {
      const workflows = await this.fetchWithRetry(`${this.apiUrl}/workflows`, options);
      
      for (const workflow of workflows) {
        try {
          const changeResult = await this.syncSingleWorkflow(workflow, options.forceRefresh);
          if (changeResult.synced) synced++;
          if (changeResult.updated) updated++;
        } catch (error) {
          const msg = `❌ Workflow ${workflow.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          warnings.push(msg);
          console.warn(msg);
        }
      }
      
      console.log(`✅ Workflows: ${synced} synced, ${updated} updated, ${warnings.length} errors`);
      
      // POST-PROCESSING: Deriva statistiche workflow da executions
      console.log(`🔄 Starting workflows post-processing...`);
      const workflowPostProcessResult = await this.postProcessWorkflows();
      console.log(`✅ Workflows post-processing completed: ${workflowPostProcessResult.processed} workflows processed`);
      
    } catch (error) {
      throw new Error(`Workflow sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return { synced, updated, warnings };
  }

  /**
   * SYNC EXECUTIONS ROBUSTO con SINGLE CALL INTELLIGENTE + Smart Fallback
   */
  private async syncExecutionsRobust(options: SyncOptions): Promise<{synced: number, updated: number, warnings: string[]}> {
    const warnings: string[] = [];
    let synced = 0;
    let updated = 0;
    
    try {
      // 1. TENTATIVO PRIMARY: Single API call con includeData=true
      console.log(`🚀 PRIMARY: Trying single call with includeData=true`);
      
      const executionsWithData = await this.fetchWithRetry(`${this.apiUrl}/executions?limit=100&includeData=true`, options);
      console.log(`✅ Fetched ${executionsWithData.length} executions with includeData`);
      
      // 2. VERIFICA COMPLETEZZA DATI
      const hasCompleteData = executionsWithData.length > 0 && executionsWithData[0].data;
      
      if (hasCompleteData) {
        console.log(`✅ Complete data available, using single call strategy`);
        
        // Sync diretto con dati completi
        for (const execution of executionsWithData) {
          try {
            const changeResult = await this.syncSingleExecution(execution, options.forceRefresh);
            if (changeResult.synced) synced++;
            if (changeResult.updated) updated++;
          } catch (error) {
            const msg = `❌ Execution ${execution.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            warnings.push(msg);
            console.warn(msg);
          }
        }
        
      } else {
        console.log(`⚠️ Incomplete data detected, falling back to SMART DUAL-FETCH`);
        
        // 3. FALLBACK: Smart Dual-Fetch con rate limiting intelligente
        const executionsList = executionsWithData.length > 0 ? executionsWithData : 
          await this.fetchWithRetry(`${this.apiUrl}/executions?limit=100`, options);
        
        const batchSize = 3; // Batch ridotti per evitare rate limiting
        for (let i = 0; i < executionsList.length; i += batchSize) {
          const batch = executionsList.slice(i, i + batchSize);
          
          // Fetch dati completi in parallelo per il batch
          const detailedExecutions = await Promise.allSettled(
            batch.map(async (exec) => {
              try {
                const detailed = await this.fetchWithRetry(`${this.apiUrl}/executions/${exec.id}?includeData=true`, options);
                return detailed[0] || detailed; // API può restituire array o oggetto
              } catch (error) {
                console.warn(`⚠️ Failed to fetch detailed data for ${exec.id}, using basic data`);
                return exec; // Fallback a dati base
              }
            })
          );
          
          // Sync con dati completi o base
          for (let j = 0; j < detailedExecutions.length; j++) {
            const result = detailedExecutions[j];
            const execution = result.status === 'fulfilled' ? result.value : batch[j];
            
            try {
              const changeResult = await this.syncSingleExecution(execution, options.forceRefresh);
              if (changeResult.synced) synced++;
              if (changeResult.updated) updated++;
            } catch (error) {
              const msg = `❌ Execution ${execution.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              warnings.push(msg);
              console.warn(msg);
            }
          }
          
          // Rate limiting intelligente: pausa più lunga tra batch
          if (i + batchSize < executionsList.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 secondo pause per rispettare rate limits
          }
        }
      }
      
      console.log(`✅ Executions: ${synced} synced, ${updated} updated, ${warnings.length} warnings`);
      
      // 4. POST-PROCESSING: Deriva status e enrichment dal raw_data  
      console.log(`🔄 Starting post-processing for execution data enrichment...`);
      const postProcessResult = await this.postProcessExecutions();
      console.log(`✅ Post-processing completed: ${postProcessResult.processed} executions processed`);
      
    } catch (error) {
      throw new Error(`Execution sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return { synced, updated, warnings };
  }

  /**
   * Fetch con RETRY LOGIC robusto
   */
  private async fetchWithRetry(url: string, options: SyncOptions): Promise<any[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= options.maxRetries!; attempt++) {
      try {
        console.log(`🔄 API call attempt ${attempt}/${options.maxRetries}: ${url}`);
        
        // Timeout wrapper per fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          headers: { 'X-N8N-API-KEY': this.apiKey },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.data || [];
        
        console.log(`✅ API success: ${results.length} items fetched`);
        return results;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown fetch error');
        console.warn(`⚠️ Attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < options.maxRetries!) {
          const delay = options.retryDelay! * attempt; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`API failed after ${options.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * TRACKING MODIFICHE - Sync singolo workflow solo se cambiato
   */
  private async syncSingleWorkflow(workflow: any, forceRefresh = false): Promise<{synced: boolean, updated: boolean}> {
    try {
      // 1. Controlla se esiste già nel DB
      const existing = await this.db.query(
        'SELECT updated_at, raw_data FROM workflows WHERE id = $1',
        [workflow.id]
      );
      
      const isNewWorkflow = existing.rows.length === 0;
      let hasChanged = isNewWorkflow || forceRefresh;
      
      // 2. SMART CHANGE DETECTION - confronta timestamp e contenuto
      if (!isNewWorkflow && !forceRefresh) {
        const dbUpdatedAt = new Date(existing.rows[0].updated_at);
        const n8nUpdatedAt = new Date(workflow.updatedAt || workflow.createdAt);
        const dbRawData = JSON.stringify(existing.rows[0].raw_data);
        const n8nRawData = JSON.stringify(workflow);
        
        hasChanged = n8nUpdatedAt > dbUpdatedAt || dbRawData !== n8nRawData;
      }
      
      if (!hasChanged) {
        return { synced: true, updated: false }; // Già aggiornato, skip
      }
      
      // 3. UPSERT nel database SOLO se cambiato
      const query = `
        INSERT INTO workflows (id, name, active, nodes, created_at, updated_at, raw_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          active = EXCLUDED.active,
          nodes = EXCLUDED.nodes,
          updated_at = EXCLUDED.updated_at,
          raw_data = EXCLUDED.raw_data
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const values = [
        workflow.id,
        workflow.name,
        workflow.active || false,
        JSON.stringify(workflow.nodes || []),
        workflow.createdAt || new Date().toISOString(),
        workflow.updatedAt || new Date().toISOString(),
        JSON.stringify(workflow)
      ];

      const result = await this.db.query(query, values);
      const wasInserted = result.rows[0]?.inserted;
      
      console.log(`${isNewWorkflow ? '🆕' : '🔄'} ${workflow.name} (${workflow.id})`);
      
      return { synced: true, updated: !wasInserted }; // updated = era UPDATE, non INSERT
      
    } catch (error) {
      console.error(`❌ Sync workflow ${workflow.id}:`, error);
      throw error;
    }
  }

  /**
   * TRACKING MODIFICHE - Sync singolo execution solo se cambiato
   */
  private async syncSingleExecution(execution: any, forceRefresh = false): Promise<{synced: boolean, updated: boolean}> {
    try {
      // 1. Controlla se esiste già nel DB
      const existing = await this.db.query(
        'SELECT status, stopped_at, raw_data FROM executions WHERE id = $1',
        [execution.id]
      );
      
      const isNewExecution = existing.rows.length === 0;
      let hasChanged = isNewExecution || forceRefresh;
      
      // 2. SMART CHANGE DETECTION per executions - status e stopped_at possono cambiare
      if (!isNewExecution && !forceRefresh) {
        const dbStatus = existing.rows[0].status;
        const dbStoppedAt = existing.rows[0].stopped_at;
        const dbRawData = JSON.stringify(existing.rows[0].raw_data);
        const n8nRawData = JSON.stringify(execution);
        
        hasChanged = execution.status !== dbStatus || 
                    execution.stoppedAt !== dbStoppedAt || 
                    dbRawData !== n8nRawData;
      }
      
      if (!hasChanged) {
        return { synced: true, updated: false }; // Già aggiornato, skip
      }
      
      // 3. UPSERT COMPLETO nel database con TUTTI i campi execution
      const duration = execution.stoppedAt && execution.startedAt
        ? new Date(execution.stoppedAt).getTime() - new Date(execution.startedAt).getTime()
        : null;

      // Calcola data size se disponibile
      const estimateDataSize = (obj: any): number => {
        try {
          return JSON.stringify(obj || {}).length / 1024; // KB
        } catch {
          return 0;
        }
      };

      const query = `
        INSERT INTO executions (
          id, workflow_id, status, mode, started_at, finished_at, stopped_at, 
          duration_ms, finished, retry_of, retry_success_id, wait_till,
          nodes_executed, data_in_kb, data_out_kb, raw_data, workflow_data,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          mode = EXCLUDED.mode,
          finished_at = EXCLUDED.finished_at,
          stopped_at = EXCLUDED.stopped_at,
          duration_ms = EXCLUDED.duration_ms,
          finished = EXCLUDED.finished,
          retry_of = EXCLUDED.retry_of,
          retry_success_id = EXCLUDED.retry_success_id,
          wait_till = EXCLUDED.wait_till,
          nodes_executed = EXCLUDED.nodes_executed,
          data_in_kb = EXCLUDED.data_in_kb,
          data_out_kb = EXCLUDED.data_out_kb,
          raw_data = EXCLUDED.raw_data,
          workflow_data = EXCLUDED.workflow_data
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const values = [
        execution.id,                                           // $1
        execution.workflowId,                                  // $2  
        execution.status || 'running',                         // $3
        execution.mode || 'manual',                            // $4
        execution.startedAt,                                   // $5
        execution.finished ? execution.stoppedAt : null,       // $6 finished_at
        execution.stoppedAt,                                   // $7 stopped_at
        duration,                                              // $8
        execution.finished || false,                           // $9
        execution.retryOf || null,                             // $10
        execution.retrySuccessId || null,                      // $11
        execution.waitTill || null,                            // $12
        0,                                                     // $13 nodes_executed (TODO: get from detailed data)
        estimateDataSize(execution),                           // $14 data_in_kb  
        estimateDataSize(execution),                           // $15 data_out_kb
        JSON.stringify(execution),                             // $16 raw_data
        null,                                                  // $17 workflow_data (TODO: fetch if needed)
        execution.createdAt || execution.startedAt             // $18 created_at
      ];

      const result = await this.db.query(query, values);
      const wasInserted = result.rows[0]?.inserted;
      
      return { synced: true, updated: !wasInserted }; // updated = era UPDATE, non INSERT
      
    } catch (error) {
      console.error(`❌ Sync execution ${execution.id}:`, error);
      throw error;
    }
  }

  /**
   * POST-PROCESSING: Deriva status, duration e enrichment dal raw_data
   * Approccio Data-First: prendi tutto da n8n, lavora nel DB
   */
  private async postProcessExecutions(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🔧 POST-PROCESSING: Starting intelligent DB processing...`);
      
      // 1. DERIVAZIONE STATUS da dati certi
      console.log(`📊 Step 1: Deriving execution status from raw data...`);
      const statusResult = await this.db.query(`
        UPDATE executions SET 
          status = CASE 
            WHEN finished = true AND (
              raw_data->'data'->'resultData'->>'error' IS NULL OR
              raw_data->'data'->'resultData'->>'error' = 'null'
            ) THEN 'success'
            WHEN finished = true AND (
              raw_data->'data'->'resultData'->>'error' IS NOT NULL AND
              raw_data->'data'->'resultData'->>'error' != 'null'
            ) THEN 'error'  
            WHEN finished = false THEN 'running'
            ELSE 'unknown'
          END
        WHERE status IS NULL OR status = 'unknown' OR status = '';
      `);
      
      // 2. CALCOLO DURATION da timestamp certi
      console.log(`⏱️ Step 2: Calculating duration from timestamps...`);
      await this.db.query(`
        UPDATE executions SET 
          duration_ms = EXTRACT(EPOCH FROM (stopped_at - started_at)) * 1000
        WHERE duration_ms IS NULL AND started_at IS NOT NULL AND stopped_at IS NOT NULL;
      `);
      
      // 3. ENRICHMENT da raw_data JSON  
      console.log(`🔍 Step 3: Extracting enrichment data from JSON...`);
      await this.db.query(`
        UPDATE executions SET
          error_message = COALESCE(
            raw_data->'data'->'resultData'->'error'->>'message',
            raw_data->'data'->'resultData'->'error'->>'description'
          )
        WHERE raw_data IS NOT NULL AND error_message IS NULL AND (
          raw_data->'data'->'resultData'->>'error' IS NOT NULL AND
          raw_data->'data'->'resultData'->>'error' != 'null'
        );
      `);
      
      // 4. COUNT risultati processati
      const countResult = await this.db.query(`
        SELECT COUNT(*) as count FROM executions 
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `);
      processed = parseInt(countResult.rows[0]?.count || '0');
      
      console.log(`✅ POST-PROCESSING completed successfully`);
      
    } catch (error) {
      console.error(`❌ Post-processing failed:`, error);
      throw error;
    }
    
    return { processed };
  }

  /**
   * POST-PROCESSING WORKFLOWS: Deriva tutte le statistiche dai dati reali
   * - Execution counts (total, success, failure)
   * - Performance metrics (avg, min, max duration)  
   * - Last execution timestamps
   * - Node analysis (AI, database, HTTP, webhook counts)
   */
  private async postProcessWorkflows(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🔧 WORKFLOWS POST-PROCESSING: Starting comprehensive analysis...`);
      
      // 1. EXECUTION STATISTICS per workflow
      console.log(`📊 Step 1: Calculating execution statistics per workflow...`);
      await this.db.query(`
        UPDATE workflows SET 
          execution_count = stats.total_executions,
          success_count = stats.success_executions,
          failure_count = stats.failure_executions,
          avg_duration_ms = stats.avg_duration,
          min_duration_ms = stats.min_duration,
          max_duration_ms = stats.max_duration,
          last_execution_at = stats.last_execution,
          last_success_at = stats.last_success,
          last_failure_at = stats.last_failure
        FROM (
          SELECT 
            workflow_id,
            COUNT(*) as total_executions,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as success_executions,
            COUNT(CASE WHEN status = 'error' THEN 1 END) as failure_executions,
            ROUND(AVG(duration_ms), 2) as avg_duration,
            MIN(duration_ms) as min_duration,
            MAX(duration_ms) as max_duration,
            MAX(started_at) as last_execution,
            MAX(CASE WHEN status = 'success' THEN started_at END) as last_success,
            MAX(CASE WHEN status = 'error' THEN started_at END) as last_failure
          FROM executions 
          WHERE workflow_id IS NOT NULL AND duration_ms IS NOT NULL
          GROUP BY workflow_id
        ) stats
        WHERE workflows.id = stats.workflow_id;
      `);
      
      // 2. NODE ANALYSIS da raw_data JSON
      console.log(`🔍 Step 2: Analyzing node types and counts...`);
      await this.db.query(`
        UPDATE workflows SET 
          node_count = COALESCE(jsonb_array_length(raw_data->'nodes'), 0),
          connection_count = CASE 
            WHEN raw_data->'connections' IS NOT NULL 
            THEN (SELECT COUNT(*) FROM jsonb_object_keys(raw_data->'connections'))
            ELSE 0
          END,
          trigger_count = (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' LIKE '%trigger%' OR node->>'type' LIKE '%webhook%'
          ),
          ai_node_count = (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%ai%' 
               OR node->>'type' ILIKE '%openai%' 
               OR node->>'type' ILIKE '%claude%'
               OR node->>'type' ILIKE '%agent%'
               OR node->>'type' ILIKE '%langchain%'
          ),
          database_node_count = (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%database%' 
               OR node->>'type' ILIKE '%postgres%'
               OR node->>'type' ILIKE '%mysql%' 
               OR node->>'type' ILIKE '%mongodb%'
          ),
          http_node_count = (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%http%' 
               OR node->>'type' ILIKE '%request%'
               OR node->>'type' ILIKE '%api%'
          ),
          webhook_node_count = (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%webhook%'
          ),
          has_manual_trigger = (
            SELECT COUNT(*) > 0
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%manual%trigger%'
          ),
          has_wait_node = (
            SELECT COUNT(*) > 0
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%wait%'
          ),
          has_error_handler = (
            SELECT COUNT(*) > 0
            FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%error%' OR node->'parameters'->>'continueOnFail' = 'true'
          )
        WHERE raw_data IS NOT NULL;
      `);
      
      // 3. UNIQUE NODE TYPES count
      console.log(`🎯 Step 3: Counting unique node types...`);
      await this.db.query(`
        UPDATE workflows SET 
          unique_node_types = (
            SELECT COUNT(DISTINCT node->>'type')
            FROM jsonb_array_elements(raw_data->'nodes') as node
          )
        WHERE raw_data IS NOT NULL;
      `);
      
      // 4. NODE NOTES EXTRACTION - UNIVERSALE per tutti i workflow (AI e Non-AI)
      console.log(`📝 Step 4: Extracting ALL workflow nodes with show-N detection...`);
      const nodesResult = await this.db.query(`
        INSERT INTO workflow_nodes (
          workflow_id, node_id, node_name, node_type, notes, show_order, 
          position, parameters, raw_node_data
        )
        SELECT 
          workflows.id as workflow_id,
          node->>'name' as node_id,
          node->>'name' as node_name,
          node->>'type' as node_type,
          node->>'notes' as notes,
          CASE 
            WHEN node->>'notes' ~ 'show[_-]([0-9]+)' THEN 
              (regexp_match(node->>'notes', 'show[_-]([0-9]+)', 'i'))[1]::integer
            ELSE NULL
          END as show_order,
          node->'position' as position,
          node->'parameters' as parameters,
          node as raw_node_data
        FROM workflows, jsonb_array_elements(raw_data->'nodes') as node
        WHERE workflows.raw_data IS NOT NULL
        ON CONFLICT (workflow_id, node_id) DO UPDATE SET
          node_name = EXCLUDED.node_name,
          node_type = EXCLUDED.node_type,
          notes = EXCLUDED.notes,
          show_order = EXCLUDED.show_order,
          position = EXCLUDED.position,
          parameters = EXCLUDED.parameters,
          raw_node_data = EXCLUDED.raw_node_data,
          updated_at = CURRENT_TIMESTAMP
        RETURNING workflow_id;
      `);
      
      const nodesExtracted = nodesResult.rows.length;
      console.log(`✅ Extracted nodes from ${nodesExtracted} workflows (AI + Non-AI)`);
      
      // 5. COUNT workflows processati
      const countResult = await this.db.query(`
        SELECT COUNT(*) as count FROM workflows 
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `);
      processed = parseInt(countResult.rows[0]?.count || '0');
      
      console.log(`✅ WORKFLOWS POST-PROCESSING completed successfully`);
      
    } catch (error) {
      console.error(`❌ Workflows post-processing failed:`, error);
      throw error;
    }
    
    return { processed };
  }

  /**
   * SYNC TAGS SISTEMA GLOBALE - Per categorizzazione workflow (Fallback Strategy)
   */
  private async syncTagsSystem(): Promise<{synced: number, updated: number}> {
    let synced = 0;
    let updated = 0;
    
    try {
      console.log(`🏷️  TAGS SYNC: Starting global tags synchronization...`);
      
      // 1. TENTATIVO di fetch tags da n8n API (può non essere disponibile)
      try {
        const tags = await this.fetchWithRetry(`${this.apiUrl}/tags?limit=250`, { maxRetries: 1 });
        console.log(`📥 Fetched ${tags.length} tags from n8n API`);
        
        // 2. SYNC ogni tag nel database
        for (const tag of tags) {
          try {
            const query = `
              INSERT INTO tags (id, name, color, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (name) DO UPDATE SET
                color = EXCLUDED.color,
                updated_at = EXCLUDED.updated_at
              RETURNING (xmax = 0) AS inserted;
            `;
            
            const values = [
              tag.id || tag.name,
              tag.name,
              tag.color || '#gray',
              tag.createdAt || new Date().toISOString(),
              tag.updatedAt || new Date().toISOString()
            ];
            
            const result = await this.db.query(query, values);
            const wasInserted = result.rows[0]?.inserted;
            
            if (wasInserted) synced++;
            else updated++;
            
          } catch (error) {
            console.warn(`⚠️ Failed to sync tag ${tag.name}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }
        
      } catch (apiError) {
        console.warn(`⚠️ n8n Tags API not available, using fallback extraction from workflow data`);
        
        // FALLBACK: Extract tags dai raw_data dei workflow
        const tagExtractionResult = await this.db.query(`
          INSERT INTO tags (id, name, color, created_at, updated_at)
          SELECT 
            ROW_NUMBER() OVER (ORDER BY tag_name),
            tag_name,
            '#4CAF50', -- Default green color
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          FROM (
            SELECT DISTINCT 
              UNNEST(
                ARRAY(
                  SELECT jsonb_array_elements_text(
                    COALESCE(raw_data->'tags', '[]'::jsonb)
                  )
                )
              ) as tag_name
            FROM workflows 
            WHERE raw_data->'tags' IS NOT NULL
            AND jsonb_array_length(raw_data->'tags') > 0
          ) extracted_tags
          WHERE tag_name IS NOT NULL AND tag_name != ''
          ON CONFLICT (name) DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP
          RETURNING name;
        `);
        
        synced = tagExtractionResult.rows.length;
        console.log(`✅ Extracted ${synced} tags from workflow raw_data as fallback`);
      }
      
      console.log(`✅ Tags sync completed: ${synced} new/updated tags`);
      
    } catch (error) {
      console.error(`❌ Tags sync failed completely:`, error);
      // Non fare throw per non bloccare tutto l'enhanced sync
      console.log(`⚠️ Continuing enhanced sync without tags...`);
    }
    
    return { synced, updated };
  }

  /**
   * SYNC WORKFLOW TAGS ASSOCIATIONS - Da raw_data (più affidabile dell'API)
   */
  private async syncWorkflowTags(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🔗 WORKFLOW TAGS: Starting workflow-tags extraction from raw_data...`);
      
      // EXTRACT workflow-tags associations direttamente dai raw_data
      const result = await this.db.query(`
        -- Clear existing workflow_tags per re-sync completo
        TRUNCATE workflow_tags;
        
        -- Extract e insert workflow-tag associations da raw_data
        INSERT INTO workflow_tags (workflow_id, tag_id, tag_name)
        SELECT DISTINCT
          w.id as workflow_id,
          -- Generate tag_id da tag name (fallback se non esistente)
          COALESCE(t.id, 
            (SELECT id FROM tags WHERE name = tag_element LIMIT 1),
            EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER + ROW_NUMBER() OVER()
          ) as tag_id,
          tag_element as tag_name
        FROM workflows w,
        jsonb_array_elements_text(COALESCE(w.raw_data->'tags', '[]'::jsonb)) as tag_element
        LEFT JOIN tags t ON t.name = tag_element
        WHERE w.raw_data->'tags' IS NOT NULL 
        AND jsonb_array_length(w.raw_data->'tags') > 0
        AND tag_element IS NOT NULL 
        AND tag_element != ''
        ON CONFLICT (workflow_id, tag_id) DO UPDATE SET
          tag_name = EXCLUDED.tag_name
        RETURNING workflow_id;
      `);
      
      processed = result.rows.length;
      console.log(`✅ Workflow tags extracted: ${processed} workflow-tag associations created from raw_data`);
      
      // Aggiorna conteggi tags
      await this.db.query(`
        UPDATE tags SET usage_count = (
          SELECT COUNT(*) FROM workflow_tags WHERE tag_name = tags.name
        )
      `);
      
    } catch (error) {
      console.error(`❌ Workflow tags sync failed:`, error);
      // Non bloccare l'enhanced sync completo
      console.log(`⚠️ Continuing enhanced sync without workflow tags associations...`);
    }
    
    return { processed };
  }

  /**
   * SYNC WORKFLOW SETTINGS - Configurazioni dettagliate workflow
   */
  private async syncWorkflowSettings(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`⚙️  WORKFLOW SETTINGS: Starting settings extraction from raw_data...`);
      
      // EXTRACT settings da raw_data esistenti nei workflow
      const settingsResult = await this.db.query(`
        INSERT INTO workflow_settings (
          workflow_id, save_execution_progress, save_manual_executions,
          save_data_error_execution, save_data_success_execution,
          execution_timeout, error_workflow, timezone, execution_order,
          static_data, raw_settings
        )
        SELECT 
          id as workflow_id,
          COALESCE((raw_data->'settings'->>'saveExecutionProgress')::boolean, false) as save_execution_progress,
          COALESCE((raw_data->'settings'->>'saveManualExecutions')::boolean, true) as save_manual_executions,
          COALESCE(raw_data->'settings'->>'saveDataErrorExecution', 'all') as save_data_error_execution,
          COALESCE(raw_data->'settings'->>'saveDataSuccessExecution', 'all') as save_data_success_execution,
          (raw_data->'settings'->>'executionTimeout')::integer as execution_timeout,
          raw_data->'settings'->>'errorWorkflow' as error_workflow,
          raw_data->'settings'->>'timezone' as timezone,
          raw_data->'settings'->>'executionOrder' as execution_order,
          raw_data->'staticData' as static_data,
          raw_data->'settings' as raw_settings
        FROM workflows 
        WHERE raw_data IS NOT NULL 
        AND NOT EXISTS (
          SELECT 1 FROM workflow_settings WHERE workflow_id = workflows.id
        )
        ON CONFLICT (workflow_id) DO UPDATE SET
          save_execution_progress = EXCLUDED.save_execution_progress,
          save_manual_executions = EXCLUDED.save_manual_executions,
          save_data_error_execution = EXCLUDED.save_data_error_execution,
          save_data_success_execution = EXCLUDED.save_data_success_execution,
          execution_timeout = EXCLUDED.execution_timeout,
          error_workflow = EXCLUDED.error_workflow,
          timezone = EXCLUDED.timezone,
          execution_order = EXCLUDED.execution_order,
          static_data = EXCLUDED.static_data,
          raw_settings = EXCLUDED.raw_settings,
          updated_at = CURRENT_TIMESTAMP
        RETURNING workflow_id;
      `);
      
      processed = settingsResult.rows.length;
      console.log(`✅ Workflow settings extracted: ${processed} workflows processed`);
      
    } catch (error) {
      console.error(`❌ Workflow settings sync failed:`, error);
      throw error;
    }
    
    return { processed };
  }

  /**
   * SYNC WORKFLOW COMPLEXITY ANALYSIS - Analisi avanzata complessità
   */
  private async syncWorkflowComplexity(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🔍 WORKFLOW COMPLEXITY: Starting advanced complexity analysis...`);
      
      // CALCULATE complexity metrics da raw_data
      const complexityResult = await this.db.query(`
        INSERT INTO workflow_complexity (
          workflow_id, total_nodes, total_connections, complexity_score,
          has_loops, has_error_handling, has_conditional_logic,
          has_manual_triggers, has_webhook_triggers, has_cron_triggers,
          credential_count
        )
        SELECT 
          id as workflow_id,
          COALESCE(jsonb_array_length(raw_data->'nodes'), 0) as total_nodes,
          CASE 
            WHEN raw_data->'connections' IS NOT NULL 
            THEN (SELECT COUNT(*) FROM jsonb_object_keys(raw_data->'connections'))
            ELSE 0
          END as total_connections,
          -- Complexity score calculation
          ROUND(
            (COALESCE(jsonb_array_length(raw_data->'nodes'), 0) * 1.0) +
            (CASE WHEN raw_data->'connections' IS NOT NULL 
             THEN (SELECT COUNT(*) FROM jsonb_object_keys(raw_data->'connections')) * 0.5
             ELSE 0 END) +
            (ai_node_count * 2.0) +
            (CASE WHEN raw_data->>'staticData' IS NOT NULL THEN 1.0 ELSE 0 END)
          , 2) as complexity_score,
          -- Advanced boolean analysis
          EXISTS(
            SELECT 1 FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%if%' OR node->>'type' ILIKE '%switch%'
          ) as has_loops,
          has_error_handler as has_error_handling,
          EXISTS(
            SELECT 1 FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%if%' OR node->>'type' ILIKE '%switch%' OR node->>'type' ILIKE '%merge%'
          ) as has_conditional_logic,
          has_manual_trigger as has_manual_triggers,
          (webhook_node_count > 0) as has_webhook_triggers,
          EXISTS(
            SELECT 1 FROM jsonb_array_elements(raw_data->'nodes') as node 
            WHERE node->>'type' ILIKE '%cron%' OR node->>'type' ILIKE '%schedule%'
          ) as has_cron_triggers,
          -- Count unique credentials used
          (
            SELECT COUNT(DISTINCT credential_key)
            FROM jsonb_array_elements(raw_data->'nodes') as node,
                 jsonb_object_keys(COALESCE(node->'credentials', '{}'::jsonb)) as credential_key
          ) as credential_count
        FROM workflows 
        WHERE raw_data IS NOT NULL
        ON CONFLICT (workflow_id) DO UPDATE SET
          total_nodes = EXCLUDED.total_nodes,
          total_connections = EXCLUDED.total_connections,
          complexity_score = EXCLUDED.complexity_score,
          has_loops = EXCLUDED.has_loops,
          has_error_handling = EXCLUDED.has_error_handling,
          has_conditional_logic = EXCLUDED.has_conditional_logic,
          has_manual_triggers = EXCLUDED.has_manual_triggers,
          has_webhook_triggers = EXCLUDED.has_webhook_triggers,
          has_cron_triggers = EXCLUDED.has_cron_triggers,
          credential_count = EXCLUDED.credential_count,
          calculated_at = CURRENT_TIMESTAMP
        RETURNING workflow_id;
      `);
      
      processed = complexityResult.rows.length;
      console.log(`✅ Workflow complexity analysis completed: ${processed} workflows analyzed`);
      
    } catch (error) {
      console.error(`❌ Workflow complexity analysis failed:`, error);
      throw error;
    }
    
    return { processed };
  }

  /**
   * ENHANCED SYNC ALL - Include tags, settings, complexity
   */
  async syncAllEnhanced(options: SyncOptions = {}): Promise<SyncResult & {tagsProcessed: number, settingsProcessed: number, complexityProcessed: number}> {
    const startTime = Date.now();
    
    // 1. SYNC base (workflows + executions) - existing logic
    const baseResult = await this.syncAll(options);
    
    // 2. ENHANCED SYNC - tags, settings, complexity
    let tagsProcessed = 0;
    let settingsProcessed = 0;
    let complexityProcessed = 0;
    
    try {
      console.log(`🚀 ENHANCED SYNC: Starting tags, settings, complexity processing...`);
      
      // 3. SYNC sistema tags globale
      const tagsResult = await this.syncTagsSystem();
      console.log(`✅ Tags system: ${tagsResult.synced} new, ${tagsResult.updated} updated`);
      
      // 4. SYNC workflow-tags associations
      const workflowTagsResult = await this.syncWorkflowTags();
      tagsProcessed = workflowTagsResult.processed;
      
      // 5. SYNC workflow settings
      const settingsResult = await this.syncWorkflowSettings();
      settingsProcessed = settingsResult.processed;
      
      // 6. SYNC workflow complexity analysis
      const complexityResult = await this.syncWorkflowComplexity();
      complexityProcessed = complexityResult.processed;
      
      console.log(`✅ ENHANCED SYNC COMPLETED: tags=${tagsProcessed}, settings=${settingsProcessed}, complexity=${complexityProcessed}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enhanced sync error';
      baseResult.errors.push(`Enhanced sync: ${message}`);
      console.error(`❌ Enhanced sync failed:`, message);
    }
    
    return {
      ...baseResult,
      tagsProcessed,
      settingsProcessed,
      complexityProcessed,
      duration: Date.now() - startTime
    };
  }

  /**
   * =====================================================
   * ADVANCED RAW DATA EXTRACTION METHODS
   * Maximum Data In-House Processing Strategy
   * =====================================================
   */

  /**
   * SYNC WORKFLOW VERSIONING & META - Complete version tracking
   */
  private async syncWorkflowVersioning(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`📝 WORKFLOW VERSIONING: Extracting version data from raw_data...`);
      
      const result = await this.db.query(`
        INSERT INTO workflow_versions (
          workflow_id, version_id, created_at, updated_at, 
          is_archived, template_creds_setup, raw_meta
        )
        SELECT DISTINCT
          w.id as workflow_id,
          raw_data->>'versionId' as version_id,
          (raw_data->>'createdAt')::timestamp as created_at,
          (raw_data->>'updatedAt')::timestamp as updated_at,
          COALESCE((raw_data->>'isArchived')::boolean, false) as is_archived,
          COALESCE((raw_data->'meta'->>'templateCredsSetupCompleted')::boolean, false) as template_creds_setup,
          raw_data->'meta' as raw_meta
        FROM workflows w
        WHERE raw_data IS NOT NULL 
        AND raw_data->>'versionId' IS NOT NULL
        ON CONFLICT (workflow_id, version_id) DO UPDATE SET
          updated_at = EXCLUDED.updated_at,
          is_archived = EXCLUDED.is_archived,
          template_creds_setup = EXCLUDED.template_creds_setup,
          raw_meta = EXCLUDED.raw_meta
        RETURNING workflow_id;
      `);
      
      processed = result.rows.length;
      console.log(`✅ Workflow versioning sync: ${processed} versions processed`);
      
    } catch (error) {
      console.error(`❌ Workflow versioning sync failed:`, error);
    }
    
    return { processed };
  }

  /**
   * SYNC WORKFLOW CONNECTIONS - Complete flow analysis
   */
  private async syncWorkflowConnections(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🔗 WORKFLOW CONNECTIONS: Extracting connection data from raw_data...`);
      
      // Clear existing connections for re-sync
      await this.db.query(`TRUNCATE workflow_connections`);
      
      const result = await this.db.query(`
        INSERT INTO workflow_connections (
          workflow_id, source_node, target_node, connection_type, 
          connection_index, raw_connection
        )
        SELECT DISTINCT
          w.id as workflow_id,
          conn_key as source_node,
          target_conn->>0->'node' as target_node,
          COALESCE(target_conn->>0->>'type', 'main') as connection_type,
          COALESCE((target_conn->>0->>'index')::integer, 0) as connection_index,
          target_conn->>0 as raw_connection
        FROM workflows w,
        LATERAL jsonb_each(raw_data->'connections') AS conn(conn_key, conn_value),
        LATERAL jsonb_each(conn_value) AS conn_type(type_key, type_value),
        LATERAL jsonb_array_elements(type_value) AS target_conn
        WHERE raw_data->'connections' IS NOT NULL
        ON CONFLICT (workflow_id, source_node, target_node, connection_type, connection_index) 
        DO UPDATE SET raw_connection = EXCLUDED.raw_connection
        RETURNING workflow_id;
      `);
      
      processed = result.rows.length;
      console.log(`✅ Workflow connections sync: ${processed} connections processed`);
      
    } catch (error) {
      console.error(`❌ Workflow connections sync failed:`, error);
    }
    
    return { processed };
  }

  /**
   * SYNC WORKFLOW TRIGGERS - Advanced trigger analysis
   */
  private async syncWorkflowTriggers(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🎯 WORKFLOW TRIGGERS: Extracting trigger data from raw_data...`);
      
      // Clear existing triggers for re-sync
      await this.db.query(`TRUNCATE workflow_triggers`);
      
      const result = await this.db.query(`
        INSERT INTO workflow_triggers (
          workflow_id, node_id, trigger_type, trigger_config, 
          webhook_path, webhook_id, is_active
        )
        SELECT DISTINCT
          w.id as workflow_id,
          node_data->>'id' as node_id,
          node_data->>'type' as trigger_type,
          CASE 
            WHEN node_data->>'type' LIKE '%webhook%' THEN jsonb_build_object(
              'path', node_data->'parameters'->>'path',
              'webhookId', node_data->>'webhookId',
              'options', node_data->'parameters'->'options'
            )
            WHEN node_data->>'type' LIKE '%cron%' THEN jsonb_build_object(
              'rule', node_data->'parameters'->>'rule',
              'timezone', node_data->'parameters'->>'timezone'
            )
            ELSE node_data->'parameters'
          END as trigger_config,
          node_data->'parameters'->>'path' as webhook_path,
          node_data->>'webhookId' as webhook_id,
          w.active as is_active
        FROM workflows w,
        LATERAL jsonb_array_elements(raw_data->'nodes') AS node_data
        WHERE raw_data->'nodes' IS NOT NULL
        AND (
          node_data->>'type' LIKE '%trigger%' 
          OR node_data->>'type' LIKE '%webhook%'
          OR node_data->>'type' LIKE '%cron%'
        )
        ON CONFLICT (workflow_id, node_id) DO UPDATE SET
          trigger_config = EXCLUDED.trigger_config,
          webhook_path = EXCLUDED.webhook_path,
          is_active = EXCLUDED.is_active
        RETURNING workflow_id;
      `);
      
      processed = result.rows.length;
      console.log(`✅ Workflow triggers sync: ${processed} triggers processed`);
      
    } catch (error) {
      console.error(`❌ Workflow triggers sync failed:`, error);
    }
    
    return { processed };
  }

  /**
   * SYNC WORKFLOW DEVELOPMENT DATA - Pin data & static data tracking
   */
  private async syncWorkflowDevelopmentData(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`🛠️ WORKFLOW DEVELOPMENT: Extracting pin/static data from raw_data...`);
      
      const result = await this.db.query(`
        INSERT INTO workflow_development_data (
          workflow_id, pin_data, static_data, pin_data_nodes, static_data_keys
        )
        SELECT DISTINCT
          w.id as workflow_id,
          raw_data->'pinData' as pin_data,
          raw_data->'staticData' as static_data,
          CASE 
            WHEN raw_data->'pinData' IS NOT NULL AND raw_data->'pinData' != '{}'::jsonb
            THEN ARRAY(SELECT jsonb_object_keys(raw_data->'pinData'))
            ELSE ARRAY[]::TEXT[]
          END as pin_data_nodes,
          CASE 
            WHEN raw_data->'staticData' IS NOT NULL AND raw_data->'staticData' != 'null'::jsonb
            THEN ARRAY(SELECT jsonb_object_keys(raw_data->'staticData'))
            ELSE ARRAY[]::TEXT[]
          END as static_data_keys
        FROM workflows w
        WHERE raw_data IS NOT NULL
        ON CONFLICT (workflow_id) DO UPDATE SET
          pin_data = EXCLUDED.pin_data,
          static_data = EXCLUDED.static_data,
          pin_data_nodes = EXCLUDED.pin_data_nodes,
          static_data_keys = EXCLUDED.static_data_keys,
          updated_at = CURRENT_TIMESTAMP
        RETURNING workflow_id;
      `);
      
      processed = result.rows.length;
      console.log(`✅ Workflow development data sync: ${processed} workflows processed`);
      
    } catch (error) {
      console.error(`❌ Workflow development data sync failed:`, error);
    }
    
    return { processed };
  }

  /**
   * SYNC WORKFLOW ANALYSIS - Advanced metrics calculation
   */
  private async syncWorkflowAnalysis(): Promise<{processed: number}> {
    let processed = 0;
    
    try {
      console.log(`📊 WORKFLOW ANALYSIS: Calculating advanced metrics from raw_data...`);
      
      const result = await this.db.query(`
        INSERT INTO workflow_analysis (
          workflow_id, total_paths, max_path_length, has_parallel_branches,
          trigger_types, webhook_count, cron_count, manual_count,
          http_nodes, database_nodes, transformation_nodes, conditional_nodes,
          has_development_data, estimated_complexity_score
        )
        SELECT 
          w.id as workflow_id,
          -- Flow analysis (simplified for now)
          COALESCE(connections_count, 0) as total_paths,
          COALESCE(w.node_count, 0) as max_path_length,
          (connections_count > w.node_count) as has_parallel_branches,
          -- Trigger analysis
          trigger_analysis.trigger_types,
          trigger_analysis.webhook_count,
          trigger_analysis.cron_count, 
          trigger_analysis.manual_count,
          -- Node type analysis
          COALESCE(node_analysis.http_nodes, 0) as http_nodes,
          COALESCE(node_analysis.database_nodes, 0) as database_nodes,
          COALESCE(node_analysis.transformation_nodes, 0) as transformation_nodes,
          COALESCE(node_analysis.conditional_nodes, 0) as conditional_nodes,
          -- Development status
          (wd.has_pin_data OR wd.has_static_data) as has_development_data,
          -- Complexity score calculation
          calculate_workflow_complexity(w.id) as estimated_complexity_score
        FROM workflows w
        LEFT JOIN (
          SELECT 
            workflow_id,
            COUNT(*) as connections_count
          FROM workflow_connections
          GROUP BY workflow_id
        ) conn ON w.id = conn.workflow_id
        LEFT JOIN (
          SELECT 
            workflow_id,
            ARRAY_AGG(DISTINCT trigger_type) as trigger_types,
            COUNT(CASE WHEN trigger_type LIKE '%webhook%' THEN 1 END) as webhook_count,
            COUNT(CASE WHEN trigger_type LIKE '%cron%' THEN 1 END) as cron_count,
            COUNT(CASE WHEN trigger_type LIKE '%manual%' THEN 1 END) as manual_count
          FROM workflow_triggers
          GROUP BY workflow_id
        ) trigger_analysis ON w.id = trigger_analysis.workflow_id
        LEFT JOIN (
          SELECT 
            workflow_id,
            COUNT(CASE WHEN node_type LIKE '%http%' THEN 1 END) as http_nodes,
            COUNT(CASE WHEN node_type LIKE '%database%' OR node_type LIKE '%postgres%' OR node_type LIKE '%mysql%' THEN 1 END) as database_nodes,
            COUNT(CASE WHEN node_type LIKE '%set%' OR node_type LIKE '%function%' OR node_type LIKE '%code%' THEN 1 END) as transformation_nodes,
            COUNT(CASE WHEN node_type LIKE '%if%' OR node_type LIKE '%switch%' OR node_type LIKE '%condition%' THEN 1 END) as conditional_nodes
          FROM workflow_nodes
          GROUP BY workflow_id
        ) node_analysis ON w.id = node_analysis.workflow_id
        LEFT JOIN workflow_development_data wd ON w.id = wd.workflow_id
        ON CONFLICT (workflow_id) DO UPDATE SET
          total_paths = EXCLUDED.total_paths,
          max_path_length = EXCLUDED.max_path_length,
          has_parallel_branches = EXCLUDED.has_parallel_branches,
          trigger_types = EXCLUDED.trigger_types,
          webhook_count = EXCLUDED.webhook_count,
          cron_count = EXCLUDED.cron_count,
          http_nodes = EXCLUDED.http_nodes,
          database_nodes = EXCLUDED.database_nodes,
          transformation_nodes = EXCLUDED.transformation_nodes,
          conditional_nodes = EXCLUDED.conditional_nodes,
          has_development_data = EXCLUDED.has_development_data,
          estimated_complexity_score = EXCLUDED.estimated_complexity_score,
          calculated_at = CURRENT_TIMESTAMP
        RETURNING workflow_id;
      `);
      
      processed = result.rows.length;
      console.log(`✅ Workflow analysis sync: ${processed} workflows analyzed`);
      
    } catch (error) {
      console.error(`❌ Workflow analysis sync failed:`, error);
    }
    
    return { processed };
  }

  /**
   * ULTRA ENHANCED SYNC - Maximum data extraction strategy
   */
  async syncAllUltraEnhanced(options: SyncOptions = {}): Promise<SyncResult & {
    versionsProcessed: number;
    connectionsProcessed: number; 
    triggersProcessed: number;
    developmentProcessed: number;
    analysisProcessed: number;
  }> {
    const startTime = Date.now();
    console.log(`🚀 ULTRA ENHANCED SYNC: Starting maximum data extraction...`);
    
    // Start with regular enhanced sync
    const baseResult = await this.syncAllEnhanced(options);
    
    let versionsProcessed = 0;
    let connectionsProcessed = 0;
    let triggersProcessed = 0;
    let developmentProcessed = 0;
    let analysisProcessed = 0;
    
    try {
      // 1. SYNC workflow versions & meta
      const versionResult = await this.syncWorkflowVersioning();
      versionsProcessed = versionResult.processed;
      
      // 2. SYNC workflow connections  
      const connectionsResult = await this.syncWorkflowConnections();
      connectionsProcessed = connectionsResult.processed;
      
      // 3. SYNC workflow triggers
      const triggersResult = await this.syncWorkflowTriggers();
      triggersProcessed = triggersResult.processed;
      
      // 4. SYNC development data
      const devResult = await this.syncWorkflowDevelopmentData();
      developmentProcessed = devResult.processed;
      
      // 5. SYNC advanced analysis (deve essere ultimo per dependencies)
      const analysisResult = await this.syncWorkflowAnalysis();
      analysisProcessed = analysisResult.processed;
      
      console.log(`✅ ULTRA ENHANCED SYNC COMPLETED: versions=${versionsProcessed}, connections=${connectionsProcessed}, triggers=${triggersProcessed}, dev=${developmentProcessed}, analysis=${analysisProcessed}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ultra enhanced sync error';
      baseResult.errors.push(`Ultra enhanced sync: ${message}`);
      console.error(`❌ Ultra enhanced sync failed:`, message);
    }
    
    return {
      ...baseResult,
      versionsProcessed,
      connectionsProcessed,
      triggersProcessed,
      developmentProcessed,
      analysisProcessed,
      duration: Date.now() - startTime
    };
  }
}