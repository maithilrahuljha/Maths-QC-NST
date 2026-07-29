import { DashboardData, InstructorPerformance } from '../types';

// Sample data for demonstration
export const mockDashboardData: DashboardData = {
  kpis: {
    lecturesObserved: {
      current: 24,
      previous: 22,
      change: 9.1,
      target: 25
    },
    avgLectureScore: {
      current: 4.32,
      previous: 4.15,
      change: 4.1,
      target: 4.0
    },
    rehearsalCompliance: {
      current: 92,
      previous: 85,
      change: 8.2,
      target: 100
    },
    contentErrors: {
      current: 2,
      previous: 5,
      change: -60,
      target: 0
    },
    assessmentsReviewed: {
      current: 15,
      previous: 12,
      change: 25,
      target: 15
    },
    assessmentErrorRate: {
      current: 0.8,
      previous: 1.5,
      change: -46.7,
      target: 1.0
    },
    studentSatisfaction: {
      current: 4.28,
      previous: 4.1,
      change: 4.4,
      target: 4.0
    },
    openActions: {
      current: 8,
      critical: 1,
      high: 3
    },
    actionsResolved: {
      current: 6,
      previous: 4,
      change: 50
    },
    activeResearch: {
      current: 12,
      previous: 11,
      change: 9.1
    }
  },
  trends: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    lectureScores: [4.1, 4.0, 4.2, 4.15, 4.3, 4.25, 4.1, 4.35, 4.2, 4.4, 4.28, 4.32],
    errorCounts: [3, 5, 2, 4, 3, 2, 4, 1, 3, 2, 3, 2],
    satisfaction: [3.9, 4.0, 4.1, 4.0, 4.2, 4.15, 4.1, 4.2, 4.25, 4.18, 4.22, 4.28],
    actionsResolved: [4, 5, 3, 6, 4, 5, 7, 4, 5, 6, 4, 6]
  },
  actions: [
    {
      issueId: 'ACT-2026-015',
      date: '2026-01-13',
      issueType: 'Academic Error',
      severity: 'Critical',
      description: 'Incorrect formula in MATH201 lecture slides - affects exam preparation',
      assignedTo: 'Dr. Smith',
      targetDate: '2026-01-14',
      status: 'In Progress',
      isOverdue: false
    },
    {
      issueId: 'ACT-2026-014',
      date: '2026-01-12',
      issueType: 'Delivery Issue',
      severity: 'High',
      description: 'Low student engagement observed in MATH102 - need interactive elements',
      assignedTo: 'Dr. Jones',
      targetDate: '2026-01-18',
      status: 'Open',
      isOverdue: false
    },
    {
      issueId: 'ACT-2026-013',
      date: '2026-01-11',
      issueType: 'Assessment Error',
      severity: 'High',
      description: 'Marking inconsistency in Quiz 3 - need re-grading for 15 scripts',
      assignedTo: 'Prof. Wilson',
      targetDate: '2026-01-15',
      status: 'In Progress',
      isOverdue: false
    },
    {
      issueId: 'ACT-2026-012',
      date: '2026-01-10',
      issueType: 'Process Issue',
      severity: 'Medium',
      description: 'Readiness checklist not completed before MATH301 lecture',
      assignedTo: 'Dr. Williams',
      targetDate: '2026-01-17',
      status: 'Open',
      isOverdue: false
    },
    {
      issueId: 'ACT-2026-011',
      date: '2026-01-09',
      issueType: 'Compliance Issue',
      severity: 'High',
      description: 'Session not rehearsed - multiple content errors observed',
      assignedTo: 'Dr. Brown',
      targetDate: '2026-01-12',
      status: 'In Progress',
      isOverdue: true
    },
    {
      issueId: 'ACT-2026-010',
      date: '2026-01-08',
      issueType: 'Research Issue',
      severity: 'Medium',
      description: 'Low originality score in student project - needs revision',
      assignedTo: 'Prof. Taylor',
      targetDate: '2026-01-20',
      status: 'Open',
      isOverdue: false
    },
    {
      issueId: 'ACT-2026-009',
      date: '2026-01-07',
      issueType: 'Delivery Issue',
      severity: 'Low',
      description: 'Board work clarity could be improved in MATH401',
      assignedTo: 'Dr. Davis',
      targetDate: '2026-01-21',
      status: 'Open',
      isOverdue: false
    },
    {
      issueId: 'ACT-2026-008',
      date: '2026-01-06',
      issueType: 'Academic Error',
      severity: 'Medium',
      description: 'Outdated example in course material needs updating',
      assignedTo: 'Prof. Johnson',
      targetDate: '2026-01-19',
      status: 'Open',
      isOverdue: false
    }
  ],
  alerts: [
    {
      type: 'danger',
      category: 'Action Items',
      message: '1 critical action item pending immediate attention',
      timestamp: new Date().toISOString()
    },
    {
      type: 'danger',
      category: 'Action Items',
      message: '1 overdue action item needs escalation',
      timestamp: new Date().toISOString()
    },
    {
      type: 'warning',
      category: 'Compliance',
      message: 'Rehearsal compliance (92%) below target (100%)',
      timestamp: new Date().toISOString()
    },
    {
      type: 'warning',
      category: 'Content Quality',
      message: '2 content errors found this week',
      timestamp: new Date().toISOString()
    }
  ],
  recent: [
    {
      type: 'observation',
      icon: '📋',
      description: 'Lecture observed: MATH201 by Dr. Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      type: 'action',
      icon: '✅',
      description: 'Action ACT-2026-007: Content error resolved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      type: 'assessment',
      icon: '📝',
      description: 'Assessment reviewed: Mid-term for MATH102',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      type: 'observation',
      icon: '📋',
      description: 'Lecture observed: MATH301 by Dr. Williams',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    },
    {
      type: 'action',
      icon: '🔔',
      description: 'Action ACT-2026-015: New critical issue logged',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
      type: 'feedback',
      icon: '💬',
      description: 'New student feedback received for MATH101',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      type: 'research',
      icon: '🔬',
      description: 'Research project RES-2026-005 reviewed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
    },
    {
      type: 'action',
      icon: '✅',
      description: 'Action ACT-2026-006: Assessment error resolved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
    }
  ],
  summary: [
    {
      metric: 'Lecture Readiness Score',
      currentWeek: '4.32',
      lastWeek: '4.15',
      changePercent: '+4.1%',
      target: '4.0',
      status: '✅',
      trendIcon: '↑'
    },
    {
      metric: 'Rehearsal Compliance',
      currentWeek: '92%',
      lastWeek: '85%',
      changePercent: '+8.2%',
      target: '100%',
      status: '⚠️',
      trendIcon: '↑'
    },
    {
      metric: 'Content Error Rate',
      currentWeek: '2',
      lastWeek: '5',
      changePercent: '-60%',
      target: '0',
      status: '⚠️',
      trendIcon: '↓'
    },
    {
      metric: 'Assessment Error Rate',
      currentWeek: '0.8%',
      lastWeek: '1.5%',
      changePercent: '-46.7%',
      target: '1%',
      status: '✅',
      trendIcon: '↓'
    },
    {
      metric: 'Student Satisfaction',
      currentWeek: '4.28',
      lastWeek: '4.10',
      changePercent: '+4.4%',
      target: '4.0',
      status: '✅',
      trendIcon: '↑'
    },
    {
      metric: 'Action Resolution Rate',
      currentWeek: '75%',
      lastWeek: '67%',
      changePercent: '+11.9%',
      target: '90%',
      status: '⚠️',
      trendIcon: '↑'
    }
  ],
  lastUpdated: new Date().toISOString()
};

export const mockInstructorData: InstructorPerformance[] = [
  { name: 'Dr. Smith', observations: 8, avgScore: '4.52', errors: 0, satisfaction: '4.45' },
  { name: 'Dr. Jones', observations: 6, avgScore: '4.28', errors: 1, satisfaction: '4.20' },
  { name: 'Dr. Williams', observations: 5, avgScore: '4.35', errors: 0, satisfaction: '4.38' },
  { name: 'Dr. Brown', observations: 4, avgScore: '3.95', errors: 2, satisfaction: '4.05' },
  { name: 'Dr. Davis', observations: 6, avgScore: '4.42', errors: 0, satisfaction: '4.35' },
  { name: 'Prof. Johnson', observations: 5, avgScore: '4.18', errors: 1, satisfaction: '4.12' },
  { name: 'Prof. Wilson', observations: 4, avgScore: '4.55', errors: 0, satisfaction: '4.48' },
  { name: 'Prof. Taylor', observations: 3, avgScore: '4.30', errors: 0, satisfaction: '4.22' }
];

// Score distribution data
export const mockScoreDistribution = {
  excellent: 12,    // 4.5-5.0
  good: 28,        // 4.0-4.49
  satisfactory: 8, // 3.5-3.99
  needsImprovement: 3, // 3.0-3.49
  poor: 1          // < 3.0
};
