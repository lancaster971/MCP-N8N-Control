import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Download,
  Plus,
  Play,
  Pause,
  Archive,
  Clock,
  GitBranch,
  Activity,
  Calendar,
  ChevronRight,
  Bot,
} from 'lucide-react'
import { tenantAPI, api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { formatDate, cn } from '../../lib/utils'
import { WorkflowDetailModal } from './WorkflowDetailModal'
import { Dropdown } from '../ui/Dropdown'
import AgentDetailModal from '../agents/AgentDetailModal'

interface Workflow {
  id: string
  name: string
  active: boolean
  has_webhook: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  node_count: number
  execution_count: number
  last_execution?: string
  has_ai_agents?: boolean
  ai_agent_count?: number
}

const getStatusInfo = (workflow: Workflow) => {
  if (workflow.is_archived) {
    return {
      status: 'Archiviato',
      color: 'text-muted',
      bgColor: 'bg-card/10',
      borderColor: 'border-border/30',
      dotColor: 'bg-card'
    }
  }
  if (workflow.active) {
    return {
      status: 'Attivo',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      dotColor: 'bg-primary'
    }
  }
  return {
    status: 'Inattivo',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    dotColor: 'bg-primary'
  }
}

export const WorkflowsPage: React.FC = () => {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || 'default_tenant'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'ai-agents' | 'standard'>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedAIWorkflow, setSelectedAIWorkflow] = useState<string | null>(null)
  const [isAITimelineOpen, setIsAITimelineOpen] = useState(false)

  // State per workflows (NO REACT QUERY)
  const [workflowsData, setWorkflowsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  // Fetch diretto senza cache
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const params = typeFilter !== 'all' ? `?filter=${typeFilter}` : ''
        const response = await fetch(`http://localhost:3001/api/workflows${params}`)
        const data = await response.json()
        console.log('Workflows fetched:', data)
        setWorkflowsData(data)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchWorkflows()
    const interval = setInterval(fetchWorkflows, 30000)
    return () => clearInterval(interval)
  }, [tenantId, typeFilter])

  const workflows = workflowsData?.workflows || []

  // Filtra workflows
  const filteredWorkflows = workflows.filter((workflow: Workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    switch (statusFilter) {
      case 'active':
        return workflow.active && !workflow.is_archived
      case 'inactive':
        return !workflow.active && !workflow.is_archived
      case 'archived':
        return workflow.is_archived
      default:
        return true
    }
  })

  // Statistiche
  const stats = {
    total: workflows.length,
    active: workflows.filter((w: Workflow) => w.active && !w.is_archived).length,
    inactive: workflows.filter((w: Workflow) => !w.active && !w.is_archived).length,
    archived: workflows.filter((w: Workflow) => w.is_archived).length,
    aiAgents: workflows.filter((w: Workflow) => w.has_ai_agents).length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="control-card p-6 h-24 skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="control-card p-6">
        <p className="text-muted">Errore nel caricamento dei workflows</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Workflows - {workflowsData?.tenantId}
          </h1>
          <p className="text-muted mt-1">
            Gestisci i tuoi workflow automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-control">
            <Download className="h-4 w-4" />
            Esporta
          </button>
          <button className="btn-control-primary">
            <Plus className="h-4 w-4" />
            Nuovo Workflow
          </button>
        </div>
      </div>

      {/* Stats Cards - 4 KPI in alto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted">Totali</p>
            </div>
            <GitBranch className="h-8 w-8 text-muted" />
          </div>
        </div>
        
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.active}</p>
              <p className="text-sm text-muted">Attivi</p>
            </div>
            <Activity className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.inactive}</p>
              <p className="text-sm text-muted">Inattivi</p>
            </div>
            <Pause className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.aiAgents}</p>
              <p className="text-sm text-muted">AI Agents</p>
            </div>
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="control-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cerca workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          
          {/* Type Filter */}
          <Dropdown
            options={[
              { value: 'all', label: 'Tutti i workflow' },
              { value: 'ai-agents', label: 'Solo AI Agents' },
              { value: 'standard', label: 'Solo Standard' }
            ]}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as any)}
            className="w-48"
          />
          
          {/* Status Filter */}
          <Dropdown
            options={[
              { value: 'all', label: 'Tutti gli status' },
              { value: 'active', label: 'Solo Attivi' },
              { value: 'inactive', label: 'Solo Inattivi' },
              { value: 'archived', label: 'Solo Archiviati' }
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as any)}
            className="w-48"
          />
        </div>
      </div>

      {/* Workflows Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Workflows ({filteredWorkflows.length})
          </h2>
        </div>
        
        {filteredWorkflows.length === 0 ? (
          <div className="control-card p-8 text-center text-muted">
            <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p>Nessun workflow trovato</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow: Workflow) => {
              const statusInfo = getStatusInfo(workflow)
              
              return (
                <div 
                  key={workflow.id} 
                  className="control-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  {/* Header con Status */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                      statusInfo.bgColor,
                      statusInfo.borderColor,
                      statusInfo.color
                    )}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dotColor)} />
                      {statusInfo.status}
                    </span>
                    <div className="flex items-center gap-2">
                      {workflow.has_ai_agents && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 border border-primary/30 text-primary">
                          <Bot className="h-3 w-3" />
                          {workflow.ai_agent_count} AI
                        </span>
                      )}
                      {workflow.has_webhook && (
                        <span className="badge-control">
                          Webhook
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nome Workflow */}
                  <h3 className="text-lg font-medium text-foreground mb-4 leading-tight truncate" title={workflow.name}>
                    {workflow.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        Nodi
                      </span>
                      <span className="text-foreground font-medium">{workflow.node_count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Esecuzioni
                      </span>
                      <span className="text-foreground font-medium">{workflow.execution_count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Creato
                      </span>
                      <span className="text-foreground font-medium">{formatDate(workflow.created_at).split(' ')[0]}</span>
                    </div>
                    
                    {workflow.last_execution && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ultima
                        </span>
                        <span className="text-foreground font-medium">{formatDate(workflow.last_execution).split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click
                        // TODO: Add toggle active logic
                      }}
                      className={cn(
                        'flex-1 btn-control text-xs py-2',
                        workflow.is_archived && 'opacity-50 cursor-not-allowed'
                      )}
                      disabled={workflow.is_archived}
                    >
                      {workflow.active ? 'Pausa' : 'Avvia'}
                    </button>
                    
                    {/* Timeline Button - per tutti i workflow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click
                        setSelectedAIWorkflow(workflow.id)
                        setIsAITimelineOpen(true)
                      }}
                      className={cn(
                        "p-2 hover:text-foreground transition-colors border rounded",
                        workflow.has_ai_agents && workflow.ai_agent_count > 0
                          ? "text-primary border-primary/30"
                          : "text-muted border-border"
                      )}
                      title={workflow.has_ai_agents ? "Timeline AI" : "Timeline Workflow"}
                    >
                      {workflow.has_ai_agents ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click
                        setSelectedWorkflow(workflow)
                      }}
                      className="p-2 text-muted hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <WorkflowDetailModal
          workflow={selectedWorkflow}
          tenantId={tenantId}
          onClose={() => setSelectedWorkflow(null)}
        />
      )}
      
      {/* AI Timeline Modal - separato */}
      {isAITimelineOpen && selectedAIWorkflow && (
        <AgentDetailModal
          workflowId={selectedAIWorkflow}
          tenantId="client_simulation_a"
          isOpen={isAITimelineOpen}
          onClose={() => {
            setIsAITimelineOpen(false)
            setSelectedAIWorkflow(null)
          }}
        />
      )}
    </div>
  )
}