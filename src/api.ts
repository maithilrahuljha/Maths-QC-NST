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
 * 
 * APPS SCRIPT CORS NOTES:
 * - Apps Script Web Apps redirect (302) on first request
 * - fetch with redirect:'follow' handles this automatically
 * - Response comes as text that needs JSON.parse
 * - If "Who has access" is set to "Anyone", no auth needed
 */

const STORAGE_KEY = 'qc_api_url';
const REFRESH_KEY = 'qc_refresh_interval';

export function getApiUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setApiUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, url.trim());
  } catch { /* localStorage not available */ }
}

export function getRefreshInterval(): number {
  try {
    return parseInt(localStorage.getItem(REFRESH_KEY) || '5') || 5;
  } catch {
    return 5;
  }
}

export function setRefreshInterval(minutes: number): void {
  try {
    localStorage.setItem(REFRESH_KEY, String(minutes));
  } catch { /* localStorage not available */ }
}

export function isApiConfigured(): boolean {
  const url = getApiUrl();
  return url.length > 0 && url.startsWith('http');
}

/**
 * Fetch data from Google Apps Script Web App
 * 
 * Apps Script quirks handled here:
 * 1. It returns 302 redirect — we follow it
 * 2. Response may be text, not JSON content-type — we parse manually
 * 3. CORS works only when "Who has access" = "Anyone"
 * 4. If permissions wrong, returns HTML login page — we detect this
 */
export async function fetchLiveData(): Promise<any> {
  const url = getApiUrl();
  
  if (!url) {
    throw new Error('API URL not configured');
  }

  // Clean the URL — remove trailing slashes, ensure no double ?
  const cleanUrl = url.replace(/\/+$/, '');
  const separator = cleanUrl.includes('?') ? '&' : '?';
  const fullUrl = `${cleanUrl}${separator}action=getData`;

  let response: Response;
  
  try {
    response = await fetch(fullUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
  } catch (networkError: any) {
    // Network errors (CORS blocked, offline, DNS failure)
    throw new Error(
      'Cannot reach Apps Script. Check:\n' +
      '1. URL is correct\n' +
      '2. Apps Script is deployed as Web App\n' +
      '3. "Who has access" is set to "Anyone"\n' +
      '4. You redeployed after adding api.gs\n' +
      'Network error: ' + networkError.message
    );
  }

  // Get the response as text first (Apps Script may not set JSON content-type)
  const text = await response.text();

  // Check if we got HTML instead of JSON (means Google login page = wrong permissions)
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(
      'Apps Script returned a login page instead of data.\n' +
      'Fix: Open Apps Script → Deploy → Manage deployments → Edit\n' +
      '→ Set "Who has access" to "Anyone"\n' +
      '→ Click Deploy (creates new version)'
    );
  }

  // Check for empty response
  if (!text.trim()) {
    throw new Error('Apps Script returned empty response. Check if api.gs is deployed.');
  }

  // Try to parse as JSON
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      'Apps Script returned invalid data (not JSON).\n' + 
      'Check that api.gs file is in your Apps Script project\n' +
      'and that you redeployed as a new version.'
    );
  }

  // Check for error in response
  if (data.error) {
    throw new Error('Apps Script error: ' + data.error);
  }

  return data;
}

/**
 * Resolve an action item via Apps Script POST
 */
export async function resolveAction(issueId: string, resolution: string = 'Resolved via dashboard'): Promise<any> {
  const url = getApiUrl();
  if (!url) throw new Error('API URL not configured');

  const response = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({
      action: 'resolveAction',
      issueId: issueId,
      resolution: resolution
    })
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server');
  }
}

/**
 * Transform Apps Script response into dashboard format
 */
export function transformApiData(apiData: any) {
  const facultyStats = apiData.facultyStats || {};
  const recentObs = apiData.recentObservations || [];
  const scores = apiData.scores || [];
  const apiActions = apiData.actions || [];
  const apiResearch = apiData.research || [];
  
  const facultyNames = Object.keys(facultyStats);
  const overallAvg = facultyNames.length > 0
    ? Math.round(facultyNames.reduce(
        (sum: number, name: string) => sum + (facultyStats[name]?.averagePercentage || 0), 0
      ) / facultyNames.length)
    : 0;
  
  // Count recent scores
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentScores = scores.filter((s: any) => {
    try { return new Date(s.date) >= oneWeekAgo; } catch { return false; }
  });
  
  const kpis = {
    lecturesObserved: {
      current: recentScores.length || scores.length,
      previous: 0,
      change: 0,
      target: 20
    },
    avgLectureScore: {
      current: overallAvg ? parseFloat(((overallAvg / 100) * 5).toFixed(2)) : 0,
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
    contentErrors: { current: 0, previous: 0, change: 0, target: 0 },
    assessmentsReviewed: {
      current: scores.filter((s: any) => s.formType === 'ASSESSMENTS').length,
      previous: 0, change: 0, target: 10
    },
    assessmentErrorRate: { current: 0, previous: 0, change: 0, target: 1.0 },
    studentSatisfaction: {
      current: overallAvg ? parseFloat(((overallAvg / 100) * 5).toFixed(2)) : 0,
      previous: 0, change: 0, target: 4.0
    },
    openActions: { current: 0, critical: 0, high: 0 },
    actionsResolved: { current: 0, previous: 0, change: 0 },
    activeResearch: {
      current: scores.filter((s: any) => s.formType === 'RESEARCH').length,
      previous: 0, change: 0
    }
  };

  // Build trends
  const trendScores = scores.slice(-12).map((s: any) => {
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

  // Build summary from faculty stats
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

  // Build activity feed
  const recent = recentObs.slice(0, 8).map((obs: any) => ({
    type: 'observation',
    icon: '📋',
    description: `${obs.faculty || 'Unknown'} — ${obs.course || ''} — ${obs.score}/${obs.max} (${obs.percentage})`,
    timestamp: obs.date || new Date().toISOString()
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
    } else if (s.averagePercentage < 80) {
      alerts.push({
        type: 'warning' as const,
        category: 'Below Target',
        message: `${name} average is ${s.averagePercentage}% — below 80% target`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Build instructor table from faculty stats (LIVE data)
  const instructors = facultyNames.map(name => {
    const s = facultyStats[name];
    return {
      name: name,
      observations: s.count || 0,
      avgScore: s.averageMax > 0 ? ((s.averageScore / s.averageMax) * 5).toFixed(2) : '0',
      errors: 0,
      satisfaction: s.averageMax > 0 ? ((s.averageScore / s.averageMax) * 5).toFixed(2) : '0'
    };
  });

  // Build actions from API data
  const actions = apiActions.map((a: any) => ({
    issueId: a.issueId || 'N/A',
    date: a.date || '',
    issueType: a.issueType || '',
    severity: a.severity || 'Medium',
    description: a.description || '',
    assignedTo: a.assignedTo || '',
    targetDate: a.targetDate || '',
    status: a.status || 'Open',
    isOverdue: a.isOverdue || false
  }));

  // Update KPI open actions from real data
  const openActions = actions.filter((a: any) => a.status === 'Open' || a.status === 'In Progress');
  kpis.openActions = {
    current: openActions.length,
    critical: actions.filter((a: any) => a.severity === 'Critical').length,
    high: actions.filter((a: any) => a.severity === 'High').length
  };

  // Build research list
  const research = apiResearch;

  return {
    kpis,
    trends,
    actions,
    alerts,
    recent,
    summary,
    instructors,
    research,
    lastUpdated: apiData.lastUpdated || new Date().toISOString()
  };
}
