# 🚀 Quick Start Guide

## Mathematics Department QC System - Get Started in 5 Minutes

---

## Overview

This dashboard displays quality control metrics for the Mathematics Department. It shows:
- **Lecture observation scores and trends**
- **Assessment quality metrics**
- **Student feedback analysis**
- **Action item tracking**
- **Research project monitoring**

---

## For Demo Mode (No Setup Required)

The dashboard works immediately with demo data! Simply open the dashboard to see sample metrics.

### What You'll See:
- ✅ KPI cards with current vs. target values
- ✅ Trend charts showing 12-week history
- ✅ Alert notifications for issues
- ✅ Action items table
- ✅ Activity feed

---

## For Production Mode (Connect to Google Sheets)

### Step 1: Create Google Sheets
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Mathematics_QC_Master"
3. Create 8 sheets with these exact names:
   - Dashboard_Summary
   - Lecture_Observations
   - Assessment_QC
   - Research_QC
   - Student_Feedback
   - Action_Items
   - QC_Failures
   - Performance_Trends

### Step 2: Add Headers
Copy headers from the sample CSV files in `/sample-data/` folder.

### Step 3: Deploy Apps Script
1. Open your spreadsheet
2. Go to Extensions → Apps Script
3. Copy code from `/scripts/` folder
4. Deploy as Web App
5. Copy the deployment URL

### Step 4: Configure Dashboard
1. Open `dashboard.js`
2. Find: `API_URL: '[YOUR_APPS_SCRIPT_URL]'`
3. Replace with your deployment URL
4. Set `USE_DEMO_DATA: false`

### Step 5: Create Google Forms
Create 5 forms and link them to your sheets:
- Lecture Observation Form → Lecture_Observations
- Assessment QC Form → Assessment_QC
- Research QC Form → Research_QC
- Student Feedback Form → Student_Feedback
- Action Tracker Form → Action_Items

---

## Dashboard Features

### 📊 KPI Cards
- Real-time metrics with status indicators
- Green = On target
- Yellow = Warning (80-99% of target)
- Red = Below threshold

### 📈 Charts
- Quality Scores Trend (12 weeks)
- Score Distribution (pie chart)
- Error Counts by Week
- Actions Resolved

### 🔔 Alerts
- Critical issues (red)
- Warnings (yellow)
- Auto-generated based on thresholds

### 📋 Action Items
- Sortable by severity
- Overdue highlighting
- Status tracking

---

## File Structure

```
public/
├── README.md              # Full documentation
├── INSTRUCTIONS.txt       # Detailed setup guide
├── QUICK_START.md         # This file
├── dashboard/
│   ├── index.html         # Standalone dashboard
│   ├── style.css          # Dashboard styles
│   └── dashboard.js       # Dashboard logic
├── scripts/
│   ├── config.gs          # Configuration
│   ├── dataProcessor.gs   # Data processing
│   ├── dashboard.gs       # API endpoints
│   ├── emailReports.gs    # Email automation
│   └── automation.gs      # Triggers & backups
└── sample-data/
    ├── lecture_observations_sample.csv
    ├── assessment_qc_sample.csv
    ├── student_feedback_sample.csv
    ├── action_items_sample.csv
    └── research_qc_sample.csv
```

---

## Support

- 📄 Full documentation: [README.md](README.md)
- 📋 Setup instructions: [INSTRUCTIONS.txt](INSTRUCTIONS.txt)
- 📊 Sample data: [sample-data/](sample-data/)

---

## Version

- **Version:** 1.0
- **Last Updated:** January 2026
- **Author:** Mathematics QC Team

---

*Ready to deploy! Follow INSTRUCTIONS.txt for complete setup.*
