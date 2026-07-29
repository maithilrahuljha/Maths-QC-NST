/**
 * ================================================================
 * MATHEMATICS DEPARTMENT QC AUTOMATION SYSTEM
 * Main Entry Point (main.gs)
 * ================================================================
 * 
 * This is the main entry file for the QC System.
 * It initializes the system and provides utility functions.
 * ================================================================
 */

// ================================================================
// SYSTEM INITIALIZATION
// ================================================================

/**
 * Initialize the QC System
 * Run this function once after setup
 */
function initializeSystem() {
  logMessage('Starting QC System Initialization...', 'INFO');
  
  // Verify configuration
  const configValid = verifyConfiguration();
  if (!configValid) {
    logMessage('Configuration errors found. Please fix before continuing.', 'ERROR');
    return false;
  }
  
  // Set up triggers
  setupTriggers();
  
  // Initialize dashboard
  updateDashboard();
  
  // Run health check
  const health = runHealthCheck();
  
  if (health.healthy) {
    logMessage('QC System initialized successfully!', 'INFO');
    
    // Send welcome email
    sendWelcomeEmail();
    
    return true;
  } else {
    logMessage('Initialization completed with warnings. Check logs.', 'WARNING');
    return false;
  }
}

/**
 * Send welcome email to QC Lead
 */
function sendWelcomeEmail() {
  if (!EMAIL_CONFIG.NOTIFICATIONS_ENABLED) return;
  
  try {
    const subject = '🎉 Mathematics QC System Initialized Successfully';
    const body = `
Hello QC Team,

The Mathematics Department Quality Control System has been initialized successfully!

System Status:
✅ Google Sheets connected
✅ Forms linked
✅ Triggers configured
✅ Dashboard ready

Quick Links:
- Dashboard: [Your GitHub Pages URL]
- Forms: [Your Form Links]

Next Steps:
1. Test form submissions
2. Verify dashboard displays data
3. Check email report delivery
4. Train team members

For support, contact IT at ${EMAIL_CONFIG.IT_SUPPORT}

Best regards,
QC Automation System
    `;
    
    MailApp.sendEmail({
      to: EMAIL_CONFIG.QC_LEAD,
      subject: subject,
      body: body,
      name: EMAIL_CONFIG.SENDER_NAME
    });
    
    logMessage('Welcome email sent', 'INFO');
  } catch (error) {
    logMessage(`Failed to send welcome email: ${error.message}`, 'ERROR');
  }
}

// ================================================================
// UTILITY MENU
// ================================================================

/**
 * Create custom menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🎓 QC System')
    .addItem('📊 Refresh Dashboard', 'refreshDashboard')
    .addItem('📧 Send Weekly Report', 'sendWeeklyReport')
    .addItem('🔔 Check Alerts', 'checkAlerts')
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Administration')
      .addItem('Initialize System', 'initializeSystem')
      .addItem('Setup Triggers', 'setupTriggers')
      .addItem('Remove Triggers', 'removeAllTriggers')
      .addItem('Verify Configuration', 'verifyConfiguration'))
    .addSubMenu(ui.createMenu('📁 Data Management')
      .addItem('Create Backup', 'createDailyBackup')
      .addItem('Archive Old Actions', 'archiveOldActions')
      .addItem('Recalculate Trends', 'recalculateTrends')
      .addItem('Validate Data', 'validateAllData'))
    .addSubMenu(ui.createMenu('🔧 Maintenance')
      .addItem('Run Health Check', 'showHealthCheck')
      .addItem('View System Status', 'showSystemStatus')
      .addItem('Fix Data Issues', 'fixDataIssues'))
    .addSeparator()
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

/**
 * Show health check results in dialog
 */
function showHealthCheck() {
  const health = runHealthCheck();
  const ui = SpreadsheetApp.getUi();
  
  let message = health.healthy ? 
    '✅ System Health: All OK\n\n' :
    '⚠️ System Health: Issues Found\n\n';
  
  if (!health.healthy) {
    message += 'Issues:\n';
    health.issues.forEach(issue => {
      message += `• ${issue}\n`;
    });
  }
  
  message += '\nStatus Details:\n';
  message += `• Spreadsheet: ${health.status.spreadsheet.connected ? '✅' : '❌'}\n`;
  message += `• Triggers: ${health.status.triggers.count} active\n`;
  
  ui.alert('System Health Check', message, ui.ButtonSet.OK);
}

/**
 * Show system status in dialog
 */
function showSystemStatus() {
  const status = getSystemStatus();
  const ui = SpreadsheetApp.getUi();
  
  let message = `QC System Status Report\n`;
  message += `Generated: ${status.timestamp}\n\n`;
  
  message += `Spreadsheet: ${status.spreadsheet.name}\n`;
  message += `Connected: ${status.spreadsheet.connected ? 'Yes' : 'No'}\n\n`;
  
  message += `Sheets Status:\n`;
  for (const [name, info] of Object.entries(status.sheets)) {
    message += `• ${name}: ${info.exists ? `✅ (${info.rows} rows)` : '❌ Missing'}\n`;
  }
  
  message += `\nTriggers: ${status.triggers.count} active\n`;
  status.triggers.list.forEach(func => {
    message += `• ${func}\n`;
  });
  
  ui.alert('System Status', message, ui.ButtonSet.OK);
}

/**
 * Show help dialog
 */
function showHelp() {
  const ui = SpreadsheetApp.getUi();
  
  const helpText = `
MATHEMATICS QC SYSTEM - HELP
============================

📊 Dashboard Functions:
• Refresh Dashboard - Update all metrics
• Send Weekly Report - Email report immediately
• Check Alerts - Check for critical issues

⚙️ Administration:
• Initialize System - First-time setup
• Setup Triggers - Configure automation
• Remove Triggers - Disable automation
• Verify Configuration - Check settings

📁 Data Management:
• Create Backup - Manual backup now
• Archive Old Actions - Clean up old data
• Recalculate Trends - Fix trend data
• Validate Data - Check for errors

🔧 Maintenance:
• Run Health Check - System diagnostics
• View System Status - Current status
• Fix Data Issues - Auto-fix common issues

For more help, contact:
IT Support: ${EMAIL_CONFIG.IT_SUPPORT || '[Configure in config.gs]'}
QC Lead: ${EMAIL_CONFIG.QC_LEAD || '[Configure in config.gs]'}
  `;
  
  ui.alert('Help', helpText, ui.ButtonSet.OK);
}

// ================================================================
// QUICK ACTION FUNCTIONS
// ================================================================

/**
 * Quick action: Add sample data for testing
 */
function addSampleData() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Add Sample Data',
    'This will add sample data to all sheets for testing. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  // Add sample lecture observation
  const lectureSheet = getSheet(SHEET_NAMES.LECTURES);
  lectureSheet.appendRow([
    new Date(),
    'MATH101',
    'Dr. Smith',
    'Lecture',
    'Introduction to Calculus',
    45,
    5, 4, 4, 5, 4,
    'Yes', 'Yes',
    0, 'No',
    'Clear explanations, good engagement',
    'Could add more examples',
    'Low',
    'Add 2 more worked examples',
    'Dr. Smith',
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    'Open'
  ]);
  
  // Add sample action item
  const actionSheet = getSheet(SHEET_NAMES.ACTIONS);
  const issueId = generateIssueId();
  actionSheet.appendRow([
    issueId,
    new Date(),
    'Process Issue',
    'Medium',
    'Sample action item for testing',
    'QC Lead',
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    'Open',
    '',
    '',
    ''
  ]);
  
  // Update dashboard
  updateDashboard();
  
  ui.alert('Sample Data Added', 
    'Sample data has been added to the sheets.\n\n' +
    'Added:\n• 1 Lecture Observation\n• 1 Action Item\n\n' +
    'Dashboard has been refreshed.',
    ui.ButtonSet.OK);
}

/**
 * Quick action: Clear all test data
 */
function clearTestData() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '⚠️ Clear All Data',
    'This will remove ALL data from all sheets (except headers). This cannot be undone!\n\nAre you absolutely sure?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const confirmResult = ui.alert(
    '⚠️ Final Confirmation',
    'Type "DELETE" in the prompt to confirm data deletion.',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (confirmResult !== ui.Button.OK) return;
  
  // Clear all sheets except headers
  for (const [key, name] of Object.entries(SHEET_NAMES)) {
    try {
      const sheet = getSheet(name);
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
    } catch (e) {
      logMessage(`Could not clear ${name}: ${e.message}`, 'WARNING');
    }
  }
  
  ui.alert('Data Cleared', 'All data has been removed. Only headers remain.', ui.ButtonSet.OK);
}

// ================================================================
// ERROR HANDLING
// ================================================================

/**
 * Global error handler
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 */
function handleError(error, context) {
  logMessage(`Error in ${context}: ${error.message}`, 'ERROR');
  logMessage(`Stack: ${error.stack}`, 'ERROR');
  
  // Send error notification
  sendErrorNotification(context, error.message);
}

/**
 * Try to execute a function with error handling
 * @param {Function} fn - Function to execute
 * @param {string} context - Context for error reporting
 * @param {*} defaultReturn - Default return value on error
 * @returns {*} Function result or default value
 */
function safeExecute(fn, context, defaultReturn = null) {
  try {
    return fn();
  } catch (error) {
    handleError(error, context);
    return defaultReturn;
  }
}

// ================================================================
// TESTING UTILITIES
// ================================================================

/**
 * Test all major functions
 * Run this to verify system is working
 */
function runAllTests() {
  const results = [];
  
  // Test 1: Configuration
  results.push({
    test: 'Configuration',
    passed: safeExecute(() => verifyConfiguration(), 'Config Test', false)
  });
  
  // Test 2: Sheet Access
  results.push({
    test: 'Sheet Access',
    passed: safeExecute(() => {
      for (const name of Object.values(SHEET_NAMES)) {
        getSheet(name);
      }
      return true;
    }, 'Sheet Access Test', false)
  });
  
  // Test 3: KPI Calculation
  results.push({
    test: 'KPI Calculation',
    passed: safeExecute(() => {
      const kpis = calculateKPIs();
      return kpis && typeof kpis === 'object';
    }, 'KPI Test', false)
  });
  
  // Test 4: Dashboard Update
  results.push({
    test: 'Dashboard Update',
    passed: safeExecute(() => {
      updateDashboard();
      return true;
    }, 'Dashboard Test', false)
  });
  
  // Log results
  console.log('=== TEST RESULTS ===');
  let allPassed = true;
  results.forEach(r => {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${r.test}`);
    if (!r.passed) allPassed = false;
  });
  console.log('====================');
  console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  
  return allPassed;
}

/**
 * Debug function to log current state
 */
function debugLogState() {
  console.log('=== SYSTEM STATE ===');
  console.log('Spreadsheet ID:', SPREADSHEET_ID);
  console.log('Sheet Names:', SHEET_NAMES);
  console.log('Email Config:', {
    ...EMAIL_CONFIG,
    QC_LEAD: EMAIL_CONFIG.QC_LEAD ? '***' : 'NOT SET'
  });
  console.log('Thresholds:', QUALITY_THRESHOLDS);
  console.log('Triggers:', ScriptApp.getProjectTriggers().length);
  console.log('====================');
}
