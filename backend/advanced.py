from fastapi import APIRouter, File, UploadFile, BackgroundTasks, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import random
import logging
import auth

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
async def voice_chat_endpoint(audio: UploadFile = File(...), current_user: str = Depends(auth.get_current_user)):
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
    
    # 2. Mock Speech-to-Text
    transcription = f"Audio received ({file_size_kb}kb). Mock query about debt or planning."
    
    # 3. LangGraph Routing Instruction
    routing_flag = "empathetic_support" if emotion_state in ["stressed", "hesitant"] else "standard_analytical"
    
    logger.info(f"🎤 Voice received. Emotion: {emotion_state}. Routing: {routing_flag}")

    return {
        "transcription": transcription,
        "emotion_detected": emotion_state,
        "langgraph_routing_flag": routing_flag,
        "ai_response": "I hear your concern. Taking on debt can feel overwhelming, but we can structure a highly efficient payoff plan together. Let's look at the numbers.",
        "reply_audio_url": None # Mock TTS output
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
async def account_aggregator_webhook(payload: AccountAggregatorPayload):
    """
    Ingests live bank transactions from India Stack AA (e.g. Setu/Sahamati).
    Triggers LangGraph active monitoring.
    """
    # LangGraph passive alert logic here
    food_expenses = sum(t.amount for t in payload.FI_data if t.category == "Food" and t.type == "DEBIT")
    alert = None
    
    if food_expenses > 10000:
        alert = "Alert: Your dining/delivery expenses spiked this month."
        
    return {"status": "ingested", "proactive_alerts_generated": [alert] if alert else []}


class WhatsAppIncoming(BaseModel):
    from_number: str
    message_body: str
    profile_name: str

def push_whatsapp_summary(user_id: str, message: str):
    """Simulates Celery background task pushing message to Twilio/Meta API."""
    logger.info(f"📱 [WhatsApp to {user_id}]: {message}")

@router.post("/api/whatsapp-bot", dependencies=[Depends(auth.verify_twilio_webhook)])
async def whatsapp_webhook(payload: WhatsAppIncoming, background_tasks: BackgroundTasks):
    """Webhook for WhatsApp Business API."""
    
    # Send user query to LangGraph
    response_msg = f"Hi {payload.profile_name}! AI Mentor here. I received: '{payload.message_body}'."
    
    # Schedule automated daily summary reminder
    market_summary = "Daily update: NIFTY50 is up 0.5%. Your SIPs are on track! Type 'Optimize Tax' to chat."
    background_tasks.add_task(push_whatsapp_summary, payload.from_number, market_summary)
    
    return {"status": "Processing via LangGraph", "immediate_reply": response_msg}
