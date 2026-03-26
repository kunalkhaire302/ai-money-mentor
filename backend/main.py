"""
AI Money Mentor — FastAPI Backend
Production-ready API for financial health scoring, tax optimization, and FIRE planning.
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, model_validator

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import engine, Base, get_db
from models_db import UserDB
import auth
import reports
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

# Load environment variables
load_dotenv()

# Startup Secrets Validation (Fail-Fast)
REQUIRED_ENV_VARS = [
    "JWT_SECRET_KEY",
    "LLM_API_KEY",
    "TWILIO_AUTH_TOKEN", 
    "WHATSAPP_TOKEN",
    "WEBHOOK_SECRET"
]

missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_vars:
    # Temporarily bypass during local build generation if needed, but raise heavily.
    # In a full strict production, we could raise RuntimeError, but since the user
    # might not have set them yet during this deployment phase, we just log a massive warning.
    # Wait, the prompt specifically says: "raise a clear error if any required env var is missing"
    raise RuntimeError(f"🚨 FATAL: Missing extremely critical Environment Variables: {', '.join(missing_vars)}")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_money_mentor")

# Paths
MODEL_DIR = Path(__file__).parent / "models"
REG_PATH = str(MODEL_DIR / "regressor.json")
CLF_PATH = str(MODEL_DIR / "classifier.json")
META_PATH = str(MODEL_DIR / "metadata.joblib")

# Global scorer instance
scorer = None

# --- Scheduler Setup ---
scheduler = AsyncIOScheduler()

async def weekly_report_task():
    """Triggered every Sunday 8 AM to process user reports."""
    logger.info("📅 [CRON] Starting weekly PDF report generation for all users...")
    # Mocked iteration
    # reports.generate_weekly_report("demo_user", {"score": 750, "tier": "Gold"}, "reports/weekly_summary.pdf")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Train models on startup if they don't exist, then load the scorer."""
    global scorer
    
    # Initialize SQLite Database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if not MODEL_DIR.exists() or not (MODEL_DIR / "regressor.json").exists():
        logger.info("🏋️ Model artifacts not found. Training from synthetic data...")
        from train_model import train_and_save_models
        train_and_save_models()
    
    logger.info("📦 Loading FinancialHealthScorer...")
    from scorer import FinancialHealthScorer
    scorer = FinancialHealthScorer(REG_PATH, CLF_PATH, META_PATH)
    logger.info("✅ Scorer loaded. API is ready!")
    
    # Start Scheduler
    scheduler.add_job(weekly_report_task, CronTrigger(day_of_week='sun', hour=8, minute=0))
    scheduler.start()
    logger.info("⏰ APScheduler started (Sunday 8 AM job configured).")
    
    yield
    # Shutdown
    scheduler.shutdown()
    logger.info("⏰ APScheduler shutdown clean.")

app = FastAPI(
    title="AI Money Mentor API",
    description="ML-powered financial health scoring, tax optimization, and FIRE planning for the Indian market.",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate Limiter Initialization
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

# Include advanced routers
from advanced import router as advanced_router
app.include_router(advanced_router)

# ─── Auth Endpoints ──────────────────────────────────────────────────────────────

@app.post("/auth/register")
async def register_user(user_data: dict, db: AsyncSession = Depends(get_db)):
    username = user_data.get("username")
    password = user_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
        
    query = select(UserDB).where(UserDB.username == username)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = auth.get_password_hash(password)
    new_user = UserDB(username=username, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "User registered successfully"}

@app.post("/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    query = select(UserDB).where(UserDB.username == form_data.username)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

class FinancialProfileInput(BaseModel):
    age: int = Field(..., ge=18, le=75)
    annual_income_lpa: float = Field(..., ge=1.0, le=500.0)
    monthly_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)
    savings_rate: float = Field(0.0, ge=0.0, le=1.0)
    emergency_fund_months: float = Field(..., ge=0, le=36)
    debt_to_income_ratio: float = Field(..., ge=0.0, le=1.0)
    credit_utilisation: float = Field(..., ge=0.0, le=1.0)
    
    has_home_loan: bool = False
    has_car_loan: bool = False
    has_personal_loan: bool = False
    has_credit_card_debt: bool = False
    has_term_insurance: bool = False
    has_health_insurance: bool = False
    invests_in_mf: bool = False
    invests_in_stocks: bool = False
    invests_in_fd: bool = False
    invests_in_ppf_nps: bool = False
    invests_in_gold: bool = False
    has_epf: bool = False
    
    monthly_sip: float = Field(0.0, ge=0)
    total_portfolio_value: float = Field(0.0, ge=0)
    equity_allocation_pct: float = Field(0.0, ge=0, le=100)
    
    term_cover_multiple: float = Field(0.0, ge=0)
    health_cover_lakhs: float = Field(0.0, ge=0)
    epf_corpus: float = Field(0.0, ge=0)
    retirement_corpus_pct: float = Field(0.0, ge=0)

    @model_validator(mode="after")
    def check_expenses(self):
        if self.monthly_expenses > self.monthly_income * 1.5:
            raise ValueError("monthly_expenses cannot exceed 1.5x of monthly_income (extreme debt trap protection)")
        return self


class TaxWizardRequest(BaseModel):
    gross_income: float = Field(ge=0, description="Annual gross income in ₹")
    hra_exemption: float = Field(0, ge=0)
    section_80c: float = Field(0, ge=0, le=150000)
    section_80d: float = Field(0, ge=0, le=75000)
    home_loan_interest: float = Field(0, ge=0, le=200000)
    nps_80ccd: float = Field(0, ge=0, le=50000)
    other_deductions: float = Field(0, ge=0)


class FirePlannerRequest(BaseModel):
    current_age: int = Field(30, ge=18, le=65)
    retirement_age: int = Field(50, ge=30, le=70)
    monthly_expenses: float = Field(50000, ge=5000)
    monthly_sip: float = Field(20000, ge=0)
    current_corpus: float = Field(0, ge=0)
    expected_return_pct: float = Field(12.0, ge=1, le=30)
    annual_step_up_pct: float = Field(10.0, ge=0, le=50)
    inflation_rate_pct: float = Field(6.0, ge=0, le=15)


# ─── API Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "AI Money Mentor API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/health-score",
            "/api/tax-wizard",
            "/api/fire-planner",
            "/api/mf-xray",
        ],
        "disclaimer": "AI Analysis — Not Investment Advice. Consult a SEBI-registered advisor."
    }


@app.post("/api/health-score")
@limiter.limit("10/minute")
async def get_health_score(request: Request, profile: FinancialProfileInput, current_user: str = Depends(auth.get_current_user)):
    """Score a user's financial health using XGBoost + SHAP."""
    try:
        if scorer is None:
            raise HTTPException(status_code=503, detail="Model not loaded yet. Please wait.")
        
        result = scorer.score(profile.model_dump())
        return result
    except Exception as e:
        logger.error(f"Health score error: {e}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


@app.post("/api/tax-wizard")
async def get_tax_comparison(request: TaxWizardRequest, current_user: str = Depends(auth.get_current_user)):
    """Compare Old vs New tax regime."""
    try:
        from tax_engine import compare_tax_regimes
        result = compare_tax_regimes(request.model_dump())
        return result
    except Exception as e:
        logger.error(f"Tax wizard error: {e}")
        raise HTTPException(status_code=500, detail=f"Tax computation failed: {str(e)}")


@app.post("/api/fire-planner")
async def get_fire_plan(request: FirePlannerRequest, current_user: str = Depends(auth.get_current_user)):
    """Project FIRE corpus growth and milestones."""
    try:
        from fire_engine import compute_fire_plan
        result = compute_fire_plan(request.model_dump())
        return result
    except Exception as e:
        logger.error(f"FIRE planner error: {e}")
        raise HTTPException(status_code=500, detail=f"FIRE calculation failed: {str(e)}")


@app.post("/api/mf-xray")
async def analyze_mf_statement(file: UploadFile = File(...)):
    """Parse and analyze a CAMS/KFintech mutual fund statement PDF."""
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
        
        # Read PDF
        import pdfplumber
        import io

        content = await file.read()
        pdf = pdfplumber.open(io.BytesIO(content))
        
        extracted_text = ""
        tables = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
            page_tables = page.extract_tables()
            if page_tables:
                tables.extend(page_tables)
        
        pdf.close()

        # Parse fund data from tables (simplified)
        funds = []
        if tables:
            for table in tables[:10]:
                for row in table:
                    if row and len(row) >= 3:
                        funds.append({
                            'name': str(row[0] or '').strip(),
                            'value': str(row[-1] or '').strip(),
                        })

        return {
            'filename': file.filename,
            'pages_parsed': len(pdf.pages) if hasattr(pdf, 'pages') else 0,
            'text_length': len(extracted_text),
            'funds_found': len(funds),
            'funds': funds[:20],
            'raw_text_preview': extracted_text[:500],
            'analysis': {
                'note': 'Full XIRR and overlap analysis requires structured CAMS/KFintech statement format.',
                'tip': 'Upload your Consolidated Account Statement (CAS) from CAMS or KFintech for detailed analysis.'
            },
            'disclaimer': 'AI Analysis — Not Investment Advice. Consult a SEBI-registered advisor.'
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MF X-Ray error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
