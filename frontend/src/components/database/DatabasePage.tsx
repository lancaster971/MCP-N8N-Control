import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Database,
  Table,
  HardDrive,
  Activity,
  Users,
  Calendar,
  Search,
  RefreshCw,
  Download,
  Server,
  Zap,
  BarChart3,
  Eye,
  Filter,
  ArrowUpDown,
  Clock,
  GitBranch,
  Target,
} from 'lucide-react'
import { tenantAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

interface DatabaseStats {
  overview: {
    totalTables: number
    totalRecords: number
    databaseSize: string
    lastBackup: string
  }
  tables: Array<{
    name: string
    records: number
    size: string
    lastModified: string
    growth: number
  }>
  performance: {
    queryTime: number
    connections: number
    uptime: string
    indexEfficiency: number
  }
  recentActivity: Array<{
    action: string
    table: string
    timestamp: string
    user: string
  }>
}

export const DatabasePage: React.FC = () => {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || 'default_tenant'
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in produzione questi dati verranno dal backend
  const mockDatabaseStats: DatabaseStats = {
    overview: {
      totalTables: 8,
      totalRecords: 45623,
      databaseSize: '234.5 MB',
      lastBackup: '2025-08-12T14:30:00Z'
    },
    tables: [
      { name: 'tenant_executions', records: 15420, size: '89.2 MB', lastModified: '2025-08-12T16:45:00Z', growth: 12.5 },
      { name: 'tenant_workflows', records: 72, size: '2.1 MB', lastModified: '2025-08-12T10:30:00Z', growth: 0.8 },
      { name: 'tenants', records: 15, size: '156 KB', lastModified: '2025-08-11T09:15:00Z', growth: 0 },
      { name: 'users', records: 245, size: '1.8 MB', lastModified: '2025-08-12T08:20:00Z', growth: 5.2 },
      { name: 'workflow_logs', records: 28950, size: '125.4 MB', lastModified: '2025-08-12T16:40:00Z', growth: 18.7 },
      { name: 'api_keys', records: 34, size: '245 KB', lastModified: '2025-08-10T15:45:00Z', growth: -2.1 },
      { name: 'system_config', records: 67, size: '89 KB', lastModified: '2025-08-09T12:00:00Z', growth: 0 },
      { name: 'audit_logs', records: 892, size: '15.5 MB', lastModified: '2025-08-12T16:30:00Z', growth: 8.9 },
    ],
    performance: {
      queryTime: 142,
      connections: 23,
      uptime: '15 giorni, 8 ore',
      indexEfficiency: 94.2
    },
    recentActivity: [
      { action: 'INSERT', table: 'tenant_executions', timestamp: '2025-08-12T16:45:23Z', user: 'system' },
      { action: 'UPDATE', table: 'tenant_workflows', timestamp: '2025-08-12T16:42:15Z', user: 'admin@pilotpro.com' },
      { action: 'INSERT', table: 'workflow_logs', timestamp: '2025-08-12T16:40:07Z', user: 'system' },
      { action: 'SELECT', table: 'tenant_executions', timestamp: '2025-08-12T16:38:45Z', user: 'admin@pilotpro.com' },
      { action: 'INSERT', table: 'tenant_executions', timestamp: '2025-08-12T16:35:12Z', user: 'system' },
    ]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT')
  }

  const formatSize = (sizeStr: string) => {
    return sizeStr
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-red-400'
    if (growth > 5) return 'text-yellow-400'
    if (growth > 0) return 'text-green-400'
    return 'text-gray-400'
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'text-green-400 bg-green-500/10'
      case 'UPDATE': return 'text-yellow-400 bg-yellow-500/10'
      case 'DELETE': return 'text-red-400 bg-red-500/10'
      case 'SELECT': return 'text-blue-400 bg-blue-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const filteredTables = mockDatabaseStats.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Database Management
          </h1>
          <p className="text-gray-500 mt-1">
            Informazioni dettagliate sul database e performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn-control">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          
          <button className="btn-control">
            <Download className="h-4 w-4" />
            Export Schema
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tabelle Totali</p>
              <p className="text-2xl font-bold text-white">{mockDatabaseStats.overview.totalTables}</p>
            </div>
            <Table className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Records Totali</p>
              <p className="text-2xl font-bold text-white">{mockDatabaseStats.overview.totalRecords.toLocaleString()}</p>
            </div>
            <HardDrive className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Dimensione DB</p>
              <p className="text-2xl font-bold text-white">{mockDatabaseStats.overview.databaseSize}</p>
            </div>
            <Database className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ultimo Backup</p>
              <p className="text-sm font-bold text-green-400">{formatDate(mockDatabaseStats.overview.lastBackup)}</p>
            </div>
            <Server className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="control-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Query Time Medio</p>
              <p className="text-xl font-bold text-green-400">{mockDatabaseStats.performance.queryTime}ms</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Connessioni Attive</p>
              <p className="text-xl font-bold text-blue-400">{mockDatabaseStats.performance.connections}</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Uptime</p>
              <p className="text-xl font-bold text-white">{mockDatabaseStats.performance.uptime}</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Index Efficiency</p>
              <p className="text-xl font-bold text-green-400">{mockDatabaseStats.performance.indexEfficiency}%</p>
            </div>
          </div>
        </div>

        <div className="control-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Attività Recenti
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {mockDatabaseStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    getActionColor(activity.action)
                  )}>
                    {activity.action}
                  </span>
                  <span className="text-white font-medium">{activity.table}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{activity.user}</p>
                  <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Overview */}
      <div className="control-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Table className="h-5 w-5 text-green-400" />
            Tabelle Database
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cerca tabelle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Nome Tabella</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Records</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Dimensione</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Crescita</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Ultima Modifica</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.map((table) => (
                <tr 
                  key={table.name} 
                  className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-medium">{table.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 font-mono">
                    {table.records.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-300 font-mono">
                    {table.size}
                  </td>
                  <td className="p-4">
                    <span className={cn('font-medium', getGrowthColor(table.growth))}>
                      {table.growth > 0 ? '+' : ''}{table.growth}%
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {formatDate(table.lastModified)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        onClick={() => setSelectedTable(table.name)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Details Modal (quando selectedTable è impostato) */}
      {selectedTable && (
        <div className="control-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Dettagli Tabella: {selectedTable}
            </h3>
            <button 
              onClick={() => setSelectedTable(null)}
              className="btn-control text-sm"
            >
              Chiudi
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Records Totali</p>
              <p className="text-xl font-bold text-white">
                {filteredTables.find(t => t.name === selectedTable)?.records.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Dimensione</p>
              <p className="text-xl font-bold text-white">
                {filteredTables.find(t => t.name === selectedTable)?.size}
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Crescita</p>
              <p className={cn(
                'text-xl font-bold',
                getGrowthColor(filteredTables.find(t => t.name === selectedTable)?.growth || 0)
              )}>
                {filteredTables.find(t => t.name === selectedTable)?.growth}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}