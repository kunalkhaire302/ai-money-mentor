"""
AI Money Mentor — Tax Wizard Engine
Old vs New Tax Regime comparison for FY 2024-25 (AY 2025-26).
"""


def compute_old_regime_tax(taxable_income: float) -> float:
    """Calculate tax under Old Regime FY 2024-25."""
    if taxable_income <= 250000:
        return 0
    elif taxable_income <= 500000:
        return (taxable_income - 250000) * 0.05
    elif taxable_income <= 1000000:
        return 12500 + (taxable_income - 500000) * 0.20
    else:
        return 112500 + (taxable_income - 1000000) * 0.30


def compute_new_regime_tax(taxable_income: float) -> float:
    """Calculate tax under New Regime FY 2024-25 (with ₹75,000 std deduction)."""
    income = taxable_income - 75000  # Standard deduction in new regime
    income = max(0, income)

    if income <= 300000:
        return 0
    elif income <= 700000:
        tax = (income - 300000) * 0.05
        # Rebate u/s 87A: no tax if income <= 7L
        if income <= 700000:
            return 0
        return tax
    elif income <= 1000000:
        return 20000 + (income - 700000) * 0.10
    elif income <= 1200000:
        return 50000 + (income - 1000000) * 0.15
    elif income <= 1500000:
        return 80000 + (income - 1200000) * 0.20
    else:
        return 140000 + (income - 1500000) * 0.30


def add_cess(tax: float) -> float:
    """Add 4% health and education cess."""
    return tax * 1.04


def compare_tax_regimes(data: dict) -> dict:
    """
    Compare Old vs New tax regimes.
    
    data keys:
        gross_income: float (annual)
        hra_exemption: float
        section_80c: float (max 1.5L)
        section_80d: float (health insurance premium)
        home_loan_interest: float (sec 24, max 2L)
        nps_80ccd: float (max 50K)
        other_deductions: float
    """
    gross = data.get('gross_income', 0)

    # Old regime deductions
    std_deduction_old = 50000
    hra = min(data.get('hra_exemption', 0), gross * 0.4)
    sec_80c = min(data.get('section_80c', 0), 150000)
    sec_80d = min(data.get('section_80d', 0), 75000)
    home_loan = min(data.get('home_loan_interest', 0), 200000)
    nps = min(data.get('nps_80ccd', 0), 50000)
    other = data.get('other_deductions', 0)

    total_deductions_old = std_deduction_old + hra + sec_80c + sec_80d + home_loan + nps + other
    taxable_old = max(0, gross - total_deductions_old)
    tax_old = add_cess(compute_old_regime_tax(taxable_old))

    # New regime (only standard deduction of 75K, no other deductions)
    taxable_new = gross  # Std deduction handled inside compute_new_regime_tax
    tax_new = add_cess(compute_new_regime_tax(taxable_new))

    savings = abs(tax_old - tax_new)
    better_regime = 'Old Regime' if tax_old < tax_new else 'New Regime'
    if tax_old == tax_new:
        better_regime = 'Both Equal'

    # Build deduction breakdown for old regime
    deduction_breakdown = [
        {'name': 'Standard Deduction', 'amount': std_deduction_old},
        {'name': 'HRA Exemption', 'amount': round(hra)},
        {'name': 'Section 80C (PPF, ELSS, LIC)', 'amount': sec_80c},
        {'name': 'Section 80D (Health Insurance)', 'amount': sec_80d},
        {'name': 'Home Loan Interest (Sec 24)', 'amount': home_loan},
        {'name': 'NPS (80CCD)', 'amount': nps},
        {'name': 'Other Deductions', 'amount': round(other)},
    ]
    deduction_breakdown = [d for d in deduction_breakdown if d['amount'] > 0]

    return {
        'gross_income': gross,
        'old_regime': {
            'total_deductions': round(total_deductions_old),
            'taxable_income': round(taxable_old),
            'tax_payable': round(tax_old),
            'deduction_breakdown': deduction_breakdown,
        },
        'new_regime': {
            'standard_deduction': 75000,
            'taxable_income': round(gross - 75000),
            'tax_payable': round(tax_new),
        },
        'savings': round(savings),
        'recommended_regime': better_regime,
        'potential_annual_savings': round(savings),
        'disclaimer': 'AI Analysis — Not Investment Advice. Consult a SEBI-registered advisor.'
    }
