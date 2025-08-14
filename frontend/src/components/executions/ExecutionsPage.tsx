import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Filter,
  Download,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  MoreHorizontal,
  Calendar,
  GitBranch,
  Activity,
  Search,
} from 'lucide-react'
import { tenantAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

interface Execution {
  id: string
  tenant_id: string
  workflow_id: string
  workflow_name: string
  status: 'success' | 'error' | 'running' | 'waiting' | null
  mode: string
  started_at: string
  stopped_at?: string
  duration_ms?: number
  error_message?: string
}

const getStatusInfo = (status: string | null) => {
  switch (status) {
    case 'success':
      return {
        label: 'Success',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        icon: CheckCircle,
        dotColor: 'bg-primary'
      }
    case 'error':
      return {
        label: 'Error',
        color: 'text-muted',
        bgColor: 'bg-muted/10',
        borderColor: 'border-muted/30',
        icon: XCircle,
        dotColor: 'bg-muted'
      }
    case 'running':
      return {
        label: 'Running',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        icon: Play,
        dotColor: 'bg-primary'
      }
    case 'waiting':
      return {
        label: 'Waiting',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        icon: Clock,
        dotColor: 'bg-primary'
      }
    default:
      return {
        label: 'Unknown',
        color: 'text-muted',
        bgColor: 'bg-card/10',
        borderColor: 'border-border/30',
        icon: Pause,
        dotColor: 'bg-card'
      }
  }
}

const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.round(ms / 1000 * 10) / 10}s`
  return `${Math.round(ms / 60000 * 10) / 10}min`
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const executionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const timeStr = date.toLocaleTimeString('it-IT', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
  
  if (executionDate.getTime() === today.getTime()) {
    return timeStr
  }
  
  return `${date.toLocaleDateString('it-IT', { 
    month: 'short', 
    day: '2-digit' 
  })}, ${timeStr}`
}

export const ExecutionsPage: React.FC = () => {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || 'default_tenant'
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'running' | 'waiting'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [workflowFilter, setWorkflowFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [_executionTags, _setExecutionTags] = useState('')
  const [_rating, _setRating] = useState('any')
  const [highlightedData, setHighlightedData] = useState({ key: '', value: '', exactMatch: false })

  // Fetch executions del tenant
  const { data: executionsData, isLoading, refetch } = useQuery({
    queryKey: ['tenant-executions', tenantId, statusFilter],
    queryFn: async () => {
      const response = await tenantAPI.executions(tenantId, { limit: 50 })
      return response.data
    },
    refetchInterval: autoRefresh ? 5000 : false, // Auto refresh ogni 5 secondi
  })

  // Fetch workflows per popolare il dropdown
  const { data: workflowsData, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['tenant-workflows', tenantId],
    queryFn: async () => {
      const response = await tenantAPI.workflows(tenantId)
      return response.data
    },
    enabled: showFilters, // Carica solo quando i filtri sono visibili
  })

  const executions = executionsData?.executions || []
  const workflows = workflowsData?.workflows || []

  // Filtra executions per status E workflow
  const filteredExecutions = executions.filter((execution: Execution) => {
    // Filtro per status
    if (statusFilter !== 'all' && execution.status !== statusFilter) return false
    
    // Filtro per workflow
    if (workflowFilter !== 'all' && execution.workflow_id !== workflowFilter) return false
    
    return true
  })

  // Stats
  const stats = {
    total: executions.length,
    success: executions.filter((e: Execution) => e.status === 'success').length,
    error: executions.filter((e: Execution) => e.status === 'error').length,
    running: executions.filter((e: Execution) => e.status === 'running').length,
    waiting: executions.filter((e: Execution) => e.status === 'waiting').length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="control-card p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-card rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error handling removed - not needed anymore

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Executions - {executionsData?.tenantId}
          </h1>
          <p className="text-muted mt-1">
            Monitora le esecuzioni dei tuoi workflow
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "btn-control",
              showFilters && "bg-primary/20 border-primary/30 text-primary"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtri
          </button>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary"
            />
            <label htmlFor="auto-refresh" className="text-sm text-foreground">
              Auto refresh
            </label>
          </div>
          
          <button 
            onClick={() => refetch()} 
            className="btn-control"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </button>
          
          <button className="btn-control">
            <Download className="h-4 w-4" />
            Esporta
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="control-card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted">Totali</p>
          </div>
        </div>
        
        <div className="control-card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.success}</p>
            <p className="text-xs text-muted">Success</p>
          </div>
        </div>
        
        <div className="control-card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-muted">{stats.error}</p>
            <p className="text-xs text-muted">Error</p>
          </div>
        </div>
        
        <div className="control-card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.running}</p>
            <p className="text-xs text-muted">Running</p>
          </div>
        </div>
        
        <div className="control-card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.waiting}</p>
            <p className="text-xs text-muted">Waiting</p>
          </div>
        </div>
      </div>

      {/* Advanced Filters Form */}
      {showFilters && (
        <div className="control-card">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Filtri Avanzati</h3>
            <p className="text-sm text-muted">Filtra le executions per criteri specifici</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflows Filter */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  <GitBranch className="h-4 w-4 inline mr-2" />
                  Workflows
                </label>
                <select
                  value={workflowFilter}
                  onChange={(e) => setWorkflowFilter(e.target.value)}
                  disabled={isLoadingWorkflows}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50"
                >
                  <option value="all">
                    {isLoadingWorkflows ? 'Caricando workflows...' : `All Workflows (${workflows.length})`}
                  </option>
                  {!isLoadingWorkflows && workflows.map((workflow: any) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  <Activity className="h-4 w-4 inline mr-2" />
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                >
                  <option value="all">Any Status ({stats.total})</option>
                  <option value="success">Success ({stats.success})</option>
                  <option value="error">Error ({stats.error})</option>
                  <option value="running">Running ({stats.running})</option>
                  <option value="waiting">Waiting ({stats.waiting})</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Execution Start Date Range */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Execution start
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Da (Earliest)</label>
                    <input
                      type="datetime-local"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">A (Latest)</label>
                    <input
                      type="datetime-local"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Execution ID Search */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search Execution ID
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={highlightedData.key}
                    onChange={(e) => setHighlightedData(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Cerca per Execution ID..."
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="exact-match"
                      checked={highlightedData.exactMatch}
                      onChange={(e) => setHighlightedData(prev => ({ ...prev, exactMatch: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="exact-match" className="text-sm text-foreground">
                      Exact match
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
              <div className="text-sm text-muted">
                {filteredExecutions.length} di {stats.total} executions
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setWorkflowFilter('all')
                    setStatusFilter('all')
                    setDateRange({ start: '', end: '' })
                    _setExecutionTags('')
                    _setRating('any')
                    setHighlightedData({ key: '', value: '', exactMatch: false })
                  }}
                  className="btn-control"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filtri
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-control-primary"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Applica Filtri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executions Table */}
      <div className="control-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted">
                  <input type="checkbox" className="w-4 h-4 bg-card border-border rounded" />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted">Workflow</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Started</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Run Time</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Exec. ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted"></th>
              </tr>
            </thead>
            <tbody>
              {filteredExecutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    <Play className="h-8 w-8 mx-auto mb-2 text-muted" />
                    Nessuna execution trovata
                  </td>
                </tr>
              ) : (
                filteredExecutions.map((execution: Execution) => {
                  const statusInfo = getStatusInfo(execution.status)
                  
                  return (
                    <tr 
                      key={execution.id} 
                      className="border-b border-border/50 hover:bg-card/30 transition-colors"
                    >
                      <td className="p-4">
                        <input type="checkbox" className="w-4 h-4 bg-card border-border rounded" />
                      </td>
                      
                      <td className="p-4">
                        <div className="font-medium text-foreground max-w-xs">
                          <span className="truncate block" title={execution.workflow_name}>
                            {execution.workflow_name}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
                          statusInfo.bgColor,
                          statusInfo.borderColor,
                          statusInfo.color
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dotColor)} />
                          {statusInfo.label}
                        </span>
                      </td>
                      
                      <td className="p-4 text-sm text-muted">
                        {formatTime(execution.started_at)}
                      </td>
                      
                      <td className="p-4 text-sm text-muted font-mono">
                        {formatDuration(execution.duration_ms)}
                      </td>
                      
                      <td className="p-4 text-sm text-muted font-mono">
                        {execution.id}
                      </td>
                      
                      <td className="p-4">
                        <button className="p-1 text-muted hover:text-foreground transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination placeholder */}
      {filteredExecutions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Visualizzando {filteredExecutions.length} di {stats.total} executions
          </p>
          <div className="flex items-center gap-2">
            <button className="btn-control text-xs px-3 py-1" disabled>
              Precedente
            </button>
            <button className="btn-control text-xs px-3 py-1" disabled>
              Successiva
            </button>
          </div>
        </div>
      )}
    </div>
  )
}