<div align="center">

# 💸 AI Money Mentor

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-FF6600?style=for-the-badge&logo=python&logoColor=white)](https://xgboost.readthedocs.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br/>

> **🏆 Hackathon Submission — Redefining Personal Finance for 1.4 Billion Indians**

<br/>

---

### 🌟 *What if your money had a mentor who never sleeps, never judges, and always knows the smartest move?*

---

</div>

<br/>

## 📌 Table of Contents

- [🎯 Problem Statement](#-problem-statement)
- [💡 Our Solution](#-our-solution)
- [🚀 Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🔮 Roadmap](#-roadmap)
- [📜 Compliance](#-compliance)
- [👥 Team](#-team)

<br/>

---

## 🎯 Problem Statement

> **95% of Indians have no access to personalized financial advice.**

The average Indian retail investor faces:
- 📉 No visibility into their **financial health**
- 🧾 Confusion between **Old vs. New Tax Regimes**
- 🔥 Zero access to **FIRE planning** tools built for Indian markets
- 😰 Emotional decision-making during **market stress**
- 📲 A financial advisor who is **never available on WhatsApp at 11 PM**

**AI Money Mentor fixes all of this. In one platform.**

<br/>

---

## 💡 Our Solution

**AI Money Mentor** is a production-ready, full-stack financial advisory platform tailored for the Indian market. It bridges the gap between raw financial data and actionable insights using:

- 🤖 **Machine Learning** (XGBoost + SHAP) for explainable financial scoring
- 🧠 **LLM-powered AI mentoring** with empathy-driven voice routing
- 🇮🇳 **India-first design** — UPI, India Stack, SEBI compliance, ₹-native calculations
- 🎮 **Gamification** to make financial discipline *fun and sticky*

<br/>

---

## 🚀 Key Features

<br/>

### 🤖 ML-Powered Money Health Score
> *Know exactly where you stand — and why.*

- Calculates a **0–100 diagnostic score** using an **XGBoost Regression model**
- Beautiful **6-Dimension Radar Chart** breakdown (Savings, Debt, Insurance, Investment, etc.)
- **SHAP (SHapley Additive exPlanations)** values reveal *exactly* which financial behaviors are helping or hurting your score
- No black-box AI — full **explainability** for every user

<br/>

### ⚖️ Tax Wizard — Old vs. New Regime
> *Stop guessing. Start optimizing.*

- Comprehensive tax engine for **FY 2024-25**
- Side-by-side **regime comparison** with Recharts visualization
- Highlights optimal deductions: **80C, 80D, HRA** and more
- Instantly tells you **which regime saves more money** and by how much

<br/>

### 🔥 FIRE Planner
> *Your roadmap to Financial Independence, Retire Early.*

- Personalized **SIP growth projections** with step-up calculations
- Accounts for **persistent Indian inflation** in all projections
- Plots your exact **financial freedom crossover point** on an interactive timeline
- Built specifically for Indian instruments: Mutual Funds, PPF, NPS

<br/>

### 🎮 Gamified RPG Financial Progression
> *Level up your finances like a game.*

| Badge | Trigger Condition | XP Reward |
|-------|-------------------|-----------|
| 🛡️ Shield Bearer | 6-month emergency fund maintained | +500 XP |
| 💳 Credit Master | Credit utilization < 30% for 90 days | +400 XP |
| 📈 SIP Sensei | 12-month SIP streak | +750 XP |
| 🔥 FIRE Starter | FIRE corpus > 25% funded | +1000 XP |
| 🧾 Tax Ninja | Tax regime optimized | +300 XP |

- Animated badge unlocks powered by **Framer Motion**
- Progress bars, XP counters, and level milestones keep users engaged long-term

<br/>

### 🎙️ Voice-Driven AI Mentor
> *Because sometimes you need to talk about money.*

- **Push-to-Talk** browser microphone interface
- Deep Learning **Speech Emotion Recognition (SER)** pipeline detects stress, hesitation, or anxiety
- Dynamically routes the LLM to respond with **elevated empathy** when financial stress is detected
- Feels less like a chatbot, more like a trusted advisor

<br/>

### 📊 India Stack Account Aggregator Integration
> *Real data. Real insights. Zero manual entry.*

- **Webhook receiver** designed to ingest live bank transaction payloads from **Sahamati / Setu**
- Auto-triggers **proactive LangGraph alerts** such as:
  - *"Your Zomato expenses spiked 20% this month 🍕"*
  - *"EMI payment due in 3 days — ensure funds availability 💰"*
- Fully compliant with the **RBI Account Aggregator framework**

<br/>

### 📱 WhatsApp Omnichannel Engine
> *Your financial mentor, now on WhatsApp.*

- Active **webhook listener** for Meta / Twilio WhatsApp API
- **FastAPI BackgroundTasks** push automated daily portfolio summaries
- Users get financial nudges at the right time, on the platform they already use daily
- Supports **Hindi + English** bilingual interactions

<br/>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACES                      │
│   🌐 Next.js Web App  │  📱 WhatsApp  │  🎙️ Voice UI   │
└────────────┬───────────────────┬───────────┬────────────┘
             │                   │           │
             ▼                   ▼           ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  ML Engine   │  │  Tax Engine  │  │  FIRE Engine │  │
│  │  XGBoost     │  │  FY 2024-25  │  │  SIP + CAGR  │  │
│  │  + SHAP      │  │  Old vs New  │  │  Projector   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  SER Voice   │  │  LangGraph   │  │  WhatsApp    │  │
│  │  Emotion AI  │  │  Agentic     │  │  Webhook     │  │
│  │  Pipeline    │  │  Router      │  │  Engine      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  India Stack │ │   LLM API    │ │   Database   │
    │  Sahamati /  │ │  (Empathic   │ │  User State  │
    │  Setu AA     │ │   Routing)   │ │  + XP/Badges │
    └──────────────┘ └──────────────┘ └──────────────┘
```

<br/>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | Core framework with SSR & SSG |
| **TypeScript + React 18** | Type-safe, concurrent UI |
| **Tailwind CSS** | Utility-first responsive styling |
| **Recharts** | SSR-safe financial data visualization |
| **Framer Motion** | Badge animations & page transitions |
| **shadcn/ui** | Accessible, composable UI components |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** (Python 3.9+) | High-performance async REST API |
| **XGBoost** | ML model for Money Health Score |
| **SHAP** | Explainability for ML predictions |
| **Pandas + NumPy** | Financial data processing |
| **Scikit-learn** | ML pipeline & preprocessing |
| **Pytest** | Unit testing with dependency mocking |
| **LangGraph / CrewAI** | Agentic AI routing (integration-ready) |

<br/>

---

## ⚡ Quick Start

### Prerequisites
```
✅ Node.js v18+
✅ Python 3.9+
✅ npm or yarn
```

### 🪟 Windows — One Click Launch

```
1. Open the project root in File Explorer
2. Double-click  ▶️  start.bat
3. Wait ~10 seconds for both services to boot
4. Visit: http://localhost:3000  🎉
```

### 🐧 Mac / Linux — One Command Launch

```bash
# Make the script executable and run
chmod +x start.sh && ./start.sh
```

### 🔧 Manual Setup (All Platforms)

**Terminal 1 — Start the Backend API:**
```bash
cd backend
pip install -r requirements.txt
python main.py
# API docs live at: http://localhost:8000/docs
```

**Terminal 2 — Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
# App live at: http://localhost:3000
```

<br/>

---

## 🔮 Roadmap

```
✅ Phase 1 — Core ML Engine + Tax Wizard + FIRE Planner
✅ Phase 2 — Gamification + Voice AI + WhatsApp Integration
✅ Phase 3 — India Stack Account Aggregator Webhooks
🔄 Phase 4 — UPI Transaction Auto-Categorization
🔄 Phase 5 — Multi-language Support (Hindi, Tamil, Telugu, Marathi)
🔄 Phase 6 — SEBI-Registered Advisory Mode (live investment suggestions)
🔄 Phase 7 — Vernacular Voice Support (regional Indian languages)
```

<br/>

---

## 📜 Compliance & Disclaimers

> ⚠️ **SEBI Compliance Notice**

This platform enforces **SEBI (Securities and Exchange Board of India)** *"Not Investment Advice"* disclaimers sitewide. All ML-generated insights, scores, and recommendations are strictly for **educational and informational purposes only**.

- 🔒 No user financial data is sold or shared with third parties
- 📋 RBI Account Aggregator framework guidelines are followed
- 🛡️ All data processing is compliant with India's **DPDP Act 2023**

<br/>

---

## 👥 Team

<div align="center">

| Role | Name |
|------|------|
| 🧠 ML & Backend | *[Your Name]* |
| 🎨 Frontend & UI/UX | *[Teammate Name]* |
| 📊 Data & Finance Domain | *[Teammate Name]* |
| 🚀 DevOps & Integration | *[Teammate Name]* |

</div>

<br/>

---

<div align="center">

### 💬 *"Financial freedom isn't a privilege. With AI Money Mentor, it's a plan."*

<br/>

**⭐ Star this repo if you believe every Indian deserves a world-class financial mentor ⭐**

<br/>

[![Made with ❤️ for Bharat](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F%20for-Bharat-FF9933?style=for-the-badge)](https://github.com/)
[![SEBI Compliant](https://img.shields.io/badge/SEBI-Compliant-138808?style=for-the-badge)](https://sebi.gov.in/)
[![India Stack](https://img.shields.io/badge/India%20Stack-Integrated-0080FF?style=for-the-badge)](https://sahamati.org.in/)

</div>