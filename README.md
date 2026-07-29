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



<div align="center">

**Mathematics Department QC System v2.0**

Flexible • Automated • Secure

</div>
