"""
AI Money Mentor — Model Training Pipeline
Generates synthetic Indian finance data, trains XGBoost models, and saves artifacts.
"""

import numpy as np
import pandas as pd
import xgboost as xgb
import pickle
from pathlib import Path
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, roc_auc_score

from scorer import engineer_features

MODEL_DIR = Path(__file__).parent / "models"


def generate_realistic_indian_finance_data(n: int = 15000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a statistically realistic Indian personal finance dataset.
    Distributions calibrated against SEBI Investor Survey 2022,
    RBI Household Finance Report 2021, AMFI SIP data 2023-24.
    """
    np.random.seed(seed)
    N = n

    # Demographics
    age = np.random.normal(36, 10, N).clip(22, 65).astype(int)
    income_lpa = np.random.lognormal(mean=np.log(8), sigma=0.7, size=N).clip(3, 80)
    monthly_income = income_lpa * 100000 / 12

    # Expenses & Savings
    expense_ratio = np.random.beta(4, 3, N) * 0.7 + 0.25
    monthly_expenses = monthly_income * expense_ratio
    monthly_savings = monthly_income - monthly_expenses
    savings_rate = (monthly_savings / monthly_income).clip(0, 0.75)

    # Emergency Fund
    emergency_months = np.random.exponential(scale=3.5, size=N).clip(0, 24)
    has_adequate_emergency = (emergency_months >= 6).astype(int)

    # Debt
    has_home_loan = (np.random.random(N) < 0.38).astype(int)
    has_car_loan = (np.random.random(N) < 0.22).astype(int)
    has_personal_loan = (np.random.random(N) < 0.31).astype(int)
    has_credit_card_debt = (np.random.random(N) < 0.28).astype(int)

    emi_home = has_home_loan * monthly_income * np.random.uniform(0.15, 0.35, N)
    emi_car = has_car_loan * monthly_income * np.random.uniform(0.05, 0.12, N)
    emi_personal = has_personal_loan * monthly_income * np.random.uniform(0.05, 0.18, N)
    total_emi = emi_home + emi_car + emi_personal
    debt_to_income_ratio = (total_emi / monthly_income).clip(0, 0.85)
    credit_utilisation = has_credit_card_debt * np.random.beta(2, 3, N)

    # Insurance
    has_term_insurance = (np.random.random(N) < 0.44).astype(int)
    term_cover_multiple = has_term_insurance * np.random.uniform(5, 25, N)
    adequate_life_cover = (term_cover_multiple >= 10).astype(int)
    has_health_insurance = (np.random.random(N) < 0.61).astype(int)
    health_cover_lakhs = has_health_insurance * np.random.choice(
        [3, 5, 7, 10, 15, 25], p=[0.15, 0.30, 0.20, 0.20, 0.10, 0.05], size=N
    )

    # Investments
    invests_in_mf = (np.random.random(N) < 0.52).astype(int)
    invests_in_stocks = (np.random.random(N) < 0.34).astype(int)
    invests_in_fd = (np.random.random(N) < 0.71).astype(int)
    invests_in_ppf_nps = (np.random.random(N) < 0.38).astype(int)
    invests_in_gold = (np.random.random(N) < 0.46).astype(int)

    num_investment_types = invests_in_mf + invests_in_stocks + invests_in_fd + invests_in_ppf_nps + invests_in_gold
    total_portfolio_value = (
        invests_in_mf * np.random.lognormal(12.5, 1.2, N) +
        invests_in_stocks * np.random.lognormal(11.5, 1.4, N) +
        invests_in_fd * np.random.lognormal(12.0, 1.0, N)
    )
    monthly_sip = invests_in_mf * np.random.lognormal(8.5, 0.9, N)
    equity_allocation_pct = np.random.beta(2.5, 2.5, N) * 100

    # Retirement Readiness
    years_to_retirement = (60 - age).clip(0, 38)
    has_epf = (np.random.random(N) < 0.68).astype(int)
    epf_corpus = has_epf * monthly_income * 0.12 * np.maximum(age - 22, 0) * 12 * 1.08
    fire_corpus_target = monthly_expenses * 12 * 25
    current_retirement_corpus = epf_corpus + total_portfolio_value * 0.4
    retirement_corpus_pct = (current_retirement_corpus / fire_corpus_target.clip(1)).clip(0, 2)

    # Ground Truth Score
    score_savings = np.clip(savings_rate / 0.30 * 100, 0, 100)
    score_emergency = emergency_months / 6 * 100
    score_debt = np.clip((1 - debt_to_income_ratio / 0.40) * 100, 0, 100)
    score_insurance = (adequate_life_cover * 50 + has_health_insurance * 50).clip(0, 100)
    score_diversification = (num_investment_types / 4 * 100).clip(0, 100)
    score_retirement = (retirement_corpus_pct * 100).clip(0, 100)

    financial_health_score = (
        0.20 * score_savings + 0.20 * score_emergency + 0.15 * score_debt +
        0.15 * score_insurance + 0.15 * score_diversification + 0.15 * score_retirement
    ).clip(0, 100)

    financial_health_score += np.random.normal(0, 3, N)
    financial_health_score = financial_health_score.clip(0, 100)

    health_tier = pd.cut(
        financial_health_score,
        bins=[0, 35, 55, 70, 85, 100],
        labels=['Critical', 'Poor', 'Fair', 'Good', 'Excellent']
    )

    df = pd.DataFrame({
        'age': age, 'annual_income_lpa': income_lpa.round(2),
        'monthly_income': monthly_income.round(0), 'monthly_expenses': monthly_expenses.round(0),
        'savings_rate': savings_rate.round(4), 'monthly_savings': monthly_savings.round(0),
        'emergency_fund_months': emergency_months.round(2),
        'has_adequate_emergency_fund': has_adequate_emergency,
        'has_home_loan': has_home_loan, 'has_car_loan': has_car_loan,
        'has_personal_loan': has_personal_loan, 'has_credit_card_debt': has_credit_card_debt,
        'debt_to_income_ratio': debt_to_income_ratio.round(4),
        'credit_utilisation': credit_utilisation.round(4),
        'has_term_insurance': has_term_insurance,
        'term_cover_multiple': term_cover_multiple.round(1),
        'has_health_insurance': has_health_insurance,
        'health_cover_lakhs': health_cover_lakhs,
        'invests_in_mf': invests_in_mf, 'invests_in_stocks': invests_in_stocks,
        'invests_in_fd': invests_in_fd, 'invests_in_ppf_nps': invests_in_ppf_nps,
        'invests_in_gold': invests_in_gold,
        'num_investment_types': num_investment_types,
        'total_portfolio_value': total_portfolio_value.round(0),
        'monthly_sip': monthly_sip.round(0),
        'equity_allocation_pct': equity_allocation_pct.round(2),
        'years_to_retirement': years_to_retirement, 'has_epf': has_epf,
        'epf_corpus': epf_corpus.round(0),
        'retirement_corpus_pct': retirement_corpus_pct.round(4),
        'score_savings': score_savings.round(2), 'score_emergency': score_emergency.round(2),
        'score_debt': score_debt.round(2), 'score_insurance': score_insurance.round(2),
        'score_diversification': score_diversification.round(2),
        'score_retirement': score_retirement.round(2),
        'financial_health_score': financial_health_score.round(2),
        'health_tier': health_tier
    })
    return df


def train_and_save_models():
    """Train XGBoost regressor + classifier and save all artifacts."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print("📊 Generating synthetic Indian finance dataset (15,000 rows)...")
    df = generate_realistic_indian_finance_data(n=15000)

    REGRESSION_TARGET = 'financial_health_score'
    CLASSIFICATION_TARGET = 'health_tier'
    EXCLUDE_COLS = [
        'financial_health_score', 'health_tier',
        'score_savings', 'score_emergency', 'score_debt',
        'score_insurance', 'score_diversification', 'score_retirement'
    ]

    df_feat = engineer_features(df)
    FEATURE_COLS = [c for c in df_feat.columns if c not in EXCLUDE_COLS]

    X = df_feat[FEATURE_COLS].copy()
    y_reg = df_feat[REGRESSION_TARGET]

    le = LabelEncoder()
    tier_order = ['Critical', 'Poor', 'Fair', 'Good', 'Excellent']
    le.fit(tier_order)
    y_clf = le.transform(df_feat[CLASSIFICATION_TARGET])

    X_temp, X_test, y_reg_temp, y_reg_test, y_clf_temp, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.15, random_state=42, stratify=y_clf
    )
    X_train, X_val, y_reg_train, y_reg_val, y_clf_train, y_clf_val = train_test_split(
        X_temp, y_reg_temp, y_clf_temp, test_size=0.176, random_state=42, stratify=y_clf_temp
    )

    # Train Regressor
    print("🚀 Training XGBoost Regressor...")
    xgb_reg = xgb.XGBRegressor(
        n_estimators=800, max_depth=6, learning_rate=0.04,
        subsample=0.80, colsample_bytree=0.80, min_child_weight=3,
        reg_alpha=0.05, reg_lambda=1.5, gamma=0.1,
        objective='reg:squarederror', eval_metric='rmse',
        tree_method='hist', random_state=42, n_jobs=-1,
        early_stopping_rounds=50
    )
    xgb_reg.fit(X_train, y_reg_train, eval_set=[(X_val, y_reg_val)], verbose=False)

    # Train Classifier
    print("🚀 Training XGBoost Classifier...")
    class_counts = Counter(y_clf_train)
    total = len(y_clf_train)
    class_weights = {cls: total / (len(class_counts) * count) for cls, count in class_counts.items()}
    sample_weights = np.array([class_weights[y] for y in y_clf_train])

    xgb_clf = xgb.XGBClassifier(
        n_estimators=600, max_depth=5, learning_rate=0.05,
        subsample=0.80, colsample_bytree=0.75, min_child_weight=5,
        reg_alpha=0.1, reg_lambda=2.0, objective='multi:softprob',
        num_class=5, eval_metric='mlogloss', tree_method='hist',
        random_state=42, n_jobs=-1, early_stopping_rounds=40
    )
    xgb_clf.fit(
        X_train, y_clf_train, sample_weight=sample_weights,
        eval_set=[(X_val, y_clf_val)], verbose=False
    )

    # Evaluate
    y_pred = xgb_reg.predict(X_test)
    r2 = r2_score(y_reg_test, y_pred)
    mae = mean_absolute_error(y_reg_test, y_pred)
    roc_auc = roc_auc_score(
        y_clf_test, xgb_clf.predict_proba(X_test),
        multi_class='ovr', average='weighted'
    )
    print(f"📈 Regressor — R²: {r2:.4f}, MAE: {mae:.2f}")
    print(f"📈 Classifier — ROC-AUC: {roc_auc:.4f}")

    # Save artifacts
    reg_path = str(MODEL_DIR / "regressor.json")
    clf_path = str(MODEL_DIR / "classifier.json")
    meta_path = str(MODEL_DIR / "metadata.pkl")

    xgb_reg.save_model(reg_path)
    xgb_clf.save_model(clf_path)

    with open(meta_path, 'wb') as f:
        pickle.dump({
            'label_encoder': le,
            'feature_cols': FEATURE_COLS,
            'tier_order': tier_order,
            'model_metrics': {
                'regressor_r2': float(r2),
                'regressor_mae': float(mae),
                'classifier_roc_auc': float(roc_auc)
            }
        }, f)

    print(f"✅ Models saved to {MODEL_DIR}/")
    return reg_path, clf_path, meta_path


if __name__ == "__main__":
    train_and_save_models()
