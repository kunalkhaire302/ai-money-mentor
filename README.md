# 💸 AI Money Mentor

**AI Money Mentor** is an advanced, production-ready financial advisory platform specifically tailored for the Indian market. It bridges the gap between raw financial data and actionable insights by combining a **Next.js 14** frontend with a high-performance **FastAPI** Python backend powered by **XGBoost** Machine Learning models and **SHAP** explainability.

---

## 🚀 Key Features

*   **🤖 ML-Powered Money Health Score:** A 0-100 diagnostic score calculated via an XGBoost regression algorithm. Includes a 6D Radar Chart breakdown and SHAP (SHapley Additive exPlanations) values to tell users *exactly* which financial behaviors are helping or hurting their score.
*   **⚖️ Tax Wizard (Old vs. New Regime):** A robust tax optimization engine calculated for FY 2024-25. Compares income footprints under both regimes using Recharts visualization and highlights optimal deductions (80C, 80D, HRA).
*   **🔥 FIRE Planner:** A dedicated Financial Independence, Retire Early (FIRE) calculator. Projects SIP growth, calculates step-ups, accounts for persistent inflation, and plots your exact crossover point to financial freedom.
*   **🎮 Gamified RPG Progression:** Transforms financial discipline into an engaging journey. Users earn "XP" and unlock interactive Framer Motion badges (e.g., *🛡️ Shield Bearer*, *💳 Credit Master*) by maintaining healthy financial habits (like a 6-month emergency fund or 12-month SIP streaks).
*   **🎙️ Voice-Driven AI Mentor:** Push-to-Talk browser microphone interface. The backend features a mocked Deep Learning Speech Emotion Recognition (SER) pipeline that detects stress or hesitation in the user's voice and dynamically routes the LLM to respond with elevated empathy.
*   **📊 "India Stack" Account Aggregator Integration:** A webhook receiver designed to ingest live bank transaction payloads from entities like Sahamati or Setu, automatically triggering proactive LangGraph alerts (e.g., "Your Zomato expenses spiked 20%").
*   **📱 WhatsApp Omnichannel Engine:** An active webhook listener for the Meta/Twilio WhatsApp API. Integrates with FastAPI BackgroundTasks to simulate pushing daily automated portfolio summaries directly to a user's phone.

---

## 🛠️ Architecture & Tech Stack

### Frontend (User Interface)
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript, React 18
*   **Styling**: Tailwind CSS, generic `shadcn/ui` concepts for accessible design
*   **Visualizations**: Recharts (fully patched for SSR Hydration out-of-the-box)
*   **Animations**: Framer Motion (page transitions, micro-interactions, badge unlocks)

### Backend (API, ML & Logic)
*   **Framework**: FastAPI (Python 3.9+)
*   **Machine Learning Pipeline**: XGBoost (Regressor & Classifier) & SHAP
*   **Data Processing**: Pandas, NumPy, Scikit-learn
*   **Testing**: Pytest (Unit testing, dependency mocking)
*   **Agentic Routing Layout**: Prepared for LangGraph / CrewAI integration

---

## ⚡ Quick Start (Local Development)

The project includes an automated launcher script to bind both the frontend and backend simultaneously.

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)

### 1-Click Start (Windows)
1. Open the project root folder in File Explorer.
2. Double-click the `start.bat` file.
3. Two terminal windows will open automatically. Wait a few seconds for the startup to complete.
4. Your platform is now live at: **[http://localhost:3000](http://localhost:3000)**

### Manual Start (Mac/Linux)
You can use the shell script provided in the root directory:
```bash
./start.sh
```

**Or start the services independently in two terminal windows:**

**Terminal 1 (Backend API):**
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*(The API documentation will be available at `http://localhost:8000/docs`)*

**Terminal 2 (Frontend App):**
```bash
cd frontend
npm install
npm run dev
```
*(The visual interface will be available at `http://localhost:3000`)*

---

## 📜 Compliance Notice
This project enforces SEBI (Securities and Exchange Board of India) "Not Investment Advice" disclaimers sitewide. The platform utilizes algorithmic data strictly for educational guidance.

---

*Built with precision for the modern Indian Retail Investor.*
