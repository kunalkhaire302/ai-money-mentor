import pytest
from httpx import AsyncClient
import io

# We import the FastAPI app from main
from main import app

@pytest.mark.asyncio
async def test_health_score_success():
    """Test the /api/health-score endpoint with a valid payload."""
    payload = {
        "age": 22,
        "annual_income_lpa": 8.0,
        "emergency_fund_months": 3.0,
        "debt_to_income_ratio": 0.1,
        "credit_utilisation": 0.2,
        "total_portfolio_value": 500000,
        "monthly_sip": 15000,
        "equity_allocation_pct": 60,
        "retirement_corpus_pct": 0.5
    }
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/health-score", json=payload)
        
    assert response.status_code == 200
    data = response.json()
    
    assert "score" in data
    assert 0 <= data["score"] <= 100
    assert "tier" in data
    assert isinstance(data["tier"], str)
    assert "top_positive_factors" in data
    assert "top_negative_factors" in data
    assert "recommendations" in data

@pytest.mark.asyncio
async def test_health_score_validation_error():
    """Test the /api/health-score endpoint with an invalid payload."""
    # annual_income_lpa is constrained ge=1, passing -5 should trigger 422
    payload = {
        "age": 22,
        "annual_income_lpa": -5.0, 
    }
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/health-score", json=payload)
        
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert data["detail"][0]["type"] == "greater_than_equal"
    assert data["detail"][0]["loc"] == ["body", "annual_income_lpa"]

@pytest.mark.asyncio
async def test_mf_xray_pdf_upload_success():
    """Test the /api/mf-xray endpoint with a valid dummy PDF file."""
    # Create a minimal valid PDF byte stream
    minimal_pdf = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Test PDF) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n0000000314 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n402\n%%EOF\n"
    
    files = {"file": ("test_statement.pdf", minimal_pdf, "application/pdf")}
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/mf-xray", files=files)
        
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_statement.pdf"
    assert "disclaimer" in data
    assert "AI Analysis — Not Investment Advice" in data["disclaimer"]

@pytest.mark.asyncio
async def test_mf_xray_invalid_file_type():
    """Test the /api/mf-xray endpoint with a non-PDF file."""
    # Uploading a fake jpg
    files = {"file": ("test_image.jpg", b"fake jpeg content", "image/jpeg")}
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/mf-xray", files=files)
        
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Only PDF files are accepted."
