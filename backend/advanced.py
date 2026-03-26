from fastapi import APIRouter, File, UploadFile, BackgroundTasks, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import random
import logging
import hashlib
import re
import pdfplumber
import auth

from googletrans import Translator
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

translator = Translator()

logger = logging.getLogger("ai_money_mentor.advanced")
router = APIRouter()

# ─── 1. Gamified Financial Progression ──────────────────────────────────────────

class UserFinancialState(BaseModel):
    emergency_fund_months: float
    sip_streak_months: int
    has_health_insurance: bool
    has_term_insurance: bool
    credit_utilisation: float
    debt_to_income_ratio: float

class GamificationResult(BaseModel):
    level: int
    current_xp: int
    xp_to_next_level: int
    badges_unlocked: List[str]
    recent_xp_gained: int

class RPGEngine:
    @staticmethod
    def calculate_progression(state: dict) -> GamificationResult:
        xp = 0
        badges = []
        recent_gains = 0

        # Rules engine for XP
        if state.get("emergency_fund_months", 0) >= 6:
            xp += 500
            badges.append("🛡️ Shield Bearer (6mo Safety)")
            recent_gains += 500
        
        sip_streak = state.get("sip_streak_months", 0)
        if sip_streak > 0:
            xp += sip_streak * 200
            if sip_streak >= 12:
                badges.append("📈 Consistency King (1yr SIP)")
        
        if state.get("has_health_insurance", False) and state.get("has_term_insurance", False):
            xp += 300
            badges.append("⚕️ Fully Covered")
            
        if state.get("credit_utilisation", 1.0) < 0.3:
            xp += 150
            badges.append("💳 Credit Master")

        # New: Wealth Creator (SIP > 20% of Income)
        monthly_income = state.get("monthly_income", 1)
        if state.get("monthly_sip", 0) / (monthly_income if monthly_income > 0 else 1) > 0.2:
            xp += 400
            badges.append("🚀 Wealth Creator")

        # New: Tax Ninja (Multiple deductions)
        if state.get("section_80c", 0) > 100000 and state.get("section_80d", 0) > 20000:
            xp += 300
            badges.append("🥷 Tax Ninja")

        # Level calculation (e.g., 1000 XP per level)
        level = (xp // 1000) + 1
        xp_to_next = 1000 - (xp % 1000)

        return GamificationResult(
            level=level,
            current_xp=xp,
            xp_to_next_level=xp_to_next,
            badges_unlocked=badges,
            recent_xp_gained=recent_gains
        )

@router.post("/api/gamification")
async def get_progression(state: UserFinancialState, current_user: str = Depends(auth.get_current_user)):
    """Calculate user's RPG level and unlockable badges."""
    return RPGEngine.calculate_progression(state.model_dump())


# ─── 2. Voice-Driven Conversational Mentor (Speech Emotion Recognition) ────────

@router.post("/api/voice-chat")
@limiter.limit("5/minute")
async def voice_chat_endpoint(
    request: Request, 
    audio: UploadFile = File(...), 
    lang: str = Form("en"), 
    current_user: str = Depends(auth.get_current_user)
):
    """Receives audio buffer, performs SER, and routes to LangGraph."""
    
    # 1. Mock Deep Learning SER Pipeline
    # In production, this would pass audio bytes to a model like wav2vec2-emotion
    file_bytes = await audio.read()
    file_size_kb = len(file_bytes) // 1024
    
    # Simulating Emotion Detection based on dummy logic (randomized for demo)
    detected_emotions = ["neutral", "calm", "stressed", "hesitant", "happy"]
    # We heavily weigh 'stressed' or 'hesitant' to trigger the empathetic routing
    emotion_state = random.choices(
        detected_emotions, 
        weights=[0.4, 0.2, 0.25, 0.1, 0.05], 
        k=1
    )[0]
    
    # 2. Mock Speech-to-Text (Simulated Native Language Input)
    # For a real implementation, we'd use OpenAI Whisper or Google Speech-to-Text
    native_transcription = {
        "hi": "मुझे कर्ज मुक्त होने के लिए क्या करना चाहिए?", # Hindi
        "mr": "माझे कर्ज कसे कमी करावे?", # Marathi
        "en": "How can I reduce my debt burden?" # English
    }.get(lang, "How can I reduce my debt burden?")

    # 3. Translate to English for ML/LLM Processing
    english_query = native_transcription
    if lang != "en":
        try:
            translation = translator.translate(native_transcription, dest="en")
            english_query = translation.text
        except Exception as e:
            logger.error(f"Translation error: {e}")
    
    # 4. LangGraph/LLM Logic (Simulated)
    # This would normally call your LangGraph workflow
    ai_response_en = (
        "Based on your profile, your Debt-to-Income ratio is 45%. "
        "I recommend prioritizing the personal loan with 14% interest first. "
        "Try the avalanche method to save ₹12,000 in interest."
    )

    # 5. Translate Back to User's Native Language
    final_output = ai_response_en
    if lang != "en":
        try:
            final_output = translator.translate(ai_response_en, dest=lang).text
        except Exception as e:
            logger.error(f"Back-translation error: {e}")

    return {
        "status": "success",
        "emotion_detected": emotion_state,
        "langgraph_routing_flag": "empathetic_support" if emotion_state in ["stressed", "hesitant"] else "standard_advice",
        "transcription": native_transcription,
        "english_query": english_query,
        "ai_response": final_output,
        "language_used": lang
    }


# ─── 3. Account Aggregator & WhatsApp Webhooks (Schemas) ────────────────────────

class BankTransaction(BaseModel):
    txn_id: str
    amount: float
    type: str = Field(description="CREDIT or DEBIT")
    category: str
    narrative: str
    timestamp: str

class AccountAggregatorPayload(BaseModel):
    user_id: str
    consent_id: str
    FI_data: List[BankTransaction]
    
@router.post("/api/aa-webhook")
async def account_aggregator_webhook(payload: AccountAggregatorPayload, background_tasks: BackgroundTasks):
    """
    Ingests live bank transactions from India Stack AA (e.g. Setu/Sahamati).
    Triggers LangGraph active monitoring.
    """
    # 1. Budget Anomaly Detection (Simulated)
    food_expenses = sum(t.amount for t in payload.FI_data if t.category == "Food" and t.type == "DEBIT")
    
    # 2. Trigger Proactive WhatsApp Alert via Twilio
    if food_expenses > 10000:
        alert_msg = (
            f"🔔 *AI Money Mentor Alert*: Your 'Food & Dining' expenses spiked to ₹{food_expenses:,.0f} "
            "this month. This is 45% higher than your average. Type 'Optimize' to reroute your budget."
        )
        # In production, we'd lookup user's phone from DB
        demo_phone = os.getenv("DEMO_WHATSAPP_PHONE", "+919876543210")
        background_tasks.add_task(push_whatsapp_summary, demo_phone, alert_msg)
        return {"status": "ingested", "anomaly_detected": True, "alert_sent": True}
        
    return {"status": "ingested", "anomaly_detected": False}


class WhatsAppIncoming(BaseModel):
    from_number: str
    message_body: str
    profile_name: str

def push_whatsapp_summary(to_number: str, message: str):
    """Simulates real Twilio/Meta API push."""
    logger.info(f"📱 [WhatsApp to {to_number}]: {message}")
    # Implementation logic (e.g. Twilio Client)
    # client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
    # client.messages.create(from_='whatsapp:+14155238886', body=message, to=f'whatsapp:{to_number}')

@router.post("/api/whatsapp-bot", dependencies=[Depends(auth.verify_twilio_webhook)])
async def whatsapp_webhook(payload: WhatsAppIncoming, background_tasks: BackgroundTasks):
    """Webhook for WhatsApp Business API."""
    
    # Send user query to LangGraph
    response_msg = f"Hi {payload.profile_name}! AI Mentor here. I received: '{payload.message_body}'."
    
    # Schedule automated daily summary reminder
    market_summary = "Daily update: NIFTY50 is up 0.5%. Your SIPs are on track! Type 'Optimize Tax' to chat."
    background_tasks.add_task(push_whatsapp_summary, payload.from_number, market_summary)
    
    return {"status": "Processing via LangGraph", "immediate_reply": response_msg}
@router.post("/api/tax-parser")
async def tax_parser_endpoint(
    file: UploadFile = File(...), 
    current_user: str = Depends(auth.get_current_user)
):
    """Parses Salary Slip/Form 16 PDF to extract tax deductions."""
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        
        # Regex patterns for common Indian tax deductions
        deductions = {
            "80C": 0.0,
            "80D": 0.0,
            "NPS": 0.0,
            "HRA": 0.0,
            "Basic_Salary": 0.0
        }
        
        # 80C search (PF, LIC, ELSS)
        sec_80c = re.search(r"80C.*?(\d{3,7})", text, re.IGNORECASE)
        if sec_80c: deductions["80C"] = float(sec_80c.group(1))
        
        # 80D search (Health Insurance)
        sec_80d = re.search(r"80D.*?(\d{3,6})", text, re.IGNORECASE)
        if sec_80d: deductions["80D"] = float(sec_80d.group(1))
        
        # NPS (80CCD)
        nps = re.search(r"(NPS|80CCD).*?(\d{3,6})", text, re.IGNORECASE)
        if nps: deductions["NPS"] = float(nps.group(2))
        
        # HRA
        hra = re.search(r"HRA.*?(\d{3,7})", text, re.IGNORECASE)
        if hra: deductions["HRA"] = float(hra.group(1))

        # Basic Salary
        basic = re.search(r"(Basic|Salary).*?(\d{4,8})", text, re.IGNORECASE)
        if basic: deductions["Basic_Salary"] = float(basic.group(2))

        return {
            "status": "success",
            "extracted_deductions": deductions,
            "raw_text_preview": text[:200] + "..." if len(text) > 200 else text
        }
    except Exception as e:
        logger.error(f"PDF Parsing Error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
