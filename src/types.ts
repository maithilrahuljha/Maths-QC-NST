// Type definitions for the QC Dashboard

export interface KPI {
  current: number;
  previous?: number;
  change?: number;
  target?: number;
}

export interface KPIs {
  lecturesObserved: KPI;
  avgLectureScore: KPI;
  rehearsalCompliance: KPI;
  contentErrors: KPI;
  assessmentsReviewed: KPI;
  assessmentErrorRate: KPI;
  studentSatisfaction: KPI;
  feedbackCount: KPI;
  openActions: {
    current: number;
    critical: number;
    high: number;
  };
  actionsResolved: KPI;
  activeResearch: KPI;
}

export interface Trends {
  labels: string[];
  lectureScores: number[];
  errorCounts: number[];
  satisfaction: number[];
  actionsResolved: number[];
}

export interface ActionItem {
  issueId: string;
  date: string;
  issueType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  assignedTo: string;
  targetDate: string;
  status: string;
  isOverdue: boolean;
}

export interface Alert {
  type: 'danger' | 'warning' | 'info';
  category: string;
  message: string;
  timestamp: string;
}

export interface RecentActivity {
  type: string;
  icon: string;
  description: string;
  timestamp: string;
}

export interface DashboardSummary {
  metric: string;
  currentWeek: string | number;
  lastWeek: string | number;
  changePercent: string;
  target: string | number;
  status: string;
  trendIcon: string;
}

export interface InstructorPerformance {
  name: string;
  observations: number;
  avgScore: string;
  errors: number;
  satisfaction: string;
}

export interface DashboardData {
  kpis: KPIs;
  trends: Trends;
  actions: ActionItem[];
  alerts: Alert[];
  recent: RecentActivity[];
  summary: DashboardSummary[];
  lastUpdated: string;
}
