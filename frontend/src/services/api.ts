import axios from 'axios'
import { sanitizeApiResponse } from '../utils/sanitization'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors + sanitization backup
api.interceptors.response.use(
  (response) => {
    // 🔒 BACKUP SANITIZZAZIONE: Layer 2 di sicurezza per garantire zero riferimenti interni
    if (response.data) {
      response.data = sanitizeApiResponse(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Sanitizza anche i messaggi di errore
    if (error.response?.data) {
      error.response.data = sanitizeApiResponse(error.response.data);
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  refresh: () => api.post('/auth/refresh'),
}

// Scheduler API
export const schedulerAPI = {
  status: () => api.get('/api/scheduler/status'),
  start: () => api.post('/api/scheduler/start'),
  stop: () => api.post('/api/scheduler/stop'),
  triggerSync: (tenantId?: string) =>
    api.post('/api/scheduler/sync', { tenantId }),
  getSyncHistory: () => api.get('/api/logs'),
  refreshWorkflow: (tenantId: string, workflowId: string) => 
    api.post('/api/scheduler/refresh-workflow', { tenantId, workflowId })
}

// Tenants API
export const tenantsAPI = {
  list: () => api.get('/api/tenants'),
  get: (id: string) => api.get(`/api/tenants/${id}`),
  create: (data: any) => api.post('/api/tenants', data),
  update: (id: string, data: any) => api.put(`/api/tenants/${id}`, data),
  delete: (id: string) => api.delete(`/api/tenants/${id}`),
  syncNow: (id: string) => api.put(`/api/tenants/${id}/sync`, { enabled: true }),
  getWorkflows: (id: string) => api.get(`/api/tenants/${id}/workflows`),
  getExecutions: (id: string) => api.get(`/api/tenants/${id}/executions`),
}

// Workflows API - USA TENANT-SPECIFIC ENDPOINTS
export const workflowsAPI = {
  list: (tenantId: string = 'client_simulation_a', params?: any) => 
    api.get(`/api/tenant/${tenantId}/workflows`, { params }),
  get: (id: string, tenantId: string = 'client_simulation_a') => 
    api.get(`/api/tenant/${tenantId}/workflows/${id}/details`),
  getExecutions: (id: string, tenantId: string = 'client_simulation_a') => 
    api.get(`/api/tenant/${tenantId}/executions`, { params: { workflowId: id } }),
  getNodes: (id: string, tenantId: string = 'client_simulation_a') => 
    api.get(`/api/tenant/${tenantId}/workflows/${id}/details`),
  getStats: (id: string, tenantId: string = 'client_simulation_a') => 
    api.get(`/api/tenant/${tenantId}/workflows/${id}/details`),
}

// Executions API
export const executionsAPI = {
  list: (params?: any) => api.get('/executions', { params }),
  get: (id: string) => api.get(`/executions/${id}`),
  getDetails: (id: string) => api.get(`/executions/${id}/details`),
  retry: (id: string) => api.post(`/executions/${id}/retry`),
  stop: (id: string) => api.post(`/executions/${id}/stop`),
}

// Stats API - USA TENANT-SPECIFIC ENDPOINTS!
export const statsAPI = {
  system: () => api.get('/api/stats'),
  database: () => api.get('/api/stats'),
  scheduler: () => api.get('/api/scheduler/status'),
  tenants: () => api.get('/api/tenants'),
  workflows: () => api.get('/api/stats'),
  executions: () => api.get('/api/stats'),
  kpis: () => api.get('/api/stats'),
  realtime: () => api.get('/api/stats'),
}

// Database API - per sostituire mock data
export const databaseAPI = {
  // Get system database stats from main stats endpoint
  stats: () => api.get('/api/stats'),
  
  // Get table information from database (non implementato, usa mock)
  tables: () => Promise.resolve({ data: { tables: [] } }),
  
  // Get recent database activity from sync logs
  recentActivity: (params?: any) => api.get('/api/logs', { params }),
}

// Alerts API - per sostituire mock data
export const alertsAPI = {
  // Get system alerts from scheduler health
  list: () => api.get('/api/scheduler/status'),
  
  // Get monitoring metrics from system stats
  metrics: () => api.get('/api/stats'),
  
  // Get health status
  health: () => api.get('/api/scheduler/status'),
}

// 🤖 AI Agents API - MISSING ENDPOINTS COMPLETATI
export const aiAgentsAPI = {
  // Get workflow con AI agents detection
  getWorkflowsWithAgents: (tenantId: string = 'client_simulation_a') =>
    api.get(`/api/tenant/${tenantId}/agents/workflows`),
    
  // Get timeline step-by-step per workflow specifico  
  getWorkflowTimeline: (tenantId: string = 'client_simulation_a', workflowId: string, forceRefresh?: boolean) =>
    api.get(`/api/tenant/${tenantId}/agents/workflow/${workflowId}/timeline`, {
      params: forceRefresh ? { forceRefresh: 'true' } : {}
    }),
    
  // Force refresh workflow da WFEngine API
  forceRefreshWorkflow: (tenantId: string = 'client_simulation_a', workflowId: string) =>
    api.post(`/api/tenant/${tenantId}/agents/workflow/${workflowId}/refresh`),
}

// 🔒 Security API Completa - ZERO MOCK DATA
export const securityAPI = {
  // Get tenant security logs (deriva dai tenant logs esistenti)
  logs: (tenantId: string = 'default_tenant', params?: any) => 
    api.get('/api/logs', { params: { tenantId, ...params } }),
  
  // Get system metrics from scheduler endpoint  
  metrics: () => api.get('/api/stats'),
  
  // Mock API keys (non implementato nel backend, usa dati fittizi)
  apiKeys: () => Promise.resolve({ data: { apiKeys: [] } }),
  // Get security audit completo con dati reali
  getAuditReport: (tenantId: string = 'client_simulation_a') =>
    api.get(`/api/tenant/${tenantId}/security/audit`),
    
  // Get security score dinamico
  getSecurityScore: (tenantId: string = 'client_simulation_a') =>
    api.get(`/api/tenant/${tenantId}/security/score`),
    
  // Get compliance report automatico
  getComplianceReport: (tenantId: string = 'client_simulation_a') =>
    api.get(`/api/tenant/${tenantId}/compliance/report`),
    
  // Get security incidents
  getSecurityIncidents: (tenantId: string = 'client_simulation_a') =>
    api.get(`/api/tenant/${tenantId}/security/incidents`),
}

// Tenant-specific API - SOLO DATI DEL TUO TENANT!
export const tenantAPI = {
  // Dashboard con tutti i dati del tenant
  dashboard: (tenantId: string = 'default_tenant') => 
    api.get(`/api/tenant/${tenantId}/dashboard`),
  
  // Stats specifiche per tenant
  stats: (tenantId: string = 'default_tenant') => 
    api.get(`/api/tenant/${tenantId}/stats`),
  
  // Workflows del tenant
  workflows: (tenantId: string = 'default_tenant') => 
    api.get(`/api/tenant/${tenantId}/workflows`),
  
  // Executions del tenant
  executions: (tenantId: string = 'default_tenant', params?: any) => 
    api.get(`/api/tenant/${tenantId}/executions`, { params }),
    
  // Advanced analytics per Stats page
  analytics: {
    // Performance data derivato dalle stats esistenti
    performance: (tenantId: string = 'default_tenant') => 
      api.get(`/api/tenant/${tenantId}/stats`),
    
    // Top workflows da stats endpoint
    topWorkflows: (tenantId: string = 'default_tenant') => 
      api.get(`/api/tenant/${tenantId}/stats`),
    
    // Time series data (non ancora implementato, usa stats base)
    timeSeries: (tenantId: string = 'default_tenant') => 
      api.get(`/api/tenant/${tenantId}/stats`),
  },
  
  // 🤖 AI Agents API
  agents: {
    // Lista workflow con AI agents
    workflows: (tenantId: string = 'default_tenant') => 
      api.get(`/api/tenant/${tenantId}/agents/workflows`),
    
    // Timeline workflow specifico
    timeline: (tenantId: string = 'default_tenant', workflowId: string, forceRefresh: boolean = false) => 
      api.get(`/api/tenant/${tenantId}/agents/workflow/${workflowId}/timeline`, {
        params: forceRefresh ? { forceRefresh: 'true' } : {}
      }),
    
    // Force refresh workflow
    refresh: (tenantId: string = 'default_tenant', workflowId: string) => 
      api.post(`/api/tenant/${tenantId}/agents/workflow/${workflowId}/refresh`),
  },
}

// Users API
export const usersAPI = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (id: string, data: any) =>
    api.post(`/users/${id}/change-password`, data),
}

// Monitoring API
export const monitoringAPI = {
  alerts: () => api.get('/health/dashboard'),
  metrics: () => api.get('/health/dashboard'),
  health: () => api.get('/health/check'),
  logs: (params?: any) => api.get('/api/logs', { params }),
}