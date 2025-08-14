import React, { useState } from 'react'
import { Bell, Menu, Moon, Sun, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDark, setIsDark] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuthStore()
  
  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }
  
  return (
    <header className="bg-background border-b border-border h-16">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-card rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">PP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                PilotPro Control Center
              </h1>
              <p className="text-xs text-muted">
                Multi-Tenant Management System
              </p>
            </div>
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-card rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
          </button>
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-card rounded-lg transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted capitalize">
                  {user?.role}
                </p>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-border rounded-lg transition-colors">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-border rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}