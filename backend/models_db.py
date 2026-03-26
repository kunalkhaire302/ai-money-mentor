from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Financial profile state tracking (simplified for XP & score deltas)
    total_xp = Column(Integer, default=0)
    current_health_score = Column(Float, default=0.0)

class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=False)  # e.g. "Food", "EMI", "Shopping"
    description = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class SecurityAlertDB(Base):
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    alert_type = Column(String, nullable=False) # e.g. "SPENDING_SPIKE", "EMI_DUE"
    message = Column(String, nullable=False)
    severity = Column(String, default="warning")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
