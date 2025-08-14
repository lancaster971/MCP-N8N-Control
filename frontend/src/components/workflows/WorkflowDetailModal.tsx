import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  X,
  GitBranch,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Copy,
  Download,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Calendar,
  Server,
  Cpu,
  Link2,
  Box,
  Layers,
  BarChart3,
  Info,
  Mail,
  MessageSquare,
  Send,
  FileText,
  Webhook,
  Brain,
  Cog,
  Globe,
  Package,
} from 'lucide-react'
import { api, schedulerAPI } from '../../services/api'
import { cn, formatDate } from '../../lib/utils'
import ReactApexChart from 'react-apexcharts'

interface WorkflowDetailModalProps {
  workflow: any
  tenantId: string
  onClose: () => void
}

interface NodeAnalysis {
  totalNodes: number
  nodesByType: Record<string, number>
  triggers: any[]
  outputs: any[]
  aiAgents: any[]
  tools: any[]
  subWorkflows: any[]
  connections: any[]
}

interface ExecutionStats {
  total: number
  successful: number
  failed: number
  averageDuration: number
  lastExecution?: string
  recentExecutions: any[]
  hourlyDistribution?: Record<string, number>
  dailyTrend?: any[]
}

export const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({
  workflow,
  tenantId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'nodes' | 'performance' | 'activity'>('overview')

  // Fetch detailed workflow data with smart cache invalidation
  const { data: detailData, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-details', tenantId, workflow.id],
    queryFn: async () => {
      console.log(`🔄 Fetching fresh workflow details for ${workflow.id}`)
      const response = await api.get(`/api/tenant/${tenantId}/workflows/${workflow.id}/details`)
      return response.data
    },
    refetchInterval: 15000, // More frequent refresh for modal data (15 seconds)
    refetchOnMount: true, // Always refresh when modal opens
    refetchOnWindowFocus: true, // Refresh when user comes back to window
    staleTime: 0, // Data is immediately considered stale to ensure freshness
  })

  // Debug: log dei dati ricevuti
  console.log('WorkflowDetailModal - detailData:', detailData)
  
  const details = detailData || {}
  const nodeAnalysis: NodeAnalysis = detailData?.nodeAnalysis || { totalNodes: 0, nodesByType: {}, triggers: [], outputs: [], aiAgents: [], tools: [], subWorkflows: [], connections: [] }
  const executionStats: ExecutionStats = detailData?.executionStats || { total: 0, successful: 0, failed: 0, averageDuration: 0, recentExecutions: [] }
  const performance = detailData?.performance || {}
  
  console.log('nodeAnalysis:', nodeAnalysis)
  console.log('executionStats:', executionStats)
  console.log('performance:', performance)

  // Chart configuration for executions trend
  const executionChartOptions = {
    chart: {
      type: 'area' as const,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--muted))'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: executionStats.dailyTrend?.map(d => d.date) || [],
      labels: { style: { colors: 'hsl(var(--muted))' } },
    },
    yaxis: {
      labels: { style: { colors: 'hsl(var(--muted))' } },
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 3,
    },
    theme: { mode: 'dark' },
    legend: {
      labels: { colors: 'hsl(var(--muted))' },
    },
  }

  const executionChartSeries = [
    {
      name: 'Successful',
      data: executionStats.dailyTrend?.map(d => d.successful) || [],
    },
    {
      name: 'Failed',
      data: executionStats.dailyTrend?.map(d => d.failed) || [],
    },
  ]

  // Node type distribution chart
  const nodeTypeChartOptions = {
    chart: {
      type: 'donut' as const,
      background: 'transparent',
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(var(--primary))'],
    labels: Object.keys(nodeAnalysis.nodesByType).map(type => type.split('.').pop() || type),
    dataLabels: {
      enabled: true,
      style: { colors: ['hsl(var(--foreground))'] },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Nodes',
              color: 'hsl(var(--muted))',
              formatter: () => String(nodeAnalysis.totalNodes),
            },
          },
        },
      },
    },
    legend: {
      labels: { colors: 'hsl(var(--muted))' },
      position: 'bottom' as const,
    },
    theme: { mode: 'dark' },
  }

  const nodeTypeChartSeries = Object.values(nodeAnalysis.nodesByType)

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(workflow, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `workflow-${workflow.name}-${Date.now()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/80 backdrop-blur-sm">
        <div className="w-full max-w-6xl max-h-[90vh] bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted">Caricamento dettagli workflow...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/80 backdrop-blur-sm">
        <div className="w-full max-w-6xl max-h-[90vh] bg-card border border-muted/30 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-muted">Errore nel caricamento</h2>
              <button
                onClick={onClose}
                className="p-2 text-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-muted">
              Impossibile caricare i dettagli del workflow. Riprova più tardi.
            </p>
            <p className="text-sm text-muted mt-2">
              {(error as any)?.message || 'Errore sconosciuto'}
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => refetch()} className="btn-control">
                Riprova
              </button>
              <button onClick={onClose} className="btn-control">
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{workflow.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted">ID: {workflow.id}</span>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  workflow.active 
                    ? 'bg-primary/10 border border-primary/30 text-primary'
                    : 'bg-primary/10 border border-primary/30 text-primary'
                )}>
                  {workflow.active ? 'Active' : 'Inactive'}
                </span>
                {workflow.has_webhook && (
                  <span className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary rounded text-xs font-medium">
                    Webhook
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(workflow.id)}
              className="p-2 text-muted hover:text-primary transition-colors"
              title="Copy ID"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-muted hover:text-primary transition-colors"
              title="Export JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={async () => {
                console.log('🔄 Force refresh requested for workflow', workflow.id)
                try {
                  // First: Force sync from n8n
                  await schedulerAPI.refreshWorkflow(tenantId, workflow.id)
                  console.log('✅ Backend sync completed')
                  
                  // Then: Refetch from our database
                  await refetch()
                  console.log('✅ Frontend data refreshed')
                } catch (error) {
                  console.error('❌ Refresh failed:', error)
                }
              }}
              disabled={isLoading}
              className="p-2 text-muted hover:text-primary disabled:text-muted transition-colors"
              title={isLoading ? 'Refreshing...' : 'Force Refresh from n8n'}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'executions', label: 'Executions', icon: Activity },
            { id: 'nodes', label: 'Nodes', icon: Layers },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'activity', label: 'Activity', icon: Clock },
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

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Activity className="h-8 w-8 text-primary animate-pulse" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Workflow Description / Purpose */}
                  {(nodeAnalysis.description || nodeAnalysis.stickyNotes.length > 0) && (
                    <div className="control-card p-6 border-primary/30">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Workflow Purpose & Description
                      </h3>
                      
                      {nodeAnalysis.description && (
                        <div className="mb-4">
                          <p className="text-foreground leading-relaxed">{nodeAnalysis.description}</p>
                        </div>
                      )}
                      
                      {nodeAnalysis.stickyNotes.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted mb-2">Documentation Notes:</p>
                          {nodeAnalysis.stickyNotes.map((note: any, index: number) => (
                            <div key={index} className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                              <FileText className="h-4 w-4 text-primary float-left mr-2 mt-1" />
                              <p className="text-muted text-sm whitespace-pre-wrap">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="control-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Total Nodes</span>
                        <Box className="h-4 w-4 text-muted" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{workflow.node_count || nodeAnalysis.totalNodes || 0}</p>
                    </div>
                    
                    <div className="control-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Total Executions</span>
                        <Play className="h-4 w-4 text-muted" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{workflow.execution_count || executionStats.total || 0}</p>
                    </div>
                    
                    <div className="control-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Success Rate</span>
                        <CheckCircle className="h-4 w-4 text-muted" />
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {executionStats.total > 0 
                          ? `${((executionStats.successful / executionStats.total) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="control-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Avg Duration</span>
                        <Clock className="h-4 w-4 text-muted" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {formatDuration(executionStats.averageDuration)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Workflow Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted">Created</span>
                          <span className="text-foreground">{formatDate(workflow.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Updated</span>
                          <span className="text-foreground">{formatDate(workflow.updated_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Last Execution</span>
                          <span className="text-foreground">
                            {workflow.last_execution ? formatDate(workflow.last_execution) : 'Never'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Webhook</span>
                          <span className={workflow.has_webhook ? 'text-primary' : 'text-muted'}>
                            {workflow.has_webhook ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Archived</span>
                          <span className={workflow.is_archived ? 'text-primary' : 'text-muted'}>
                            {workflow.is_archived ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Quick Stats
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted">Successful Runs</span>
                          <span className="text-primary font-bold">{executionStats.successful}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Failed Runs</span>
                          <span className="text-muted font-bold">{executionStats.failed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Min Duration</span>
                          <span className="text-foreground">{formatDuration(performance.minExecutionTime || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Max Duration</span>
                          <span className="text-foreground">{formatDuration(performance.maxExecutionTime || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Error Rate</span>
                          <span className="text-primary">{performance.errorRate || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Executions Tab */}
              {activeTab === 'executions' && (
                <div className="p-6 space-y-6">
                  {executionStats.dailyTrend && executionStats.dailyTrend.length > 0 && (
                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Execution Trend (Last 7 Days)
                      </h3>
                      <ReactApexChart
                        options={executionChartOptions}
                        series={executionChartSeries}
                        type="area"
                        height={300}
                      />
                    </div>
                  )}

                  <div className="control-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Executions
                    </h3>
                    <div className="space-y-3">
                      {executionStats.recentExecutions.length === 0 ? (
                        <p className="text-muted text-center py-4">No recent executions</p>
                      ) : (
                        executionStats.recentExecutions.map((exec: any, index: number) => (
                          <div key={exec.id || index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {exec.status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              ) : exec.status === 'error' ? (
                                <XCircle className="h-4 w-4 text-muted" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-primary" />
                              )}
                              <div>
                                <p className="text-foreground text-sm">Execution #{exec.id}</p>
                                <p className="text-xs text-muted">{formatDate(exec.started_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-foreground text-sm">{formatDuration(exec.duration_ms || 0)}</p>
                              <p className={cn(
                                'text-xs',
                                exec.status === 'success' ? 'text-primary' : 
                                exec.status === 'error' ? 'text-muted' : 'text-primary'
                              )}>
                                {exec.status}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nodes Tab */}
              {activeTab === 'nodes' && (
                <div className="p-6 space-y-6">
                  {/* AI Agents Section - PRIORITY */}
                  {nodeAnalysis.aiAgents.length > 0 && (
                    <div className="control-card p-6 border-primary/30">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI Agents ({nodeAnalysis.aiAgents.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nodeAnalysis.aiAgents.map((agent: any, index: number) => (
                          <div key={index} className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-foreground font-medium">{agent.name}</h4>
                              <Brain className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-muted">Type: <span className="text-primary">{agent.type}</span></p>
                              {agent.model !== 'unknown' && (
                                <p className="text-muted">Model: <span className="text-primary">{agent.model}</span></p>
                              )}
                              {agent.connectedTools && agent.connectedTools.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-muted mb-1">Connected Tools:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {agent.connectedTools.map((tool: string, idx: number) => (
                                      <span key={idx} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                                        {tool}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools & Sub-Workflows Section */}
                  {(nodeAnalysis.tools.length > 0 || nodeAnalysis.subWorkflows.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Tools */}
                      {nodeAnalysis.tools.length > 0 && (
                        <div className="control-card p-6">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Cog className="h-5 w-5 text-muted" />
                            AI Tools ({nodeAnalysis.tools.length})
                          </h3>
                          <div className="space-y-2">
                            {nodeAnalysis.tools.map((tool: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted/10 border border-muted/30 rounded">
                                <Cog className="h-4 w-4 text-muted" />
                                <span className="text-foreground text-sm">{tool.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sub-Workflows */}
                      {nodeAnalysis.subWorkflows.length > 0 && (
                        <div className="control-card p-6">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-primary" />
                            Sub-Workflows ({nodeAnalysis.subWorkflows.length})
                          </h3>
                          <div className="space-y-2">
                            {nodeAnalysis.subWorkflows.map((subWf: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded">
                                <GitBranch className="h-4 w-4 text-primary" />
                                <span className="text-foreground text-sm">{subWf.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Workflow Flow Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Triggers (Input) */}
                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Triggers (Input)
                      </h3>
                      {nodeAnalysis.triggers.length > 0 ? (
                        <div className="space-y-3">
                          {nodeAnalysis.triggers.map((trigger: any, index: number) => {
                            const getTriggerIcon = () => {
                              switch(trigger.triggerType) {
                                case 'webhook': return Webhook;
                                case 'form': return FileText;
                                case 'schedule': return Clock;
                                case 'email': return Mail;
                                default: return Play;
                              }
                            };
                            const TriggerIcon = getTriggerIcon();
                            
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                                <TriggerIcon className="h-5 w-5 text-primary" />
                                <div className="flex-1">
                                  <p className="text-foreground font-medium">{trigger.name}</p>
                                  <p className="text-xs text-muted">{trigger.type}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted text-center py-4">No triggers</p>
                      )}
                    </div>

                    {/* Processing Overview */}
                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Processing
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(nodeAnalysis.nodesByType).map(([category, count]) => {
                          // Skip Triggers and Output/Response as they're shown separately
                          if (category === 'Triggers' || category === 'Output/Response') return null;
                          
                          const getCategoryIcon = () => {
                            switch(category) {
                              case 'AI/ML': return Brain;
                              case 'Data Processing': return Cog;
                              case 'External Services': return Globe;
                              default: return Package;
                            }
                          };
                          
                          const CategoryIcon = getCategoryIcon();
                          
                          const getColorClasses = () => {
                            switch(category) {
                              case 'AI/ML': return 'bg-primary/10 border-primary/30 text-primary';
                              case 'Data Processing': return 'bg-primary/10 border-primary/30 text-primary';
                              case 'External Services': return 'bg-primary/10 border-primary/30 text-primary';
                              default: return 'bg-card/10 border-border/30 text-muted';
                            }
                          };
                          
                          return (
                            <div key={category} className={`flex items-center justify-between p-3 border rounded-lg ${getColorClasses()}`}>
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4" />
                                <span className="text-foreground text-sm">{category}</span>
                              </div>
                              <span className="px-2 py-1 bg-current/10 rounded text-xs font-bold">
                                {count}
                              </span>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        Outputs (Response)
                      </h3>
                      {nodeAnalysis.outputs.length > 0 ? (
                        <div className="space-y-3">
                          {nodeAnalysis.outputs.map((output: any, index: number) => {
                            const getOutputIcon = () => {
                              switch(output.outputType) {
                                case 'email': return Mail;
                                case 'slack': return MessageSquare;
                                case 'telegram': return MessageSquare;
                                case 'response': return ExternalLink;
                                default: return Send;
                              }
                            };
                            const OutputIcon = getOutputIcon();
                            
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                                <OutputIcon className="h-5 w-5 text-primary" />
                                <div className="flex-1">
                                  <p className="text-foreground font-medium">{output.name}</p>
                                  <p className="text-xs text-muted">{output.type}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted text-center py-4">No outputs defined</p>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="control-card p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{nodeAnalysis.totalNodes}</p>
                        <p className="text-sm text-muted mt-1">Total Nodes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{nodeAnalysis.triggers.length}</p>
                        <p className="text-sm text-muted mt-1">Triggers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          {nodeAnalysis.totalNodes - nodeAnalysis.triggers.length - nodeAnalysis.outputs.length}
                        </p>
                        <p className="text-sm text-muted mt-1">Processing</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{nodeAnalysis.outputs.length}</p>
                        <p className="text-sm text-muted mt-1">Outputs</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="control-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted">Min Execution Time</span>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {formatDuration(performance.minExecutionTime || 0)}
                      </p>
                    </div>
                    
                    <div className="control-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted">Average Time</span>
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {formatDuration(performance.avgExecutionTime || 0)}
                      </p>
                    </div>
                    
                    <div className="control-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted">Max Execution Time</span>
                        <AlertTriangle className="h-4 w-4 text-muted" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {formatDuration(performance.maxExecutionTime || 0)}
                      </p>
                    </div>
                  </div>

                  {performance.commonErrors && performance.commonErrors.length > 0 && (
                    <div className="control-card p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-muted" />
                        Common Errors
                      </h3>
                      <div className="space-y-3">
                        {performance.commonErrors.map((error: any, index: number) => (
                          <div key={index} className="p-4 bg-muted/10 border border-muted/30 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-muted font-medium">{error.message}</p>
                                <p className="text-xs text-muted mt-1">Occurred {error.count} times</p>
                              </div>
                              <span className="text-xs text-muted">{error.lastOccurred}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <div className="control-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Activity Timeline
                    </h3>
                    <div className="space-y-4">
                      {executionStats.recentExecutions.slice(0, 20).map((exec: any, index: number) => (
                        <div key={exec.id || index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {exec.status === 'success' ? (
                              <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-primary" />
                              </div>
                            ) : exec.status === 'error' ? (
                              <div className="w-8 h-8 bg-muted/10 border border-muted/30 rounded-full flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-muted" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center">
                                <Clock className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 pb-4 border-l-2 border-border pl-4 -ml-4">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-foreground font-medium">
                                Execution {exec.status === 'success' ? 'completed' : exec.status === 'error' ? 'failed' : 'started'}
                              </p>
                              <span className="text-xs text-muted">{formatDate(exec.started_at)}</span>
                            </div>
                            <p className="text-sm text-muted">
                              Duration: {formatDuration(exec.duration_ms || 0)}
                            </p>
                            {exec.error_message && (
                              <p className="text-sm text-muted mt-1">{exec.error_message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}