import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  GitBranch,
  Play,
  Users,
  Building2,
  BarChart3,
  AlertCircle,
  Settings,
  Database,
  Clock,
  Shield,
  Bot,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  {
    title: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: GitBranch, label: 'Workflows', path: '/workflows' },
      { icon: Play, label: 'Executions', path: '/executions' },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: Building2, label: 'Tenants', path: '/tenants' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: Clock, label: 'Scheduler', path: '/scheduler' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { icon: BarChart3, label: 'Statistics', path: '/stats' },
      { icon: AlertCircle, label: 'Alerts', path: '/alerts' },
      { icon: Database, label: 'Database', path: '/database' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: Shield, label: 'Security', path: '/security' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300',
          'bg-background border-r border-border',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-card rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {navItems.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                          'hover:bg-card',
                          isActive
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="bg-background rounded-md p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot status-success" />
                <span className="text-xs font-medium text-primary">Live Execution</span>
              </div>
              <div className="text-xs text-muted">
                <div>Uptime: 99.9%</div>
                <div>Version: 1.0.0</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}