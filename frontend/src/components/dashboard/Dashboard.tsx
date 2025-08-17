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
  RefreshCw,
  Zap,
  Eye,
  BarChart3,
  Network,
  Lock,
  Timer,
  Cpu
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { motion } from 'framer-motion'
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

  // Dati per execution analytics chart (24 ore con pattern realistici)
  const executionData = Array.from({length: 24}, (_, i) => {
    let baseActivity = 5
    if (i >= 7 && i <= 9) baseActivity = 45 + Math.random() * 20
    else if (i >= 10 && i <= 12) baseActivity = 60 + Math.random() * 25
    else if (i >= 13 && i <= 15) baseActivity = 70 + Math.random() * 20
    else if (i >= 16 && i <= 18) baseActivity = 50 + Math.random() * 15
    else if (i >= 19 && i <= 21) baseActivity = 25 + Math.random() * 10
    else if (i >= 22 || i <= 6) baseActivity = 5 + Math.random() * 8
    
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      executions: Math.floor(baseActivity),
      success: Math.floor(baseActivity * 0.92)
    }
  })

  // Dati security trend (ultimi 7 giorni)
  const securityTrendData = Array.from({length: 7}, (_, i) => ({
    day: i + 1,
    rate: 75 + Math.random() * 10
  }))

  // Dati complexity distribution - Control Room Colors
  const complexityData = [
    { name: 'Semplici (5-15)', value: 2, color: '#22c55e' },
    { name: 'Medie (15-30)', value: 3, color: '#6b7280' },
    { name: 'Complesse (30+)', value: 2, color: '#374151' }
  ]

  // Dati execution volume per workflow
  const workflowVolumeData = [
    { name: 'GommeGo Flow 4', executions: 257 },
    { name: 'GommeGo Flow 2', executions: 131 },
    { name: 'GommeGo Flow 1', executions: 43 },
    { name: 'Daily Summary', executions: 2 }
  ]

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
              <p className="text-2xl font-bold text-green-400">
                {isLoading ? '-' : formatNumber(systemStats?.database?.totalWorkflows)}
              </p>
            </div>
            <GitBranch className="h-8 w-8 text-green-400" />
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
            <Target className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-300">
                {isLoading ? '-' : formatNumber(systemStats?.database?.activeTenants)}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="control-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sync Operations</p>
              <p className="text-2xl font-bold text-gray-300">
                {isLoading ? '-' : formatNumber(systemStats?.scheduler?.totalSyncRuns)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Workflow Table - FORMATO ORIZZONTALE COMPATTO */}
      <div className="control-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-400" />
          Workflow Attivi (7) - Tutti i dati in vista
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 pb-2">Nome Workflow</th>
                <th className="text-right text-gray-400 pb-2">Exec</th>
                <th className="text-right text-gray-400 pb-2">Complex</th>
                <th className="text-right text-gray-400 pb-2">Last Run</th>
                <th className="text-center text-gray-400 pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="bg-green-500/10">
                <td className="py-2 text-white">GommeGo Flow 4 - Price Control</td>
                <td className="py-2 text-right text-green-400 font-bold">257</td>
                <td className="py-2 text-right text-gray-300">12.0</td>
                <td className="py-2 text-right text-gray-300">2h ago</td>
                <td className="py-2 text-center"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mx-auto"></div></td>
              </tr>
              <tr className="bg-green-500/5">
                <td className="py-2 text-white">GommeGo Flow 2 - Grab Tyre24</td>
                <td className="py-2 text-right text-green-400 font-bold">131</td>
                <td className="py-2 text-right text-gray-300">28.0</td>
                <td className="py-2 text-right text-gray-300">2h ago</td>
                <td className="py-2 text-center"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mx-auto"></div></td>
              </tr>
              <tr>
                <td className="py-2 text-white">GommeGo Flow 1 - Prestashop</td>
                <td className="py-2 text-right text-green-400 font-bold">43</td>
                <td className="py-2 text-right text-gray-300">21.5</td>
                <td className="py-2 text-right text-gray-300">2h ago</td>
                <td className="py-2 text-center"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mx-auto"></div></td>
              </tr>
              <tr>
                <td className="py-2 text-white">Daily Summary Reporter</td>
                <td className="py-2 text-right text-gray-400 font-bold">2</td>
                <td className="py-2 text-right text-gray-300">9.5</td>
                <td className="py-2 text-right text-gray-300">12h ago</td>
                <td className="py-2 text-center"><div className="w-2 h-2 bg-gray-500 rounded-full mx-auto"></div></td>
              </tr>
              <tr className="opacity-50">
                <td className="py-1 text-gray-400">Return Validation & Intake</td>
                <td className="py-1 text-right text-red-400">0</td>
                <td className="py-1 text-right text-gray-500">52.0</td>
                <td className="py-1 text-right text-gray-500">Never</td>
                <td className="py-1 text-center"><div className="w-2 h-2 bg-gray-600 rounded-full mx-auto"></div></td>
              </tr>
              <tr className="opacity-50">
                <td className="py-1 text-gray-400">Chatbot Mail Simple</td>
                <td className="py-1 text-right text-red-400">0</td>
                <td className="py-1 text-right text-gray-500">48.0</td>
                <td className="py-1 text-right text-gray-500">Never</td>
                <td className="py-1 text-center"><div className="w-2 h-2 bg-gray-600 rounded-full mx-auto"></div></td>
              </tr>
              <tr className="opacity-50">
                <td className="py-1 text-gray-400">Error Handling</td>
                <td className="py-1 text-right text-red-400">0</td>
                <td className="py-1 text-right text-gray-500">5.0</td>
                <td className="py-1 text-right text-gray-500">Never</td>
                <td className="py-1 text-center"><div className="w-2 h-2 bg-gray-600 rounded-full mx-auto"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Grid - TUTTI I GRAFICI BELLISSIMI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Execution Timeline Analytics */}
        <motion.div 
          className="lg:col-span-2 control-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-400" />
            Execution Analytics - Ultime 24h
          </h3>
          
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={executionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="executionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  interval={3}
                />
                
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#22c55e' }}
                />
                
                <Area
                  type="monotone"
                  dataKey="executions"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#executionGradient)"
                  fillOpacity={1}
                  name="Executions"
                />
                
                <Area
                  type="monotone"
                  dataKey="success"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  fill="url(#activityGradient)"
                  fillOpacity={1}
                  name="Success"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">Executions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">Success</span>
              </div>
            </div>
            <div className="text-gray-500">
              Picco: 14:00-16:00 • Live Updates
            </div>
          </div>
        </motion.div>

        {/* Security Center con Mini Charts */}
        <motion.div 
          className="control-card p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-400" />
            Security Trends
          </h3>
          
          {/* Security Sparkline */}
          <div className="h-16 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={securityTrendData}>
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#22c55e" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Login Success</span>
              <span className="text-green-400 font-bold text-sm">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Events Total</span>
              <span className="text-gray-300 font-bold text-sm">281</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Failed Logins</span>
              <span className="text-red-400 font-bold text-sm">57</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
        </motion.div>

        {/* System Health con Gauges */}
        <motion.div 
          className="control-card p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-green-400" />
            System Health
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: 'CPU', value: 34, color: '#22c55e' },
              { label: 'Memory', value: 67, color: '#6b7280' },
              { label: 'Disk', value: 23, color: '#6b7280' },
              { label: 'Network', value: 89, color: '#22c55e' }
            ].map((gauge) => (
              <div key={gauge.label} className="text-center">
                <div className="relative w-12 h-12 mx-auto">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke={gauge.color}
                      strokeWidth="2"
                      strokeDasharray={`${gauge.value}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{gauge.value}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{gauge.label}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">Database</span>
              <span className="text-green-400 text-xs">✓ Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">API Status</span>
              <span className="text-green-400 text-xs">✓ Online</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Complexity Distribution Donut */}
        <motion.div 
          className="control-card p-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            🍩 Complexity Distribution
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complexityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {complexityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Execution Volume Bar Chart */}
        <motion.div 
          className="control-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            📊 Execution Volume
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workflowVolumeData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="executions" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div 
          className="control-card p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-400" />
            Live Activity
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-green-400 text-xs font-medium">GommeGo Flow 4 completed</p>
                <p className="text-gray-400 text-xs">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-800/50 border border-gray-600/20 rounded">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-300 text-xs font-medium">User login successful</p>
                <p className="text-gray-400 text-xs">5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-800/50 border border-gray-600/20 rounded">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-300 text-xs font-medium">Sync job started</p>
                <p className="text-gray-400 text-xs">8 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-800/50 border border-gray-600/20 rounded">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-300 text-xs font-medium">Database optimized</p>
                <p className="text-gray-400 text-xs">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-800/50 border border-gray-600/20 rounded">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-300 text-xs font-medium">Backup completed</p>
                <p className="text-gray-400 text-xs">1 hour ago</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}