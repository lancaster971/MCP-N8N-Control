/**
 * Helper per sanitizzazione dati dal database PostgreSQL
 * REGOLA FERREA: Tutti i dati raw_data devono essere sanitizzati prima del frontend
 */

import { sanitizationUtils } from '../middleware/sanitization.js';

/**
 * Sanitizza i risultati delle query del database per rimuovere riferimenti n8n
 */
export class DatabaseSanitizer {
  
  /**
   * Sanitizza i workflow dal database
   */
  static sanitizeWorkflows(workflows: any[]): any[] {
    return workflows.map(workflow => ({
      ...workflow,
      // Sanitizza il nome del workflow
      name: sanitizationUtils.sanitizeWorkflowName(workflow.name || ''),
      
      // Sanitizza i raw_data JSON che contengono nodeTypes
      raw_data: workflow.raw_data ? sanitizationUtils.sanitizeRawData(workflow.raw_data) : null,
      
      // Sanitizza le tags se presenti
      tags: workflow.tags ? workflow.tags.map((tag: string) => sanitizationUtils.sanitizeString(tag)) : [],
      
      // Sanitizza descrizioni e note
      description: workflow.description ? sanitizationUtils.sanitizeString(workflow.description) : null,
      notes: workflow.notes ? sanitizationUtils.sanitizeString(workflow.notes) : null,
    }));
  }
  
  /**
   * Sanitizza le executions dal database
   */
  static sanitizeExecutions(executions: any[]): any[] {
    return executions.map(execution => ({
      ...execution,
      // Sanitizza i dati di execution
      data: execution.data ? sanitizationUtils.sanitizeRawData(execution.data) : null,
      
      // Sanitizza i messaggi di errore
      error: execution.error ? sanitizationUtils.sanitizeErrorMessage(execution.error) : null,
      
      // Sanitizza workflow name se presente
      workflow_name: execution.workflow_name ? sanitizationUtils.sanitizeWorkflowName(execution.workflow_name) : null,
      
      // Sanitizza execution_data che contiene step details
      execution_data: execution.execution_data ? sanitizationUtils.sanitizeRawData(execution.execution_data) : null,
    }));
  }
  
  /**
   * Sanitizza i log delle sync operations
   */
  static sanitizeSyncLogs(logs: any[]): any[] {
    return logs.map(log => ({
      ...log,
      // Sanitizza i messaggi di log
      message: log.message ? sanitizationUtils.sanitizeString(log.message) : null,
      
      // Sanitizza error messages
      error: log.error ? sanitizationUtils.sanitizeErrorMessage(log.error) : null,
      
      // Sanitizza metadata JSON
      metadata: log.metadata ? sanitizationUtils.sanitizeRawData(log.metadata) : null,
    }));
  }
  
  /**
   * Sanitizza i dati dei security audit
   */
  static sanitizeSecurityData(securityData: any): any {
    return {
      ...securityData,
      // Sanitizza findings che possono contenere node types
      findings: securityData.findings ? sanitizationUtils.sanitizeRawData(securityData.findings) : null,
      
      // Sanitizza recommendations
      recommendations: securityData.recommendations ? 
        sanitizationUtils.sanitizeRawData(securityData.recommendations) : null,
      
      // Sanitizza audit logs
      auditLogs: securityData.auditLogs ? 
        securityData.auditLogs.map((log: any) => sanitizationUtils.sanitizeRawData(log)) : [],
    };
  }
  
  /**
   * Sanitizza i dati degli AI agents per transparency system
   */
  static sanitizeAgentData(agentData: any): any {
    return {
      ...agentData,
      // Sanitizza timeline steps
      timeline: agentData.timeline ? agentData.timeline.map((step: any) => ({
        ...step,
        // Sanitizza node types
        nodeType: step.nodeType ? sanitizationUtils.sanitizeString(step.nodeType) : null,
        
        // Sanitizza input/output data
        inputData: step.inputData ? sanitizationUtils.sanitizeRawData(step.inputData) : null,
        outputData: step.outputData ? sanitizationUtils.sanitizeRawData(step.outputData) : null,
        
        // Sanitizza summary e error messages
        summary: step.summary ? sanitizationUtils.sanitizeString(step.summary) : null,
        error: step.error ? sanitizationUtils.sanitizeErrorMessage(step.error) : null,
      })) : [],
      
      // Sanitizza business context
      businessContext: agentData.businessContext ? 
        sanitizationUtils.sanitizeRawData(agentData.businessContext) : null,
    };
  }
  
  /**
   * Sanitizza genericamente qualsiasi risultato dal database
   */
  static sanitizeGeneric(data: any): any {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => sanitizationUtils.sanitizeObject(item));
    }
    
    return sanitizationUtils.sanitizeObject(data);
  }
  
  /**
   * Wrapper per query del database con sanitizzazione automatica
   */
  static async sanitizeQueryResult<T>(
    queryPromise: Promise<T>, 
    sanitizeFunction?: (data: T) => T
  ): Promise<T> {
    try {
      const result = await queryPromise;
      
      if (sanitizeFunction) {
        return sanitizeFunction(result);
      }
      
      // Sanitizzazione generica come fallback
      return this.sanitizeGeneric(result) as T;
      
    } catch (error) {
      // Sanitizza anche i messaggi di errore
      if (error instanceof Error) {
        error.message = sanitizationUtils.sanitizeErrorMessage(error.message);
      }
      throw error;
    }
  }
}

/**
 * Funzioni di utilità per sanitizzazione SQL queries
 */
export const dbSanitizationUtils = {
  
  /**
   * Sanitizza WHERE clauses che potrebbero contenere riferimenti n8n
   */
  sanitizeWhereClause: (whereClause: string): string => {
    return sanitizationUtils.sanitizeString(whereClause);
  },
  
  /**
   * Sanitizza ORDER BY clauses
   */
  sanitizeOrderBy: (orderBy: string): string => {
    return sanitizationUtils.sanitizeString(orderBy);
  },
  
  /**
   * Sanitizza i parametri delle query
   */
  sanitizeQueryParams: (params: any[]): any[] => {
    return params.map(param => 
      typeof param === 'string' ? sanitizationUtils.sanitizeString(param) : param
    );
  },
  
  /**
   * Verifica se una query contiene riferimenti n8n (per debugging)
   */
  validateQueryForN8nReferences: (query: string, params: any[] = []): void => {
    const fullQuery = query + ' ' + JSON.stringify(params);
    if (fullQuery.toLowerCase().includes('n8n')) {
      console.warn('⚠️  Query contiene riferimenti n8n:', query.substring(0, 100) + '...');
      console.warn('🔒 Considerare sanitizzazione dei parametri');
    }
  }
};

/**
 * Decorator per metodi che devono sanitizzare automaticamente i risultati
 */
export function sanitizeResult(sanitizeFunction?: (data: any) => any) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      if (sanitizeFunction) {
        return sanitizeFunction(result);
      }
      
      return DatabaseSanitizer.sanitizeGeneric(result);
    };
  };
}