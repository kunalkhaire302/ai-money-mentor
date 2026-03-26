import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime

def generate_weekly_report(user_id: str, data: dict, output_path: str):
    """Generates a professional PDF report for the user."""
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Header
    c.setFillColor(colors.HexColor("#0D1117"))
    c.rect(0, height - 1.5*inch, width, 1.5*inch, fill=1)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(0.5*inch, height - 0.75*inch, "AI MONEY MENTOR")
    
    c.setFont("Helvetica", 10)
    c.drawString(0.5*inch, height - 1*inch, f"Weekly Financial Analysis | {datetime.now().strftime('%B %d, %Y')}")
    
    # Content - Summary
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(0.5*inch, height - 2*inch, f"Summary for User: {user_id}")
    
    c.setFont("Helvetica", 12)
    c.drawString(0.5*inch, height - 2.4*inch, f"Current Health Score: {data.get('score', 'N/A')}/1000")
    c.drawString(0.5*inch, height - 2.7*inch, f"Financial Tier: {data.get('tier', 'Unknown')}")
    
    # Progress Section
    c.setStrokeColor(colors.lightgrey)
    c.line(0.5*inch, height - 3*inch, width - 0.5*inch, height - 3*inch)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, height - 3.4*inch, "AI Insights & Recommendations")
    
    c.setFont("Helvetica", 11)
    y_pos = height - 3.7*inch
    for rec in data.get("recommendations", []):
        c.drawString(0.7*inch, y_pos, f"• {rec.get('title')}: {rec.get('description')[:80]}...")
        y_pos -= 0.3*inch
        if y_pos < 1*inch:
            c.showPage()
            y_pos = height - 1*inch

    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    c.drawCentredString(width/2, 0.5*inch, "Disclaimer: AI Analysis - Not Investment Advice. Consult a SEBI advisor.")
    
    c.save()
    return output_path
