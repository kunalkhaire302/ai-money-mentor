"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Flame,
  Target,
  TrendingUp,
  Loader2,
  Calendar,
  IndianRupee,
  Zap,
  Award,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Milestone {
  age: number;
  label: string;
  corpus_crores: number;
}

interface Projection {
  age: number;
  year: number;
  corpus: number;
  corpus_crores: number;
  monthly_sip: number;
  fire_target: number;
  fire_target_crores: number;
  progress_pct: number;
}

interface FireResult {
  fire_target: number;
  fire_target_crores: number;
  fire_reached_age: number | null;
  years_to_fire: number;
  final_corpus: number;
  final_corpus_crores: number;
  total_invested: number;
  wealth_gain: number;
  wealth_multiplier: number;
  monthly_passive_income: number;
  projections: Projection[];
  milestones: Milestone[];
  disclaimer: string;
}

const formatCrore = (n: number) => `₹${n.toFixed(2)} Cr`;
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function FirePlannerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FireResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fix Recharts SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    current_age: 28,
    retirement_age: 45,
    monthly_expenses: 50000,
    monthly_sip: 25000,
    current_corpus: 500000,
    expected_return_pct: 12,
    annual_step_up_pct: 10,
    inflation_rate_pct: 6,
  });

  const updateField = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/fire-planner", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to compute FIRE plan. Make sure the backend is running. (${message})`);
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? result.projections.map((p) => ({
        age: p.age,
        corpus: p.corpus_crores,
        target: p.fire_target_crores,
      }))
    : [];

  return (
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
            }}
          >
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="section-title text-3xl mb-2">FIRE Planner</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Chart your path to Financial Independence with SIP projections and
            inflation-adjusted targets
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: "#F59E0B" }} />
              FIRE Parameters
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Current Age</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.current_age}
                    onChange={(e) => updateField("current_age", Number(e.target.value))}
                    min={18}
                    max={60}
                  />
                </div>
                <div>
                  <label className="label">FIRE Age</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.retirement_age}
                    onChange={(e) => updateField("retirement_age", Number(e.target.value))}
                    min={30}
                    max={70}
                  />
                </div>
              </div>
              <div>
                <label className="label">Monthly Expenses (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.monthly_expenses}
                  onChange={(e) => updateField("monthly_expenses", Number(e.target.value))}
                  min={5000}
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
                <label className="label">Current Corpus (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.current_corpus}
                  onChange={(e) => updateField("current_corpus", Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expected Return (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.expected_return_pct}
                    onChange={(e) => updateField("expected_return_pct", Number(e.target.value))}
                    min={1}
                    max={30}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="label">SIP Step-up (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.annual_step_up_pct}
                    onChange={(e) => updateField("annual_step_up_pct", Number(e.target.value))}
                    min={0}
                    max={50}
                  />
                </div>
              </div>
              <div>
                <label className="label">Inflation Rate (%)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.inflation_rate_pct}
                  onChange={(e) => updateField("inflation_rate_pct", Number(e.target.value))}
                  min={0}
                  max={15}
                  step={0.5}
                />
              </div>
              <button
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Projecting...
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    Calculate FIRE Plan
                  </>
                )}
              </button>
            </div>

            {error && (
              <div
                className="mt-4 p-3 rounded-lg flex items-start gap-2"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {loading && (
              <div className="space-y-4">
                <div className="skeleton h-64" />
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-24" />
                  ))}
                </div>
              </div>
            )}

            {result && !loading && (
              <>
                {/* Summary Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {[
                    {
                      icon: Target,
                      label: "FIRE Target",
                      value: formatCrore(result.fire_target_crores),
                      color: "#F59E0B",
                    },
                    {
                      icon: Calendar,
                      label: "FIRE Age",
                      value: result.fire_reached_age
                        ? `Age ${result.fire_reached_age}`
                        : "Not reached",
                      color: result.fire_reached_age ? "#10B981" : "#EF4444",
                    },
                    {
                      icon: Zap,
                      label: "Wealth Multiplier",
                      value: `${result.wealth_multiplier}×`,
                      color: "#A78BFA",
                    },
                    {
                      icon: IndianRupee,
                      label: "Monthly Passive Income",
                      value: formatINR(result.monthly_passive_income),
                      color: "#10B981",
                    },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-4"
                      >
                        <Icon
                          className="w-5 h-5 mb-2"
                          style={{ color: stat.color }}
                        />
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {stat.label}
                        </p>
                        <p className="text-lg font-bold" style={{ color: stat.color }}>
                          {stat.value}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Projection Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: "#F59E0B" }} />
                    Corpus Growth Projection
                  </h3>
                  {mounted && (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="corpusGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="age"
                          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                          label={{
                            value: "Age",
                            position: "insideBottom",
                            offset: -5,
                            fill: "var(--color-text-muted)",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                          tickFormatter={(v) => `₹${v}Cr`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            color: "var(--color-text-primary)",
                            fontSize: "12px",
                          }}
                          formatter={(value: any, name: any) => [
                            `₹${Number(value).toFixed(2)} Cr`,
                            name === "corpus" ? "Corpus" : "FIRE Target",
                          ]}
                        />
                        {result.fire_reached_age && (
                          <ReferenceLine
                            x={result.fire_reached_age}
                            stroke="#F59E0B"
                            strokeDasharray="5 5"
                            label={{
                              value: "🔥 FIRE!",
                              position: "top",
                              fill: "#F59E0B",
                              fontSize: 12,
                            }}
                          />
                        )}
                        <Area
                          type="monotone"
                          dataKey="corpus"
                          stroke="#10B981"
                          fill="url(#corpusGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="target"
                          stroke="#F59E0B"
                          fill="none"
                          strokeWidth={2}
                          strokeDasharray="8 4"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                {/* Milestones */}
                {result.milestones.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" style={{ color: "#F59E0B" }} />
                      Milestones
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {result.milestones.map((m, i) => (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{
                            background:
                              m.label === "🔥 FIRE!"
                                ? "rgba(245, 158, 11, 0.15)"
                                : "var(--color-bg-secondary)",
                            border: `1px solid ${
                              m.label === "🔥 FIRE!"
                                ? "rgba(245, 158, 11, 0.3)"
                                : "var(--color-border)"
                            }`,
                          }}
                        >
                          <div>
                            <p className="text-sm font-bold">{m.label}</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                              Age {m.age} • {formatCrore(m.corpus_crores)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Investment Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                      Total Invested
                    </p>
                    <p className="text-base font-bold">{formatINR(result.total_invested)}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                      Wealth Gained
                    </p>
                    <p className="text-base font-bold text-green-400">
                      {formatINR(result.wealth_gain)}
                    </p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                      Final Corpus
                    </p>
                    <p className="text-base font-bold" style={{ color: "#F59E0B" }}>
                      {formatCrore(result.final_corpus_crores)}
                    </p>
                  </div>
                </motion.div>

                {/* Disclaimer */}
                <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-muted)" }}>
                  {result.disclaimer}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
