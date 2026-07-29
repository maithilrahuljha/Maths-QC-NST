/**
 * ================================================================
 * MATHEMATICS DEPARTMENT QC AUTOMATION SYSTEM
 * Automation Functions (automation.gs)
 * ================================================================
 * 
 * This file contains trigger setup and automation functions.
 * ================================================================
 */

// ================================================================
// TRIGGER SETUP
// ================================================================

/**
 * Set up all required triggers
 * Run this function once during initial setup
 */
function setupTriggers() {
  // First, remove all existing triggers
  removeAllTriggers();
  
  logMessage('Setting up triggers...', 'INFO');
  
  // 1. Weekly report trigger (Monday 8 AM)
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(REPORT_CONFIG.WEEKLY_REPORT_HOUR)
    .create();
  logMessage('Weekly report trigger created', 'INFO');
  
  // 2. Monthly report trigger (1st of month, 9 AM)
  ScriptApp.newTrigger('sendMonthlyReport')
    .timeBased()
    .onMonthDay(REPORT_CONFIG.MONTHLY_REPORT_DAY)
    .atHour(REPORT_CONFIG.MONTHLY_REPORT_HOUR)
    .create();
  logMessage('Monthly report trigger created', 'INFO');
  
  // 3. Dashboard refresh trigger (daily 6 AM)
  ScriptApp.newTrigger('refreshDashboard')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  logMessage('Dashboard refresh trigger created', 'INFO');
  
  // 4. Alert check trigger (hourly)
  ScriptApp.newTrigger('checkAlerts')
    .timeBased()
    .everyHours(1)
    .create();
  logMessage('Alert check trigger created', 'INFO');
  
  // 5. Daily backup trigger (2 AM)
  if (BACKUP_CONFIG.AUTO_BACKUP_ENABLED) {
    ScriptApp.newTrigger('createDailyBackup')
      .timeBased()
      .everyDays(1)
      .atHour(2)
      .create();
    logMessage('Daily backup trigger created', 'INFO');
  }
  
  // 6. Form submission triggers
  setupFormTriggers();
  
  logMessage('All triggers set up successfully!', 'INFO');
}

/**
 * Set up form submission triggers
 */
function setupFormTriggers() {
  const ss = getSpreadsheet();
  
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  
  logMessage('Form submission trigger created', 'INFO');
}

/**
 * Handle form submissions - router function
 * @param {Object} e - Form submission event
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    logMessage(`Form submission received for sheet: ${sheetName}`, 'INFO');
    
    // Route to appropriate handler based on sheet
    switch (sheetName) {
      case SHEET_NAMES.LECTURES:
        onLectureFormSubmit(e);
        break;
      case SHEET_NAMES.ASSESSMENTS:
        onAssessmentFormSubmit(e);
        break;
      case SHEET_NAMES.RESEARCH:
        onResearchFormSubmit(e);
        break;
      case SHEET_NAMES.FEEDBACK:
        onFeedbackFormSubmit(e);
        break;
      case SHEET_NAMES.ACTIONS:
        onActionFormSubmit(e);
        break;
      default:
        logMessage(`Unknown sheet: ${sheetName}`, 'WARNING');
    }
    
  } catch (error) {
    logMessage(`Error in form submission handler: ${error.message}`, 'ERROR');
  }
}

/**
 * Remove all existing triggers
 */
function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  logMessage(`Removed ${triggers.length} existing triggers`, 'INFO');
}

/**
 * List all current triggers
 */
function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  
  console.log('Current Triggers:');
  console.log('=================');
  
  triggers.forEach((trigger, index) => {
    console.log(`${index + 1}. Function: ${trigger.getHandlerFunction()}`);
    console.log(`   Type: ${trigger.getEventType()}`);
    console.log(`   Source: ${trigger.getTriggerSource()}`);
    console.log('---');
  });
  
  return triggers.length;
}

// ================================================================
// BACKUP FUNCTIONS
// ================================================================

/**
 * Create daily backup of the spreadsheet
 */
function createDailyBackup() {
  try {
    logMessage('Creating daily backup...', 'INFO');
    
    const ss = getSpreadsheet();
    const backupName = `QC_Backup_${formatDate(new Date())}`;
    
    // Create copy
    const backup = ss.copy(backupName);
    
    // Move to backup folder
    if (BACKUP_CONFIG.BACKUP_FOLDER_ID !== '[BACKUP_FOLDER_ID]') {
      const backupFolder = DriveApp.getFolderById(BACKUP_CONFIG.BACKUP_FOLDER_ID);
      const file = DriveApp.getFileById(backup.getId());
      file.moveTo(backupFolder);
    }
    
    logMessage(`Backup created: ${backupName}`, 'INFO');
    
    // Clean up old backups
    cleanupOldBackups();
    
  } catch (error) {
    logMessage(`Backup failed: ${error.message}`, 'ERROR');
    sendErrorNotification('Backup Failed', error.message);
  }
}

/**
 * Clean up backups older than retention period
 */
function cleanupOldBackups() {
  try {
    if (BACKUP_CONFIG.BACKUP_FOLDER_ID === '[BACKUP_FOLDER_ID]') return;
    
    const folder = DriveApp.getFolderById(BACKUP_CONFIG.BACKUP_FOLDER_ID);
    const files = folder.getFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_CONFIG.BACKUP_RETENTION);
    
    let deletedCount = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith('QC_Backup_') && file.getDateCreated() < cutoffDate) {
        file.setTrashed(true);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      logMessage(`Cleaned up ${deletedCount} old backup(s)`, 'INFO');
    }
    
  } catch (error) {
    logMessage(`Backup cleanup failed: ${error.message}`, 'ERROR');
  }
}

/**
 * Restore from backup
 * @param {string} backupId - ID of backup file to restore
 */
function restoreFromBackup(backupId) {
  try {
    logMessage(`Restoring from backup: ${backupId}`, 'INFO');
    
    const backup = SpreadsheetApp.openById(backupId);
    const current = getSpreadsheet();
    
    // For each sheet in backup, copy data to current
    const backupSheets = backup.getSheets();
    
    backupSheets.forEach(backupSheet => {
      const sheetName = backupSheet.getName();
      const currentSheet = current.getSheetByName(sheetName);
      
      if (currentSheet) {
        const data = backupSheet.getDataRange().getValues();
        currentSheet.clearContents();
        if (data.length > 0) {
          currentSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
        }
      }
    });
    
    logMessage('Restore completed successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Restore failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ================================================================
// DATA MAINTENANCE
// ================================================================

/**
 * Archive old resolved actions
 * Keep only last 90 days of resolved items
 */
function archiveOldActions() {
  try {
    const sheet = getSheet(SHEET_NAMES.ACTIONS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const rowsToKeep = [headers];
    const rowsToArchive = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const completionDate = new Date(row[9]); // Actual_Completion column
      
      if (row[7] === 'Resolved' && completionDate < cutoffDate) {
        rowsToArchive.push(row);
      } else {
        rowsToKeep.push(row);
      }
    }
    
    if (rowsToArchive.length > 0) {
      // Create archive sheet if needed
      let archiveSheet = getSpreadsheet().getSheetByName('Action_Archive');
      if (!archiveSheet) {
        archiveSheet = getSpreadsheet().insertSheet('Action_Archive');
        archiveSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      // Add archived rows
      const lastRow = archiveSheet.getLastRow();
      archiveSheet.getRange(lastRow + 1, 1, rowsToArchive.length, headers.length).setValues(rowsToArchive);
      
      // Update main sheet
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
      
      logMessage(`Archived ${rowsToArchive.length} old action items`, 'INFO');
    }
    
  } catch (error) {
    logMessage(`Archive failed: ${error.message}`, 'ERROR');
  }
}

/**
 * Recalculate all trends
 */
function recalculateTrends() {
  try {
    const sheet = getSheet(SHEET_NAMES.TRENDS);
    const lectureData = getSheetData(SHEET_NAMES.LECTURES).slice(1);
    const feedbackData = getSheetData(SHEET_NAMES.FEEDBACK).slice(1);
    const actionData = getSheetData(SHEET_NAMES.ACTIONS).slice(1);
    
    // Clear existing data (keep headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
    }
    
    // Calculate for past 12 weeks
    const now = new Date();
    const rows = [];
    
    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      
      const weekNum = getCurrentWeek() - i;
      
      const weekLectures = filterByDateRange(lectureData, 0, weekStart, weekEnd);
      const weekFeedback = filterByDateRange(feedbackData, 0, weekStart, weekEnd);
      const weekActions = filterByDateRange(actionData, 9, weekStart, weekEnd)
        .filter(row => row[7] === 'Resolved');
      
      const avgScore = calculateAvgScore(weekLectures, [6, 7, 8, 9, 10]);
      const passRate = calculateComplianceRate(weekLectures, 11, 'Yes');
      const errorCount = sumColumn(weekLectures, 13);
      const satisfaction = calculateAvgScore(weekFeedback, [5, 6, 7, 8, 9]);
      
      rows.push([
        weekNum,
        weekLectures.length,
        avgScore.toFixed(2),
        passRate.toFixed(0) + '%',
        errorCount,
        weekActions.length,
        0, // Research projects
        satisfaction.toFixed(2)
      ]);
    }
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 8).setValues(rows);
    }
    
    logMessage('Trends recalculated successfully', 'INFO');
    
  } catch (error) {
    logMessage(`Trend recalculation failed: ${error.message}`, 'ERROR');
  }
}

// ================================================================
// DATA VALIDATION
// ================================================================

/**
 * Validate all data in sheets
 */
function validateAllData() {
  const issues = [];
  
  // Validate lectures
  const lectureData = getSheetData(SHEET_NAMES.LECTURES).slice(1);
  lectureData.forEach((row, index) => {
    // Check scores are in valid range
    for (let col = 6; col <= 10; col++) {
      const score = parseFloat(row[col]);
      if (isNaN(score) || score < 1 || score > 5) {
        issues.push(`Lecture row ${index + 2}: Invalid score in column ${col + 1}`);
      }
    }
    
    // Check required fields
    if (!row[0] || !row[1] || !row[2]) {
      issues.push(`Lecture row ${index + 2}: Missing required field`);
    }
  });
  
  // Validate assessments
  const assessmentData = getSheetData(SHEET_NAMES.ASSESSMENTS).slice(1);
  assessmentData.forEach((row, index) => {
    const total = parseInt(row[4]) || 0;
    const correct = parseInt(row[5]) || 0;
    const incorrect = parseInt(row[6]) || 0;
    
    if (correct + incorrect > total) {
      issues.push(`Assessment row ${index + 2}: Answers exceed total questions`);
    }
  });
  
  // Log results
  if (issues.length > 0) {
    logMessage(`Data validation found ${issues.length} issues:`, 'WARNING');
    issues.forEach(issue => logMessage(`  - ${issue}`, 'WARNING'));
  } else {
    logMessage('Data validation passed - no issues found', 'INFO');
  }
  
  return issues;
}

/**
 * Fix common data issues
 */
function fixDataIssues() {
  try {
    let fixed = 0;
    
    // Fix missing statuses in actions
    const actionSheet = getSheet(SHEET_NAMES.ACTIONS);
    const actionData = actionSheet.getDataRange().getValues();
    
    for (let i = 1; i < actionData.length; i++) {
      if (!actionData[i][7]) {
        actionSheet.getRange(i + 1, 8).setValue('Open');
        fixed++;
      }
    }
    
    // Trim whitespace from text fields
    const sheets = [SHEET_NAMES.LECTURES, SHEET_NAMES.ASSESSMENTS, SHEET_NAMES.FEEDBACK];
    
    sheets.forEach(sheetName => {
      const sheet = getSheet(sheetName);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          if (typeof data[i][j] === 'string') {
            const trimmed = data[i][j].trim();
            if (trimmed !== data[i][j]) {
              sheet.getRange(i + 1, j + 1).setValue(trimmed);
              fixed++;
            }
          }
        }
      }
    });
    
    logMessage(`Fixed ${fixed} data issues`, 'INFO');
    return fixed;
    
  } catch (error) {
    logMessage(`Error fixing data issues: ${error.message}`, 'ERROR');
    return 0;
  }
}

// ================================================================
// SYSTEM STATUS
// ================================================================

/**
 * Get system status
 * @returns {Object} System status information
 */
function getSystemStatus() {
  const status = {
    timestamp: new Date().toISOString(),
    spreadsheet: { connected: false, name: '' },
    triggers: { count: 0, list: [] },
    sheets: {},
    lastBackup: null
  };
  
  try {
    // Check spreadsheet
    const ss = getSpreadsheet();
    status.spreadsheet.connected = true;
    status.spreadsheet.name = ss.getName();
    
    // Check sheets
    for (const [key, name] of Object.entries(SHEET_NAMES)) {
      try {
        const sheet = ss.getSheetByName(name);
        status.sheets[name] = {
          exists: !!sheet,
          rows: sheet ? sheet.getLastRow() : 0
        };
      } catch (e) {
        status.sheets[name] = { exists: false, error: e.message };
      }
    }
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    status.triggers.count = triggers.length;
    status.triggers.list = triggers.map(t => t.getHandlerFunction());
    
    // Check last backup
    if (BACKUP_CONFIG.BACKUP_FOLDER_ID !== '[BACKUP_FOLDER_ID]') {
      try {
        const folder = DriveApp.getFolderById(BACKUP_CONFIG.BACKUP_FOLDER_ID);
        const files = folder.getFilesByName('QC_Backup_');
        if (files.hasNext()) {
          status.lastBackup = files.next().getDateCreated().toISOString();
        }
      } catch (e) {
        status.lastBackup = 'Unable to check';
      }
    }
    
  } catch (error) {
    status.error = error.message;
  }
  
  return status;
}

/**
 * Run system health check
 */
function runHealthCheck() {
  logMessage('Running system health check...', 'INFO');
  
  const status = getSystemStatus();
  const issues = [];
  
  // Check spreadsheet connection
  if (!status.spreadsheet.connected) {
    issues.push('Cannot connect to spreadsheet');
  }
  
  // Check all sheets exist
  for (const [name, info] of Object.entries(status.sheets)) {
    if (!info.exists) {
      issues.push(`Sheet missing: ${name}`);
    }
  }
  
  // Check triggers are set
  if (status.triggers.count < 4) {
    issues.push(`Only ${status.triggers.count} triggers found, expected at least 4`);
  }
  
  // Report results
  if (issues.length > 0) {
    logMessage('Health check found issues:', 'WARNING');
    issues.forEach(issue => logMessage(`  - ${issue}`, 'WARNING'));
    
    sendErrorNotification('Health Check Issues', issues.join('; '));
  } else {
    logMessage('Health check passed - all systems operational', 'INFO');
  }
  
  return { healthy: issues.length === 0, issues: issues, status: status };
}
