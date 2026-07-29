/**
 * ================================================================
 * QC SYSTEM CONFIGURATION v2.1
 * ================================================================
 * 
 * SIMPLIFIED STRUCTURE:
 * - ONE spreadsheet with multiple tabs
 * - Each form connects to its own tab
 * - Keyword-based tab detection (flexible naming)
 * 
 * ================================================================
 */

// ═══════════════════════════════════════════════════════════════
// SPREADSHEET CONFIGURATION (SINGLE SPREADSHEET)
// ═══════════════════════════════════════════════════════════════

/**
 * Your Google Spreadsheet ID
 * 
 * This is the ONLY spreadsheet you need!
 * All forms connect to tabs within this spreadsheet.
 * 
 * Find it in URL: https://docs.google.com/spreadsheets/d/[THIS_PART]/edit
 */
const SPREADSHEET_ID = '[YOUR_SPREADSHEET_ID]';

/**
 * Tab detection keywords
 * 
 * When a form connects, Google creates a tab like:
 * "Lecture Observation Form (Responses)"
 * 
 * The script finds tabs by searching for these keywords.
 * This means you DON'T need exact tab names!
 */
const TAB_KEYWORDS = {
  LECTURES: ['lecture', 'observation'],
  ASSESSMENTS: ['assessment', 'exam', 'quiz'],
  RESEARCH: ['research', 'project'],
  FEEDBACK: ['feedback', 'student'],
  ACTIONS: ['action', 'tracker', 'issue']
};

/**
 * Tabs that script creates automatically
 * These store calculated data
 */
const AUTO_TABS = {
  SCORES: 'Summary_Scores',
  DASHBOARD: 'Dashboard_Data'
};

// ═══════════════════════════════════════════════════════════════
// DEPARTMENT LEAD (SINGLE LOGIN)
// ═══════════════════════════════════════════════════════════════

/**
 * Department Lead Email
 * This is the ONLY person with system access
 */
const LEAD_EMAIL = '[YOUR_LEAD_EMAIL]';

// ═══════════════════════════════════════════════════════════════
// FACULTY EMAIL LIST
// ═══════════════════════════════════════════════════════════════

/**
 * Faculty email mapping
 * 
 * Names MUST match what appears in form dropdown!
 * Bot sends personalized reports to each faculty.
 */
const FACULTY_EMAILS = {
  "Dr. Smith": "smith@university.edu",
  "Dr. Jones": "jones@university.edu",
  "Prof. Williams": "williams@university.edu",
  "Dr. Brown": "brown@university.edu",
  "Prof. Taylor": "taylor@university.edu",
  "Dr. Davis": "davis@university.edu",
  "Prof. Wilson": "wilson@university.edu",
  "Prof. Johnson": "johnson@university.edu"
  // Add your faculty here
};

// ═══════════════════════════════════════════════════════════════
// EMAIL BOT SETTINGS
// ═══════════════════════════════════════════════════════════════

const EMAIL_SETTINGS = {
  SEND_IMMEDIATE_REPORTS: true,
  SEND_WEEKLY_SUMMARY: true,
  SEND_MONTHLY_REPORT: true,
  SENDER_NAME: 'QC Automation System',
  CC_LEAD_ON_REPORTS: true,
  SEND_LOW_SCORE_ALERTS: true,
  LOW_SCORE_THRESHOLD: 60
};

// ═══════════════════════════════════════════════════════════════
// SCORING CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/**
 * Keywords to identify score/rating columns
 * Columns with these words are summed for total score
 */
const SCORE_KEYWORDS = ['score', 'rating', 'quality', '(1-5)', 'scale'];

/**
 * Points per question (linear scale max)
 */
const POINTS_PER_QUESTION = 5;

/**
 * Score thresholds (percentage)
 */
const THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  SATISFACTORY: 70,
  NEEDS_IMPROVEMENT: 60,
  POOR: 0
};

// ═══════════════════════════════════════════════════════════════
// COLUMN DETECTION KEYWORDS
// ═══════════════════════════════════════════════════════════════

const COLUMN_KEYWORDS = {
  INSTRUCTOR: ['instructor', 'faculty', 'professor', 'teacher'],
  COURSE: ['course', 'class', 'subject'],
  DATE: ['date', 'when'],
  TOPIC: ['topic', 'lesson']
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get the main spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Find a tab by keywords
 * @param {string} type - Tab type (LECTURES, ASSESSMENTS, etc.)
 * @returns {Sheet|null}
 */
function findTab(type) {
  const keywords = TAB_KEYWORDS[type];
  if (!keywords) return null;
  
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  
  for (const sheet of sheets) {
    const name = sheet.getName().toLowerCase();
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) {
        return sheet;
      }
    }
  }
  
  return null;
}

/**
 * Get or create auto-generated tab
 * @param {string} tabName - Tab name from AUTO_TABS
 * @returns {Sheet}
 */
function getOrCreateTab(tabName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(tabName);
  
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    Logger.log('Created tab: ' + tabName);
  }
  
  return sheet;
}

/**
 * Get scores tab (auto-create if needed)
 */
function getScoresTab() {
  const sheet = getOrCreateTab(AUTO_TABS.SCORES);
  
  // Add headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Faculty', 'Course', 'Score', 'Max', 'Percentage', 'Status', 'Form Type']);
    const header = sheet.getRange(1, 1, 1, 8);
    header.setFontWeight('bold');
    header.setBackground('#2563eb');
    header.setFontColor('#ffffff');
  }
  
  return sheet;
}

/**
 * Get faculty email by name
 */
function getFacultyEmail(name) {
  if (!name) return null;
  
  // Exact match
  if (FACULTY_EMAILS[name]) return FACULTY_EMAILS[name];
  
  // Case-insensitive match
  const lowerName = name.toLowerCase().trim();
  for (const [facultyName, email] of Object.entries(FACULTY_EMAILS)) {
    if (facultyName.toLowerCase().trim() === lowerName) {
      return email;
    }
  }
  
  // Partial match
  for (const [facultyName, email] of Object.entries(FACULTY_EMAILS)) {
    if (lowerName.includes(facultyName.toLowerCase()) || 
        facultyName.toLowerCase().includes(lowerName)) {
      return email;
    }
  }
  
  return null;
}

/**
 * Check if column header is a score column
 */
function isScoreColumn(headerName) {
  if (!headerName) return false;
  const lower = headerName.toLowerCase();
  return SCORE_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Get status based on percentage
 */
function getScoreStatus(percentage) {
  if (percentage >= THRESHOLDS.EXCELLENT) return { status: 'Excellent', emoji: '🌟', color: '#16a34a' };
  if (percentage >= THRESHOLDS.GOOD) return { status: 'Good', emoji: '✅', color: '#22c55e' };
  if (percentage >= THRESHOLDS.SATISFACTORY) return { status: 'Satisfactory', emoji: '👍', color: '#f59e0b' };
  if (percentage >= THRESHOLDS.NEEDS_IMPROVEMENT) return { status: 'Needs Improvement', emoji: '⚠️', color: '#f97316' };
  return { status: 'Poor', emoji: '❌', color: '#dc2626' };
}

/**
 * Find column index by keywords
 */
function findColumnIndex(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const lower = (headers[i] || '').toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) return i;
    }
  }
  return -1;
}

/**
 * Identify form type from sheet name
 */
function identifyFormType(sheetName) {
  const lower = sheetName.toLowerCase();
  
  for (const [type, keywords] of Object.entries(TAB_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return type;
    }
  }
  
  return 'UNKNOWN';
}

/**
 * Verify configuration
 */
function verifyConfiguration() {
  Logger.log('=== CONFIGURATION CHECK ===');
  
  try {
    const ss = getSpreadsheet();
    Logger.log('✅ Spreadsheet: ' + ss.getName());
    
    Logger.log('📋 Tabs found:');
    ss.getSheets().forEach(sheet => {
      Logger.log('   - ' + sheet.getName());
    });
    
    Logger.log('👥 Faculty configured: ' + Object.keys(FACULTY_EMAILS).length);
    Logger.log('📧 Lead email: ' + LEAD_EMAIL);
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.message);
  }
  
  Logger.log('=== CHECK COMPLETE ===');
}
