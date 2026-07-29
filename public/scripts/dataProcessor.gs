/**
 * ================================================================
 * MATHEMATICS DEPARTMENT QC AUTOMATION SYSTEM
 * Data Processing Functions (dataProcessor.gs)
 * ================================================================
 * 
 * This file contains all data processing and calculation functions.
 * ================================================================
 */

// ================================================================
// FORM SUBMISSION HANDLERS
// ================================================================

/**
 * Process new lecture observation submission
 * Triggered when a new form response is submitted
 * @param {Object} e - Form submission event object
 */
function onLectureFormSubmit(e) {
  try {
    logMessage('Processing new lecture observation submission', 'INFO');
    
    const response = e.values;
    const sheet = getSheet(SHEET_NAMES.LECTURES);
    
    // Calculate overall score
    const scores = [
      parseFloat(response[6]) || 0,  // Correctness
      parseFloat(response[7]) || 0,  // Delivery
      parseFloat(response[8]) || 0,  // Engagement
      parseFloat(response[9]) || 0,  // Board Work
      parseFloat(response[10]) || 0  // Pace
    ];
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Check for quality issues
    const issues = [];
    
    if (avgScore < QUALITY_THRESHOLDS.OVERALL_MIN) {
      issues.push(`Low overall score: ${avgScore.toFixed(2)}`);
    }
    
    if (response[11] === 'No') {  // Not rehearsed
      issues.push('Session not rehearsed');
    }
    
    if (response[12] === 'No') {  // Readiness incomplete
      issues.push('Readiness checklist incomplete');
    }
    
    if (parseInt(response[13]) > 0) {  // Content errors
      issues.push(`${response[13]} content error(s) found`);
    }
    
    // Create action item if issues found
    if (issues.length > 0) {
      createActionItem({
        issueType: 'Lecture Quality',
        severity: avgScore < 3.0 ? 'High' : 'Medium',
        description: `Issues in ${response[1]} by ${response[2]}: ${issues.join('; ')}`,
        assignedTo: response[2],
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      });
    }
    
    // Send alert for critical issues
    if (avgScore < 3.0 || issues.length >= 3) {
      sendCriticalAlert('Lecture Observation', response[2], issues.join('; '));
    }
    
    // Update dashboard
    updateDashboard();
    
    logMessage('Lecture observation processed successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error processing lecture submission: ${error.message}`, 'ERROR');
  }
}

/**
 * Process new assessment QC submission
 * @param {Object} e - Form submission event object
 */
function onAssessmentFormSubmit(e) {
  try {
    logMessage('Processing new assessment QC submission', 'INFO');
    
    const response = e.values;
    
    // Calculate error rate
    const totalQuestions = parseInt(response[4]) || 1;
    const incorrectAnswers = parseInt(response[6]) || 0;
    const typoErrors = parseInt(response[7]) || 0;
    const markingErrors = parseInt(response[12]) || 0;
    
    const errorRate = (incorrectAnswers + typoErrors) / totalQuestions;
    
    // Check for quality issues
    const issues = [];
    
    if (errorRate > QUALITY_THRESHOLDS.ERROR_RATE_MAX) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }
    
    if (parseInt(response[8]) < QUALITY_THRESHOLDS.SYLLABUS_COVERAGE_MIN) {
      issues.push(`Low syllabus coverage: ${response[8]}%`);
    }
    
    if (response[9] === 'No') {  // Difficulty not appropriate
      issues.push('Difficulty level inappropriate');
    }
    
    if (markingErrors > 0) {
      issues.push(`${markingErrors} marking error(s) found`);
    }
    
    if (response[13] === 'Yes') {  // Escalation required
      issues.push('Escalation required');
    }
    
    // Create action item if issues found
    if (issues.length > 0 || response[14] === 'Rejected') {
      createActionItem({
        issueType: 'Assessment Error',
        severity: response[14] === 'Rejected' ? 'Critical' : 'High',
        description: `Assessment issues in ${response[2]}: ${issues.join('; ')}`,
        assignedTo: response[3],
        targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });
    }
    
    // Log QC failure if rejected
    if (response[14] === 'Rejected') {
      logQCFailure({
        failureCase: `Assessment rejected for ${response[2]}`,
        qcResponse: 'Sent back for revision',
        severity: 'High'
      });
    }
    
    // Update dashboard
    updateDashboard();
    
    logMessage('Assessment QC processed successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error processing assessment submission: ${error.message}`, 'ERROR');
  }
}

/**
 * Process new research QC submission
 * @param {Object} e - Form submission event object
 */
function onResearchFormSubmit(e) {
  try {
    logMessage('Processing new research QC submission', 'INFO');
    
    const response = e.values;
    
    // Generate project ID
    const projectId = generateProjectId();
    
    // Add project ID to the row
    const sheet = getSheet(SHEET_NAMES.RESEARCH);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setValue(projectId);
    
    // Calculate overall research score
    const scores = [
      parseFloat(response[7]) || 0,   // Literature Review
      parseFloat(response[8]) || 0,   // Methodology
      parseFloat(response[9]) || 0,   // Data Analysis
      parseFloat(response[10]) || 0   // Presentation
    ];
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const originality = parseInt(response[6]) || 0;
    
    // Check for quality issues
    const issues = [];
    
    if (originality < QUALITY_THRESHOLDS.ORIGINALITY_MIN) {
      issues.push(`Low originality score: ${originality}%`);
    }
    
    if (response[11] === 'Yes') {  // Plagiarism detected
      issues.push('PLAGIARISM DETECTED');
    }
    
    if (avgScore < QUALITY_THRESHOLDS.METHODOLOGY_MIN) {
      issues.push(`Low research quality score: ${avgScore.toFixed(2)}`);
    }
    
    // Create action item if issues found
    if (issues.length > 0) {
      createActionItem({
        issueType: 'Research Issue',
        severity: response[11] === 'Yes' ? 'Critical' : 'Medium',
        description: `Research issues for "${response[1]}": ${issues.join('; ')}`,
        assignedTo: response[3],  // Faculty mentor
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
      });
    }
    
    // Send alert for plagiarism
    if (response[11] === 'Yes') {
      sendCriticalAlert('Research - Plagiarism', response[3], `Plagiarism detected in project: ${response[1]}`);
    }
    
    // Update dashboard
    updateDashboard();
    
    logMessage('Research QC processed successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error processing research submission: ${error.message}`, 'ERROR');
  }
}

/**
 * Process new student feedback submission
 * @param {Object} e - Form submission event object
 */
function onFeedbackFormSubmit(e) {
  try {
    logMessage('Processing new student feedback submission', 'INFO');
    
    const response = e.values;
    
    // Calculate average satisfaction score
    const scores = [
      parseFloat(response[5]) || 0,   // Subject Knowledge
      parseFloat(response[6]) || 0,   // Teaching Clarity
      parseFloat(response[7]) || 0,   // Engagement
      parseFloat(response[8]) || 0,   // Approachability
      parseFloat(response[9]) || 0    // Punctuality
    ];
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Check for concerning feedback
    if (avgScore < QUALITY_THRESHOLDS.SATISFACTION_MIN) {
      createActionItem({
        issueType: 'Delivery Issue',
        severity: avgScore < 2.5 ? 'High' : 'Medium',
        description: `Low student feedback for ${response[3]} in ${response[1]}: avg ${avgScore.toFixed(2)}`,
        assignedTo: response[3],
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Update dashboard
    updateDashboard();
    
    logMessage('Student feedback processed successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error processing feedback submission: ${error.message}`, 'ERROR');
  }
}

/**
 * Process new action item submission
 * @param {Object} e - Form submission event object
 */
function onActionFormSubmit(e) {
  try {
    logMessage('Processing new action item submission', 'INFO');
    
    const response = e.values;
    
    // Generate issue ID
    const issueId = generateIssueId();
    
    // Add issue ID to the row
    const sheet = getSheet(SHEET_NAMES.ACTIONS);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setValue(issueId);
    
    // Send notification for critical/high severity
    if (response[2] === 'Critical' || response[2] === 'High') {
      sendActionNotification(issueId, response);
    }
    
    // Update dashboard
    updateDashboard();
    
    logMessage('Action item processed successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Error processing action submission: ${error.message}`, 'ERROR');
  }
}

// ================================================================
// DATA CALCULATION FUNCTIONS
// ================================================================

/**
 * Calculate KPIs from all data
 * @returns {Object} Object containing all KPIs
 */
function calculateKPIs() {
  const kpis = {};
  
  // Get data from all sheets
  const lectureData = getSheetData(SHEET_NAMES.LECTURES);
  const assessmentData = getSheetData(SHEET_NAMES.ASSESSMENTS);
  const feedbackData = getSheetData(SHEET_NAMES.FEEDBACK);
  const actionData = getSheetData(SHEET_NAMES.ACTIONS);
  const researchData = getSheetData(SHEET_NAMES.RESEARCH);
  
  // Current week data (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  // Filter data by date
  const currentWeekLectures = filterByDateRange(lectureData.slice(1), 0, oneWeekAgo, new Date());
  const lastWeekLectures = filterByDateRange(lectureData.slice(1), 0, twoWeeksAgo, oneWeekAgo);
  
  // Calculate lecture metrics
  kpis.lecturesObserved = {
    current: currentWeekLectures.length,
    previous: lastWeekLectures.length,
    change: calculatePercentChange(lastWeekLectures.length, currentWeekLectures.length)
  };
  
  kpis.avgLectureScore = {
    current: calculateAvgScore(currentWeekLectures, [6, 7, 8, 9, 10]),
    previous: calculateAvgScore(lastWeekLectures, [6, 7, 8, 9, 10]),
    target: QUALITY_THRESHOLDS.OVERALL_MIN
  };
  kpis.avgLectureScore.change = calculatePercentChange(
    kpis.avgLectureScore.previous, 
    kpis.avgLectureScore.current
  );
  
  kpis.rehearsalCompliance = {
    current: calculateComplianceRate(currentWeekLectures, 11, 'Yes'),
    previous: calculateComplianceRate(lastWeekLectures, 11, 'Yes'),
    target: QUALITY_THRESHOLDS.REHEARSAL_COMPLIANCE_MIN
  };
  kpis.rehearsalCompliance.change = calculatePercentChange(
    kpis.rehearsalCompliance.previous, 
    kpis.rehearsalCompliance.current
  );
  
  kpis.contentErrors = {
    current: sumColumn(currentWeekLectures, 13),
    previous: sumColumn(lastWeekLectures, 13),
    target: 0
  };
  kpis.contentErrors.change = calculatePercentChange(
    kpis.contentErrors.previous, 
    kpis.contentErrors.current
  );
  
  // Calculate assessment metrics
  const currentWeekAssessments = filterByDateRange(assessmentData.slice(1), 0, oneWeekAgo, new Date());
  const lastWeekAssessments = filterByDateRange(assessmentData.slice(1), 0, twoWeeksAgo, oneWeekAgo);
  
  kpis.assessmentsReviewed = {
    current: currentWeekAssessments.length,
    previous: lastWeekAssessments.length,
    change: calculatePercentChange(lastWeekAssessments.length, currentWeekAssessments.length)
  };
  
  kpis.assessmentErrorRate = {
    current: calculateErrorRate(currentWeekAssessments),
    previous: calculateErrorRate(lastWeekAssessments),
    target: QUALITY_THRESHOLDS.ERROR_RATE_MAX * 100
  };
  kpis.assessmentErrorRate.change = calculatePercentChange(
    kpis.assessmentErrorRate.previous, 
    kpis.assessmentErrorRate.current
  );
  
  // Calculate feedback metrics
  const currentWeekFeedback = filterByDateRange(feedbackData.slice(1), 0, oneWeekAgo, new Date());
  const lastWeekFeedback = filterByDateRange(feedbackData.slice(1), 0, twoWeeksAgo, oneWeekAgo);
  
  kpis.studentSatisfaction = {
    current: calculateAvgScore(currentWeekFeedback, [5, 6, 7, 8, 9]),
    previous: calculateAvgScore(lastWeekFeedback, [5, 6, 7, 8, 9]),
    target: QUALITY_THRESHOLDS.SATISFACTION_MIN
  };
  kpis.studentSatisfaction.change = calculatePercentChange(
    kpis.studentSatisfaction.previous, 
    kpis.studentSatisfaction.current
  );
  
  // Calculate action item metrics
  const openActions = actionData.slice(1).filter(row => 
    row[7] === 'Open' || row[7] === 'In Progress'
  );
  const resolvedThisWeek = filterByDateRange(actionData.slice(1), 9, oneWeekAgo, new Date())
    .filter(row => row[7] === 'Resolved');
  
  kpis.openActions = {
    current: openActions.length,
    critical: openActions.filter(row => row[3] === 'Critical').length,
    high: openActions.filter(row => row[3] === 'High').length
  };
  
  kpis.actionsResolved = {
    current: resolvedThisWeek.length
  };
  
  // Calculate research metrics
  kpis.activeResearch = {
    current: researchData.slice(1).filter(row => 
      row[20] === 'In Progress' || !row[20]
    ).length
  };
  
  return kpis;
}

/**
 * Calculate trend data for charts
 * @param {number} weeks - Number of weeks to include
 * @returns {Object} Trend data for charts
 */
function calculateTrends(weeks = 12) {
  const trends = {
    labels: [],
    lectureScores: [],
    errorCounts: [],
    satisfaction: [],
    actionsResolved: []
  };
  
  const lectureData = getSheetData(SHEET_NAMES.LECTURES).slice(1);
  const feedbackData = getSheetData(SHEET_NAMES.FEEDBACK).slice(1);
  const actionData = getSheetData(SHEET_NAMES.ACTIONS).slice(1);
  
  // Calculate weekly data
  const now = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    
    trends.labels.push(`Week ${weeks - i}`);
    
    // Lecture scores
    const weekLectures = filterByDateRange(lectureData, 0, weekStart, weekEnd);
    trends.lectureScores.push(calculateAvgScore(weekLectures, [6, 7, 8, 9, 10]) || 0);
    
    // Error counts
    trends.errorCounts.push(sumColumn(weekLectures, 13) || 0);
    
    // Satisfaction
    const weekFeedback = filterByDateRange(feedbackData, 0, weekStart, weekEnd);
    trends.satisfaction.push(calculateAvgScore(weekFeedback, [5, 6, 7, 8, 9]) || 0);
    
    // Actions resolved
    const weekActions = filterByDateRange(actionData, 9, weekStart, weekEnd)
      .filter(row => row[7] === 'Resolved');
    trends.actionsResolved.push(weekActions.length);
  }
  
  return trends;
}

/**
 * Get instructor performance data
 * @returns {Array} Instructor performance summary
 */
function getInstructorPerformance() {
  const lectureData = getSheetData(SHEET_NAMES.LECTURES).slice(1);
  const feedbackData = getSheetData(SHEET_NAMES.FEEDBACK).slice(1);
  
  const instructors = {};
  
  // Process lecture data
  lectureData.forEach(row => {
    const name = row[2];
    if (!name) return;
    
    if (!instructors[name]) {
      instructors[name] = {
        name: name,
        observations: 0,
        totalScore: 0,
        errors: 0,
        feedbackCount: 0,
        feedbackTotal: 0
      };
    }
    
    instructors[name].observations++;
    instructors[name].totalScore += (
      (parseFloat(row[6]) || 0) +
      (parseFloat(row[7]) || 0) +
      (parseFloat(row[8]) || 0) +
      (parseFloat(row[9]) || 0) +
      (parseFloat(row[10]) || 0)
    ) / 5;
    instructors[name].errors += parseInt(row[13]) || 0;
  });
  
  // Process feedback data
  feedbackData.forEach(row => {
    const name = row[3];
    if (!name || !instructors[name]) return;
    
    instructors[name].feedbackCount++;
    instructors[name].feedbackTotal += (
      (parseFloat(row[5]) || 0) +
      (parseFloat(row[6]) || 0) +
      (parseFloat(row[7]) || 0) +
      (parseFloat(row[8]) || 0) +
      (parseFloat(row[9]) || 0)
    ) / 5;
  });
  
  // Calculate averages
  return Object.values(instructors).map(inst => ({
    name: inst.name,
    observations: inst.observations,
    avgScore: inst.observations > 0 ? (inst.totalScore / inst.observations).toFixed(2) : 'N/A',
    errors: inst.errors,
    satisfaction: inst.feedbackCount > 0 ? (inst.feedbackTotal / inst.feedbackCount).toFixed(2) : 'N/A'
  }));
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Filter data by date range
 * @param {Array} data - Data array
 * @param {number} dateColumn - Index of date column
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered data
 */
function filterByDateRange(data, dateColumn, startDate, endDate) {
  return data.filter(row => {
    const date = new Date(row[dateColumn]);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Calculate average score from multiple columns
 * @param {Array} data - Data array
 * @param {Array} columns - Array of column indices
 * @returns {number} Average score
 */
function calculateAvgScore(data, columns) {
  if (data.length === 0) return 0;
  
  let total = 0;
  let count = 0;
  
  data.forEach(row => {
    columns.forEach(col => {
      const val = parseFloat(row[col]);
      if (!isNaN(val)) {
        total += val;
        count++;
      }
    });
  });
  
  return count > 0 ? (total / count) : 0;
}

/**
 * Calculate compliance rate
 * @param {Array} data - Data array
 * @param {number} column - Column index
 * @param {string} expectedValue - Expected value for compliance
 * @returns {number} Compliance rate percentage
 */
function calculateComplianceRate(data, column, expectedValue) {
  if (data.length === 0) return 0;
  
  const compliant = data.filter(row => row[column] === expectedValue).length;
  return (compliant / data.length) * 100;
}

/**
 * Sum values in a column
 * @param {Array} data - Data array
 * @param {number} column - Column index
 * @returns {number} Sum of values
 */
function sumColumn(data, column) {
  return data.reduce((sum, row) => sum + (parseInt(row[column]) || 0), 0);
}

/**
 * Calculate percent change
 * @param {number} previous - Previous value
 * @param {number} current - Current value
 * @returns {number} Percent change
 */
function calculatePercentChange(previous, current) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate assessment error rate
 * @param {Array} data - Assessment data
 * @returns {number} Error rate percentage
 */
function calculateErrorRate(data) {
  if (data.length === 0) return 0;
  
  let totalQuestions = 0;
  let totalErrors = 0;
  
  data.forEach(row => {
    totalQuestions += parseInt(row[4]) || 0;
    totalErrors += (parseInt(row[6]) || 0) + (parseInt(row[7]) || 0);
  });
  
  return totalQuestions > 0 ? (totalErrors / totalQuestions) * 100 : 0;
}

/**
 * Generate unique project ID
 * @returns {string} Project ID
 */
function generateProjectId() {
  const year = new Date().getFullYear();
  const sheet = getSheet(SHEET_NAMES.RESEARCH);
  const lastRow = sheet.getLastRow();
  const num = String(lastRow).padStart(3, '0');
  return `RES-${year}-${num}`;
}

/**
 * Generate unique issue ID
 * @returns {string} Issue ID
 */
function generateIssueId() {
  const year = new Date().getFullYear();
  const sheet = getSheet(SHEET_NAMES.ACTIONS);
  const lastRow = sheet.getLastRow();
  const num = String(lastRow).padStart(3, '0');
  return `ACT-${year}-${num}`;
}

/**
 * Create action item
 * @param {Object} item - Action item details
 */
function createActionItem(item) {
  const sheet = getSheet(SHEET_NAMES.ACTIONS);
  const issueId = generateIssueId();
  
  sheet.appendRow([
    issueId,
    new Date(),
    item.issueType,
    item.severity,
    item.description,
    item.assignedTo,
    item.targetDate,
    'Open',
    '',
    '',
    ''
  ]);
  
  logMessage(`Action item ${issueId} created`, 'INFO');
}

/**
 * Log QC failure
 * @param {Object} failure - Failure details
 */
function logQCFailure(failure) {
  const sheet = getSheet(SHEET_NAMES.FAILURES);
  
  sheet.appendRow([
    new Date(),
    failure.failureCase,
    failure.qcResponse,
    failure.severity,
    '',
    'No',
    'No'
  ]);
  
  logMessage('QC failure logged', 'INFO');
}

/**
 * Clean and validate incoming data
 * @param {Array} row - Data row
 * @returns {Array} Cleaned data row
 */
function cleanData(row) {
  return row.map((cell, index) => {
    // Trim strings
    if (typeof cell === 'string') {
      return cell.trim();
    }
    // Ensure numbers are valid
    if (typeof cell === 'number' && isNaN(cell)) {
      return 0;
    }
    return cell;
  });
}

/**
 * Check for duplicate entries
 * @param {string} sheetName - Sheet to check
 * @param {Array} newRow - New row to check
 * @param {Array} keyColumns - Column indices for duplicate check
 * @returns {boolean} True if duplicate exists
 */
function isDuplicate(sheetName, newRow, keyColumns) {
  const data = getSheetData(sheetName).slice(1);
  
  return data.some(existingRow => {
    return keyColumns.every(col => existingRow[col] === newRow[col]);
  });
}
