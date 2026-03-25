"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowRight,
  ArrowLeft,
  Activity,
  User,
  Wallet,
  Shield,
  TrendingUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ai-money-mentor-n5kt.onrender.com";

interface ShapFactor {
  feature: string;
  label: string;
  impact: number;
}

interface Recommendation {
  icon: string;
  title: string;
  description: string;
}

interface HealthResult {
  score: number;
  tier: string;
  tier_probabilities: Record<string, number>;
  sub_scores: Record<string, number>;
  top_positive_factors: ShapFactor[];
  top_negative_factors: ShapFactor[];
  recommendations: Recommendation[];
  disclaimer: string;
}

const steps = [
  { id: 0, title: "Demographics", icon: User, description: "Basic information" },
  { id: 1, title: "Income & Expenses", icon: Wallet, description: "Cash flow details" },
  { id: 2, title: "Debt & Insurance", icon: Shield, description: "Protection & liabilities" },
  { id: 3, title: "Investments", icon: TrendingUp, description: "Portfolio details" },
];

const tierColors: Record<string, string> = {
  Critical: "#EF4444",
  Poor: "#F97316",
  Fair: "#EAB308",
  Good: "#22C55E",
  Excellent: "#10B981",
};

export default function HealthScorePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    age: 30,
    annual_income_lpa: 10,
    monthly_expenses: 40000,
    emergency_fund_months: 3,
    has_home_loan: false,
    has_car_loan: false,
    has_personal_loan: false,
    has_credit_card_debt: false,
    debt_to_income_ratio: 0.15,
    credit_utilisation: 0.1,
    has_term_insurance: false,
    term_cover_multiple: 0,
    has_health_insurance: false,
    health_cover_lakhs: 0,
    invests_in_mf: false,
    invests_in_stocks: false,
    invests_in_fd: false,
    invests_in_ppf_nps: false,
    invests_in_gold: false,
    total_portfolio_value: 0,
    monthly_sip: 0,
    equity_allocation_pct: 40,
    has_epf: false,
    epf_corpus: 0,
    retirement_corpus_pct: 0.1,
  });

  const updateField = (key: string, value: number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const monthly_income = form.annual_income_lpa * 100000 / 12;
      const res = await fetch(`${API_BASE}/api/health-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, monthly_income }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to get health score. Make sure the backend is running. (${message})`);
    } finally {
      setLoading(false);
    }
  };

  const radarData = result
    ? Object.entries(result.sub_scores).map(([key, value]) => ({
        dimension: key,
        score: value,
        fullMark: 100,
      }))
    : [];

  if (result && !loading) {
    return <ResultView result={result} radarData={radarData} onReset={() => setResult(null)} />;
  }

  return (
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
            }}
          >
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="section-title text-3xl mb-2">Money Health Score</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Get your AI-powered financial health analysis in 4 simple steps
          </p>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300"
                  style={{
                    background: isActive
                      ? "var(--color-emerald-glow)"
                      : isCompleted
                      ? "rgba(16, 185, 129, 0.08)"
                      : "transparent",
                    border: `1px solid ${
                      isActive ? "var(--color-emerald-primary)" : "var(--color-border)"
                    }`,
                    color: isActive || isCompleted
                      ? "var(--color-emerald-light)"
                      : "var(--color-text-muted)",
                    cursor: i <= step ? "pointer" : "default",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">
                    {s.title}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className="w-6 h-px"
                    style={{
                      background: isCompleted
                        ? "var(--color-emerald-primary)"
                        : "var(--color-border)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-2">Demographics</h2>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                  Tell us about yourself to personalize your analysis.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Age</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.age}
                      onChange={(e) => updateField("age", Number(e.target.value))}
                      min={18}
                      max={70}
                    />
                  </div>
                  <div>
                    <label className="label">Annual Income (₹ Lakhs per annum)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.annual_income_lpa}
                      onChange={(e) => updateField("annual_income_lpa", Number(e.target.value))}
                      min={1}
                      step={0.5}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-2">Income & Expenses</h2>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                  Your monthly cash flow and savings details.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Monthly Expenses (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.monthly_expenses}
                      onChange={(e) => updateField("monthly_expenses", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Emergency Fund (months of expenses)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.emergency_fund_months}
                      onChange={(e) => updateField("emergency_fund_months", Number(e.target.value))}
                      min={0}
                      max={36}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="label">Monthly SIP (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.monthly_sip}
                      onChange={(e) => updateField("monthly_sip", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Equity Allocation (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.equity_allocation_pct}
                      onChange={(e) => updateField("equity_allocation_pct", Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-2">Debt & Insurance</h2>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                  Your liabilities and protection coverage.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleField label="Home Loan" checked={form.has_home_loan} onChange={(v) => updateField("has_home_loan", v)} />
                  <ToggleField label="Car Loan" checked={form.has_car_loan} onChange={(v) => updateField("has_car_loan", v)} />
                  <ToggleField label="Personal Loan" checked={form.has_personal_loan} onChange={(v) => updateField("has_personal_loan", v)} />
                  <ToggleField label="Credit Card Debt" checked={form.has_credit_card_debt} onChange={(v) => updateField("has_credit_card_debt", v)} />
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="label">Debt-to-Income Ratio</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.debt_to_income_ratio}
                      onChange={(e) => updateField("debt_to_income_ratio", Number(e.target.value))}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <label className="label">Credit Utilisation Ratio</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.credit_utilisation}
                      onChange={(e) => updateField("credit_utilisation", Number(e.target.value))}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <ToggleField label="Term Insurance" checked={form.has_term_insurance} onChange={(v) => updateField("has_term_insurance", v)} />
                  <ToggleField label="Health Insurance" checked={form.has_health_insurance} onChange={(v) => updateField("has_health_insurance", v)} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Term Cover Multiple (× annual income)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.term_cover_multiple}
                      onChange={(e) => updateField("term_cover_multiple", Number(e.target.value))}
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <label className="label">Health Cover (₹ Lakhs)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.health_cover_lakhs}
                      onChange={(e) => updateField("health_cover_lakhs", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-2">Investments</h2>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                  Your investment portfolio details.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleField label="Mutual Funds" checked={form.invests_in_mf} onChange={(v) => updateField("invests_in_mf", v)} />
                  <ToggleField label="Stocks" checked={form.invests_in_stocks} onChange={(v) => updateField("invests_in_stocks", v)} />
                  <ToggleField label="Fixed Deposits" checked={form.invests_in_fd} onChange={(v) => updateField("invests_in_fd", v)} />
                  <ToggleField label="PPF / NPS" checked={form.invests_in_ppf_nps} onChange={(v) => updateField("invests_in_ppf_nps", v)} />
                  <ToggleField label="Gold" checked={form.invests_in_gold} onChange={(v) => updateField("invests_in_gold", v)} />
                  <ToggleField label="EPF" checked={form.has_epf} onChange={(v) => updateField("has_epf", v)} />
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="label">Total Portfolio Value (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.total_portfolio_value}
                      onChange={(e) => updateField("total_portfolio_value", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">EPF Corpus (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.epf_corpus}
                      onChange={(e) => updateField("epf_corpus", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.3 : 1 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 3 ? (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setStep((s) => s + 1)}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Get My Score
                </>
              )}
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-4"
          >
            <div className="skeleton h-8 w-48 mx-auto" />
            <div className="skeleton h-64 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="skeleton h-32" />
              <div className="skeleton h-32" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Toggle Field Component ───────────────────────────────────────────────── */
function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl transition-all duration-300"
      style={{
        background: checked ? "var(--color-emerald-glow)" : "var(--color-bg-secondary)",
        border: `1px solid ${checked ? "var(--color-emerald-primary)" : "var(--color-border)"}`,
      }}
    >
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        className="toggle-switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

/* ─── Result View ──────────────────────────────────────────────────────────── */
function ResultView({
  result,
  radarData,
  onReset,
}: {
  result: HealthResult;
  radarData: { dimension: string; score: number; fullMark: number }[];
  onReset: () => void;
}) {
  const tierClass = `tier-${result.tier.toLowerCase()}`;

  return (
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Score Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="relative inline-block mb-4">
            <svg className="w-40 h-40" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="8"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={tierColors[result.tier] || "#10B981"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(result.score / 100) * 440} 440`}
                initial={{ strokeDasharray: "0 440" }}
                animate={{ strokeDasharray: `${(result.score / 100) * 440} 440` }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-extrabold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ color: tierColors[result.tier] }}
              >
                {result.score}
              </motion.span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                out of 100
              </span>
            </div>
          </div>
          <div>
            <span className={`tier-badge ${tierClass}`}>{result.tier}</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-bold mb-4">Financial Health Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* SHAP Factors */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Positive Factors */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                What&apos;s Helping You
              </h3>
              <div className="space-y-3">
                {result.top_positive_factors.map((f, i) => (
                  <motion.div
                    key={f.feature}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: "rgba(34, 197, 94, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-xs font-bold text-green-400">
                      +{f.impact.toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Negative Factors */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                What&apos;s Hurting You
              </h3>
              <div className="space-y-3">
                {result.top_negative_factors.map((f, i) => (
                  <motion.div
                    key={f.feature}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-xs font-bold text-red-400">
                      {f.impact.toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" style={{ color: "var(--color-accent-gold)" }} />
            Personalized Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {result.recommendations.map((rec, i) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer + Reset */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            {result.disclaimer}
          </p>
          <button className="btn-secondary" onClick={onReset}>
            Analyze Again
          </button>
        </div>
      </div>
    </div>
  );
}
