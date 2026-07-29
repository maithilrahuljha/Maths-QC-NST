# 📊 Mathematics Department QC Automation System

## Flexible Quality Control with Automated Email Reports

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()

---

## 🎯 System Overview

A **flexible** Quality Control automation system for Mathematics Departments that:

- ✅ **Dynamically handles form changes** - Add/remove questions without code changes
- ✅ **Calculates scores out of 25** - Sum of linear scale responses (not scaled to 5)
- ✅ **Single admin access** - Only Department Lead has full access
- ✅ **Automated email reports** - Bot sends QC reports to respective faculty
- ✅ **Secure faculty list** - Email addresses stored in GitHub Secrets
- ✅ **Real-time dashboard** - Visual metrics and trends

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QC AUTOMATION SYSTEM v2.1                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ONE SPREADSHEET                               │   │
│  │                    (QC_System_Data)                              │   │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐      │   │
│  │  │   Tab 1     │   Tab 2     │   Tab 3     │   Tab 4     │ ...  │   │
│  │  │  Lectures   │ Assessments │  Research   │  Feedback   │      │   │
│  │  └──────▲──────┴──────▲──────┴──────▲──────┴──────▲──────┘      │   │
│  │         │             │             │             │              │   │
│  └─────────┼─────────────┼─────────────┼─────────────┼──────────────┘   │
│            │             │             │             │                   │
│  ┌─────────┴───┐ ┌───────┴───┐ ┌───────┴───┐ ┌───────┴───┐             │
│  │   Form 1    │ │  Form 2   │ │  Form 3   │ │  Form 4   │   Form 5    │
│  │  Lecture    │ │Assessment │ │ Research  │ │ Feedback  │   Actions   │
│  │ Observation │ │    QC     │ │    QC     │ │           │             │
│  └─────────────┘ └───────────┘ └───────────┘ └───────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GOOGLE APPS SCRIPT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐                                                    │
│  │  GOOGLE FORMS   │ ◄── Flexible structure (add/remove questions)     │
│  │  (Data Entry)   │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │  GOOGLE SHEETS  │ ◄── Auto-captures all form responses              │
│  │  (Data Storage) │     Headers read dynamically                       │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    GOOGLE APPS SCRIPT                            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │   │
│  │  │ Dynamic     │ │ Score       │ │ Email Bot   │                │   │
│  │  │ Header      │ │ Calculator  │ │ (Gmail)     │                │   │
│  │  │ Reader      │ │ (Out of 25) │ │             │                │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │   │
│  │                         │                │                       │   │
│  │                         ▼                ▼                       │   │
│  │              ┌─────────────────────────────────┐                │   │
│  │              │   Automated QC Reports          │                │   │
│  │              │   → Sent to respective faculty  │                │   │
│  │              │   → Email list from Secrets     │                │   │
│  │              └─────────────────────────────────┘                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐      ┌─────────────────┐                          │
│  │   DASHBOARD     │      │  GITHUB SECRETS │                          │
│  │  (GitHub Pages) │      │  (Faculty List) │                          │
│  │                 │      │                 │                          │
│  │  • KPI Cards    │      │  FACULTY_EMAILS │                          │
│  │  • Trend Charts │      │  = JSON list    │                          │
│  │  • Score /25    │      │                 │                          │
│  └─────────────────┘      └─────────────────┘                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       ACCESS CONTROL                             │   │
│  │                                                                   │   │
│  │   👔 Department Lead    │  Full Access (Single Login)            │   │
│  │   🤖 Email Bot          │  Gmail API (Sends Reports)             │   │
│  │   👁️ Faculty            │  Receives Reports Only (No Login)      │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Scoring System

### How Scores are Calculated

The system uses **linear scale questions** (1-5 each) and calculates a **total score out of 25**.

```
Example: Lecture Observation with 5 rating questions

Question 1: Academic Correctness    → Score: 4
Question 2: Delivery Quality        → Score: 5
Question 3: Student Engagement      → Score: 4
Question 4: Board Work Quality      → Score: 3
Question 5: Pace Management         → Score: 4
                                      ─────────
                            TOTAL:    20 / 25

Percentage: (20/25) × 100 = 80%
```

### Flexible Scoring

- If you have **5 linear scale questions** → Score out of 25
- If you have **4 linear scale questions** → Score out of 20
- If you have **6 linear scale questions** → Score out of 30
- **The system automatically adjusts!**

---

## 🔐 Access Control Model

### Single Login Access

| Role | Access | Description |
|------|--------|-------------|
| **Department Lead** | Full Access | Only person with login credentials. Can view dashboard, edit sheets, manage system |
| **Email Bot** | Gmail API | Automated system that sends reports. No human login. |
| **Faculty** | Email Only | Receive QC reports via email. No system login required. |
| **QC Team** | Form Only | Can submit forms (no login needed for Google Forms) |

### Why Single Login?

- ✅ **Security** - Only one person has access credentials
- ✅ **Accountability** - All changes tracked to one account
- ✅ **Simplicity** - No user management needed
- ✅ **Control** - Lead controls all data and reports

---

## 📧 Email Bot System

### How It Works

1. **Faculty email list** stored securely in GitHub Secrets
2. **Apps Script** reads the faculty list
3. **Bot sends personalized QC reports** to each faculty member
4. **Reports include**: Their scores, observations, action items

### Email Types

| Email Type | Frequency | Recipients |
|------------|-----------|------------|
| Individual QC Report | After each observation | Specific faculty member |
| Weekly Summary | Every Monday | All faculty |
| Alert Notification | Immediate | Faculty with issues |
| Monthly Report | 1st of month | Department Lead |

---

## 📁 File Structure

```
mathematics-qc-system/
│
├── 📄 README.md                    # This file - System documentation
├── 📄 installation.txt             # Complete installation guide
├── 📄 changesmade.txt              # What changed from previous version
│
├── 📁 src/                         # React dashboard source
│   ├── App.tsx                     # Main dashboard
│   ├── components/                 # UI components
│   └── data/                       # Mock data
│
├── 📁 public/
│   ├── 📁 scripts/                 # Google Apps Script files
│   │   ├── config.gs               # Configuration
│   │   ├── dynamicProcessor.gs     # Flexible form handler
│   │   ├── scoreCalculator.gs      # Score out of 25 logic
│   │   ├── emailBot.gs             # Automated email sender
│   │   └── dashboard.gs            # API endpoints
│   │
│   ├── 📁 dashboard/               # Standalone HTML dashboard
│   │   ├── index.html
│   │   ├── style.css
│   │   └── dashboard.js
│   │
│   └── 📁 sample-data/             # Sample CSV files
│
└── 📁 .github/
    └── 📁 workflows/               # (Optional) GitHub Actions
```

---

## ⚙️ Configuration

### GitHub Secrets Required

You must add these secrets to your GitHub repository:

| Secret Name | Value Format | Example |
|-------------|--------------|---------|
| `FACULTY_EMAILS` | JSON object | See below |
| `LEAD_EMAIL` | Email string | `lead@university.edu` |
| `APPS_SCRIPT_URL` | URL string | `https://script.google.com/...` |

### FACULTY_EMAILS Format

```json
{
  "Dr. Smith": "smith@university.edu",
  "Dr. Jones": "jones@university.edu",
  "Prof. Williams": "williams@university.edu",
  "Dr. Brown": "brown@university.edu",
  "Prof. Taylor": "taylor@university.edu"
}
```

---

## 🔧 Key Features

### 1. Dynamic Form Handling

```javascript
// OLD WAY (Rigid) - Required exact column positions
const score = row[6] + row[7] + row[8] + row[9] + row[10];

// NEW WAY (Flexible) - Reads headers dynamically
const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
const scoreColumns = headers.filter(h => h.includes('Score') || h.includes('Rating'));
const score = sumScoreColumns(row, scoreColumns);
```

### 2. Score Out of 25

```javascript
// Finds all linear scale columns (1-5 ratings)
// Sums them for total score
// Does NOT scale down - keeps actual total

function calculateTotalScore(row, headers) {
  let total = 0;
  let maxPossible = 0;
  
  headers.forEach((header, index) => {
    if (isLinearScaleColumn(header)) {
      total += parseInt(row[index]) || 0;
      maxPossible += 5;  // Each linear scale is 1-5
    }
  });
  
  return { total, maxPossible, percentage: (total/maxPossible)*100 };
}
```

### 3. Automated Email Bot

```javascript
// Reads faculty list from config
// Sends personalized reports
// No manual intervention needed

function sendFacultyReport(facultyName, reportData) {
  const facultyEmail = FACULTY_EMAILS[facultyName];
  
  GmailApp.sendEmail({
    to: facultyEmail,
    subject: `QC Report - ${facultyName}`,
    htmlBody: generateReportHTML(reportData)
  });
}
```

---

## 📈 Dashboard Features

### KPI Cards
- **Total Score** displayed as X/25 (not scaled)
- **Percentage** shown alongside
- **Color coding**: Green (80%+), Yellow (60-79%), Red (<60%)

### Charts
- **Trend lines** showing score progression
- **Distribution** of scores
- **Faculty comparison** (anonymized optional)

### Alerts
- **Low scores** flagged automatically
- **Missing submissions** highlighted
- **Overdue actions** shown

---

## 🚀 Quick Start

1. **Read** `installation.txt` for complete setup guide
2. **Create** Google Sheet and Forms
3. **Copy** Apps Script code
4. **Configure** GitHub Secrets
5. **Deploy** Dashboard to GitHub Pages
6. **Test** with sample submission

---

## 📞 Support

- **Installation Issues**: See `installation.txt` Section 9
- **What Changed**: See `changesmade.txt`
- **Technical Help**: Contact IT Support

---

## 📋 Changelog

### Version 2.0.0 (Current)
- ✅ Flexible form structure
- ✅ Scoring out of 25 (not scaled)
- ✅ Single login (Department Lead only)
- ✅ Email bot with Gmail access
- ✅ Faculty list in GitHub Secrets
- ✅ Dynamic header reading

### Version 1.0.0 (Previous)
- Rigid form structure
- Scoring scaled to 5
- Multiple user logins
- Manual email sending

---

<div align="center">

**Mathematics Department QC System v2.0**

Flexible • Automated • Secure

</div>
