import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  Plus,
  Settings,
  Search,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  Timer,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { schedulerAPI, statsAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

interface ScheduledJob {
  id: string
  name: string
  description: string
  cron: string
  cronReadable: string
  workflowId: string
  workflowName: string
  status: 'active' | 'paused' | 'disabled' | 'error'
  lastRun?: string
  lastRunStatus?: 'success' | 'failed' | 'running'
  nextRun: string
  executionCount: number
  averageDuration: number
  successRate: number
  priority: 'high' | 'medium' | 'low'
  timezone: string
  createdAt: string
  updatedAt: string
}

interface SchedulerStats {
  totalJobs: number
  activeJobs: number
  pausedJobs: number
  runningJobs: number
  successRate: number
  totalExecutions: number
  avgExecutionTime: number
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active':
    case 'running':
      return {
        label: 'Active',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        icon: Play
      }
    case 'paused':
      return {
        label: 'Paused',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        icon: Pause
      }
    case 'disabled':
      return {
        label: 'Disabled',
        color: 'text-muted',
        bgColor: 'bg-card/10',
        borderColor: 'border-border/30',
        icon: Square
      }
    case 'error':
      return {
        label: 'Error',
        color: 'text-muted',
        bgColor: 'bg-muted/10',
        borderColor: 'border-muted/30',
        icon: XCircle
      }
    default:
      return {
        label: 'Unknown',
        color: 'text-muted',
        bgColor: 'bg-card/10',
        borderColor: 'border-border/30',
        icon: Square
      }
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-muted bg-muted/10 border-muted/30'
    case 'medium': return 'text-primary bg-primary/10 border-primary/30'
    case 'low': return 'text-primary bg-primary/10 border-primary/30'
    default: return 'text-muted bg-card/10 border-border/30'
  }
}

export const SchedulerPage: React.FC = () => {
  const { user } = useAuthStore()
  const _tenantId = user?.tenantId || 'default_tenant'
  void _tenantId // suppress unused warning
  
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'history'>('overview')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'disabled' | 'error'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch real data from backend
  const { data: schedulerStatus, isLoading: isLoadingScheduler, refetch: refetchScheduler } = useQuery({
    queryKey: ['scheduler-status'],
    queryFn: async () => {
      const response = await schedulerAPI.status()
      return response.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: systemStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const response = await statsAPI.system()
      return response.data
    },
    refetchInterval: 60000,
  })

  const { data: syncHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['sync-history'],
    queryFn: async () => {
      const response = await schedulerAPI.getSyncHistory()
      return response.data
    },
    refetchInterval: 60000,
  })

  // Process backend data into component format
  const processedStats: SchedulerStats = {
    totalJobs: systemStats?.database?.activeTenants || 0,
    activeJobs: schedulerStatus?.scheduler?.isRunning ? (systemStats?.database?.activeTenants || 0) : 0,
    pausedJobs: schedulerStatus?.scheduler?.isRunning ? 0 : (systemStats?.database?.activeTenants || 0),
    runningJobs: schedulerStatus?.scheduler?.isRunning ? 1 : 0,
    successRate: 97.8, // Placeholder - not available in backend
    totalExecutions: systemStats?.scheduler?.totalSyncRuns || 0,
    avgExecutionTime: 180000 // 3 minutes placeholder
  }

  // Transform sync logs into scheduled jobs format
  const processedJobs: ScheduledJob[] = syncHistory?.logs?.slice(0, 10).map((log: any, index: number) => ({
    id: log.id || `job-${index}`,
    name: `Sync Job for ${log.tenant_name || 'Unknown Tenant'}`,
    description: `Automated sync for tenant: ${log.tenant_name || 'Unknown'}`,
    cron: '*/30 * * * *', // Every 30 minutes placeholder
    cronReadable: 'Every 30 minutes',
    workflowId: `tenant-${log.tenant_id}`,
    workflowName: `${log.tenant_name} Sync`,
    status: log.success ? 'active' : 'error',
    lastRun: log.started_at,
    lastRunStatus: log.success ? 'success' : 'failed',
    nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
    executionCount: log.items_processed || 0,
    averageDuration: log.duration_ms || 180000,
    successRate: log.success ? 100 : 0,
    priority: 'medium' as const,
    timezone: 'Europe/Rome',
    createdAt: log.started_at,
    updatedAt: log.started_at
  })) || []

  // Filtri
  const filteredJobs = processedJobs.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.workflowName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT')
  }

  const formatDuration = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`
    return `${Math.round(ms / 3600000)}h`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Scheduler Control
          </h1>
          <p className="text-muted mt-1">
            Gestione scheduling automatico e monitoraggio job
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetchScheduler()}
            disabled={isLoadingScheduler}
            className="btn-control disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isLoadingScheduler && 'animate-spin')} />
            Aggiorna
          </button>
          
          <button className="btn-control">
            <Settings className="h-4 w-4" />
            Configurazione
          </button>
          
          <button className="btn-control-primary">
            <Plus className="h-4 w-4" />
            Nuovo Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Jobs Totali</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoadingStats ? '-' : processedStats.totalJobs}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-muted" />
          </div>
        </div>

        <div className="control-card p-6 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Scheduler Status</p>
              <p className={cn(
                'text-2xl font-bold',
                schedulerStatus?.scheduler?.isRunning ? 'text-primary' : 'text-muted'
              )}>
                {isLoadingScheduler ? '-' : (schedulerStatus?.scheduler?.isRunning ? 'RUNNING' : 'STOPPED')}
              </p>
            </div>
            <Play className={cn(
              'h-8 w-8',
              schedulerStatus?.scheduler?.isRunning ? 'text-primary' : 'text-muted'
            )} />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Sync Runs</p>
              <p className="text-2xl font-bold text-primary">
                {isLoadingStats ? '-' : (systemStats?.scheduler?.totalSyncRuns || 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-muted" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Active Tenants</p>
              <p className="text-2xl font-bold text-primary">
                {isLoadingStats ? '-' : (systemStats?.database?.activeTenants || 0)}
              </p>
            </div>
            <Target className="h-8 w-8 text-muted" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="control-card p-1">
        <div className="flex items-center gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'jobs', label: 'Scheduled Jobs', icon: Clock },
            { id: 'history', label: 'Execution History', icon: Activity },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-primary text-foreground'
                  : 'text-muted hover:bg-card hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Scheduler Running</span>
                  <span className={cn(
                    'font-bold',
                    schedulerStatus?.scheduler?.isRunning ? 'text-primary' : 'text-muted'
                  )}>
                    {isLoadingScheduler ? '-' : (schedulerStatus?.scheduler?.isRunning ? 'YES' : 'NO')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Active Tenants</span>
                  <span className="text-foreground font-bold">
                    {isLoadingStats ? '-' : systemStats?.database?.activeTenants || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">System Uptime</span>
                  <span className="text-primary font-bold">
                    {isLoadingScheduler ? '-' : formatDuration((schedulerStatus?.system?.uptime || 0) * 1000)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Last Sync</span>
                  <span className="text-primary font-bold">
                    {isLoadingStats ? '-' : (systemStats?.scheduler?.lastSyncTime ? formatTime(systemStats.scheduler.lastSyncTime) : 'Never')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Recent Sync Activity
              </h3>
              <div className="space-y-3">
                {isLoadingHistory ? (
                  <div className="text-muted">Caricamento...</div>
                ) : syncHistory?.logs?.length === 0 ? (
                  <div className="text-muted">Nessun sync recente</div>
                ) : (
                  syncHistory?.logs?.slice(0, 5).map((log: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div>
                        <p className="text-foreground font-medium">{log.tenant_name || 'Unknown Tenant'}</p>
                        <p className="text-xs text-muted">
                          {log.items_processed || 0} items • {formatDuration(log.duration_ms || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {log.success ? (
                            <CheckCircle className="h-3 w-3 text-primary" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted" />
                          )}
                          <span className={cn(
                            'text-xs font-medium',
                            log.success ? 'text-primary' : 'text-muted'
                          )}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{formatTime(log.started_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="control-card p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Cerca jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md text-foreground text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-card border border-border rounded-md text-foreground text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">Tutti gli status</option>
                <option value="active">Solo Attivi</option>
                <option value="paused">Solo Paused</option>
                <option value="disabled">Solo Disabled</option>
                <option value="error">Solo Errori</option>
              </select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="control-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted">Job Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted">Schedule</th>
                    <th className="text-left p-4 text-sm font-medium text-muted">Last Run</th>
                    <th className="text-left p-4 text-sm font-medium text-muted">Duration</th>
                    <th className="text-left p-4 text-sm font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted">
                        Caricamento...
                      </td>
                    </tr>
                  ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted">
                        Nessun job trovato
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => {
                      const statusInfo = getStatusInfo(job.status)
                      const StatusIcon = statusInfo.icon
                      
                      return (
                        <tr 
                          key={job.id} 
                          className="border-b border-border/50 hover:bg-card/30 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-foreground font-medium">{job.name}</h4>
                                <span className={cn(
                                  'px-2 py-1 rounded text-xs font-medium border',
                                  getPriorityColor(job.priority)
                                )}>
                                  {job.priority}
                                </span>
                              </div>
                              <p className="text-sm text-muted mt-1">{job.description}</p>
                              <p className="text-xs text-primary">{job.workflowName}</p>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                              statusInfo.bgColor,
                              statusInfo.borderColor,
                              statusInfo.color
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            <div>
                              <p className="text-foreground font-mono text-sm">{job.cron}</p>
                              <p className="text-xs text-muted">{job.cronReadable}</p>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            {job.lastRun && (
                              <div className="flex items-center gap-1">
                                {job.lastRunStatus === 'success' && <CheckCircle className="h-3 w-3 text-primary" />}
                                {job.lastRunStatus === 'failed' && <XCircle className="h-3 w-3 text-muted" />}
                                {job.lastRunStatus === 'running' && <Play className="h-3 w-3 text-primary animate-pulse" />}
                                <span className="text-xs text-muted">
                                  {formatTime(job.lastRun)}
                                </span>
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <p className="text-sm text-foreground">
                              {formatDuration(job.averageDuration)}
                            </p>
                            <p className="text-xs text-muted">{job.executionCount} runs</p>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <button className="p-1 text-muted hover:text-primary transition-colors">
                                {job.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                              </button>
                              <button className="p-1 text-muted hover:text-primary transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-muted hover:text-primary transition-colors">
                                <Copy className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-muted hover:text-muted transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="control-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Sync Execution History
          </h3>
          
          {isLoadingHistory ? (
            <div className="text-muted">Caricamento...</div>
          ) : (
            <div className="space-y-3">
              {syncHistory?.logs?.map((log: any, index: number) => (
                <div key={index} className="p-4 bg-card/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-foreground font-medium">{log.tenant_name || 'Unknown Tenant'}</h4>
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted" />
                      )}
                      <span className={cn(
                        'text-sm font-medium',
                        log.success ? 'text-primary' : 'text-muted'
                      )}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Started</span>
                      <p className="text-foreground">{formatTime(log.started_at)}</p>
                    </div>
                    <div>
                      <span className="text-muted">Duration</span>
                      <p className="text-foreground">{formatDuration(log.duration_ms || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted">Items</span>
                      <p className="text-foreground">{log.items_processed || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted">Tenant</span>
                      <p className="text-foreground">{log.tenant_id}</p>
                    </div>
                  </div>
                  
                  {log.error_message && (
                    <div className="mt-2 p-2 bg-muted/10 border border-muted/30 rounded">
                      <p className="text-muted text-sm">{log.error_message}</p>
                    </div>
                  )}
                </div>
              )) || <div className="text-muted">Nessun history disponibile</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}