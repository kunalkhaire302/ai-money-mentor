from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=False)  # e.g. "Food", "EMI", "Shopping"
    description = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class SecurityAlertDB(Base):
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, nullable=False) # e.g. "SPENDING_SPIKE", "EMI_DUE"
    message = Column(String, nullable=False)
    severity = Column(String, default="warning")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
