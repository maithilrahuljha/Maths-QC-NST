/**
 * ================================================================
 * EMAIL BOT v2.0
 * ================================================================
 * 
 * Automated email system that:
 * - Sends personalized QC reports to faculty
 * - Sends weekly summaries
 * - Sends alerts for low scores
 * - Uses Gmail API via Apps Script
 * 
 * Faculty emails are configured in config.gs
 * No faculty login required - they just receive emails!
 * ================================================================
 */

/**
 * Send observation report to faculty
 * Called after each form submission
 * 
 * @param {string} facultyName - Faculty name
 * @param {Object} reportData - Report data
 */
function sendObservationReport(facultyName, reportData) {
  const facultyEmail = getFacultyEmail(facultyName);
  
  if (!facultyEmail) {
    Logger.log('📧 No email found for: ' + facultyName);
    Logger.log('   Available faculty: ' + Object.keys(FACULTY_EMAILS).join(', '));
    return false;
  }
  
  const subject = `📊 QC Report - ${reportData.course} - ${reportData.date}`;
  const htmlBody = generateObservationReportHTML(facultyName, reportData);
  
  try {
    const emailOptions = {
      htmlBody: htmlBody,
      name: EMAIL_SETTINGS.SENDER_NAME
    };
    
    // CC the lead if enabled
    if (EMAIL_SETTINGS.CC_LEAD_ON_REPORTS && LEAD_EMAIL && !LEAD_EMAIL.includes('[')) {
      emailOptions.cc = LEAD_EMAIL;
    }
    
    GmailApp.sendEmail(facultyEmail, subject, '', emailOptions);
    
    Logger.log('📧 Report sent to: ' + facultyEmail);
    return true;
    
  } catch (error) {
    Logger.log('❌ Email failed: ' + error.message);
    return false;
  }
}

/**
 * Generate HTML for observation report
 */
function generateObservationReportHTML(facultyName, data) {
  const score = data.score;
  const statusColor = score.status.color;
  const percentage = score.percentage;
  
  // Generate score breakdown table
  let breakdownHTML = '';
  if (score.breakdown && score.breakdown.length > 0) {
    breakdownHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="background: #f1f5f9;">
          <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Category</th>
          <th style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">Score</th>
        </tr>
        ${score.breakdown.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.question}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">
              ${item.score} / ${item.max}
            </td>
          </tr>
        `).join('')}
      </table>
    `;
  }
  
  // Generate details section
  let detailsHTML = '';
  if (data.details) {
    const importantDetails = ['Strengths', 'Areas for improvement', 'Recommended action', 'Topic'];
    
    for (const key of importantDetails) {
      // Check various key formats
      const value = data.details[key] || 
                    data.details[key.toLowerCase()] ||
                    data.details[key.replace(/ /g, '_')];
      
      if (value) {
        detailsHTML += `<p><strong>${key}:</strong> ${value}</p>`;
      }
    }
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
      color: white; 
      padding: 30px; 
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0 0;
      opacity: 0.9;
    }
    .content { 
      padding: 30px;
    }
    .score-box { 
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 30px; 
      border-radius: 12px; 
      text-align: center; 
      margin: 20px 0;
      border: 3px solid ${statusColor};
    }
    .score-number { 
      font-size: 56px; 
      font-weight: bold; 
      color: ${statusColor};
      line-height: 1;
    }
    .score-max {
      font-size: 24px;
      color: #64748b;
    }
    .score-percentage {
      font-size: 20px;
      color: ${statusColor};
      margin-top: 10px;
    }
    .score-status { 
      font-size: 18px;
      color: #475569;
      margin-top: 5px;
    }
    .info-box {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }
    .info-box h3 {
      margin: 0 0 15px 0;
      color: #1e40af;
    }
    .details-box {
      background: #fffbeb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #f59e0b;
    }
    .details-box h3 {
      margin: 0 0 15px 0;
      color: #b45309;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #64748b; 
      font-size: 12px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Quality Control Report</h1>
      <p>Observation Feedback</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${facultyName}</strong>,</p>
      
      <p>Here is your Quality Control report for the recent observation:</p>
      
      <div class="score-box">
        <div class="score-number">${score.total}<span class="score-max"> / ${score.maxPossible}</span></div>
        <div class="score-percentage">${percentage}%</div>
        <div class="score-status">${score.status.emoji} ${score.status.status}</div>
      </div>
      
      <div class="info-box">
        <h3>📚 Session Details</h3>
        <p><strong>Course:</strong> ${data.course}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        ${data.sessionType ? `<p><strong>Type:</strong> ${data.sessionType}</p>` : ''}
        ${data.topic ? `<p><strong>Topic:</strong> ${data.topic}</p>` : ''}
      </div>
      
      ${breakdownHTML ? `
      <div class="info-box">
        <h3>📊 Score Breakdown</h3>
        ${breakdownHTML}
      </div>
      ` : ''}
      
      ${detailsHTML ? `
      <div class="details-box">
        <h3>💡 Feedback Details</h3>
        ${detailsHTML}
      </div>
      ` : ''}
      
      <p style="margin-top: 30px;">
        If you have any questions about this report, please contact the QC Lead.
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated message from the QC Automation System.</p>
      <p>© Mathematics Department</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send low score alert
 * @param {string} facultyName - Faculty name
 * @param {Object} scoreResult - Score result
 * @param {Object} submissionData - Submission data
 */
function sendLowScoreAlert(facultyName, scoreResult, submissionData) {
  if (!LEAD_EMAIL || LEAD_EMAIL.includes('[')) return;
  
  const subject = `⚠️ Low Score Alert - ${facultyName} - ${scoreResult.percentage}%`;
  
  const html = `
    <h2>⚠️ Low Score Alert</h2>
    <p>A QC observation has recorded a score below the threshold (${EMAIL_SETTINGS.LOW_SCORE_THRESHOLD}%).</p>
    
    <table border="1" cellpadding="10" style="border-collapse: collapse;">
      <tr><td><strong>Faculty</strong></td><td>${facultyName}</td></tr>
      <tr><td><strong>Course</strong></td><td>${submissionData.course}</td></tr>
      <tr><td><strong>Date</strong></td><td>${submissionData.date}</td></tr>
      <tr><td><strong>Score</strong></td><td style="color: red; font-weight: bold;">${scoreResult.total} / ${scoreResult.maxPossible} (${scoreResult.percentage}%)</td></tr>
    </table>
    
    <p>Please review and take appropriate action.</p>
  `;
  
  try {
    GmailApp.sendEmail(LEAD_EMAIL, subject, '', {
      htmlBody: html,
      name: EMAIL_SETTINGS.SENDER_NAME
    });
    Logger.log('⚠️ Low score alert sent');
  } catch (error) {
    Logger.log('Failed to send alert: ' + error.message);
  }
}

/**
 * Send weekly summary to all faculty
 * Set up as a weekly trigger (Monday morning)
 */
function sendWeeklySummary() {
  Logger.log('📧 Starting weekly summary...');
  
  const stats = getFacultyStats();
  
  if (!stats || Object.keys(stats).length === 0) {
    Logger.log('No data for weekly summary');
    return;
  }
  
  // Send individual summaries to each faculty
  for (const [facultyName, facultyStats] of Object.entries(stats)) {
    const email = getFacultyEmail(facultyName);
    
    if (email) {
      sendFacultyWeeklySummary(facultyName, email, facultyStats);
    }
  }
  
  // Send master summary to lead
  sendLeadWeeklySummary(stats);
  
  Logger.log('✅ Weekly summaries sent');
}

/**
 * Send weekly summary to individual faculty
 */
function sendFacultyWeeklySummary(facultyName, email, stats) {
  const subject = `📊 Weekly QC Summary - ${facultyName}`;
  
  // Get recent scores (last 7 days)
  const recentScores = stats.scores.filter(s => {
    const scoreDate = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return scoreDate >= weekAgo;
  });
  
  if (recentScores.length === 0) {
    Logger.log(`No recent observations for ${facultyName}`);
    return;
  }
  
  let scoresHTML = recentScores.map(s => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${new Date(s.date).toLocaleDateString()}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${s.course}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${s.score}/${s.max}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${s.percentage}</td>
    </tr>
  `).join('');
  
  const html = `
    <h2>📊 Weekly QC Summary</h2>
    <p>Dear ${facultyName},</p>
    <p>Here is your QC summary for the past week:</p>
    
    <h3>📈 Your Observations</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #2563eb; color: white;">
        <th style="padding: 10px; text-align: left;">Date</th>
        <th style="padding: 10px; text-align: left;">Course</th>
        <th style="padding: 10px; text-align: center;">Score</th>
        <th style="padding: 10px; text-align: center;">Percentage</th>
      </tr>
      ${scoresHTML}
    </table>
    
    <div style="background: #f8fafc; padding: 15px; margin-top: 20px; border-radius: 8px;">
      <h3 style="margin-top: 0;">📊 Summary</h3>
      <p><strong>Total Observations:</strong> ${recentScores.length}</p>
      <p><strong>Average Score:</strong> ${stats.averageScore}/${stats.averageMax} (${stats.averagePercentage}%)</p>
      <p><strong>Status:</strong> ${stats.status.emoji} ${stats.status.status}</p>
    </div>
    
    <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
      This is an automated weekly summary from the QC System.
    </p>
  `;
  
  try {
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: html,
      name: EMAIL_SETTINGS.SENDER_NAME
    });
    Logger.log(`📧 Weekly summary sent to ${facultyName}`);
  } catch (error) {
    Logger.log(`Failed to send to ${facultyName}: ${error.message}`);
  }
}

/**
 * Send master weekly summary to department lead
 */
function sendLeadWeeklySummary(allStats) {
  if (!LEAD_EMAIL || LEAD_EMAIL.includes('[')) return;
  
  const subject = '📊 Weekly QC Summary - All Faculty';
  
  // Sort faculty by average percentage
  const sortedFaculty = Object.entries(allStats)
    .sort((a, b) => b[1].averagePercentage - a[1].averagePercentage);
  
  let tableHTML = sortedFaculty.map(([name, stats]) => {
    const color = stats.averagePercentage >= 80 ? '#16a34a' : 
                  stats.averagePercentage >= 60 ? '#f59e0b' : '#dc2626';
    
    return `
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${name}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${stats.count}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${stats.averageScore}/${stats.averageMax}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: ${color}; font-weight: bold;">${stats.averagePercentage}%</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${stats.status.emoji}</td>
      </tr>
    `;
  }).join('');
  
  const html = `
    <h2>📊 Weekly QC Summary - All Faculty</h2>
    <p>Here is the department-wide QC summary for this week:</p>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #1e40af; color: white;">
        <th style="padding: 12px; text-align: left;">Faculty</th>
        <th style="padding: 12px; text-align: center;">Observations</th>
        <th style="padding: 12px; text-align: center;">Avg Score</th>
        <th style="padding: 12px; text-align: center;">Percentage</th>
        <th style="padding: 12px; text-align: center;">Status</th>
      </tr>
      ${tableHTML}
    </table>
    
    <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
      Generated by QC Automation System
    </p>
  `;
  
  try {
    GmailApp.sendEmail(LEAD_EMAIL, subject, '', {
      htmlBody: html,
      name: EMAIL_SETTINGS.SENDER_NAME
    });
    Logger.log('📧 Lead summary sent');
  } catch (error) {
    Logger.log('Failed to send lead summary: ' + error.message);
  }
}

/**
 * Send monthly report
 * Set up as monthly trigger (1st of month)
 */
function sendMonthlyReport() {
  Logger.log('📧 Generating monthly report...');
  
  const stats = getFacultyStats();
  sendLeadWeeklySummary(stats); // Same format, just monthly
  
  Logger.log('✅ Monthly report sent');
}

/**
 * Test email configuration
 * Run this to verify emails work
 */
function testEmailConfiguration() {
  Logger.log('Testing email configuration...');
  
  // Test sending to lead
  if (LEAD_EMAIL && !LEAD_EMAIL.includes('[')) {
    try {
      GmailApp.sendEmail(
        LEAD_EMAIL,
        '✅ QC System Email Test',
        'This is a test email from the QC Automation System.\n\nIf you received this, email is configured correctly!',
        { name: EMAIL_SETTINGS.SENDER_NAME }
      );
      Logger.log('✅ Test email sent to lead: ' + LEAD_EMAIL);
    } catch (error) {
      Logger.log('❌ Failed to send to lead: ' + error.message);
    }
  } else {
    Logger.log('⚠️ Lead email not configured');
  }
  
  // List configured faculty
  Logger.log('📧 Configured faculty:');
  for (const [name, email] of Object.entries(FACULTY_EMAILS)) {
    Logger.log(`   ${name}: ${email}`);
  }
}
