import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Settings,
  Bell,
  BookOpen,
  ClipboardCheck,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  ExternalLink,
  FlaskConical,
  BarChart3,
  Activity
} from 'lucide-react';
import { safeFormatFullDate, safeFormatTime } from './utils/safeDate';

// Components
import { KPICard } from './components/KPICard';
import { AlertsPanel } from './components/AlertsPanel';
import { ActionItemsTable } from './components/ActionItemsTable';
import { LectureScoreChart, ErrorTrendChart, ActionsResolvedChart, ScoreDistributionChart } from './components/Charts';
import { RecentActivityList } from './components/RecentActivity';
import { SummaryTable } from './components/SummaryTable';
import { InstructorTable } from './components/InstructorTable';

// Data
import { mockDashboardData, mockInstructorData, mockScoreDistribution } from './data/mockData';
import { DashboardData } from './types';

function App() {
  const [data, setData] = useState<DashboardData>(mockDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);

  // Simulate data refresh
  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData({
      ...mockDashboardData,
      lastUpdated: new Date().toISOString()
    });
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getKPIStatus = (current: number, target: number, lowerIsBetter = false): 'success' | 'warning' | 'danger' => {
    if (lowerIsBetter) {
      if (current <= target) return 'success';
      if (current <= target * 1.5) return 'warning';
      return 'danger';
    }
    if (current >= target) return 'success';
    if (current >= target * 0.8) return 'warning';
    return 'danger';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'teaching', label: 'Teaching Quality', icon: BookOpen },
    { id: 'actions', label: 'Action Items', icon: ClipboardCheck },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'research', label: 'Research', icon: FlaskConical }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Mathematics QC Dashboard</h1>
                  <p className="text-xs text-blue-200">Quality Control Automation System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>{safeFormatFullDate()}</span>
              </div>

              <div className="relative">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {data.alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                      {data.alerts.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-hide pb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Last Updated Banner */}
      <div className="bg-white border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-green-500" />
            <span>Last updated: {safeFormatTime(lastRefresh)}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              View Reports
            </a>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export Data
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alerts Section */}
        {data.alerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {data.alerts.length}
              </span>
            </div>
            <AlertsPanel alerts={data.alerts} />
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Lectures Observed"
                value={data.kpis.lecturesObserved.current}
                change={data.kpis.lecturesObserved.change}
                target={data.kpis.lecturesObserved.target}
                icon={<BookOpen className="w-5 h-5" />}
                status={getKPIStatus(data.kpis.lecturesObserved.current, data.kpis.lecturesObserved.target || 20)}
              />
              <KPICard
                title="Avg Lecture Score"
                value={data.kpis.avgLectureScore.current.toFixed(2)}
                suffix="/5"
                change={data.kpis.avgLectureScore.change}
                target={data.kpis.avgLectureScore.target}
                icon={<TrendingUp className="w-5 h-5" />}
                status={getKPIStatus(data.kpis.avgLectureScore.current, data.kpis.avgLectureScore.target || 4.0)}
              />
              <KPICard
                title="Rehearsal Compliance"
                value={data.kpis.rehearsalCompliance.current}
                suffix="%"
                change={data.kpis.rehearsalCompliance.change}
                target={data.kpis.rehearsalCompliance.target}
                icon={<ClipboardCheck className="w-5 h-5" />}
                status={getKPIStatus(data.kpis.rehearsalCompliance.current, data.kpis.rehearsalCompliance.target || 100)}
              />
              <KPICard
                title="Content Errors"
                value={data.kpis.contentErrors.current}
                change={data.kpis.contentErrors.change}
                target={data.kpis.contentErrors.target}
                lowerIsBetter={true}
                icon={<AlertTriangle className="w-5 h-5" />}
                status={getKPIStatus(data.kpis.contentErrors.current, data.kpis.contentErrors.target || 0, true)}
              />
            </div>

            {/* Second Row KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Student Satisfaction"
                value={data.kpis.studentSatisfaction.current.toFixed(2)}
                suffix="/5"
                change={data.kpis.studentSatisfaction.change}
                target={data.kpis.studentSatisfaction.target}
                icon={<Users className="w-5 h-5" />}
                status={getKPIStatus(data.kpis.studentSatisfaction.current, data.kpis.studentSatisfaction.target || 4.0)}
              />
              <KPICard
                title="Assessment Error Rate"
                value={data.kpis.assessmentErrorRate.current.toFixed(1)}
                suffix="%"
                change={data.kpis.assessmentErrorRate.change}
                target={data.kpis.assessmentErrorRate.target}
                lowerIsBetter={true}
                icon={<FileText className="w-5 h-5" />}
                status={getKPIStatus(data.kpis.assessmentErrorRate.current, data.kpis.assessmentErrorRate.target || 1, true)}
              />
              <KPICard
                title="Open Actions"
                value={data.kpis.openActions.current}
                icon={<ClipboardCheck className="w-5 h-5" />}
                status={data.kpis.openActions.critical > 0 ? 'danger' : data.kpis.openActions.high > 0 ? 'warning' : 'success'}
              />
              <KPICard
                title="Active Research"
                value={data.kpis.activeResearch.current}
                change={data.kpis.activeResearch.change}
                icon={<FlaskConical className="w-5 h-5" />}
                status="neutral"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Scores Trend</h3>
                <div className="h-64">
                  <LectureScoreChart trends={data.trends} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                <div className="h-64">
                  <ScoreDistributionChart distribution={mockScoreDistribution} />
                </div>
              </div>
            </div>

            {/* Summary Table & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
                <SummaryTable summary={data.summary} />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <RecentActivityList activities={data.recent.slice(0, 6)} />
              </div>
            </div>
          </>
        )}

        {/* Teaching Quality Tab */}
        {activeTab === 'teaching' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Scores Trend</h3>
                <div className="h-72">
                  <LectureScoreChart trends={data.trends} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Errors by Week</h3>
                <div className="h-72">
                  <ErrorTrendChart trends={data.trends} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
              <SummaryTable summary={data.summary} />
            </div>
          </>
        )}

        {/* Action Items Tab */}
        {activeTab === 'actions' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-700">{data.kpis.openActions.critical}</p>
                    <p className="text-sm text-red-600">Critical</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{data.kpis.openActions.high}</p>
                    <p className="text-sm text-amber-600">High Priority</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{data.kpis.actionsResolved.current}</p>
                    <p className="text-sm text-green-600">Resolved This Week</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Open Action Items</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  View All
                </button>
              </div>
              <ActionItemsTable actions={data.actions} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Resolved by Week</h3>
              <div className="h-64">
                <ActionsResolvedChart trends={data.trends} />
              </div>
            </div>
          </>
        )}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Performance</h3>
            <InstructorTable instructors={mockInstructorData} />
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Research Projects</h3>
                <p className="text-sm text-gray-500">{data.kpis.activeResearch.current} active projects</p>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Research QC Dashboard</p>
              <p className="text-sm mt-2">Connect to your Google Sheets to view research project data</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Configure Data Source
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Mathematics Department QC System v1.0
              </span>
              <a href="/README.md" target="_blank" className="text-sm text-blue-600 hover:text-blue-700">
                Documentation
              </a>
              <a href="/INSTRUCTIONS.txt" target="_blank" className="text-sm text-blue-600 hover:text-blue-700">
                Setup Guide
              </a>
            </div>
            <div className="text-sm text-gray-400">
              © 2026 Mathematics Department. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Demo Data (Current)</option>
                  <option>Google Sheets API</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Refresh Interval</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apps Script URL</label>
                <input 
                  type="text" 
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
