/**
 * API Client for Google Apps Script
 * 
 * HOW THIS CONNECTS TO YOUR SPREADSHEET:
 * 
 * 1. You deployed Apps Script as a Web App (installation.txt Section 18)
 * 2. That gave you a URL like: https://script.google.com/macros/s/.../exec
 * 3. You paste that URL in the dashboard Settings (⚙️ icon)
 * 4. The dashboard saves it in your browser's localStorage
 * 5. Every refresh, the dashboard calls that URL to get live data
 * 6. Apps Script reads your Google Sheet and returns JSON
 * 
 * If no URL is configured, the dashboard shows demo data.
 */

const STORAGE_KEY = 'qc_api_url';
const REFRESH_KEY = 'qc_refresh_interval';

/**
 * Get the saved API URL from browser storage
 */
export function getApiUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save the API URL to browser storage
 */
export function setApiUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, url.trim());
  } catch {
    // localStorage not available
  }
}

/**
 * Get refresh interval in minutes
 */
export function getRefreshInterval(): number {
  try {
    return parseInt(localStorage.getItem(REFRESH_KEY) || '5') || 5;
  } catch {
    return 5;
  }
}

/**
 * Save refresh interval
 */
export function setRefreshInterval(minutes: number): void {
  try {
    localStorage.setItem(REFRESH_KEY, String(minutes));
  } catch {
    // localStorage not available
  }
}

/**
 * Check if API URL is configured
 */
export function isApiConfigured(): boolean {
  const url = getApiUrl();
  return url.length > 0 && url.startsWith('http');
}

/**
 * Fetch data from Google Apps Script Web App
 * 
 * The Apps Script doGet() function returns JSON with:
 * - scores: array of faculty score records
 * - recentObservations: last 10 observations
 * - facultyStats: per-faculty averages
 * - lastUpdated: timestamp
 */
export async function fetchLiveData(): Promise<any> {
  const url = getApiUrl();
  
  if (!url) {
    throw new Error('API URL not configured');
  }

  // Apps Script Web Apps return JSON via doGet()
  // We call ?action=getData to get all dashboard data
  const response = await fetch(`${url}?action=getData`, {
    method: 'GET',
    redirect: 'follow', // Apps Script redirects on first call
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Transform Apps Script response into dashboard format
 * 
 * Apps Script returns raw sheet data.
 * This function maps it to the format the dashboard expects.
 */
export function transformApiData(apiData: any) {
  const facultyStats = apiData.facultyStats || {};
  const recentObs = apiData.recentObservations || [];
  const scores = apiData.scores || [];
  
  // Count totals
  const facultyNames = Object.keys(facultyStats);
  const overallAvg = facultyNames.length > 0
    ? Math.round(facultyNames.reduce(
        (sum, name) => sum + (facultyStats[name]?.averagePercentage || 0), 0
      ) / facultyNames.length)
    : 0;
  
  // Get recent week data
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentScores = scores.filter((s: any) => new Date(s.date) >= oneWeekAgo);
  
  // Build KPIs
  const kpis = {
    lecturesObserved: {
      current: recentScores.length,
      previous: 0,
      change: 0,
      target: 20
    },
    avgLectureScore: {
      current: overallAvg ? (overallAvg / 100) * 5 : 0,
      previous: 0,
      change: 0,
      target: 4.0
    },
    rehearsalCompliance: {
      current: overallAvg || 0,
      previous: 0,
      change: 0,
      target: 100
    },
    contentErrors: {
      current: 0,
      previous: 0,
      change: 0,
      target: 0
    },
    assessmentsReviewed: {
      current: scores.filter((s: any) => s.formType === 'ASSESSMENTS').length,
      previous: 0,
      change: 0,
      target: 10
    },
    assessmentErrorRate: {
      current: 0,
      previous: 0,
      change: 0,
      target: 1.0
    },
    studentSatisfaction: {
      current: overallAvg ? (overallAvg / 100) * 5 : 0,
      previous: 0,
      change: 0,
      target: 4.0
    },
    openActions: {
      current: 0,
      critical: 0,
      high: 0
    },
    actionsResolved: {
      current: 0,
      previous: 0,
      change: 0
    },
    activeResearch: {
      current: scores.filter((s: any) => s.formType === 'RESEARCH').length,
      previous: 0,
      change: 0
    }
  };

  // Build trends (last 12 data points or pad with zeros)
  const trendScores = scores.slice(-12).map((s: any) => {
    const pct = parseFloat(String(s.percentage).replace('%', '')) || 0;
    return (pct / 100) * 5;
  });
  while (trendScores.length < 12) trendScores.unshift(0);
  
  const trends = {
    labels: trendScores.map((_: any, i: number) => `#${i + 1}`),
    lectureScores: trendScores,
    errorCounts: trendScores.map(() => 0),
    satisfaction: trendScores,
    actionsResolved: trendScores.map(() => 0)
  };

  // Build summary table
  const summary = facultyNames.map(name => {
    const s = facultyStats[name];
    return {
      metric: name,
      currentWeek: `${s.averageScore}/${s.averageMax}`,
      lastWeek: '--',
      changePercent: `${s.averagePercentage}%`,
      target: '20/25',
      status: s.averagePercentage >= 80 ? '✅' : s.averagePercentage >= 60 ? '⚠️' : '❌',
      trendIcon: '→'
    };
  });

  // Build recent activity
  const recent = recentObs.slice(0, 8).map((obs: any) => ({
    type: 'observation',
    icon: '📋',
    description: `${obs.faculty || 'Unknown'} — ${obs.course || ''} — ${obs.score}/${obs.max} (${obs.percentage})`,
    timestamp: obs.date ? new Date(obs.date).toISOString() : new Date().toISOString()
  }));

  // Build alerts
  const alerts: any[] = [];
  facultyNames.forEach(name => {
    const s = facultyStats[name];
    if (s.averagePercentage < 60) {
      alerts.push({
        type: 'danger' as const,
        category: 'Low Score',
        message: `${name} average is ${s.averagePercentage}% — below 60% threshold`,
        timestamp: new Date().toISOString()
      });
    }
  });

  return {
    kpis,
    trends,
    actions: [],
    alerts,
    recent,
    summary,
    lastUpdated: apiData.lastUpdated || new Date().toISOString()
  };
}
