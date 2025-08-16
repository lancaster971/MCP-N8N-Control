import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Activity, 
  Database, 
  GitBranch, 
  Target, 
  Users, 
  Clock, 
  TrendingUp, 
  Shield,
  RefreshCw
} from 'lucide-react'
import { statsAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  
  // Carica i dati dal backend in modo sicuro
  const { data: systemStats, isLoading, error, refetch } = useQuery({
    queryKey: ['system-stats-dashboard'],
    queryFn: async () => {
      try {
        const response = await statsAPI.system()
        return response.data
      } catch (err) {
        console.error('Error loading dashboard stats:', err)
        return null
      }
    },
    refetchInterval: 30000,
    retry: 1,
    retryOnMount: false
  })

  const formatNumber = (num: number | undefined) => {
    return num ? num.toLocaleString() : '0'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            🎯 PilotPro Control Center
          </h1>
          <p className="text-gray-500 mt-1">
            Benvenuto, {user?.email} | Sistema operativo e monitoraggio
          </p>
        </div>
        
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="btn-control disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Aggiorna
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Workflows</p>
              <p className="text-2xl font-bold text-blue-400">
                {isLoading ? '-' : formatNumber(systemStats?.database?.totalWorkflows)}
              </p>
            </div>
            <GitBranch className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Executions</p>
              <p className="text-2xl font-bold text-green-400">
                {isLoading ? '-' : formatNumber(systemStats?.database?.totalExecutions)}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Tenants</p>
              <p className="text-2xl font-bold text-purple-400">
                {isLoading ? '-' : formatNumber(systemStats?.database?.activeTenants)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sync Operations</p>
              <p className="text-2xl font-bold text-yellow-400">
                {isLoading ? '-' : formatNumber(systemStats?.scheduler?.totalSyncRuns)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="control-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Sistema Status
          </h3>
          
          {error ? (
            <div className="text-red-400 text-sm">
              ⚠️ Errore nel caricamento dei dati. Sistema in modalità offline.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Database Status</span>
                <span className="text-green-400 font-bold">✅ Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">API Status</span>
                <span className="text-green-400 font-bold">✅ Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ultimo Sync</span>
                <span className="text-blue-400 font-bold">
                  {systemStats?.scheduler?.lastSyncTime ? 
                    new Date(systemStats.scheduler.lastSyncTime).toLocaleTimeString('it-IT') : 
                    'Mai'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="control-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Sicurezza & Tenant
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Modalità Sistema</span>
              <span className="text-yellow-400 font-bold">Mono-Tenant</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tenant Attuale</span>
              <span className="text-white font-bold">{user?.tenantId || 'client_simulation_a'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ruolo Utente</span>
              <span className="text-green-400 font-bold">{user?.role || 'admin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="control-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-400" />
          Azioni Rapide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="control-card p-4 hover:bg-gray-800/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Visualizza Workflows</h4>
                <p className="text-gray-400 text-sm">Gestisci i tuoi workflow automatizzati</p>
              </div>
            </div>
          </button>
          
          <button className="control-card p-4 hover:bg-gray-800/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Database Stats</h4>
                <p className="text-gray-400 text-sm">Monitora performance database</p>
              </div>
            </div>
          </button>
          
          <button className="control-card p-4 hover:bg-gray-800/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-yellow-400" />
              <div>
                <h4 className="text-white font-medium">Scheduler Control</h4>
                <p className="text-gray-400 text-sm">Gestisci job automatici</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}