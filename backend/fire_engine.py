"""
AI Money Mentor — FIRE (Financial Independence, Retire Early) Engine
SIP projection, corpus growth, and FIRE target calculation.
"""

import math


def compute_fire_plan(data: dict) -> dict:
    """
    Compute FIRE plan projections.
    
    data keys:
        current_age: int
        retirement_age: int (default 50 for FIRE, 60 for traditional)
        monthly_expenses: float
        monthly_sip: float
        current_corpus: float
        expected_return_pct: float (annual, e.g. 12.0)
        annual_step_up_pct: float (SIP increase per year, e.g. 10.0)
        inflation_rate_pct: float (e.g. 6.0)
    """
    current_age = data.get('current_age', 30)
    retirement_age = data.get('retirement_age', 50)
    monthly_expenses = data.get('monthly_expenses', 50000)
    monthly_sip = data.get('monthly_sip', 20000)
    current_corpus = data.get('current_corpus', 0)
    expected_return = data.get('expected_return_pct', 12.0) / 100
    step_up = data.get('annual_step_up_pct', 10.0) / 100
    inflation = data.get('inflation_rate_pct', 6.0) / 100

    years_to_fire = max(0, retirement_age - current_age)
    monthly_return = expected_return / 12

    # FIRE target: 25x annual expenses (adjusted for inflation at retirement)
    expenses_at_retirement = monthly_expenses * 12 * ((1 + inflation) ** years_to_fire)
    fire_target = expenses_at_retirement * 25

    # Year-by-year projection
    projections = []
    corpus = current_corpus
    sip = monthly_sip
    fire_reached_age = None

    for year in range(years_to_fire + 10):  # project 10 years beyond target
        age = current_age + year

        # Monthly compounding for this year
        for month in range(12):
            corpus = corpus * (1 + monthly_return) + sip

        # Record projection
        inflation_adj_corpus = corpus / ((1 + inflation) ** year) if year > 0 else corpus
        projections.append({
            'age': age,
            'year': year,
            'corpus': round(corpus),
            'corpus_lakhs': round(corpus / 100000, 1),
            'corpus_crores': round(corpus / 10000000, 2),
            'monthly_sip': round(sip),
            'annual_investment': round(sip * 12),
            'fire_target': round(fire_target),
            'fire_target_crores': round(fire_target / 10000000, 2),
            'progress_pct': round(min(100, (corpus / fire_target) * 100), 1),
        })

        if fire_reached_age is None and corpus >= fire_target:
            fire_reached_age = age

        # Step up SIP for next year
        sip = sip * (1 + step_up)

        if age >= 70:
            break

    # Summary metrics
    total_invested = current_corpus
    sip_temp = monthly_sip
    for y in range(years_to_fire):
        total_invested += sip_temp * 12
        sip_temp *= (1 + step_up)

    final_corpus = projections[years_to_fire]['corpus'] if years_to_fire < len(projections) else projections[-1]['corpus']
    wealth_gain = final_corpus - total_invested

    # Milestones
    milestones = []
    for p in projections:
        if p['progress_pct'] >= 25 and not any(m['label'] == '25% FIRE' for m in milestones):
            milestones.append({'age': p['age'], 'label': '25% FIRE', 'corpus_crores': p['corpus_crores']})
        if p['progress_pct'] >= 50 and not any(m['label'] == '50% FIRE' for m in milestones):
            milestones.append({'age': p['age'], 'label': '50% FIRE', 'corpus_crores': p['corpus_crores']})
        if p['progress_pct'] >= 75 and not any(m['label'] == '75% FIRE' for m in milestones):
            milestones.append({'age': p['age'], 'label': '75% FIRE', 'corpus_crores': p['corpus_crores']})
        if p['progress_pct'] >= 100 and not any(m['label'] == '🔥 FIRE!' for m in milestones):
            milestones.append({'age': p['age'], 'label': '🔥 FIRE!', 'corpus_crores': p['corpus_crores']})

    return {
        'fire_target': round(fire_target),
        'fire_target_crores': round(fire_target / 10000000, 2),
        'fire_reached_age': fire_reached_age,
        'years_to_fire': years_to_fire,
        'final_corpus': round(final_corpus),
        'final_corpus_crores': round(final_corpus / 10000000, 2),
        'total_invested': round(total_invested),
        'wealth_gain': round(wealth_gain),
        'wealth_multiplier': round(final_corpus / max(total_invested, 1), 1),
        'monthly_passive_income': round(final_corpus * 0.04 / 12),  # 4% SWR
        'projections': projections,
        'milestones': milestones,
        'disclaimer': 'AI Analysis — Not Investment Advice. Consult a SEBI-registered advisor. Past returns do not guarantee future performance.'
    }
