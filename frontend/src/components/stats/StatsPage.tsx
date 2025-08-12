import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Users,
  Database,
  Timer,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import { tenantAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

interface StatsData {
  overview: {
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    successRate: number
    avgExecutionTime: number
    trendsVsPreviousWeek: {
      executions: number
      successRate: number
      avgTime: number
    }
  }
  performance: {
    topWorkflows: Array<{
      id: string
      name: string
      executions: number
      avgDuration: number
      successRate: number
      trend: 'up' | 'down' | 'stable'
    }>
    slowestWorkflows: Array<{
      id: string
      name: string
      avgDuration: number
      maxDuration: number
    }>
    errorProne: Array<{
      id: string
      name: string
      errorRate: number
      totalErrors: number
    }>
  }
  timeSeries: {
    hourlyStats: Array<{
      hour: string
      executions: number
      errors: number
      avgDuration: number
    }>
    dailyStats: Array<{
      date: string
      executions: number
      successRate: number
    }>
  }
  resources: {
    peakHours: Array<{
      hour: number
      avgExecutions: number
    }>
    workflowTypes: Array<{
      type: string
      count: number
      percentage: number
    }>
  }
}

const StatCard: React.FC<{
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  className?: string
}> = ({ title, value, change, icon, trend, className }) => (
  <div className={cn('control-card p-6', className)}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-2 text-sm',
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 'text-gray-400'
          )}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            <span>{change > 0 ? '+' : ''}{change}% vs scorsa settimana</span>
          </div>
        )}
      </div>
      <div className="text-gray-600">
        {icon}
      </div>
    </div>
  </div>
)

export const StatsPage: React.FC = () => {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || 'default_tenant'
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'analytics'>('overview')

  // Per ora usiamo dati mock, poi li colleghiamo al backend
  const mockStats: StatsData = {
    overview: {
      totalWorkflows: 72,
      activeWorkflows: 68,
      totalExecutions: 15420,
      successRate: 98.2,
      avgExecutionTime: 2340,
      trendsVsPreviousWeek: {
        executions: 12.5,
        successRate: 1.8,
        avgTime: -15.2
      }
    },
    performance: {
      topWorkflows: [
        { id: '1', name: 'GommeGo Flow 4 - Price Margin Control', executions: 1240, avgDuration: 152, successRate: 100, trend: 'up' },
        { id: '2', name: 'GommeGo Flow 2 - Grab Order from Tyre24', executions: 980, avgDuration: 76, successRate: 99.8, trend: 'stable' },
        { id: '3', name: 'GommeGo Flow 1 - Order Processing', executions: 750, avgDuration: 230, successRate: 97.5, trend: 'down' },
      ],
      slowestWorkflows: [
        { id: '1', name: 'Heavy Data Processing Workflow', avgDuration: 45000, maxDuration: 120000 },
        { id: '2', name: 'External API Integration', avgDuration: 12000, maxDuration: 30000 },
      ],
      errorProne: [
        { id: '1', name: 'Legacy System Sync', errorRate: 15.2, totalErrors: 45 },
        { id: '2', name: 'File Upload Handler', errorRate: 8.7, totalErrors: 23 },
      ]
    },
    timeSeries: {
      hourlyStats: [],
      dailyStats: []
    },
    resources: {
      peakHours: [
        { hour: 9, avgExecutions: 145 },
        { hour: 14, avgExecutions: 132 },
        { hour: 16, avgExecutions: 121 },
      ],
      workflowTypes: [
        { type: 'Webhook', count: 42, percentage: 58.3 },
        { type: 'Scheduled', count: 20, percentage: 27.8 },
        { type: 'Manual', count: 10, percentage: 13.9 },
      ]
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Analytics & Statistics
          </h1>
          <p className="text-gray-500 mt-1">
            Analisi approfondite delle performance del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-green-500 focus:outline-none"
          >
            <option value="7d">Ultimi 7 giorni</option>
            <option value="30d">Ultimi 30 giorni</option>
            <option value="90d">Ultimi 90 giorni</option>
          </select>
          
          <button className="btn-control">
            <RefreshCw className="h-4 w-4" />
            Aggiorna
          </button>
          
          <button className="btn-control">
            <Download className="h-4 w-4" />
            Esporta Report
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="control-card p-1">
        <div className="flex items-center gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Workflows"
              value={mockStats.overview.totalWorkflows}
              icon={<GitBranch className="h-8 w-8" />}
            />
            <StatCard
              title="Workflows Attivi"
              value={mockStats.overview.activeWorkflows}
              change={5.2}
              trend="up"
              icon={<Activity className="h-8 w-8" />}
            />
            <StatCard
              title="Executions Totali"
              value={mockStats.overview.totalExecutions.toLocaleString()}
              change={mockStats.overview.trendsVsPreviousWeek.executions}
              trend="up"
              icon={<Target className="h-8 w-8" />}
            />
            <StatCard
              title="Success Rate"
              value={`${mockStats.overview.successRate}%`}
              change={mockStats.overview.trendsVsPreviousWeek.successRate}
              trend="up"
              icon={<CheckCircle className="h-8 w-8" />}
              className="border-green-500/30"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Timer className="h-5 w-5 text-green-400" />
                Tempi di Esecuzione
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tempo Medio</span>
                  <span className="text-white font-mono">{formatDuration(mockStats.overview.avgExecutionTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Miglioramento</span>
                  <span className="text-green-400 font-medium">-15.2% vs scorsa settimana</span>
                </div>
              </div>
            </div>

            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-400" />
                Distribuzione Workflow Types
              </h3>
              <div className="space-y-3">
                {mockStats.resources.workflowTypes.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <span className="text-gray-400">{type.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-12 text-right">{type.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Workflows */}
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top Performing Workflows
              </h3>
              <div className="space-y-3">
                {mockStats.performance.topWorkflows.map((workflow, index) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">#{index + 1}</span>
                        <h4 className="text-white font-medium truncate">{workflow.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{workflow.executions} exec.</span>
                        <span>{formatDuration(workflow.avgDuration)} avg</span>
                        <span className="text-green-400">{workflow.successRate}% success</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {workflow.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
                      {workflow.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
                      {workflow.trend === 'stable' && <span className="text-gray-500">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slowest Workflows */}
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                Workflows più Lenti
              </h3>
              <div className="space-y-3">
                {mockStats.performance.slowestWorkflows.map((workflow, index) => (
                  <div key={workflow.id} className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">{workflow.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Tempo Medio</span>
                        <p className="text-yellow-400 font-mono">{formatDuration(workflow.avgDuration)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Tempo Max</span>
                        <p className="text-red-400 font-mono">{formatDuration(workflow.maxDuration)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Analysis */}
          <div className="control-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Analisi Errori
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockStats.performance.errorProne.map((workflow) => (
                <div key={workflow.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">{workflow.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Error Rate</span>
                      <span className="text-red-400 font-bold">{workflow.errorRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Errors</span>
                      <span className="text-white">{workflow.totalErrors}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Ore di Picco
              </h3>
              <div className="space-y-3">
                {mockStats.resources.peakHours.map((peak) => (
                  <div key={peak.hour} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white font-medium">{peak.hour}:00 - {peak.hour + 1}:00</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(peak.avgExecutions / 150) * 100}%` }}
                        />
                      </div>
                      <span className="text-blue-400 font-mono">{peak.avgExecutions} exec/h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="control-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-green-400" />
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">System Load</span>
                  <span className="text-green-400 font-medium">Normale</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database Performance</span>
                  <span className="text-green-400 font-medium">Ottimale</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">API Response Time</span>
                  <span className="text-green-400 font-mono">142ms avg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-green-400 font-bold">99.98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}