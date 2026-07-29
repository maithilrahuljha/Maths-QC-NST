/**
 * ================================================================
 * DYNAMIC DATA PROCESSOR v2.1
 * ================================================================
 * 
 * Handles form submissions from ANY tab in the spreadsheet.
 * Identifies form type by tab name keywords.
 * Works with flexible form structures.
 * 
 * ================================================================
 */

/**
 * Main form submission handler
 * Triggered when ANY form submits to ANY tab
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    const row = e.values;
    
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('📥 Form submission received');
    Logger.log('📋 Tab: ' + sheetName);
    
    // Identify form type from tab name
    const formType = identifyFormType(sheetName);
    Logger.log('📝 Form type: ' + formType);
    
    // Get headers dynamically
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Calculate score
    const scoreResult = calculateTotalScore(row, headers);
    Logger.log(`📊 Score: ${scoreResult.total}/${scoreResult.maxPossible} (${scoreResult.percentage}%)`);
    
    // Extract key info
    const data = extractSubmissionData(row, headers);
    data.formType = formType;
    Logger.log('👤 Faculty: ' + (data.instructor || 'N/A'));
    
    // Save to scores tab
    saveScore(data.instructor, scoreResult, data);
    
    // Send email if faculty observation
    if (formType === 'LECTURES' || formType === 'ASSESSMENTS' || formType === 'FEEDBACK') {
      if (EMAIL_SETTINGS.SEND_IMMEDIATE_REPORTS && data.instructor) {
        sendObservationReport(data.instructor, {
          course: data.course,
          date: data.date,
          score: scoreResult,
          details: data.details,
          formType: formType
        });
      }
      
      // Alert for low scores
      if (EMAIL_SETTINGS.SEND_LOW_SCORE_ALERTS && 
          scoreResult.percentage < EMAIL_SETTINGS.LOW_SCORE_THRESHOLD) {
        sendLowScoreAlert(data.instructor, scoreResult, data);
      }
    }
    
    Logger.log('✅ Processing complete');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    sendErrorNotification(error);
  }
}

/**
 * Calculate total score from linear scale columns
 * Score is SUM of all ratings (out of 25 if 5 questions)
 */
function calculateTotalScore(row, headers) {
  let total = 0;
  let count = 0;
  let maxPossible = 0;
  const breakdown = [];
  
  headers.forEach((header, index) => {
    if (isScoreColumn(header)) {
      const value = parseFloat(row[index]);
      
      if (!isNaN(value) && value >= 1 && value <= 5) {
        total += value;
        count++;
        maxPossible += POINTS_PER_QUESTION;
        
        breakdown.push({
          question: header,
          score: value,
          max: POINTS_PER_QUESTION
        });
      }
    }
  });
  
  const percentage = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
  
  return {
    total: total,
    count: count,
    maxPossible: maxPossible,
    percentage: Math.round(percentage * 10) / 10,
    status: getScoreStatus(percentage),
    breakdown: breakdown
  };
}

/**
 * Extract key information from submission
 */
function extractSubmissionData(row, headers) {
  const instructorIdx = findColumnIndex(headers, COLUMN_KEYWORDS.INSTRUCTOR);
  const courseIdx = findColumnIndex(headers, COLUMN_KEYWORDS.COURSE);
  const dateIdx = findColumnIndex(headers, COLUMN_KEYWORDS.DATE);
  const topicIdx = findColumnIndex(headers, COLUMN_KEYWORDS.TOPIC);
  
  const details = {};
  headers.forEach((header, index) => {
    if (!isScoreColumn(header) && row[index] && header !== 'Timestamp') {
      details[header] = row[index];
    }
  });
  
  return {
    instructor: instructorIdx >= 0 ? row[instructorIdx] : null,
    course: courseIdx >= 0 ? row[courseIdx] : 'Not specified',
    date: dateIdx >= 0 ? row[dateIdx] : new Date().toLocaleDateString(),
    topic: topicIdx >= 0 ? row[topicIdx] : null,
    details: details,
    timestamp: row[0]
  };
}

/**
 * Save score to Summary_Scores tab
 */
function saveScore(facultyName, scoreResult, data) {
  const sheet = getScoresTab();
  
  sheet.appendRow([
    new Date(),
    facultyName || 'Unknown',
    data.course,
    scoreResult.total,
    scoreResult.maxPossible,
    scoreResult.percentage + '%',
    scoreResult.status.status,
    data.formType || 'UNKNOWN'
  ]);
  
  Logger.log('📝 Score saved to Summary_Scores');
}

/**
 * Get all scores for a faculty member
 */
function getFacultyScores(facultyName) {
  const sheet = getScoresTab();
  if (sheet.getLastRow() <= 1) return [];
  
  const data = sheet.getDataRange().getValues().slice(1);
  
  return data
    .filter(row => row[1] === facultyName)
    .map(row => ({
      date: row[0],
      course: row[2],
      score: row[3],
      max: row[4],
      percentage: row[5],
      status: row[6],
      formType: row[7]
    }));
}

/**
 * Get faculty statistics
 */
function getFacultyStats(facultyName) {
  const sheet = getScoresTab();
  if (sheet.getLastRow() <= 1) return {};
  
  const data = sheet.getDataRange().getValues().slice(1);
  const stats = {};
  
  data.forEach(row => {
    const name = row[1];
    if (facultyName && name !== facultyName) return;
    
    if (!stats[name]) {
      stats[name] = { totalScore: 0, totalMax: 0, count: 0, scores: [] };
    }
    
    stats[name].totalScore += parseFloat(row[3]) || 0;
    stats[name].totalMax += parseFloat(row[4]) || 0;
    stats[name].count++;
    stats[name].scores.push({
      date: row[0],
      course: row[2],
      score: row[3],
      max: row[4],
      percentage: row[5]
    });
  });
  
  // Calculate averages
  for (const name of Object.keys(stats)) {
    const s = stats[name];
    s.averageScore = Math.round(s.totalScore / s.count);
    s.averageMax = Math.round(s.totalMax / s.count);
    s.averagePercentage = Math.round((s.totalScore / s.totalMax) * 100);
    s.status = getScoreStatus(s.averagePercentage);
  }
  
  return facultyName ? stats[facultyName] : stats;
}

/**
 * Get recent observations from any form
 */
function getRecentObservations(limit = 10) {
  const scoresSheet = getScoresTab();
  if (scoresSheet.getLastRow() <= 1) return [];
  
  const data = scoresSheet.getDataRange().getValues().slice(1);
  
  return data.slice(-limit).reverse().map(row => ({
    date: row[0],
    faculty: row[1],
    course: row[2],
    score: row[3],
    max: row[4],
    percentage: row[5],
    status: row[6],
    formType: row[7]
  }));
}

/**
 * Send error notification
 */
function sendErrorNotification(error) {
  if (!LEAD_EMAIL || LEAD_EMAIL.includes('[')) return;
  
  try {
    GmailApp.sendEmail(
      LEAD_EMAIL,
      '⚠️ QC System Error',
      `Error: ${error.message}\nTime: ${new Date().toISOString()}`,
      { name: EMAIL_SETTINGS.SENDER_NAME }
    );
  } catch (e) {
    Logger.log('Failed to send error notification');
  }
}

/**
 * Reprocess all historical data
 * Run manually if you change scoring logic
 */
function reprocessAllData() {
  Logger.log('🔄 Reprocessing all data...');
  
  const ss = getSpreadsheet();
  const scoresSheet = getScoresTab();
  
  // Clear scores (except header)
  if (scoresSheet.getLastRow() > 1) {
    scoresSheet.deleteRows(2, scoresSheet.getLastRow() - 1);
  }
  
  // Process each form tab
  let totalProcessed = 0;
  
  for (const [type, keywords] of Object.entries(TAB_KEYWORDS)) {
    const sheet = findTab(type);
    if (!sheet || sheet.getLastRow() <= 1) continue;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const data = sheet.getDataRange().getValues().slice(1);
    
    data.forEach(row => {
      const scoreResult = calculateTotalScore(row, headers);
      const submissionData = extractSubmissionData(row, headers);
      submissionData.formType = type;
      
      saveScore(submissionData.instructor, scoreResult, submissionData);
      totalProcessed++;
    });
  }
  
  Logger.log(`✅ Reprocessed ${totalProcessed} records`);
}
