"""
AI Money Mentor — Financial Health Scorer
Production-ready inference pipeline using XGBoost + SHAP.
Refactored from ai_money.py Colab notebook.
"""

import numpy as np
import pandas as pd
import xgboost as xgb
import shap
import joblib
import hashlib
from pathlib import Path


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply feature engineering to raw financial data."""
    df = df.copy()

    # Age-adjusted features
    recommended_equity_pct = (100 - df['age']).clip(20, 80)
    df['equity_vs_recommended'] = df['equity_allocation_pct'] - recommended_equity_pct

    # Wealth ratios
    df['portfolio_to_annual_income'] = (
        df['total_portfolio_value'] / (df['annual_income_lpa'] * 100000)
    ).clip(0, 20)
    df['sip_to_income_ratio'] = (df['monthly_sip'] / df['monthly_income']).clip(0, 0.5)
    df['epf_to_income_ratio'] = (
        df['epf_corpus'] / (df['annual_income_lpa'] * 100000)
    ).clip(0, 20)

    # Insurance adequacy
    df['insurance_adequacy_score'] = (
        (df['term_cover_multiple'] >= 10).astype(int) * 50 +
        (df['health_cover_lakhs'] >= 5).astype(int) * 30 +
        (df['health_cover_lakhs'] >= 10).astype(int) * 20
    )

    # Debt burden flag
    df['high_debt_burden'] = (df['debt_to_income_ratio'] > 0.40).astype(int)
    df['total_loans'] = df['has_home_loan'] + df['has_car_loan'] + df['has_personal_loan']

    # Savings momentum
    df['savings_above_30pct'] = (df['savings_rate'] >= 0.30).astype(int)
    df['savings_deficit'] = (0.30 - df['savings_rate']).clip(0, 0.30)

    # Financial maturity score
    df['financial_maturity'] = (
        df['invests_in_mf'] + df['invests_in_ppf_nps'] +
        df['has_term_insurance'] + df['has_health_insurance'] +
        df['has_epf'] + df['has_adequate_emergency_fund']
    )

    # Log transforms
    df['log_monthly_income'] = np.log1p(df['monthly_income'])
    df['log_total_portfolio'] = np.log1p(df['total_portfolio_value'])
    df['log_epf_corpus'] = np.log1p(df['epf_corpus'])

    # Interaction terms
    df['age_x_savings_rate'] = df['age'] * df['savings_rate']
    df['income_x_diversification'] = df['log_monthly_income'] * df['num_investment_types']

    return df


# Human-readable feature name mapping
FEATURE_LABELS = {
    'age': 'Age',
    'annual_income_lpa': 'Annual Income',
    'monthly_income': 'Monthly Income',
    'monthly_expenses': 'Monthly Expenses',
    'savings_rate': 'Savings Rate',
    'monthly_savings': 'Monthly Savings',
    'emergency_fund_months': 'Emergency Fund (Months)',
    'has_adequate_emergency_fund': 'Adequate Emergency Fund',
    'has_home_loan': 'Home Loan',
    'has_car_loan': 'Car Loan',
    'has_personal_loan': 'Personal Loan',
    'has_credit_card_debt': 'Credit Card Debt',
    'debt_to_income_ratio': 'Debt-to-Income Ratio',
    'credit_utilisation': 'Credit Utilisation',
    'has_term_insurance': 'Term Insurance',
    'term_cover_multiple': 'Term Cover Multiple',
    'has_health_insurance': 'Health Insurance',
    'health_cover_lakhs': 'Health Cover (₹ Lakhs)',
    'invests_in_mf': 'Mutual Fund Investments',
    'invests_in_stocks': 'Stock Investments',
    'invests_in_fd': 'Fixed Deposit Investments',
    'invests_in_ppf_nps': 'PPF/NPS Investments',
    'invests_in_gold': 'Gold Investments',
    'num_investment_types': 'Investment Diversification',
    'total_portfolio_value': 'Total Portfolio Value',
    'monthly_sip': 'Monthly SIP',
    'equity_allocation_pct': 'Equity Allocation %',
    'years_to_retirement': 'Years to Retirement',
    'has_epf': 'EPF Account',
    'epf_corpus': 'EPF Corpus',
    'retirement_corpus_pct': 'Retirement Progress',
    'equity_vs_recommended': 'Equity vs Recommended',
    'portfolio_to_annual_income': 'Portfolio-to-Income Ratio',
    'sip_to_income_ratio': 'SIP-to-Income Ratio',
    'epf_to_income_ratio': 'EPF-to-Income Ratio',
    'insurance_adequacy_score': 'Insurance Adequacy',
    'high_debt_burden': 'High Debt Burden',
    'total_loans': 'Total Active Loans',
    'savings_above_30pct': 'Savings Above 30%',
    'savings_deficit': 'Savings Deficit',
    'financial_maturity': 'Financial Maturity Score',
    'log_monthly_income': 'Log Monthly Income',
    'log_total_portfolio': 'Log Portfolio Value',
    'log_epf_corpus': 'Log EPF Corpus',
    'age_x_savings_rate': 'Age × Savings Rate',
    'income_x_diversification': 'Income × Diversification',
}


class FinancialHealthScorer:
    """Production inference pipeline for financial health scoring."""

    def __init__(self, regressor_path: str, classifier_path: str, metadata_path: str):
        self.regressor = xgb.XGBRegressor()
        self.regressor.load_model(regressor_path)

        self.classifier = xgb.XGBClassifier()
        self.classifier.load_model(classifier_path)

        # Integrity Check: SHA-256 verification
        checksum_path = Path(metadata_path).parent / "model_metadata.sha256"
        if not checksum_path.exists():
            raise RuntimeError("🛡️ Security Alert: model_metadata.sha256 checksum file missing!")

        with open(checksum_path, "r") as f:
            expected_hash = f.read().strip()

        with open(metadata_path, "rb") as f:
            actual_hash = hashlib.sha256(f.read()).hexdigest()

        if actual_hash != expected_hash:
            raise RuntimeError(f"🛡️ Security Alert: Metadata integrity compromise! Hash mismatch ({actual_hash[:10]}... vs {expected_hash[:10]}...)")

        # Secure Load via Joblib
        meta = joblib.load(metadata_path)
        self.label_encoder = meta['label_encoder']
        self.feature_cols = meta['feature_cols']
        self.tier_order = meta['tier_order']

        self.explainer = shap.TreeExplainer(self.regressor)

    def preprocess(self, user_input: dict) -> pd.DataFrame:
        """Convert user input dict to feature DataFrame."""
        monthly_income = user_input.get('monthly_income', 0)
        if monthly_income == 0:
            annual = user_input.get('annual_income_lpa', 8)
            monthly_income = annual * 100000 / 12

        monthly_expenses = user_input.get('monthly_expenses', 0)
        if monthly_expenses == 0:
            monthly_expenses = monthly_income * 0.6

        monthly_savings = monthly_income - monthly_expenses
        savings_rate = monthly_savings / monthly_income if monthly_income > 0 else 0

        row = {
            'age': user_input.get('age', 30),
            'annual_income_lpa': user_input.get('annual_income_lpa', 8),
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
            'savings_rate': max(0, min(savings_rate, 0.75)),
            'monthly_savings': max(0, monthly_savings),
            'emergency_fund_months': user_input.get('emergency_fund_months', 3),
            'has_adequate_emergency_fund': int(user_input.get('emergency_fund_months', 3) >= 6),
            'has_home_loan': int(user_input.get('has_home_loan', False)),
            'has_car_loan': int(user_input.get('has_car_loan', False)),
            'has_personal_loan': int(user_input.get('has_personal_loan', False)),
            'has_credit_card_debt': int(user_input.get('has_credit_card_debt', False)),
            'debt_to_income_ratio': user_input.get('debt_to_income_ratio', 0.0),
            'credit_utilisation': user_input.get('credit_utilisation', 0.0),
            'has_term_insurance': int(user_input.get('has_term_insurance', False)),
            'term_cover_multiple': user_input.get('term_cover_multiple', 0),
            'has_health_insurance': int(user_input.get('has_health_insurance', False)),
            'health_cover_lakhs': user_input.get('health_cover_lakhs', 0),
            'invests_in_mf': int(user_input.get('invests_in_mf', False)),
            'invests_in_stocks': int(user_input.get('invests_in_stocks', False)),
            'invests_in_fd': int(user_input.get('invests_in_fd', False)),
            'invests_in_ppf_nps': int(user_input.get('invests_in_ppf_nps', False)),
            'invests_in_gold': int(user_input.get('invests_in_gold', False)),
            'num_investment_types': sum([
                int(user_input.get('invests_in_mf', False)),
                int(user_input.get('invests_in_stocks', False)),
                int(user_input.get('invests_in_fd', False)),
                int(user_input.get('invests_in_ppf_nps', False)),
                int(user_input.get('invests_in_gold', False)),
            ]),
            'total_portfolio_value': user_input.get('total_portfolio_value', 0),
            'monthly_sip': user_input.get('monthly_sip', 0),
            'equity_allocation_pct': user_input.get('equity_allocation_pct', 40),
            'years_to_retirement': max(0, 60 - user_input.get('age', 30)),
            'has_epf': int(user_input.get('has_epf', False)),
            'epf_corpus': user_input.get('epf_corpus', 0),
            'retirement_corpus_pct': user_input.get('retirement_corpus_pct', 0.1),
        }
        df_row = pd.DataFrame([row])
        df_row = engineer_features(df_row)
        return df_row[self.feature_cols]

    def score(self, user_input: dict) -> dict:
        """Score a user's financial health and return comprehensive results."""
        X_input = self.preprocess(user_input)

        # Compute score from sub-scores (matching training ground-truth formula)
        sub_scores = self._compute_sub_scores(user_input)
        score = round((
            0.20 * sub_scores['Savings'] +
            0.20 * sub_scores['Emergency Fund'] +
            0.15 * sub_scores['Debt Management'] +
            0.15 * sub_scores['Insurance'] +
            0.15 * sub_scores['Diversification'] +
            0.15 * sub_scores['Retirement']
        ), 1)
        score = max(0, min(100, score))

        # Derive tier from score (matching training binning)
        if score < 35:
            tier = "Critical"
        elif score < 55:
            tier = "Poor"
        elif score < 70:
            tier = "Fair"
        elif score < 85:
            tier = "Good"
        else:
            tier = "Excellent"

        # Approximate tier probabilities based on score distance to bin centers
        tier_bins = {"Critical": 17.5, "Poor": 45, "Fair": 62.5, "Good": 77.5, "Excellent": 92.5}
        tier_probabilities = {}
        for t, center in tier_bins.items():
            dist = abs(score - center)
            tier_probabilities[t] = round(max(0, 100 - dist * 2), 1)
        # Normalize
        total = sum(tier_probabilities.values())
        tier_probabilities = {t: round(p / total * 100, 1) for t, p in tier_probabilities.items()}

        # SHAP explainability
        shap_vals = self.explainer.shap_values(X_input)[0]
        shap_df = pd.DataFrame({
            'feature': self.feature_cols,
            'shap_value': shap_vals
        }).sort_values('shap_value', key=abs, ascending=False)

        top_positive = [
            {
                'feature': row['feature'],
                'label': FEATURE_LABELS.get(row['feature'], row['feature']),
                'impact': round(float(row['shap_value']), 3)
            }
            for _, row in shap_df[shap_df['shap_value'] > 0].head(5).iterrows()
        ]
        top_negative = [
            {
                'feature': row['feature'],
                'label': FEATURE_LABELS.get(row['feature'], row['feature']),
                'impact': round(float(row['shap_value']), 3)
            }
            for _, row in shap_df[shap_df['shap_value'] < 0].head(5).iterrows()
        ]

        # Recommendations
        recommendations = self._generate_recommendations(user_input, shap_df)

        return {
            'score': score,
            'tier': tier,
            'tier_probabilities': tier_probabilities,
            'sub_scores': sub_scores,
            'top_positive_factors': top_positive,
            'top_negative_factors': top_negative,
            'recommendations': recommendations,
            'disclaimer': 'AI Analysis — Not Investment Advice. Consult a SEBI-registered advisor.'
        }

    def _compute_sub_scores(self, user_input: dict) -> dict:
        """Compute 6-dimension sub-scores for radar chart."""
        monthly_income = user_input.get('monthly_income', 0)
        if monthly_income == 0:
            monthly_income = user_input.get('annual_income_lpa', 8) * 100000 / 12

        monthly_expenses = user_input.get('monthly_expenses', monthly_income * 0.6)
        savings_rate = (monthly_income - monthly_expenses) / monthly_income if monthly_income > 0 else 0

        score_savings = min(100, max(0, savings_rate / 0.30 * 100))
        score_emergency = min(100, user_input.get('emergency_fund_months', 0) / 6 * 100)
        score_debt = min(100, max(0, (1 - user_input.get('debt_to_income_ratio', 0) / 0.40) * 100))

        adequate_life = 1 if user_input.get('term_cover_multiple', 0) >= 10 else 0
        has_health = 1 if user_input.get('has_health_insurance', False) else 0
        score_insurance = min(100, adequate_life * 50 + has_health * 50)

        num_inv = sum([
            int(user_input.get('invests_in_mf', False)),
            int(user_input.get('invests_in_stocks', False)),
            int(user_input.get('invests_in_fd', False)),
            int(user_input.get('invests_in_ppf_nps', False)),
            int(user_input.get('invests_in_gold', False)),
        ])
        score_diversification = min(100, num_inv / 4 * 100)

        score_retirement = min(100, user_input.get('retirement_corpus_pct', 0) * 100)

        return {
            'Savings': round(score_savings, 1),
            'Emergency Fund': round(score_emergency, 1),
            'Debt Management': round(score_debt, 1),
            'Insurance': round(score_insurance, 1),
            'Diversification': round(score_diversification, 1),
            'Retirement': round(score_retirement, 1),
        }

    def _generate_recommendations(self, user_input: dict, shap_df: pd.DataFrame) -> list:
        """Generate actionable financial recommendations."""
        recs = []
        em = user_input.get('emergency_fund_months', 0)
        if em < 6:
            recs.append({
                'icon': '🛡️',
                'title': 'Build Emergency Fund',
                'description': f'Increase from {em:.0f} to 6 months of expenses for financial safety.'
            })

        if not user_input.get('has_term_insurance', False):
            income = user_input.get('annual_income_lpa', 8)
            cover = round(income * 10)
            recs.append({
                'icon': '🏥',
                'title': 'Get Term Life Insurance',
                'description': f'Get ₹{cover} LPA term cover (10× annual income) to protect your family.'
            })

        if not user_input.get('has_health_insurance', False):
            recs.append({
                'icon': '💊',
                'title': 'Get Health Insurance',
                'description': 'Get minimum ₹5 lakh family floater health insurance cover.'
            })

        dr = user_input.get('debt_to_income_ratio', 0)
        if dr > 0.40:
            recs.append({
                'icon': '📉',
                'title': 'Reduce Debt Burden',
                'description': f'Your EMI burden is {dr*100:.0f}% of income. Target below 40%.'
            })

        monthly_income = user_input.get('monthly_income', 0)
        if monthly_income == 0:
            monthly_income = user_input.get('annual_income_lpa', 8) * 100000 / 12
        monthly_expenses = user_input.get('monthly_expenses', monthly_income * 0.6)
        sr = (monthly_income - monthly_expenses) / monthly_income if monthly_income > 0 else 0

        if sr < 0.20:
            recs.append({
                'icon': '💰',
                'title': 'Increase Savings Rate',
                'description': f'Your savings rate is {sr*100:.0f}%. Target at least 30% of income.'
            })

        num_inv = sum([
            int(user_input.get('invests_in_mf', False)),
            int(user_input.get('invests_in_stocks', False)),
            int(user_input.get('invests_in_fd', False)),
            int(user_input.get('invests_in_ppf_nps', False)),
            int(user_input.get('invests_in_gold', False)),
        ])
        if num_inv < 3:
            recs.append({
                'icon': '📊',
                'title': 'Diversify Investments',
                'description': f'You invest in {num_inv} asset classes. Consider adding MFs, PPF/NPS, or gold.'
            })

        if not recs:
            recs.append({
                'icon': '🎉',
                'title': 'Great Financial Health!',
                'description': 'Consider increasing equity allocation or exploring new investment avenues.'
            })

        return recs[:4]
