import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, AlertCircle, Clock, Users } from 'lucide-react'
import { tenantAPI } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

interface Activity {
  id: string
  type: 'success' | 'error' | 'info' | 'running'
  title: string
  time: string
  icon: React.ElementType
  color: string
}

export const RecentActivity: React.FC = () => {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || 'default_tenant'
  
  // USA DATI DEL TUO TENANT!
  const { data: recentExecutions } = useQuery({
    queryKey: ['tenant-executions', tenantId],
    queryFn: async () => {
      const response = await tenantAPI.executions(tenantId, { limit: 10 })
      return response.data
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })
  
  // Trasforma le esecuzioni DEL TUO TENANT in attività
  const activities: Activity[] = recentExecutions?.executions?.map((execution: any) => {
    let icon = Clock
    let color = 'text-muted'
    let type: Activity['type'] = 'info'
    
    switch (execution.status) {
      case 'success':
        icon = CheckCircle
        color = 'text-primary'
        type = 'success'
        break
      case 'error':
        icon = AlertCircle
        color = 'text-muted'
        type = 'error'
        break
      case 'running':
        icon = Clock
        color = 'text-primary'
        type = 'running'
        break
      case 'waiting':
        icon = Clock
        color = 'text-primary'
        type = 'info'
        break
    }
    
    return {
      id: execution.id,
      type,
      title: `${execution.workflow_name || 'Workflow'} - ${execution.status}`,
      time: formatDate(execution.started_at),
      icon,
      color,
    }
  }) || []
  
  // Se non ci sono esecuzioni, mostra attività demo
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: '1',
      type: 'success' as const,
      title: 'Workflow "Data Sync" completato',
      time: '2 minuti fa',
      icon: CheckCircle,
      color: 'text-primary',
    },
    {
      id: '2',
      type: 'error' as const,
      title: 'Errore in "Email Campaign"',
      time: '15 minuti fa',
      icon: AlertCircle,
      color: 'text-muted',
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Nuovo tenant aggiunto',
      time: '1 ora fa',
      icon: Users,
      color: 'text-primary',
    },
    {
      id: '4',
      type: 'running' as const,
      title: 'Backup in esecuzione',
      time: '2 ore fa',
      icon: Clock,
      color: 'text-primary',
    },
  ]
  
  return (
    <div className="premium-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Attività Recente</h2>
        {recentExecutions && (
          <span className="text-xs text-muted dark:text-muted">
            Tenant: {tenantId}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {displayActivities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 hover:bg-card dark:hover:bg-card rounded-lg transition-colors"
          >
            <activity.icon className={cn('h-5 w-5 mt-0.5', activity.color)} />
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted dark:text-muted">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-4 text-sm text-muted dark:text-muted">
          Nessuna attività recente
        </div>
      )}
    </div>
  )
}