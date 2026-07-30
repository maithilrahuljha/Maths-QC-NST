/**
 * API Client for Google Apps Script — v2.9
 * 
 * PERFORMANCE = Lectures + Student Feedback ONLY
 * Assessment, Research, Actions are separate metrics
 */

const STORAGE_KEY = 'qc_api_url';
const REFRESH_KEY = 'qc_refresh_interval';

export function getApiUrl(): string {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
}
export function setApiUrl(url: string): void {
  try { localStorage.setItem(STORAGE_KEY, url.trim()); } catch {}
}
export function getRefreshInterval(): number {
  try { return parseInt(localStorage.getItem(REFRESH_KEY) || '5') || 5; } catch { return 5; }
}
export function setRefreshInterval(minutes: number): void {
  try { localStorage.setItem(REFRESH_KEY, String(minutes)); } catch {}
}
export function isApiConfigured(): boolean {
  const url = getApiUrl();
  return url.length > 0 && url.startsWith('http');
}

export async function fetchLiveData(): Promise<any> {
  const url = getApiUrl();
  if (!url) throw new Error('API URL not configured');

  const cleanUrl = url.replace(/\/+$/, '');
  const separator = cleanUrl.includes('?') ? '&' : '?';
  const fullUrl = `${cleanUrl}${separator}action=getData`;

  let response: Response;
  try {
    response = await fetch(fullUrl, { method: 'GET', redirect: 'follow', headers: { 'Accept': 'application/json, text/plain, */*' } });
  } catch (err: any) {
    throw new Error('Cannot reach Apps Script.\n1. Check URL\n2. Redeploy as New Version\n3. "Who has access" = Anyone\nError: ' + err.message);
  }

  const text = await response.text();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error('Apps Script returned login page.\nFix: Redeploy with "Who has access" = "Anyone"');
  }
  if (!text.trim()) throw new Error('Empty response. Check api.gs is deployed.');

  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON. Redeploy api.gs as new version.'); }
  if (data.error) throw new Error('API error: ' + data.error);
  return data;
}

export async function resolveAction(issueId: string, resolution: string = 'Resolved via dashboard'): Promise<any> {
  const url = getApiUrl();
  if (!url) throw new Error('API URL not configured');
  const response = await fetch(url, {
    method: 'POST', redirect: 'follow',
    body: JSON.stringify({ action: 'resolveAction', issueId, resolution })
  });
  const text = await response.text();
  try { return JSON.parse(text); } catch { throw new Error('Invalid response'); }
}

/**
 * Transform API response into dashboard format
 * 
 * IMPORTANT:
 * - Faculty performance = LECTURES + FEEDBACK scores only
 * - Assessment, Research, Actions are separate counts
 * - No rehearsal compliance (removed)
 */
export function transformApiData(apiData: any) {
  const facultyStats = apiData.facultyStats || {};
  const recentObs = apiData.recentObservations || [];
  const apiActions = apiData.actions || [];
  const apiResearch = apiData.research || [];

  const facultyNames = Object.keys(facultyStats);

  // Faculty average from LECTURES + FEEDBACK only (API already filters)
  const overallAvg = facultyNames.length > 0
    ? Math.round(facultyNames.reduce((sum: number, name: string) => sum + (facultyStats[name]?.averagePercentage || 0), 0) / facultyNames.length)
    : 0;

  // Lecture count (from API)
  const lectureCount = (apiData.lectureScores || []).length;
  const feedbackCount = (apiData.feedbackScores || []).length;
  const assessmentCount = apiData.assessmentCount || 0;

  // Actions
  const actions = apiActions.map((a: any) => ({
    issueId: a.issueId || 'N/A', date: a.date || '', issueType: a.issueType || '',
    severity: a.severity || 'Medium', description: a.description || '',
    assignedTo: a.assignedTo || '', targetDate: a.targetDate || '',
    status: a.status || 'Open', isOverdue: a.isOverdue || false
  }));
  const openActions = actions.filter((a: any) => a.status !== 'Resolved');
  const resolvedActions = actions.filter((a: any) => a.status === 'Resolved');

  const kpis = {
    lecturesObserved: { current: lectureCount, previous: 0, change: 0, target: 20 },
    avgLectureScore: {
      current: overallAvg ? parseFloat(((overallAvg / 100) * 5).toFixed(2)) : 0,
      previous: 0, change: 0, target: 4.0
    },
    studentSatisfaction: {
      current: overallAvg ? parseFloat(((overallAvg / 100) * 5).toFixed(2)) : 0,
      previous: 0, change: 0, target: 4.0
    },
    feedbackCount: { current: feedbackCount, previous: 0, change: 0, target: 10 },
    assessmentsReviewed: { current: assessmentCount, previous: 0, change: 0, target: 10 },
    openActions: {
      current: openActions.length,
      critical: openActions.filter((a: any) => a.severity === 'Critical').length,
      high: openActions.filter((a: any) => a.severity === 'High').length
    },
    actionsResolved: { current: resolvedActions.length, previous: 0, change: 0 },
    activeResearch: { current: apiResearch.length, previous: 0, change: 0 },
    // Keep these for type compatibility but they won't be shown as tiles
    rehearsalCompliance: { current: 0, previous: 0, change: 0, target: 0 },
    contentErrors: { current: 0, previous: 0, change: 0, target: 0 },
    assessmentErrorRate: { current: 0, previous: 0, change: 0, target: 0 }
  };

  // Trends from lecture + feedback scores only
  const perfScores = (apiData.lectureScores || []).concat(apiData.feedbackScores || []);
  const trendScores = perfScores.slice(-12).map((s: any) => {
    const pct = parseFloat(String(s.percentage).replace('%', '')) || 0;
    return parseFloat(((pct / 100) * 5).toFixed(2));
  });
  while (trendScores.length < 12) trendScores.unshift(0);

  const trends = {
    labels: trendScores.map((_: any, i: number) => `#${i + 1}`),
    lectureScores: trendScores,
    errorCounts: trendScores.map(() => 0),
    satisfaction: trendScores,
    actionsResolved: trendScores.map(() => 0)
  };

  // Summary table (faculty performance from lectures+feedback)
  const summary = facultyNames.map(name => {
    const s = facultyStats[name];
    return {
      metric: name,
      currentWeek: `${s.averageScore}/${s.averageMax}`,
      lastWeek: '--',
      changePercent: `${s.averagePercentage}%`,
      target: `${s.averageMax}`,
      status: s.averagePercentage >= 80 ? '✅' : s.averagePercentage >= 60 ? '⚠️' : '❌',
      trendIcon: '→'
    };
  });

  // Recent activity
  const recent = recentObs.slice(0, 8).map((obs: any) => ({
    type: 'observation', icon: '📋',
    description: `${obs.faculty || 'Unknown'} — ${obs.course || ''} — ${obs.score}/${obs.maxScore || obs.max} (${obs.percentage})`,
    timestamp: obs.date || new Date().toISOString()
  }));

  // Alerts
  const alerts: any[] = [];
  facultyNames.forEach(name => {
    const s = facultyStats[name];
    if (s.averagePercentage < 60) {
      alerts.push({ type: 'danger' as const, category: 'Low Score', message: `${name} average is ${s.averagePercentage}% — below 60%`, timestamp: new Date().toISOString() });
    } else if (s.averagePercentage < 80) {
      alerts.push({ type: 'warning' as const, category: 'Below Target', message: `${name} average is ${s.averagePercentage}% — below 80%`, timestamp: new Date().toISOString() });
    }
  });
  // Action alerts
  if (openActions.filter((a: any) => a.severity === 'Critical').length > 0) {
    alerts.push({ type: 'danger' as const, category: 'Critical Action', message: `${openActions.filter((a: any) => a.severity === 'Critical').length} critical action(s) pending`, timestamp: new Date().toISOString() });
  }

  // Instructors from faculty stats (LECTURES + FEEDBACK only)
  const instructors = facultyNames.map(name => {
    const s = facultyStats[name];
    return {
      name, observations: s.count || 0,
      avgScore: s.averageMax > 0 ? ((s.averageScore / s.averageMax) * 5).toFixed(2) : '0',
      errors: 0,
      satisfaction: s.averageMax > 0 ? ((s.averageScore / s.averageMax) * 5).toFixed(2) : '0'
    };
  });

  return {
    kpis, trends, actions, alerts, recent, summary, instructors,
    research: apiResearch,
    lastUpdated: apiData.lastUpdated || new Date().toISOString()
  };
}
