/**
 * PilotPro Admin Interface - JavaScript Controller
 * Gestisce tutte le funzionalità dell'interfaccia di amministrazione
 */

class AdminInterface {
    constructor() {
        this.baseURL = 'http://localhost:3001';
        this.token = localStorage.getItem('admin_token');
        this.currentUser = null;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.checkAuthStatus();
        this.loadDashboard();
    }

    // ================================
    // EVENT LISTENERS SETUP
    // ================================
    setupEventListeners() {
        // Login
        document.getElementById('login-btn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));

        // Users Management
        document.getElementById('create-user-btn').addEventListener('click', () => this.showCreateUserModal());
        document.getElementById('create-user-form').addEventListener('submit', (e) => this.handleCreateUser(e));

        // API Testing
        document.querySelectorAll('.api-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.testQuickAPI(e.target.dataset.endpoint));
        });
        document.getElementById('execute-api-btn').addEventListener('click', () => this.executeCustomAPI());

        // System Controls
        document.getElementById('refresh-system-btn').addEventListener('click', () => this.loadSystemMetrics());
        document.getElementById('refresh-pool-btn').addEventListener('click', () => this.refreshDatabasePool());

        // Scheduler Controls
        document.getElementById('start-scheduler-btn').addEventListener('click', () => this.controlScheduler('start'));
        document.getElementById('stop-scheduler-btn').addEventListener('click', () => this.controlScheduler('stop'));
        document.getElementById('restart-scheduler-btn').addEventListener('click', () => this.controlScheduler('restart'));
        document.getElementById('manual-sync-btn').addEventListener('click', () => this.manualSync());

        // Test Suite
        document.querySelectorAll('.test-suite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.runTestSuite(e.target.dataset.test));
        });

        // Modals
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    setupTabs() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'system':
                this.loadSystemMetrics();
                break;
            case 'scheduler':
                this.loadSchedulerData();
                break;
        }
    }

    // ================================
    // AUTHENTICATION
    // ================================
    async checkAuthStatus() {
        if (!this.token) {
            this.updateAuthStatus(false);
            return;
        }

        try {
            const response = await this.apiCall('/auth/profile', 'GET');
            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.updateAuthStatus(true);
            } else {
                this.token = null;
                localStorage.removeItem('admin_token');
                this.updateAuthStatus(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.updateAuthStatus(false);
        }
    }

    updateAuthStatus(isAuthenticated) {
        const indicator = document.getElementById('auth-indicator');
        const loginBtn = document.getElementById('login-btn');

        if (isAuthenticated) {
            indicator.innerHTML = '<i class="fas fa-circle"></i> Connesso';
            indicator.className = 'status-indicator connected';
            loginBtn.textContent = 'Logout';
            loginBtn.onclick = () => this.logout();
        } else {
            indicator.innerHTML = '<i class="fas fa-circle"></i> Disconnesso';
            indicator.className = 'status-indicator disconnected';
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => this.showLoginModal();
        }
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.classList.add('show');
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('admin_token', this.token);
                this.currentUser = data.user;
                this.updateAuthStatus(true);
                this.closeModal(document.getElementById('login-modal'));
                this.showSuccess('Login successful!');
                this.loadDashboard();
            } else {
                this.showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error during login');
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('admin_token');
        this.currentUser = null;
        this.updateAuthStatus(false);
        this.showSuccess('Logged out successfully');
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    // ================================
    // DASHBOARD
    // ================================
    async loadDashboard() {
        if (!this.token) return;

        try {
            // Load health status
            await this.loadHealthStatus();
            
            // Load quick stats
            await this.loadQuickStats();
            
            // Load alerts
            await this.loadAlerts();

            // Start auto-refresh for dashboard
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            this.refreshInterval = setInterval(() => {
                if (document.querySelector('.nav-tab.active').dataset.tab === 'dashboard') {
                    this.loadHealthStatus();
                    this.loadQuickStats();
                }
            }, 30000); // Refresh every 30 seconds

        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    }

    async loadHealthStatus() {
        // API Health - gestisce sia 200 OK che 503 Service Unavailable
        try {
            const response = await this.apiCall('/health/check');
            if (response.ok || response.status === 503) {
                const healthData = await response.json();
                const isHealthy = healthData.status === 'healthy';
                document.getElementById('api-status').textContent = isHealthy ? 'Online' : 'Degraded';
                document.getElementById('api-status').className = `status ${isHealthy ? 'healthy' : 'warning'}`;
            } else {
                document.getElementById('api-status').textContent = 'Offline';
                document.getElementById('api-status').className = 'status error';
            }
        } catch (error) {
            document.getElementById('api-status').textContent = 'Error';
            document.getElementById('api-status').className = 'status error';
        }

        // Database Health - usa endpoint corretto
        try {
            const response = await this.apiCall('/api/production/database/pool');
            if (response.ok) {
                const poolData = await response.json();
                const isHealthy = poolData.health.isHealthy;
                document.getElementById('db-status').textContent = isHealthy ? 'Connected' : 'Issues';
                document.getElementById('db-status').className = `status ${isHealthy ? 'healthy' : 'warning'}`;
            } else {
                document.getElementById('db-status').textContent = 'Error';
                document.getElementById('db-status').className = 'status error';
            }
        } catch (error) {
            document.getElementById('db-status').textContent = 'Error';
            document.getElementById('db-status').className = 'status error';
        }

        // Scheduler Health
        try {
            const response = await this.apiCall('/scheduler/status');
            if (response.ok) {
                const data = await response.json();
                const isRunning = data.isRunning;
                document.getElementById('scheduler-status').textContent = isRunning ? 'Running' : 'Stopped';
                document.getElementById('scheduler-status').className = `status ${isRunning ? 'healthy' : 'warning'}`;
            }
        } catch (error) {
            document.getElementById('scheduler-status').textContent = 'Error';
            document.getElementById('scheduler-status').className = 'status error';
        }
    }

    async loadQuickStats() {
        try {
            // Total Users
            const usersResponse = await this.apiCall('/auth/users');
            if (usersResponse.ok) {
                const data = await usersResponse.json();
                const users = data.users || data;
                document.getElementById('total-users').textContent = data.total || users.length;
            }

            // System Stats
            const statsResponse = await this.apiCall('/api/stats');
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                document.getElementById('active-workflows').textContent = stats.database?.totalWorkflows || 0;
                const lastSync = stats.scheduler?.lastSyncTime;
                document.getElementById('last-sync').textContent = lastSync ? 
                    new Date(lastSync).toLocaleTimeString() : 'Never';
            }
        } catch (error) {
            console.error('Quick stats error:', error);
        }
    }

    async loadAlerts() {
        try {
            // Usa alerts dall'health check invece dell'endpoint alerts vuoto
            const response = await this.apiCall('/health/check');
            if (response.ok || response.status === 503) {
                const healthData = await response.json();
                const alerts = healthData.alerts || [];
                const container = document.getElementById('alerts-list');
                
                if (alerts.length === 0) {
                    container.innerHTML = '<div class="alert-item info">No active alerts</div>';
                } else {
                    container.innerHTML = alerts.map(alert => `
                        <div class="alert-item ${alert.severity}">
                            <strong>${alert.component.toUpperCase()}</strong><br>
                            ${alert.message}
                            <small style="float: right; color: #9ca3af;">
                                ${new Date(alert.timestamp).toLocaleString()}
                            </small>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Alerts load error:', error);
        }
    }

    // ================================
    // USERS MANAGEMENT
    // ================================
    async loadUsers() {
        if (!this.token) return;

        try {
            const response = await this.apiCall('/auth/users');
            if (response.ok) {
                const data = await response.json();
                // Backend restituisce {users: [...], total: N} non array diretto
                const users = data.users || data;
                this.renderUsersTable(users);
            } else {
                this.showError('Failed to load users');
            }
        } catch (error) {
            console.error('Users load error:', error);
            this.showError('Network error loading users');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td><span class="status ${user.role === 'admin' ? 'warning' : 'healthy'}">${user.role}</span></td>
                <td>${user.tenant_id || '-'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="adminInterface.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showCreateUserModal() {
        const modal = document.getElementById('create-user-modal');
        modal.classList.add('show');
    }

    async handleCreateUser(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            tenantId: formData.get('tenantId') || 'client_simulation_a'  // Default tenant per mono-tenant
        };

        try {
            const response = await this.apiCall('/auth/register', 'POST', userData);
            if (response.ok) {
                this.showSuccess('User created successfully');
                this.closeModal(document.getElementById('create-user-modal'));
                this.loadUsers();
                e.target.reset();
            } else {
                const error = await response.json();
                this.showError(error.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Create user error:', error);
            this.showError('Network error creating user');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await this.apiCall(`/auth/users/${userId}`, 'DELETE');
            if (response.ok) {
                this.showSuccess('User deleted successfully');
                this.loadUsers();
            } else {
                this.showError('Failed to delete user');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            this.showError('Network error deleting user');
        }
    }

    // ================================
    // API TESTING
    // ================================
    async testQuickAPI(endpoint) {
        await this.executeAPI('GET', endpoint);
    }

    async executeCustomAPI() {
        const method = document.getElementById('api-method').value;
        const endpoint = document.getElementById('api-endpoint').value.trim();
        const body = document.getElementById('api-body').value.trim();

        if (!endpoint) {
            this.showError('Please enter an API endpoint');
            return;
        }

        let bodyData = null;
        if (body && (method === 'POST' || method === 'PUT')) {
            try {
                bodyData = JSON.parse(body);
            } catch (error) {
                this.showError('Invalid JSON in request body');
                return;
            }
        }

        await this.executeAPI(method, endpoint, bodyData);
    }

    async executeAPI(method, endpoint, body = null) {
        const startTime = Date.now();
        const responseEl = document.getElementById('api-response');
        const statusEl = document.getElementById('response-status');
        const timeEl = document.getElementById('response-time');

        // Show loading
        responseEl.textContent = 'Executing API call...';
        statusEl.textContent = 'Loading...';
        timeEl.textContent = '';

        try {
            const response = await this.apiCall(endpoint, method, body);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Update status
            statusEl.textContent = `${response.status} ${response.statusText}`;
            statusEl.className = `response-status ${response.ok ? 'success' : 'error'}`;
            timeEl.textContent = `${responseTime}ms`;

            // Update response body
            let responseText;
            try {
                const responseData = await response.json();
                responseText = JSON.stringify(responseData, null, 2);
            } catch (error) {
                responseText = await response.text();
            }

            responseEl.textContent = responseText || 'Empty response';

        } catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            statusEl.textContent = 'Network Error';
            statusEl.className = 'response-status error';
            timeEl.textContent = `${responseTime}ms`;
            responseEl.textContent = `Error: ${error.message}`;
        }
    }

    // ================================
    // SYSTEM MONITORING
    // ================================
    async loadSystemMetrics() {
        if (!this.token) return;

        try {
            // Production metrics
            const metricsResponse = await this.apiCall('/api/production/metrics');
            if (metricsResponse.ok) {
                const metrics = await metricsResponse.json();
                this.renderProductionMetrics(metrics);
            }

            // Database pool info - usa health check se pool restituisce 0
            const poolResponse = await this.apiCall('/api/production/database/pool');
            if (poolResponse.ok) {
                const pool = await poolResponse.json();
                
                // Se pool mostra 0 connessioni, usa dati da health check
                if (pool.detailed?.pool?.status?.totalConnections === 0) {
                    const healthResponse = await this.apiCall('/health/check');
                    if (healthResponse.ok || healthResponse.status === 503) {
                        const healthData = await healthResponse.json();
                        const dbDetails = healthData.checks?.database?.details;
                        if (dbDetails) {
                            // Combina dati pool con dati health
                            pool.healthData = dbDetails;
                        }
                    }
                }
                
                this.renderDatabasePool(pool);
            }

            // System logs
            const logsResponse = await this.apiCall('/logs?limit=20');
            if (logsResponse.ok) {
                const logs = await logsResponse.json();
                this.renderSystemLogs(logs);
            }

        } catch (error) {
            console.error('System metrics error:', error);
        }
    }

    renderProductionMetrics(metrics) {
        const container = document.getElementById('production-metrics');
        
        // Estrai dati dalla struttura reale dell'endpoint
        const memoryUsage = metrics.system?.memory?.percentage || 0;
        const cpuUsage = metrics.system?.cpu?.usage || 0;
        const avgResponseTime = metrics.performance?.averageResponseTime || 0;
        const errorRate = metrics.performance?.errorRate || 0;
        
        container.innerHTML = `
            <div class="status-item">
                <span>Memory Usage</span>
                <span class="status ${memoryUsage > 80 ? 'error' : 'healthy'}">
                    ${memoryUsage.toFixed(1)}%
                </span>
            </div>
            <div class="status-item">
                <span>CPU Usage</span>
                <span class="status ${cpuUsage > 80 ? 'error' : 'healthy'}">
                    ${cpuUsage.toFixed(1)}%
                </span>
            </div>
            <div class="status-item">
                <span>Response Time</span>
                <span class="status ${avgResponseTime > 1000 ? 'warning' : 'healthy'}">
                    ${avgResponseTime.toFixed(0)}ms
                </span>
            </div>
            <div class="status-item">
                <span>Error Rate</span>
                <span class="status ${errorRate > 5 ? 'error' : 'healthy'}">
                    ${errorRate.toFixed(1)}%
                </span>
            </div>
        `;
    }

    renderDatabasePool(pool) {
        const container = document.getElementById('db-pool-info');
        
        // Usa dati health se disponibili, altrimenti pool endpoint
        let totalConnections, activeConnections, waitingClients;
        
        if (pool.healthData) {
            // Dati da health check
            totalConnections = pool.healthData.totalConnections || 0;
            activeConnections = pool.healthData.totalConnections - pool.healthData.idleConnections || 0;
            waitingClients = pool.healthData.waitingCount || 0;
        } else {
            // Dati da pool endpoint
            totalConnections = pool.detailed?.pool?.status?.totalConnections || 0;
            activeConnections = pool.detailed?.pool?.status?.activeConnections || 0;
            waitingClients = pool.detailed?.pool?.status?.waitingClients || 0;
        }
        
        container.innerHTML = `
            <div class="status-item">
                <span>Total Connections</span>
                <span class="stat-value">${totalConnections}</span>
            </div>
            <div class="status-item">
                <span>Active Connections</span>
                <span class="stat-value">${activeConnections}</span>
            </div>
            <div class="status-item">
                <span>Waiting Requests</span>
                <span class="stat-value">${waitingClients}</span>
            </div>
        `;
    }

    renderSystemLogs(logs) {
        const container = document.getElementById('system-logs');
        if (logs.length === 0) {
            container.innerHTML = '<div class="text-center">No recent logs</div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-item" style="padding: 0.5rem; border-bottom: 1px solid #374151; font-size: 0.8rem;">
                <span style="color: #9ca3af;">${new Date(log.timestamp).toLocaleString()}</span>
                <span style="color: #4ade80;">[${log.level}]</span>
                <span style="color: #e5e7eb;">${log.message}</span>
            </div>
        `).join('');
    }

    async refreshDatabasePool() {
        try {
            const response = await this.apiCall('/api/production/database/pool/refresh', 'POST');
            if (response.ok) {
                this.showSuccess('Database pool refreshed');
                await this.loadSystemMetrics();
            } else {
                this.showError('Failed to refresh database pool');
            }
        } catch (error) {
            console.error('Pool refresh error:', error);
            this.showError('Network error refreshing pool');
        }
    }

    // ================================
    // SCHEDULER CONTROL
    // ================================
    async loadSchedulerData() {
        if (!this.token) return;

        try {
            // Scheduler status
            const statusResponse = await this.apiCall('/scheduler/status');
            if (statusResponse.ok) {
                const status = await statusResponse.json();
                this.renderSchedulerInfo(status);
            }

            // Sync history
            const historyResponse = await this.apiCall('/logs?limit=10');
            if (historyResponse.ok) {
                const history = await historyResponse.json();
                this.renderSyncHistory(history);
            }

        } catch (error) {
            console.error('Scheduler data error:', error);
        }
    }

    renderSchedulerInfo(status) {
        const container = document.getElementById('scheduler-info');
        container.innerHTML = `
            <div class="status-item">
                <span>Status</span>
                <span class="status ${status.isRunning ? 'healthy' : 'warning'}">
                    ${status.isRunning ? 'Running' : 'Stopped'}
                </span>
            </div>
            <div class="status-item">
                <span>Next Run</span>
                <span class="stat-value">${status.nextRun || 'N/A'}</span>
            </div>
            <div class="status-item">
                <span>Last Run</span>
                <span class="stat-value">${status.lastRun || 'Never'}</span>
            </div>
        `;
    }

    renderSyncHistory(history) {
        const container = document.getElementById('sync-history');
        if (history.length === 0) {
            container.innerHTML = '<div class="text-center">No sync history</div>';
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="sync-item" style="padding: 0.75rem; border-bottom: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #4ade80;">${item.tenantName || item.tenant_id}</span>
                    <span class="status ${item.success ? 'healthy' : 'error'}">
                        ${item.success ? 'Success' : 'Failed'}
                    </span>
                </div>
                <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 0.25rem;">
                    ${new Date(item.started_at).toLocaleString()} • ${item.duration_ms}ms
                </div>
            </div>
        `).join('');
    }

    async controlScheduler(action) {
        try {
            const response = await this.apiCall(`/api/scheduler/${action}`, 'POST');
            if (response.ok) {
                this.showSuccess(`Scheduler ${action} successful`);
                await this.loadSchedulerData();
            } else {
                this.showError(`Failed to ${action} scheduler`);
            }
        } catch (error) {
            console.error(`Scheduler ${action} error:`, error);
            this.showError(`Network error during scheduler ${action}`);
        }
    }

    async manualSync() {
        const tenantId = document.getElementById('tenant-id-input').value.trim();
        const endpoint = tenantId ? `/api/tenants/${tenantId}/sync` : '/api/scheduler/sync';

        try {
            const response = await this.apiCall(endpoint, 'POST');
            if (response.ok) {
                this.showSuccess('Manual sync started');
                await this.loadSchedulerData();
            } else {
                this.showError('Failed to start manual sync');
            }
        } catch (error) {
            console.error('Manual sync error:', error);
            this.showError('Network error during manual sync');
        }
    }

    // ================================
    // TEST SUITE
    // ================================
    async runTestSuite(testType) {
        const outputEl = document.getElementById('test-output');
        const statusEl = document.getElementById('test-status');

        statusEl.textContent = `Running ${testType} tests...`;
        statusEl.className = 'test-status';
        outputEl.textContent = 'Initializing test suite...\n';

        const scriptName = testType === 'quick' ? 'test-quick.sh' : 
                          testType === 'security' ? 'test-suite-security.sh' : 
                          'test-suite.sh';

        try {
            // Simulate test execution by calling a test endpoint
            const response = await this.apiCall(`/test/${testType}`, 'POST');
            
            if (response.ok) {
                const result = await response.json();
                statusEl.textContent = `${testType} tests completed`;
                outputEl.textContent = result.output || `${testType} test suite completed successfully`;
                
                if (result.success) {
                    statusEl.style.color = '#4ade80';
                } else {
                    statusEl.style.color = '#ef4444';
                }
            } else {
                // Fallback: show manual test instructions
                outputEl.textContent = `To run ${testType} tests manually, execute:\n\n./${scriptName}\n\nTest endpoint not implemented yet.`;
                statusEl.textContent = 'Manual test required';
                statusEl.style.color = '#fbbf24';
            }
        } catch (error) {
            console.error('Test suite error:', error);
            outputEl.textContent = `Error running tests: ${error.message}\n\nTo run manually:\n./${scriptName}`;
            statusEl.textContent = 'Test execution failed';
            statusEl.style.color = '#ef4444';
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================
    async apiCall(endpoint, method = 'GET', body = null) {
        const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        return fetch(url, options);
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    closeModal(modal) {
        modal.classList.remove('show');
    }
}

// CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize admin interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminInterface = new AdminInterface();
});

// Make adminInterface globally available for inline event handlers
window.adminInterface = null;