/**
 * ================================================================
 * API ENDPOINT v2.4
 * ================================================================
 * 
 * This file provides the doGet() function that the dashboard
 * calls to fetch live data from the spreadsheet.
 * 
 * The dashboard calls:
 *   https://script.google.com/macros/s/.../exec?action=getData
 * 
 * This function reads the Summary_Scores tab and form tabs,
 * and returns JSON that the dashboard can display.
 * 
 * IMPORTANT: After pasting this file into Apps Script, you must
 * redeploy the Web App for changes to take effect:
 *   Deploy → Manage deployments → Edit → New version → Deploy
 * 
 * ================================================================
 */

/**
 * Handle GET requests from the dashboard
 * This is the ONLY function the dashboard calls
 */
function doGet(e) {
  try {
    var result = getAllData();
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('API Error: ' + error.message);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.message,
        scores: [],
        recentObservations: [],
        facultyStats: {},
        lastUpdated: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gather all data for the dashboard
 * Returns one JSON object with everything the dashboard needs
 */
function getAllData() {
  var scores = getScoresData();
  var recentObservations = getRecentData();
  var facultyStats = buildFacultyStats(scores);
  
  return {
    scores: scores,
    recentObservations: recentObservations,
    facultyStats: facultyStats,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Read all rows from Summary_Scores tab
 */
function getScoresData() {
  var sheet = getScoresTab();
  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);
  
  return rows.map(function(row) {
    return {
      date: row[0] ? new Date(row[0]).toISOString() : '',
      faculty: row[1] || '',
      course: row[2] || '',
      score: Number(row[3]) || 0,
      maxScore: Number(row[4]) || 0,
      percentage: String(row[5] || '0%'),
      status: row[6] || '',
      formType: row[7] || ''
    };
  });
}

/**
 * Read last 20 scores as recent observations
 */
function getRecentData() {
  var sheet = getScoresTab();
  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }
  
  var data = sheet.getDataRange().getValues();
  var rows = data.slice(1);
  
  // Get last 20 rows, newest first
  var recent = rows.slice(-20).reverse();
  
  return recent.map(function(row) {
    return {
      date: row[0] ? new Date(row[0]).toISOString() : '',
      faculty: row[1] || '',
      course: row[2] || '',
      score: Number(row[3]) || 0,
      max: Number(row[4]) || 0,
      percentage: String(row[5] || '0%'),
      status: row[6] || '',
      formType: row[7] || ''
    };
  });
}

/**
 * Build per-faculty statistics from scores array
 */
function buildFacultyStats(scores) {
  var stats = {};
  
  scores.forEach(function(s) {
    var name = s.faculty;
    if (!name) return;
    
    if (!stats[name]) {
      stats[name] = {
        totalScore: 0,
        totalMax: 0,
        count: 0,
        scores: []
      };
    }
    
    stats[name].totalScore += s.score;
    stats[name].totalMax += s.maxScore;
    stats[name].count++;
    stats[name].scores.push({
      date: s.date,
      course: s.course,
      score: s.score,
      max: s.maxScore,
      percentage: s.percentage
    });
  });
  
  // Calculate averages
  Object.keys(stats).forEach(function(name) {
    var s = stats[name];
    s.averageScore = Math.round(s.totalScore / s.count);
    s.averageMax = Math.round(s.totalMax / s.count);
    s.averagePercentage = s.totalMax > 0 
      ? Math.round((s.totalScore / s.totalMax) * 100) 
      : 0;
  });
  
  return stats;
}
