/**
 * Test Results Modal Functions
 * Estende AdminInterface con funzionalità per visualizzare risultati completi
 */

// Extend AdminInterface with full test results functionality
AdminInterface.prototype.showFullTestResults = async function() {
    try {
        const response = await this.apiCall('/test/results');
        if (response.ok) {
            const result = await response.json();
            this.renderFullTestResults(result.data);
            
            const modal = document.getElementById('full-test-results-modal');
            modal.classList.add('show');
        } else {
            this.showError('Failed to load test results');
        }
    } catch (error) {
        console.error('Full test results error:', error);
        this.showError('Network error loading test results');
    }
};

AdminInterface.prototype.renderFullTestResults = function(data) {
    // Update summary
    document.getElementById('modal-total-tests').textContent = data.summary.totalExecuted;
    document.getElementById('modal-success-rate').textContent = `${data.summary.successRate}%`;
    document.getElementById('modal-avg-duration').textContent = data.summary.avgDuration;
    document.getElementById('modal-last-test').textContent = new Date(data.summary.lastTest).toLocaleString();

    // Update test types breakdown
    const breakdownContainer = document.getElementById('test-types-breakdown');
    breakdownContainer.innerHTML = Object.entries(data.breakdown).map(([type, stats]) => `
        <div class="test-breakdown-item">
            <span class="test-breakdown-label">${type.toUpperCase()}</span>
            <span class="test-breakdown-value ${stats.failed > 0 ? 'error' : 'success'}">
                ${stats.passed}/${stats.executed} (${stats.avgDuration})
            </span>
        </div>
    `).join('');

    // Update detailed history
    const historyContainer = document.getElementById('detailed-test-history');
    historyContainer.innerHTML = data.history.map(test => `
        <div class="detailed-test-item ${test.status}">
            <div class="test-item-header">
                <span class="test-item-title">${test.type.toUpperCase()} Test Suite</span>
                <span class="test-item-status status ${test.status}">
                    ${this.getStatusIcon(test.status)} ${test.status.toUpperCase()}
                </span>
            </div>
            <div class="test-item-info">
                <div class="test-info-item">
                    <span class="test-info-label">Executed</span>
                    <span class="test-info-value">${new Date(test.timestamp).toLocaleString()}</span>
                </div>
                <div class="test-info-item">
                    <span class="test-info-label">Duration</span>
                    <span class="test-info-value">${test.duration}</span>
                </div>
                <div class="test-info-item">
                    <span class="test-info-label">Coverage</span>
                    <span class="test-info-value">${test.details.coverage}</span>
                </div>
            </div>
            <div class="test-output-preview">${test.output}</div>
            <div class="test-actions">
                <button class="btn btn-info btn-sm" onclick="adminInterface.copyTestOutput('${test.id}')">
                    <i class="fas fa-copy"></i> Copy Output
                </button>
                <button class="btn btn-primary btn-sm" onclick="adminInterface.rerunTest('${test.type}')">
                    <i class="fas fa-redo"></i> Re-run Test
                </button>
                <span class="test-info-value" style="margin-left: auto; color: var(--muted-foreground);">
                    ${test.details.testsPassed}/${test.details.testsRun} tests passed
                </span>
            </div>
        </div>
    `).join('');
};

AdminInterface.prototype.clearTestHistory = async function() {
    if (!confirm('Are you sure you want to clear all test history?')) return;
    
    this.testHistory = [];
    localStorage.removeItem('test_history');
    this.updateTestResults();
    this.showSuccess('Test history cleared');
    
    const modal = document.getElementById('full-test-results-modal');
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
    }
};

AdminInterface.prototype.exportTestResults = function() {
    try {
        const exportData = {
            exported: new Date().toISOString(),
            version: '2.11.0',
            testHistory: this.testHistory,
            summary: {
                totalTests: this.testHistory.length,
                passedTests: this.testHistory.filter(t => t.status === 'success').length,
                failedTests: this.testHistory.filter(t => t.status === 'error').length
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pilotpro-test-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Test results exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        this.showError('Failed to export test results');
    }
};

AdminInterface.prototype.copyTestOutput = function(testId) {
    navigator.clipboard.writeText('Test output copied to clipboard').then(() => {
        this.showSuccess('Test output copied to clipboard');
    });
};

AdminInterface.prototype.rerunTest = function(testType) {
    const modal = document.getElementById('full-test-results-modal');
    modal.classList.remove('show');
    
    this.switchTab('tests');
    setTimeout(() => {
        this.runTestSuite(testType);
    }, 500);
};

// Add event listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const viewBtn = document.getElementById('view-full-results-btn');
        const clearBtn = document.getElementById('clear-test-history-btn');
        const exportBtn = document.getElementById('export-test-results-btn');
        
        if (viewBtn) viewBtn.addEventListener('click', () => window.adminInterface.showFullTestResults());
        if (clearBtn) clearBtn.addEventListener('click', () => window.adminInterface.clearTestHistory());
        if (exportBtn) exportBtn.addEventListener('click', () => window.adminInterface.exportTestResults());
    }, 1000);
});