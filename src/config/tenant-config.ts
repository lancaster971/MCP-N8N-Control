/**
 * Tenant Configuration Management
 * Gestisce la logica mono-tenant vs multi-tenant
 */

import { getEnvConfig } from './environment.js';

let tenantConfig: TenantConfig | null = null;

export interface TenantConfig {
  isMultiTenantMode: boolean;
  defaultTenantId: string;
}

/**
 * Inizializza e restituisce la configurazione tenant
 */
export function getTenantConfig(): TenantConfig {
  if (!tenantConfig) {
    const envConfig = getEnvConfig();
    tenantConfig = {
      isMultiTenantMode: envConfig.multiTenantMode,
      defaultTenantId: envConfig.defaultTenantId,
    };
  }
  return tenantConfig;
}

/**
 * Determina il tenant ID da utilizzare
 * In modo mono-tenant, usa sempre il default tenant
 * In modo multi-tenant, usa il tenant fornito o fallback al default
 */
export function resolveTenantId(providedTenantId?: string): string {
  const config = getTenantConfig();
  
  if (!config.isMultiTenantMode) {
    // Modo mono-tenant: ignora il tenant fornito e usa sempre il default
    return config.defaultTenantId;
  }
  
  // Modo multi-tenant: usa il tenant fornito o fallback al default
  return providedTenantId || config.defaultTenantId;
}

/**
 * Valida se un tenant ID è permesso
 * In modo mono-tenant, accetta solo il default tenant
 * In modo multi-tenant, accetta qualsiasi tenant ID valido
 */
export function validateTenantId(tenantId: string): boolean {
  const config = getTenantConfig();
  
  if (!config.isMultiTenantMode) {
    // Modo mono-tenant: solo il default tenant è valido
    return tenantId === config.defaultTenantId;
  }
  
  // Modo multi-tenant: qualsiasi tenant ID non vuoto è valido
  return Boolean(tenantId && tenantId.trim().length > 0);
}

/**
 * Ottiene la lista di tenant disponibili
 * In modo mono-tenant, restituisce solo il default
 * In modo multi-tenant, dovrebbe essere implementato per restituire tutti i tenant attivi
 */
export function getAvailableTenants(): string[] {
  const config = getTenantConfig();
  
  if (!config.isMultiTenantMode) {
    return [config.defaultTenantId];
  }
  
  // TODO: In futuro, implementare query per ottenere lista tenant attivi dal database
  return [config.defaultTenantId];
}

/**
 * Sanitizza tenant ID per utilizzo sicuro nelle query
 */
export function sanitizeTenantId(tenantId: string): string {
  // Rimuove caratteri pericolosi e limita lunghezza
  return tenantId
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .substring(0, 255);
}

/**
 * Log helper per indicare la modalità tenant corrente
 */
export function logTenantMode(): void {
  const config = getTenantConfig();
  console.log(`🏢 Tenant Mode: ${config.isMultiTenantMode ? 'Multi-Tenant' : 'Mono-Tenant'}`);
  console.log(`🏷️  Default Tenant: ${config.defaultTenantId}`);
}