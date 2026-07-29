/**
 * ================================================================
 * MATHEMATICS QC DASHBOARD - JAVASCRIPT
 * ================================================================
 * 
 * This file handles all dashboard functionality including:
 * - Data fetching from Google Apps Script
 * - Chart rendering
 * - Real-time updates
 * - UI interactions
 * ================================================================
 */

// ================================================================
// CONFIGURATION
// ================================================================

const CONFIG = {
    // Replace with your Apps Script Web App URL
    API_URL: '[YOUR_APPS_SCRIPT_URL]',
    
    // Use demo data if API is not configured
    USE_DEMO_DATA: true,
    
    // Auto-refresh interval in milliseconds (5 minutes)
    REFRESH_INTERVAL: 5 * 60 * 1000,
    
    // Quality thresholds
    THRESHOLDS: {
        LECTURE_SCORE: 4.0,
        REHEARSAL_COMPLIANCE: 100,
        ERROR_RATE: 1.0,
        SATISFACTION: 4.0
    }
};

// ================================================================
// DEMO DATA
// ================================================================

const DEMO_DATA = {
    kpis: {
        lecturesObserved: { current: 24, previous: 22, change: 9.1, target: 25 },
        avgLectureScore: { current: 4.32, previous: 4.15, change: 4.1, target: 4.0 },
        rehearsalCompliance: { current: 92, previous: 85, change: 8.2, target: 100 },
        contentErrors: { current: 2, previous: 5, change: -60, target: 0 },
        assessmentsReviewed: { current: 15, previous: 12, change: 25, target: 15 },
        assessmentErrorRate: { current: 0.8, previous: 1.5, change: -46.7, target: 1.0 },
        studentSatisfaction: { current: 4.28, previous: 4.1, change: 4.4, target: 4.0 },
        openActions: { current: 8, critical: 1, high: 3 },
        actionsResolved: { current: 6, previous: 4, change: 50 },
        activeResearch: { current: 12, previous: 11, change: 9.1 }
    },
    trends: {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
        lectureScores: [4.1, 4.0, 4.2, 4.15, 4.3, 4.25, 4.1, 4.35, 4.2, 4.4, 4.28, 4.32],
        errorCounts: [3, 5, 2, 4, 3, 2, 4, 1, 3, 2, 3, 2],
        satisfaction: [3.9, 4.0, 4.1, 4.0, 4.2, 4.15, 4.1, 4.2, 4.25, 4.18, 4.22, 4.28],
        actionsResolved: [4, 5, 3, 6, 4, 5, 7, 4, 5, 6, 4, 6]
    },
    actions: [
        { issueId: 'ACT-2026-015', date: '2026-01-13', issueType: 'Academic Error', severity: 'Critical', description: 'Incorrect formula in MATH201 lecture slides', assignedTo: 'Dr. Smith', targetDate: '2026-01-14', status: 'In Progress', isOverdue: false },
        { issueId: 'ACT-2026-014', date: '2026-01-12', issueType: 'Delivery Issue', severity: 'High', description: 'Low student engagement in MATH102', assignedTo: 'Dr. Jones', targetDate: '2026-01-18', status: 'Open', isOverdue: false },
        { issueId: 'ACT-2026-013', date: '2026-01-11', issueType: 'Assessment Error', severity: 'High', description: 'Marking inconsistency in Quiz 3', assignedTo: 'Prof. Wilson', targetDate: '2026-01-15', status: 'In Progress', isOverdue: false },
        { issueId: 'ACT-2026-012', date: '2026-01-10', issueType: 'Process Issue', severity: 'Medium', description: 'Readiness checklist incomplete for MATH301', assignedTo: 'Dr. Williams', targetDate: '2026-01-17', status: 'Open', isOverdue: false },
        { issueId: 'ACT-2026-011', date: '2026-01-09', issueType: 'Compliance Issue', severity: 'High', description: 'Session not rehearsed - content errors observed', assignedTo: 'Dr. Brown', targetDate: '2026-01-12', status: 'In Progress', isOverdue: true },
        { issueId: 'ACT-2026-010', date: '2026-01-08', issueType: 'Research Issue', severity: 'Medium', description: 'Low originality score in student project', assignedTo: 'Prof. Taylor', targetDate: '2026-01-20', status: 'Open', isOverdue: false }
    ],
    alerts: [
        { type: 'danger', category: 'Action Items', message: '1 critical action item pending immediate attention' },
        { type: 'danger', category: 'Action Items', message: '1 overdue action item needs escalation' },
        { type: 'warning', category: 'Compliance', message: 'Rehearsal compliance (92%) below target (100%)' },
        { type: 'warning', category: 'Content Quality', message: '2 content errors found this week' }
    ],
    recent: [
        { type: 'observation', icon: '📋', description: 'Lecture observed: MATH201 by Dr. Smith', time: '30 min ago' },
        { type: 'action', icon: '✅', description: 'Action ACT-2026-007: Content error resolved', time: '2 hours ago' },
        { type: 'assessment', icon: '📝', description: 'Assessment reviewed: Mid-term for MATH102', time: '3 hours ago' },
        { type: 'observation', icon: '📋', description: 'Lecture observed: MATH301 by Dr. Williams', time: '4 hours ago' },
        { type: 'action', icon: '🔔', description: 'Action ACT-2026-015: New critical issue logged', time: '5 hours ago' },
        { type: 'feedback', icon: '💬', description: 'New student feedback received for MATH101', time: '6 hours ago' }
    ],
    summary: [
        { metric: 'Lecture Readiness Score', currentWeek: '4.32', lastWeek: '4.15', change: '+4.1%', status: '✅' },
        { metric: 'Rehearsal Compliance', currentWeek: '92%', lastWeek: '85%', change: '+8.2%', status: '⚠️' },
        { metric: 'Content Error Rate', currentWeek: '2', lastWeek: '5', change: '-60%', status: '⚠️' },
        { metric: 'Assessment Error Rate', currentWeek: '0.8%', lastWeek: '1.5%', change: '-46.7%', status: '✅' },
        { metric: 'Student Satisfaction', currentWeek: '4.28', lastWeek: '4.10', change: '+4.4%', status: '✅' }
    ],
    distribution: { excellent: 12, good: 28, satisfactory: 8, needsImprovement: 3, poor: 1 }
};

// ================================================================
// STATE MANAGEMENT
// ================================================================

let state = {
    data: null,
    isLoading: true,
    lastUpdated: null,
    activeTab: 'overview',
    charts: {}
};

// ================================================================
// INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    startAutoRefresh();
});

async function initializeDashboard() {
    showLoading(true);
    updateCurrentDate();
    
    try {
        const data = await fetchDashboardData();
        state.data = data;
        state.lastUpdated = new Date();
        renderDashboard(data);
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        // Use demo data as fallback
        state.data = DEMO_DATA;
        state.lastUpdated = new Date();
        renderDashboard(DEMO_DATA);
    } finally {
        showLoading(false);
    }
}

// ================================================================
// DATA FETCHING
// ================================================================

async function fetchDashboardData() {
    if (CONFIG.USE_DEMO_DATA || CONFIG.API_URL === '[YOUR_APPS_SCRIPT_URL]') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return DEMO_DATA;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getData`);
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ================================================================
// RENDERING FUNCTIONS
// ================================================================

function renderDashboard(data) {
    renderKPIs(data.kpis);
    renderAlerts(data.alerts);
    renderCharts(data.trends, data.distribution);
    renderSummaryTable(data.summary);
    renderActivityList(data.recent);
    renderActionsTab(data.kpis.openActions, data.actions);
    updateLastUpdated();
}

function renderKPIs(kpis) {
    const grid = document.getElementById('kpiGrid');
    
    const kpiConfigs = [
        { key: 'lecturesObserved', title: 'Lectures Observed', icon: '📋', suffix: '' },
        { key: 'avgLectureScore', title: 'Avg Lecture Score', icon: '📈', suffix: '/5' },
        { key: 'rehearsalCompliance', title: 'Rehearsal Compliance', icon: '✓', suffix: '%' },
        { key: 'contentErrors', title: 'Content Errors', icon: '⚠️', suffix: '', lowerIsBetter: true },
        { key: 'studentSatisfaction', title: 'Student Satisfaction', icon: '👥', suffix: '/5' },
        { key: 'assessmentErrorRate', title: 'Assessment Error Rate', icon: '📝', suffix: '%', lowerIsBetter: true },
        { key: 'openActions', title: 'Open Actions', icon: '📋', suffix: '', isSimple: true },
        { key: 'activeResearch', title: 'Active Research', icon: '🔬', suffix: '' }
    ];
    
    grid.innerHTML = kpiConfigs.map(config => {
        const kpi = kpis[config.key];
        if (!kpi) return '';
        
        const value = config.isSimple ? kpi.current : kpi.current;
        const change = kpi.change;
        const target = kpi.target;
        
        let status = 'neutral';
        if (target !== undefined) {
            if (config.lowerIsBetter) {
                status = value <= target ? 'success' : value <= target * 1.5 ? 'warning' : 'danger';
            } else {
                status = value >= target ? 'success' : value >= target * 0.8 ? 'warning' : 'danger';
            }
        }
        if (config.key === 'openActions') {
            status = kpi.critical > 0 ? 'danger' : kpi.high > 0 ? 'warning' : 'success';
        }
        
        const changeClass = config.lowerIsBetter ? (change <= 0 ? 'positive' : 'negative') : (change >= 0 ? 'positive' : 'negative');
        const changeArrow = change >= 0 ? '↑' : '↓';
        
        return `
            <div class="kpi-card ${status}">
                <div class="kpi-header">
                    <span class="kpi-title">${config.title}</span>
                    <div class="kpi-icon">${config.icon}</div>
                </div>
                <div class="kpi-value">
                    ${typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}
                    <span class="kpi-suffix">${config.suffix}</span>
                </div>
                <div class="kpi-footer">
                    ${change !== undefined ? `
                    <span class="kpi-change ${changeClass}">
                        ${changeArrow} ${Math.abs(change).toFixed(1)}% vs last week
                    </span>
                    ` : ''}
                    ${target !== undefined ? `
                    <span class="kpi-target">Target: ${target}${config.suffix}</span>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderAlerts(alerts) {
    const section = document.getElementById('alertsSection');
    const list = document.getElementById('alertsList');
    const badge = document.getElementById('alertBadge');
    const countBadge = document.getElementById('alertCount');
    
    badge.textContent = alerts.length;
    badge.style.display = alerts.length > 0 ? 'flex' : 'none';
    
    if (alerts.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    countBadge.textContent = alerts.length;
    
    list.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <span class="alert-icon">${alert.type === 'danger' ? '🚨' : '⚠️'}</span>
            <div class="alert-content">
                <span class="alert-category">${alert.category}</span>
                <p class="alert-message">${alert.message}</p>
            </div>
        </div>
    `).join('');
}

function renderCharts(trends, distribution) {
    // Destroy existing charts
    Object.values(state.charts).forEach(chart => chart.destroy());
    state.charts = {};
    
    // Trend Chart (Overview)
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        state.charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trends.labels,
                datasets: [
                    {
                        label: 'Lecture Score',
                        data: trends.lectureScores,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Satisfaction',
                        data: trends.satisfaction,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: { min: 3, max: 5 }
                }
            }
        });
    }
    
    // Distribution Chart
    const distCtx = document.getElementById('distributionChart');
    if (distCtx) {
        state.charts.distribution = new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor'],
                datasets: [{
                    data: [distribution.excellent, distribution.good, distribution.satisfactory, distribution.needsImprovement, distribution.poor],
                    backgroundColor: ['#16a34a', '#2563eb', '#f59e0b', '#f97316', '#dc2626']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } },
                cutout: '60%'
            }
        });
    }
    
    // Lecture Chart (Teaching Tab)
    const lectureCtx = document.getElementById('lectureChart');
    if (lectureCtx) {
        state.charts.lecture = new Chart(lectureCtx, {
            type: 'line',
            data: {
                labels: trends.labels,
                datasets: [{
                    label: 'Lecture Score',
                    data: trends.lectureScores,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 3, max: 5 } }
            }
        });
    }
    
    // Error Chart (Teaching Tab)
    const errorCtx = document.getElementById('errorChart');
    if (errorCtx) {
        state.charts.error = new Chart(errorCtx, {
            type: 'bar',
            data: {
                labels: trends.labels,
                datasets: [{
                    label: 'Content Errors',
                    data: trends.errorCounts,
                    backgroundColor: '#dc2626'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

function renderSummaryTable(summary) {
    const tbody = document.querySelector('#summaryTable tbody');
    
    tbody.innerHTML = summary.map(row => `
        <tr>
            <td><strong>${row.metric}</strong></td>
            <td>${row.currentWeek}</td>
            <td>${row.lastWeek}</td>
            <td class="${row.change.startsWith('+') ? 'text-success' : row.change.startsWith('-') ? 'text-danger' : ''}">${row.change}</td>
            <td>${row.status}</td>
        </tr>
    `).join('');
}

function renderActivityList(activities) {
    const list = document.getElementById('activityList');
    
    list.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function renderActionsTab(openActions, actions) {
    // Action Summary Cards
    const summary = document.getElementById('actionSummary');
    summary.innerHTML = `
        <div class="action-summary-card critical">
            <div class="action-summary-icon">🚨</div>
            <div class="action-summary-content">
                <h3>${openActions.critical}</h3>
                <p>Critical</p>
            </div>
        </div>
        <div class="action-summary-card high">
            <div class="action-summary-icon">⚠️</div>
            <div class="action-summary-content">
                <h3>${openActions.high}</h3>
                <p>High Priority</p>
            </div>
        </div>
        <div class="action-summary-card resolved">
            <div class="action-summary-icon">✅</div>
            <div class="action-summary-content">
                <h3>${state.data.kpis.actionsResolved.current}</h3>
                <p>Resolved This Week</p>
            </div>
        </div>
    `;
    
    // Actions Count Badge
    document.getElementById('openActionsCount').textContent = openActions.current;
    
    // Actions Table
    const tbody = document.querySelector('#actionsTable tbody');
    tbody.innerHTML = actions.map(action => `
        <tr class="${action.isOverdue ? 'overdue-row' : ''}">
            <td><strong>${action.issueId}</strong></td>
            <td><span class="badge severity-${action.severity.toLowerCase()}">${action.severity}</span></td>
            <td>${action.description}</td>
            <td>${action.assignedTo}</td>
            <td>
                ${action.targetDate}
                ${action.isOverdue ? '<div class="overdue-indicator">⚠️ Overdue</div>' : ''}
            </td>
            <td>
                <span class="status-indicator">
                    <span class="status-dot-sm ${action.status.toLowerCase().replace(' ', '-')}"></span>
                    ${action.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// ================================================================
// EVENT HANDLERS
// ================================================================

function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        const btn = document.getElementById('refreshBtn');
        btn.classList.add('loading');
        
        try {
            const data = await fetchDashboardData();
            state.data = data;
            state.lastUpdated = new Date();
            renderDashboard(data);
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            btn.classList.remove('loading');
        }
    });
    
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}Content`).classList.add('active');
            
            state.activeTab = tabId;
        });
    });
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
    state.isLoading = show;
}

function updateCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    el.textContent = state.lastUpdated.toLocaleTimeString();
}

function startAutoRefresh() {
    setInterval(async () => {
        try {
            const data = await fetchDashboardData();
            state.data = data;
            state.lastUpdated = new Date();
            renderDashboard(data);
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, CONFIG.REFRESH_INTERVAL);
}

// ================================================================
// CSS HELPER STYLES (injected)
// ================================================================

const style = document.createElement('style');
style.textContent = `
    .text-success { color: #16a34a; }
    .text-danger { color: #dc2626; }
`;
document.head.appendChild(style);
