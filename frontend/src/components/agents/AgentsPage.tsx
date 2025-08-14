/**
 * AI Agents Transparency Page
 * 
 * KILLER FEATURE: Mostra cosa stanno facendo gli AI agents in real-time
 * - Feed attività agents con business context
 * - Drill-down su ogni execution
 * - Quick actions per CRM/sistemi esterni
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Clock, CheckCircle, XCircle, ExternalLink, Mail, Eye, Zap, Settings, Send } from 'lucide-react';
import { tenantAPI } from '../../services/api';
import AgentDetailModal from './AgentDetailModal';

// Tipi per nuovo approccio basato su WORKFLOW
interface AgentWorkflow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastActivity: string | null;
  lastExecutionId: string | null;
  lastExecutionStatus: string;
  totalExecutions: number;
  hasDetailedData: boolean;
  updatedAt: string;
  type: 'ai-agent';
  preview?: {
    senderEmail?: string;
    subject?: string;
    classification?: string;
  };
}

const AgentsPage: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tenantId = 'client_simulation_a'; // TODO: Get from auth context

  // Fetch AI agents workflows (NEW APPROACH)
  const { data: workflowsData, isLoading, error, refetch } = useQuery({
    queryKey: ['agents-workflows', tenantId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/api/tenant/${tenantId}/agents/workflows?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch agents workflows');
      return response.json();
    },
    refetchInterval: 300000, // 🚀 POLLING SMART: Auto-refresh ogni 5 minuti per workflow activity
    staleTime: 0, // 🔥 SEMPRE FRESH: Nessuna cache stale
    refetchOnWindowFocus: true, // 👁️ REFRESH ON FOCUS: Quando torni alla pagina
  });

  const workflows: AgentWorkflow[] = workflowsData?.data || [];

  // Gestione apertura modal (ora per WORKFLOW non execution)
  const handleViewWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    setIsModalOpen(true);
  };

  // Formattazione durata
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  // Formattazione timestamp relativo
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Icon per status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'error': return <XCircle className="w-5 h-5 text-muted" />;
      case 'running': return <Clock className="w-5 h-5 text-primary animate-spin" />;
      default: return <Clock className="w-5 h-5 text-muted" />;
    }
  };

  // Color uniforme con testo bianco per tutte le cards
  const getWorkflowColor = () => {
    return 'text-foreground bg-primary/10';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary">Loading AI Agents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center text-muted">
          <XCircle className="w-16 h-16 mx-auto mb-4" />
          <p>Failed to load AI Agents activity</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
            <p className="text-muted">Real-time transparency on your AI agents activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
              Live Feed
            </div>
            <button
              onClick={() => refetch()}
              className="btn-glow px-4 py-2 rounded"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Workflow-based */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="premium-card p-4">
          <div>
            <p className="text-muted text-sm">Active Agents</p>
            <p className="text-2xl font-bold text-foreground">{workflows.length}</p>
          </div>
        </div>
        
        <div className="premium-card p-4">
          <div>
            <p className="text-muted text-sm">With Data</p>
            <p className="text-2xl font-bold text-primary">
              {workflows.filter(w => w.hasDetailedData).length}
            </p>
          </div>
        </div>

        <div className="premium-card p-4">
          <div>
            <p className="text-muted text-sm">Total Executions</p>
            <p className="text-2xl font-bold text-foreground">
              {workflows.reduce((sum, w) => sum + w.totalExecutions, 0)}
            </p>
          </div>
        </div>

        <div className="premium-card p-4">
          <div>
            <p className="text-muted text-sm">Recently Active</p>
            <p className="text-2xl font-bold text-foreground">
              {workflows.filter(w => w.lastActivity && new Date(w.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Cards - NEW APPROACH */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">AI Agent Workflows</h2>
        
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">No AI agent workflows found</p>
            <p className="text-muted text-sm mt-2">Active AI workflows will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div 
                key={workflow.id}
                className="premium-card hover-glow p-5 cursor-pointer"
                onClick={() => handleViewWorkflow(workflow.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold truncate max-w-xs ${getWorkflowColor()}`}>
                        {workflow.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {workflow.hasDetailedData ? (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" title="Has detailed execution data" />
                    ) : (
                      <div className="w-2 h-2 bg-card rounded-full" title="No execution data available" />
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-muted text-xs mb-1">Executions</div>
                    <div className="text-foreground text-lg font-semibold">{workflow.totalExecutions}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs mb-1">Status</div>
                    <div className="flex items-center">
                      {workflow.lastExecutionStatus === 'success' && <CheckCircle className="w-4 h-4 text-primary mr-1" />}
                      {workflow.lastExecutionStatus === 'error' && <XCircle className="w-4 h-4 text-muted mr-1" />}
                      {!workflow.lastExecutionStatus && <Clock className="w-4 h-4 text-muted mr-1" />}
                      <span className="text-foreground text-sm">{workflow.lastExecutionStatus || 'inactive'}</span>
                    </div>
                  </div>
                </div>

                {/* Business Context Preview */}
                {workflow.preview && (
                  <div className="mb-4 p-3 bg-card/50 rounded border-l-2 border-primary/50">
                    <div className="text-muted text-xs mb-2">Latest Activity</div>
                    {workflow.preview.senderEmail && (
                      <div className="flex items-center mb-1">
                        <Mail className="w-3 h-3 text-primary mr-2" />
                        <span className="text-primary text-sm truncate">{workflow.preview.senderEmail}</span>
                      </div>
                    )}
                    {workflow.preview.subject && (
                      <div className="text-muted text-sm truncate mb-1">"{workflow.preview.subject}"</div>
                    )}
                    {workflow.preview.classification && (
                      <div className="text-primary text-xs">{workflow.preview.classification}</div>
                    )}
                  </div>
                )}

                {/* Last Activity */}
                <div className="flex items-center justify-between text-xs text-muted">
                  <div>
                    {workflow.lastActivity ? formatTimeAgo(workflow.lastActivity) : 'No recent activity'}
                  </div>
                  <button className="text-primary hover:text-primary font-medium">
                    View Timeline →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Timeline Modal */}
      {isModalOpen && selectedWorkflow && (
        <AgentDetailModal
          workflowId={selectedWorkflow}
          tenantId={tenantId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWorkflow(null);
          }}
        />
      )}
    </div>
  );
};

export default AgentsPage;