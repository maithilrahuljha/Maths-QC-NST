/**
 * ================================================================
 * MATHEMATICS DEPARTMENT QC AUTOMATION SYSTEM
 * Email Reports Functions (emailReports.gs)
 * ================================================================
 * 
 * This file contains all email notification and reporting functions.
 * ================================================================
 */

// ================================================================
// WEEKLY REPORTS
// ================================================================

/**
 * Send weekly QC report
 * Called by trigger every Monday morning
 */
function sendWeeklyReport() {
  try {
    if (!EMAIL_CONFIG.NOTIFICATIONS_ENABLED) {
      logMessage('Email notifications disabled', 'INFO');
      return;
    }
    
    logMessage('Generating weekly report...', 'INFO');
    
    const kpis = calculateKPIs();
    const trends = calculateTrends(4);
    const actions = getOpenActions();
    const alerts = getActiveAlerts();
    
    // Build email content
    const subject = `[QC Report] Mathematics Department Weekly Summary - Week ${getCurrentWeek()}`;
    const htmlBody = buildWeeklyReportHTML(kpis, trends, actions, alerts);
    const textBody = buildWeeklyReportText(kpis, actions);
    
    // Send to QC team
    MailApp.sendEmail({
      to: EMAIL_CONFIG.QC_LEAD,
      cc: EMAIL_CONFIG.QC_TEAM,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
    // Send summary to department head
    const summarySubject = `[QC Summary] Weekly Quality Report - Week ${getCurrentWeek()}`;
    const summaryBody = buildExecutiveSummaryHTML(kpis);
    
    MailApp.sendEmail({
      to: EMAIL_CONFIG.DEPARTMENT_HEAD,
      subject: summarySubject,
      htmlBody: summaryBody,
      body: buildExecutiveSummaryText(kpis),
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
    logMessage('Weekly report sent successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error sending weekly report: ${error.message}`, 'ERROR');
    sendErrorNotification('Weekly Report Failed', error.message);
  }
}

/**
 * Build weekly report HTML content
 */
function buildWeeklyReportHTML(kpis, trends, actions, alerts) {
  const alertsHTML = alerts.length > 0 ? 
    alerts.map(a => `<li style="color: ${a.type === 'danger' ? '#dc2626' : '#f59e0b'};">
      <strong>${a.category}:</strong> ${a.message}
    </li>`).join('') : '<li>No active alerts</li>';
  
  const actionsHTML = actions.slice(0, 10).map(a => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.issueId}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">
        <span style="background: ${getSeverityColor(a.severity)}; color: white; padding: 2px 8px; border-radius: 4px;">
          ${a.severity}
        </span>
      </td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.description.substring(0, 60)}...</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.assignedTo}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${formatDate(new Date(a.targetDate))}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .section { margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .section h2 { color: #1e40af; margin-top: 0; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .kpi-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .kpi-value { font-size: 28px; font-weight: bold; color: #2563eb; }
    .kpi-label { font-size: 12px; color: #64748b; }
    .kpi-change { font-size: 14px; }
    .kpi-change.positive { color: #16a34a; }
    .kpi-change.negative { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #2563eb; color: white; padding: 12px; text-align: left; }
    .alerts-list { list-style: none; padding: 0; }
    .alerts-list li { padding: 10px; margin: 5px 0; background: white; border-radius: 4px; border-left: 4px solid; }
    .footer { text-align: center; color: #64748b; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Weekly QC Report</h1>
    <p>Mathematics Department Quality Control</p>
    <p>Week ${getCurrentWeek()} | ${formatDateForEmail(new Date())}</p>
  </div>
  
  <div class="container">
    <!-- Alerts Section -->
    ${alerts.length > 0 ? `
    <div class="section" style="background: #fef2f2; border-left: 4px solid #dc2626;">
      <h2 style="color: #dc2626;">⚠️ Active Alerts</h2>
      <ul class="alerts-list">${alertsHTML}</ul>
    </div>
    ` : ''}
    
    <!-- KPI Overview -->
    <div class="section">
      <h2>📈 Key Performance Indicators</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${kpis.lecturesObserved.current}</div>
          <div class="kpi-label">Lectures Observed</div>
          <div class="kpi-change ${kpis.lecturesObserved.change >= 0 ? 'positive' : 'negative'}">
            ${kpis.lecturesObserved.change >= 0 ? '↑' : '↓'} ${Math.abs(kpis.lecturesObserved.change).toFixed(0)}%
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${kpis.avgLectureScore.current.toFixed(2)}</div>
          <div class="kpi-label">Avg Lecture Score</div>
          <div class="kpi-change ${kpis.avgLectureScore.change >= 0 ? 'positive' : 'negative'}">
            ${kpis.avgLectureScore.change >= 0 ? '↑' : '↓'} ${Math.abs(kpis.avgLectureScore.change).toFixed(1)}%
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${kpis.rehearsalCompliance.current.toFixed(0)}%</div>
          <div class="kpi-label">Rehearsal Compliance</div>
          <div class="kpi-change ${kpis.rehearsalCompliance.change >= 0 ? 'positive' : 'negative'}">
            ${kpis.rehearsalCompliance.change >= 0 ? '↑' : '↓'} ${Math.abs(kpis.rehearsalCompliance.change).toFixed(1)}%
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${kpis.contentErrors.current}</div>
          <div class="kpi-label">Content Errors</div>
          <div class="kpi-change ${kpis.contentErrors.change <= 0 ? 'positive' : 'negative'}">
            ${kpis.contentErrors.change <= 0 ? '↓' : '↑'} ${Math.abs(kpis.contentErrors.change).toFixed(0)}%
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${kpis.studentSatisfaction.current.toFixed(2)}</div>
          <div class="kpi-label">Student Satisfaction</div>
          <div class="kpi-change ${kpis.studentSatisfaction.change >= 0 ? 'positive' : 'negative'}">
            ${kpis.studentSatisfaction.change >= 0 ? '↑' : '↓'} ${Math.abs(kpis.studentSatisfaction.change).toFixed(1)}%
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${kpis.actionsResolved.current}</div>
          <div class="kpi-label">Actions Resolved</div>
        </div>
      </div>
    </div>
    
    <!-- Open Actions -->
    <div class="section">
      <h2>📋 Open Action Items (${actions.length})</h2>
      ${actions.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Severity</th>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Target Date</th>
          </tr>
        </thead>
        <tbody>
          ${actionsHTML}
        </tbody>
      </table>
      ` : '<p>No open action items. Great work!</p>'}
    </div>
    
    <!-- Week Summary -->
    <div class="section">
      <h2>📊 This Week's Summary</h2>
      <ul>
        <li><strong>Total Observations:</strong> ${kpis.lecturesObserved.current} lectures</li>
        <li><strong>Assessments Reviewed:</strong> ${kpis.assessmentsReviewed.current}</li>
        <li><strong>Active Research Projects:</strong> ${kpis.activeResearch.current}</li>
        <li><strong>Critical Issues:</strong> ${kpis.openActions.critical}</li>
        <li><strong>High Priority Issues:</strong> ${kpis.openActions.high}</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>This is an automated report from the Mathematics QC System.</p>
      <p>For questions, contact ${EMAIL_CONFIG.QC_LEAD}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Build weekly report text content (fallback)
 */
function buildWeeklyReportText(kpis, actions) {
  return `
MATHEMATICS DEPARTMENT - WEEKLY QC REPORT
Week ${getCurrentWeek()} | ${formatDateForEmail(new Date())}
========================================

KEY PERFORMANCE INDICATORS
--------------------------
Lectures Observed: ${kpis.lecturesObserved.current}
Average Lecture Score: ${kpis.avgLectureScore.current.toFixed(2)}/5.0
Rehearsal Compliance: ${kpis.rehearsalCompliance.current.toFixed(0)}%
Content Errors: ${kpis.contentErrors.current}
Student Satisfaction: ${kpis.studentSatisfaction.current.toFixed(2)}/5.0

OPEN ACTION ITEMS (${actions.length})
--------------------------
${actions.slice(0, 5).map(a => `• [${a.severity}] ${a.issueId}: ${a.description.substring(0, 50)}...`).join('\n')}

This is an automated report from the Mathematics QC System.
`;
}

/**
 * Build executive summary for department head
 */
function buildExecutiveSummaryHTML(kpis) {
  const status = getOverallStatus(kpis);
  const statusColor = status === 'Good' ? '#16a34a' : status === 'Warning' ? '#f59e0b' : '#dc2626';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; color: white; font-weight: bold; }
    .metric { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .metric-value { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Weekly Quality Summary</h1>
  <p>Week ${getCurrentWeek()} | ${formatDateForEmail(new Date())}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <span class="status-badge" style="background: ${statusColor}">
      Overall Status: ${status}
    </span>
  </div>
  
  <h2>Key Metrics</h2>
  <div class="metric">
    <span>Average Teaching Score</span>
    <span class="metric-value">${kpis.avgLectureScore.current.toFixed(2)}/5.0</span>
  </div>
  <div class="metric">
    <span>Compliance Rate</span>
    <span class="metric-value">${kpis.rehearsalCompliance.current.toFixed(0)}%</span>
  </div>
  <div class="metric">
    <span>Student Satisfaction</span>
    <span class="metric-value">${kpis.studentSatisfaction.current.toFixed(2)}/5.0</span>
  </div>
  <div class="metric">
    <span>Critical Issues</span>
    <span class="metric-value">${kpis.openActions.critical}</span>
  </div>
  
  <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
    For detailed report, contact QC Lead at ${EMAIL_CONFIG.QC_LEAD}
  </p>
</body>
</html>`;
}

/**
 * Build executive summary text
 */
function buildExecutiveSummaryText(kpis) {
  return `
WEEKLY QUALITY SUMMARY - WEEK ${getCurrentWeek()}
Overall Status: ${getOverallStatus(kpis)}

Key Metrics:
• Teaching Score: ${kpis.avgLectureScore.current.toFixed(2)}/5.0
• Compliance: ${kpis.rehearsalCompliance.current.toFixed(0)}%
• Satisfaction: ${kpis.studentSatisfaction.current.toFixed(2)}/5.0
• Critical Issues: ${kpis.openActions.critical}
`;
}

// ================================================================
// MONTHLY REPORTS
// ================================================================

/**
 * Send monthly QC report
 * Called by trigger on 1st of each month
 */
function sendMonthlyReport() {
  try {
    if (!EMAIL_CONFIG.NOTIFICATIONS_ENABLED) return;
    
    logMessage('Generating monthly report...', 'INFO');
    
    const kpis = calculateKPIs();
    const trends = calculateTrends(4);
    const instructors = getInstructorPerformance();
    
    const subject = `[Monthly Report] Mathematics Department QC - ${formatDateForEmail(new Date())}`;
    const htmlBody = buildMonthlyReportHTML(kpis, trends, instructors);
    
    MailApp.sendEmail({
      to: EMAIL_CONFIG.DEPARTMENT_HEAD,
      cc: EMAIL_CONFIG.QC_LEAD,
      subject: subject,
      htmlBody: htmlBody,
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
    logMessage('Monthly report sent successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error sending monthly report: ${error.message}`, 'ERROR');
  }
}

/**
 * Build monthly report HTML
 */
function buildMonthlyReportHTML(kpis, trends, instructors) {
  const instructorRows = instructors.map(i => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.name}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.observations}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.avgScore}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.errors}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.satisfaction}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #1e3a8a, #1e40af); color: white; padding: 30px; text-align: center; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .section { margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e40af; color: white; padding: 12px; text-align: left; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Monthly QC Report</h1>
    <p>${formatDateForEmail(new Date())}</p>
  </div>
  
  <div class="container">
    <div class="section">
      <h2>Instructor Performance Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Instructor</th>
            <th>Observations</th>
            <th>Avg Score</th>
            <th>Errors</th>
            <th>Satisfaction</th>
          </tr>
        </thead>
        <tbody>
          ${instructorRows}
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <h2>Monthly Statistics</h2>
      <ul>
        <li>Total Lectures Observed: ${kpis.lecturesObserved.current * 4}</li>
        <li>Average Quality Score: ${kpis.avgLectureScore.current.toFixed(2)}</li>
        <li>Total Content Errors: ${kpis.contentErrors.current}</li>
        <li>Actions Resolved: ${kpis.actionsResolved.current * 4}</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
}

// ================================================================
// ALERT NOTIFICATIONS
// ================================================================

/**
 * Send critical alert notification
 * @param {string} type - Alert type
 * @param {string} subject - Alert subject
 * @param {string} details - Alert details
 */
function sendCriticalAlert(type, subject, details) {
  if (!ALERT_CONFIG.CRITICAL_ALERTS_ENABLED) return;
  
  try {
    const emailSubject = `🚨 [CRITICAL] QC Alert - ${type}`;
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
    <h1>⚠️ Critical QC Alert</h1>
  </div>
  <div style="padding: 20px;">
    <h2>Alert Type: ${type}</h2>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Details:</strong> ${details}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <hr>
    <p style="color: #dc2626; font-weight: bold;">
      This requires immediate attention!
    </p>
  </div>
</body>
</html>`;
    
    MailApp.sendEmail({
      to: EMAIL_CONFIG.QC_LEAD,
      subject: emailSubject,
      htmlBody: htmlBody,
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
    logMessage(`Critical alert sent: ${type}`, 'INFO');
    
  } catch (error) {
    logMessage(`Error sending critical alert: ${error.message}`, 'ERROR');
  }
}

/**
 * Send action item notification
 * @param {string} issueId - Issue ID
 * @param {Array} details - Action details
 */
function sendActionNotification(issueId, details) {
  try {
    const severity = details[2];
    const subject = `[Action Required] ${issueId} - ${severity} Priority`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <div style="background: ${getSeverityColor(severity)}; color: white; padding: 20px;">
    <h1>New Action Item</h1>
  </div>
  <div style="padding: 20px;">
    <p><strong>Issue ID:</strong> ${issueId}</p>
    <p><strong>Type:</strong> ${details[1]}</p>
    <p><strong>Severity:</strong> ${severity}</p>
    <p><strong>Description:</strong> ${details[3]}</p>
    <p><strong>Assigned To:</strong> ${details[4]}</p>
    <p><strong>Target Date:</strong> ${details[5]}</p>
  </div>
</body>
</html>`;
    
    MailApp.sendEmail({
      to: details[4], // Assigned person
      cc: EMAIL_CONFIG.QC_LEAD,
      subject: subject,
      htmlBody: htmlBody,
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
  } catch (error) {
    logMessage(`Error sending action notification: ${error.message}`, 'ERROR');
  }
}

/**
 * Send error notification to IT
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 */
function sendErrorNotification(errorType, errorMessage) {
  try {
    MailApp.sendEmail({
      to: EMAIL_CONFIG.IT_SUPPORT,
      cc: EMAIL_CONFIG.QC_LEAD,
      subject: `[QC System Error] ${errorType}`,
      body: `An error occurred in the QC system:\n\nType: ${errorType}\nMessage: ${errorMessage}\nTime: ${new Date().toISOString()}`,
      name: EMAIL_CONFIG.SENDER_NAME
    });
  } catch (error) {
    console.error('Failed to send error notification:', error);
  }
}

/**
 * Check for alerts and send notifications
 * Called by hourly trigger
 */
function checkAlerts() {
  if (!isAlertTime()) return;
  
  try {
    const alerts = getActiveAlerts();
    const criticalAlerts = alerts.filter(a => a.type === 'danger');
    
    if (criticalAlerts.length > 0) {
      criticalAlerts.forEach(alert => {
        sendCriticalAlert(alert.category, 'System Alert', alert.message);
      });
    }
    
    // Check for overdue actions
    const openActions = getOpenActions();
    const overdueActions = openActions.filter(a => a.isOverdue);
    
    overdueActions.forEach(action => {
      sendActionOverdueNotification(action);
    });
    
  } catch (error) {
    logMessage(`Error checking alerts: ${error.message}`, 'ERROR');
  }
}

/**
 * Send overdue action notification
 * @param {Object} action - Overdue action item
 */
function sendActionOverdueNotification(action) {
  try {
    const subject = `⏰ OVERDUE: Action ${action.issueId}`;
    const body = `Action item ${action.issueId} is overdue!\n\n${action.description}\n\nTarget Date: ${formatDate(new Date(action.targetDate))}\nAssigned To: ${action.assignedTo}`;
    
    MailApp.sendEmail({
      to: action.assignedTo,
      cc: EMAIL_CONFIG.QC_LEAD,
      subject: subject,
      body: body,
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
  } catch (error) {
    logMessage(`Error sending overdue notification: ${error.message}`, 'ERROR');
  }
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Get severity color
 * @param {string} severity - Severity level
 * @returns {string} Color code
 */
function getSeverityColor(severity) {
  const colors = {
    'Critical': '#dc2626',
    'High': '#f59e0b',
    'Medium': '#3b82f6',
    'Low': '#10b981'
  };
  return colors[severity] || '#64748b';
}

/**
 * Get overall status based on KPIs
 * @param {Object} kpis - KPI data
 * @returns {string} Overall status
 */
function getOverallStatus(kpis) {
  const issues = [];
  
  if (kpis.avgLectureScore.current < QUALITY_THRESHOLDS.OVERALL_MIN) issues.push('lecture');
  if (kpis.rehearsalCompliance.current < 90) issues.push('compliance');
  if (kpis.openActions.critical > 0) issues.push('critical');
  
  if (issues.length === 0) return 'Good';
  if (issues.length <= 1) return 'Warning';
  return 'Needs Attention';
}
