/**
 * ================================================================
 * MATHEMATICS DEPARTMENT QC AUTOMATION SYSTEM
 * Dashboard Functions (dashboard.gs)
 * ================================================================
 * 
 * This file contains all dashboard-related functions including
 * the web API endpoints for the GitHub Pages dashboard.
 * ================================================================
 */

// ================================================================
// WEB API ENDPOINTS
// ================================================================

/**
 * Handle GET requests from the dashboard
 * This is the main API endpoint
 * @param {Object} e - Request event object
 * @returns {Object} JSON response
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'getData';
    let result;
    
    switch (action) {
      case 'getData':
        result = getAllDashboardData();
        break;
      case 'getKPIs':
        result = calculateKPIs();
        break;
      case 'getTrends':
        result = calculateTrends(parseInt(e.parameter.weeks) || 12);
        break;
      case 'getActions':
        result = getOpenActions();
        break;
      case 'getAlerts':
        result = getActiveAlerts();
        break;
      case 'getInstructors':
        result = getInstructorPerformance();
        break;
      case 'getRecent':
        result = getRecentActivity();
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logMessage(`API Error: ${error.message}`, 'ERROR');
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests (for future use)
 * @param {Object} e - Request event object
 * @returns {Object} JSON response
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;
    
    switch (action) {
      case 'updateAction':
        result = updateActionItem(data.issueId, data.status, data.notes);
        break;
      case 'addNote':
        result = addNote(data.target, data.note);
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logMessage(`POST API Error: ${error.message}`, 'ERROR');
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ================================================================
// DATA RETRIEVAL FUNCTIONS
// ================================================================

/**
 * Get all dashboard data in one call
 * @returns {Object} Complete dashboard data
 */
function getAllDashboardData() {
  return {
    kpis: calculateKPIs(),
    trends: calculateTrends(12),
    actions: getOpenActions(),
    alerts: getActiveAlerts(),
    recent: getRecentActivity(),
    summary: getDashboardSummary(),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get dashboard summary metrics
 * @returns {Array} Summary metrics
 */
function getDashboardSummary() {
  const sheet = getSheet(SHEET_NAMES.DASHBOARD);
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  return data.slice(1).map(row => ({
    metric: row[0],
    currentWeek: row[1],
    lastWeek: row[2],
    changePercent: row[3],
    target: row[4],
    status: row[5],
    trendIcon: row[6]
  }));
}

/**
 * Get open action items
 * @returns {Array} Open action items
 */
function getOpenActions() {
  const sheet = getSheet(SHEET_NAMES.ACTIONS);
  const data = sheet.getDataRange().getValues();
  
  // Filter for open and in-progress items
  const openItems = data.slice(1)
    .filter(row => row[7] === 'Open' || row[7] === 'In Progress')
    .map(row => ({
      issueId: row[0],
      date: row[1],
      issueType: row[2],
      severity: row[3],
      description: row[4],
      assignedTo: row[5],
      targetDate: row[6],
      status: row[7],
      isOverdue: new Date(row[6]) < new Date()
    }));
  
  // Sort by severity and date
  const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  openItems.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(a.targetDate) - new Date(b.targetDate);
  });
  
  return openItems;
}

/**
 * Get active alerts
 * @returns {Array} Active alerts
 */
function getActiveAlerts() {
  const alerts = [];
  const kpis = calculateKPIs();
  
  // Check lecture score
  if (kpis.avgLectureScore.current < QUALITY_THRESHOLDS.OVERALL_MIN) {
    alerts.push({
      type: 'warning',
      category: 'Lecture Quality',
      message: `Average lecture score (${kpis.avgLectureScore.current.toFixed(2)}) below target (${QUALITY_THRESHOLDS.OVERALL_MIN})`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check rehearsal compliance
  if (kpis.rehearsalCompliance.current < QUALITY_THRESHOLDS.REHEARSAL_COMPLIANCE_MIN) {
    alerts.push({
      type: 'warning',
      category: 'Compliance',
      message: `Rehearsal compliance (${kpis.rehearsalCompliance.current.toFixed(0)}%) below target (${QUALITY_THRESHOLDS.REHEARSAL_COMPLIANCE_MIN}%)`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check content errors
  if (kpis.contentErrors.current > 0) {
    alerts.push({
      type: kpis.contentErrors.current > 5 ? 'danger' : 'warning',
      category: 'Content Quality',
      message: `${kpis.contentErrors.current} content error(s) found this week`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check critical actions
  if (kpis.openActions.critical > 0) {
    alerts.push({
      type: 'danger',
      category: 'Action Items',
      message: `${kpis.openActions.critical} critical action item(s) pending`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check student satisfaction
  if (kpis.studentSatisfaction.current < QUALITY_THRESHOLDS.SATISFACTION_MIN) {
    alerts.push({
      type: 'warning',
      category: 'Student Feedback',
      message: `Student satisfaction (${kpis.studentSatisfaction.current.toFixed(2)}) below target (${QUALITY_THRESHOLDS.SATISFACTION_MIN})`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check overdue actions
  const openActions = getOpenActions();
  const overdueCount = openActions.filter(a => a.isOverdue).length;
  if (overdueCount > 0) {
    alerts.push({
      type: 'danger',
      category: 'Action Items',
      message: `${overdueCount} overdue action item(s)`,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

/**
 * Get recent activity
 * @param {number} limit - Number of items to return
 * @returns {Array} Recent activity items
 */
function getRecentActivity(limit = 10) {
  const activity = [];
  
  // Get recent lectures
  const lectureData = getSheetData(SHEET_NAMES.LECTURES).slice(1);
  lectureData.slice(-5).forEach(row => {
    activity.push({
      type: 'observation',
      icon: '📋',
      description: `Lecture observed: ${row[1]} by ${row[2]}`,
      timestamp: new Date(row[0]).toISOString()
    });
  });
  
  // Get recent assessments
  const assessmentData = getSheetData(SHEET_NAMES.ASSESSMENTS).slice(1);
  assessmentData.slice(-3).forEach(row => {
    activity.push({
      type: 'assessment',
      icon: '📝',
      description: `Assessment reviewed: ${row[1]} for ${row[2]}`,
      timestamp: new Date(row[0]).toISOString()
    });
  });
  
  // Get recent actions
  const actionData = getSheetData(SHEET_NAMES.ACTIONS).slice(1);
  actionData.slice(-5).forEach(row => {
    activity.push({
      type: 'action',
      icon: row[7] === 'Resolved' ? '✅' : '🔔',
      description: `Action ${row[0]}: ${row[4].substring(0, 50)}...`,
      timestamp: new Date(row[1]).toISOString()
    });
  });
  
  // Sort by timestamp and limit
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return activity.slice(0, limit);
}

// ================================================================
// DASHBOARD UPDATE FUNCTIONS
// ================================================================

/**
 * Update the dashboard summary sheet
 */
function updateDashboard() {
  try {
    logMessage('Updating dashboard...', 'INFO');
    
    const kpis = calculateKPIs();
    const sheet = getSheet(SHEET_NAMES.DASHBOARD);
    
    // Clear existing data (keep headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 7).clearContent();
    }
    
    // Prepare dashboard rows
    const rows = [
      createDashboardRow('Lectures Observed', kpis.lecturesObserved, 20),
      createDashboardRow('Avg Lecture Score', kpis.avgLectureScore, kpis.avgLectureScore.target, true),
      createDashboardRow('Rehearsal Compliance', kpis.rehearsalCompliance, kpis.rehearsalCompliance.target, false, '%'),
      createDashboardRow('Content Errors', kpis.contentErrors, 0, false, '', true),
      createDashboardRow('Assessments Reviewed', kpis.assessmentsReviewed, 10),
      createDashboardRow('Assessment Error Rate', kpis.assessmentErrorRate, kpis.assessmentErrorRate.target, false, '%', true),
      createDashboardRow('Student Satisfaction', kpis.studentSatisfaction, kpis.studentSatisfaction.target, true),
      createDashboardRow('Open Actions', { current: kpis.openActions.current, change: 0 }, 0, false, '', true),
      createDashboardRow('Critical Actions', { current: kpis.openActions.critical, change: 0 }, 0, false, '', true),
      createDashboardRow('Actions Resolved', kpis.actionsResolved, 5),
      createDashboardRow('Active Research Projects', kpis.activeResearch, 10)
    ];
    
    // Write rows to sheet
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }
    
    // Update Performance_Trends if new week
    updatePerformanceTrends(kpis);
    
    logMessage('Dashboard updated successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error updating dashboard: ${error.message}`, 'ERROR');
  }
}

/**
 * Create a dashboard row
 * @param {string} metric - Metric name
 * @param {Object} data - Metric data
 * @param {number} target - Target value
 * @param {boolean} higherIsBetter - True if higher values are better
 * @param {string} suffix - Value suffix (e.g., '%')
 * @param {boolean} lowerIsBetter - True if lower values are better
 * @returns {Array} Dashboard row
 */
function createDashboardRow(metric, data, target, higherIsBetter = true, suffix = '', lowerIsBetter = false) {
  const current = typeof data.current === 'number' ? data.current : data.current;
  const previous = data.previous || 0;
  const change = data.change || 0;
  
  // Determine status
  let status;
  if (lowerIsBetter) {
    status = current <= target ? STATUS_ICONS.PASS : 
             current <= target * 1.5 ? STATUS_ICONS.WARNING : STATUS_ICONS.FAIL;
  } else if (higherIsBetter) {
    status = current >= target ? STATUS_ICONS.PASS : 
             current >= target * 0.8 ? STATUS_ICONS.WARNING : STATUS_ICONS.FAIL;
  } else {
    status = STATUS_ICONS.PASS;
  }
  
  // Determine trend
  let trend;
  if (change > 5) {
    trend = lowerIsBetter ? STATUS_ICONS.TREND_DOWN : STATUS_ICONS.TREND_UP;
  } else if (change < -5) {
    trend = lowerIsBetter ? STATUS_ICONS.TREND_UP : STATUS_ICONS.TREND_DOWN;
  } else {
    trend = STATUS_ICONS.TREND_FLAT;
  }
  
  // Format values
  const currentFormatted = typeof current === 'number' ? 
    (Number.isInteger(current) ? current : current.toFixed(2)) + suffix : current;
  const previousFormatted = typeof previous === 'number' ? 
    (Number.isInteger(previous) ? previous : previous.toFixed(2)) + suffix : previous;
  const changeFormatted = change !== 0 ? (change > 0 ? '+' : '') + change.toFixed(1) + '%' : '0%';
  
  return [
    metric,
    currentFormatted,
    previousFormatted,
    changeFormatted,
    target + suffix,
    status,
    trend
  ];
}

/**
 * Update performance trends weekly
 * @param {Object} kpis - Current KPIs
 */
function updatePerformanceTrends(kpis) {
  const sheet = getSheet(SHEET_NAMES.TRENDS);
  const currentWeek = getCurrentWeek();
  
  // Check if this week already has an entry
  const data = sheet.getDataRange().getValues();
  const weekExists = data.some(row => row[0] === currentWeek);
  
  if (!weekExists) {
    sheet.appendRow([
      currentWeek,
      kpis.lecturesObserved.current,
      kpis.avgLectureScore.current.toFixed(2),
      kpis.rehearsalCompliance.current.toFixed(0) + '%',
      kpis.contentErrors.current,
      kpis.actionsResolved.current,
      kpis.activeResearch.current,
      kpis.studentSatisfaction.current.toFixed(2)
    ]);
    
    logMessage(`Performance trends updated for week ${currentWeek}`, 'INFO');
  }
}

/**
 * Refresh all dashboard data
 * Call this function manually or via trigger
 */
function refreshDashboard() {
  updateDashboard();
  logMessage('Dashboard refreshed', 'INFO');
}

// ================================================================
// CHART DATA FUNCTIONS
// ================================================================

/**
 * Get chart data for lecture scores trend
 * @returns {Object} Chart configuration
 */
function getLectureScoresChartData() {
  const trends = calculateTrends(12);
  
  return {
    type: 'line',
    data: {
      labels: trends.labels,
      datasets: [{
        label: 'Average Lecture Score',
        data: trends.lectureScores,
        borderColor: DASHBOARD_CONFIG.COLORS.PRIMARY,
        backgroundColor: DASHBOARD_CONFIG.COLORS.PRIMARY + '20',
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 5,
          title: {
            display: true,
            text: 'Score'
          }
        }
      }
    }
  };
}

/**
 * Get chart data for error counts
 * @returns {Object} Chart configuration
 */
function getErrorChartData() {
  const trends = calculateTrends(12);
  
  return {
    type: 'bar',
    data: {
      labels: trends.labels,
      datasets: [{
        label: 'Content Errors',
        data: trends.errorCounts,
        backgroundColor: DASHBOARD_CONFIG.COLORS.DANGER
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Error Count'
          }
        }
      }
    }
  };
}

/**
 * Get chart data for student satisfaction
 * @returns {Object} Chart configuration
 */
function getSatisfactionChartData() {
  const trends = calculateTrends(12);
  
  return {
    type: 'line',
    data: {
      labels: trends.labels,
      datasets: [{
        label: 'Student Satisfaction',
        data: trends.satisfaction,
        borderColor: DASHBOARD_CONFIG.COLORS.SUCCESS,
        backgroundColor: DASHBOARD_CONFIG.COLORS.SUCCESS + '20',
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 5,
          title: {
            display: true,
            text: 'Score'
          }
        }
      }
    }
  };
}

/**
 * Get score distribution data
 * @returns {Object} Distribution data
 */
function getScoreDistribution() {
  const lectureData = getSheetData(SHEET_NAMES.LECTURES).slice(1);
  
  const distribution = {
    excellent: 0,  // 4.5-5.0
    good: 0,       // 4.0-4.49
    satisfactory: 0, // 3.5-3.99
    needsImprovement: 0, // 3.0-3.49
    poor: 0        // < 3.0
  };
  
  lectureData.forEach(row => {
    const avgScore = (
      (parseFloat(row[6]) || 0) +
      (parseFloat(row[7]) || 0) +
      (parseFloat(row[8]) || 0) +
      (parseFloat(row[9]) || 0) +
      (parseFloat(row[10]) || 0)
    ) / 5;
    
    if (avgScore >= 4.5) distribution.excellent++;
    else if (avgScore >= 4.0) distribution.good++;
    else if (avgScore >= 3.5) distribution.satisfactory++;
    else if (avgScore >= 3.0) distribution.needsImprovement++;
    else distribution.poor++;
  });
  
  return distribution;
}

// ================================================================
// ACTION ITEM MANAGEMENT
// ================================================================

/**
 * Update action item status
 * @param {string} issueId - Issue ID
 * @param {string} status - New status
 * @param {string} notes - Resolution notes
 * @returns {Object} Result
 */
function updateActionItem(issueId, status, notes) {
  const sheet = getSheet(SHEET_NAMES.ACTIONS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === issueId) {
      sheet.getRange(i + 1, 8).setValue(status);
      if (notes) {
        sheet.getRange(i + 1, 9).setValue(notes);
      }
      if (status === 'Resolved') {
        sheet.getRange(i + 1, 10).setValue(new Date());
      }
      
      logMessage(`Action ${issueId} updated to ${status}`, 'INFO');
      return { success: true, message: `Action ${issueId} updated` };
    }
  }
  
  return { success: false, message: 'Issue ID not found' };
}

/**
 * Get action item details
 * @param {string} issueId - Issue ID
 * @returns {Object} Action item details
 */
function getActionItem(issueId) {
  const sheet = getSheet(SHEET_NAMES.ACTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === issueId) {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = data[i][index];
      });
      return item;
    }
  }
  
  return null;
}
