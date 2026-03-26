"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Calculator,
  IndianRupee,
  ArrowDown,
  Loader2,
  CheckCircle2,
  TrendingDown,
  XCircle,
  FileText,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import SalarySlipParser from "@/components/SalarySlipParser";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ai-money-mentor-n5kt.onrender.com";

interface DeductionItem {
  name: string;
  amount: number;
}

interface TaxResult {
  gross_income: number;
  old_regime: {
    total_deductions: number;
    taxable_income: number;
    tax_payable: number;
    deduction_breakdown: DeductionItem[];
  };
  new_regime: {
    standard_deduction: number;
    taxable_income: number;
    tax_payable: number;
  };
  savings: number;
  recommended_regime: string;
  potential_annual_savings: number;
  disclaimer: string;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function TaxWizardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fix Recharts SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    gross_income: 1200000,
    hra_exemption: 100000,
    section_80c: 150000,
    section_80d: 25000,
    home_loan_interest: 0,
    nps_80ccd: 50000,
    other_deductions: 0,
  });

  const updateField = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = await apiFetch("/api/tax-wizard", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setResult(data);
    } catch (err: any) {
      setError(`Failed to compute tax. (${err.message})`);
    } finally {
      setLoading(false);
    }
  };

  const handleParsed = (deductions: any) => {
    setForm(prev => ({
      ...prev,
      gross_income: deductions.Basic_Salary ? deductions.Basic_Salary * 12 * 2 : prev.gross_income, // Assume CTC ~2x basic
      section_80c: Math.min(150000, deductions["80C"] || prev.section_80c),
      section_80d: Math.min(75000, deductions["80D"] || prev.section_80d),
      nps_80ccd: Math.min(50000, deductions["NPS"] || prev.nps_80ccd),
      hra_exemption: deductions["HRA"] || prev.hra_exemption,
    }));
  };

  const chartData = result
    ? [
        { name: "Old Regime", tax: result.old_regime.tax_payable, color: "#F97316" },
        { name: "New Regime", tax: result.new_regime.tax_payable, color: "#3B82F6" },
      ]
    : [];

  return (
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h1 className="section-title text-3xl mb-2">Tax Wizard</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Compare Old vs New Tax Regime for FY 2024-25 and maximize your savings
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <SalarySlipParser onParsed={handleParsed} />
            
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <IndianRupee className="w-5 h-5" style={{ color: "var(--color-emerald-primary)" }} />
              Income & Deductions
            </h2>
            <div className="space-y-5">
              <div>
                <label className="label">Gross Annual Income (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.gross_income}
                  onChange={(e) => updateField("gross_income", Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">HRA Exemption (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.hra_exemption}
                    onChange={(e) => updateField("hra_exemption", Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="label">Section 80C (₹ max 1.5L)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.section_80c}
                    onChange={(e) => updateField("section_80c", Number(e.target.value))}
                    min={0}
                    max={150000}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Section 80D (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.section_80d}
                    onChange={(e) => updateField("section_80d", Number(e.target.value))}
                    min={0}
                    max={75000}
                  />
                </div>
                <div>
                  <label className="label">Home Loan Interest (₹ max 2L)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.home_loan_interest}
                    onChange={(e) => updateField("home_loan_interest", Number(e.target.value))}
                    min={0}
                    max={200000}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">NPS 80CCD (₹ max 50K)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.nps_80ccd}
                    onChange={(e) => updateField("nps_80ccd", Number(e.target.value))}
                    min={0}
                    max={50000}
                  />
                </div>
                <div>
                  <label className="label">Other Deductions (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.other_deductions}
                    onChange={(e) => updateField("other_deductions", Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Computing...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    Compare Regimes
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
              </div>
            )}
          </div>
        </motion.div>

          {/* Results */}
          <div className="space-y-6">
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="skeleton h-48" />
                <div className="skeleton h-32" />
              </motion.div>
            )}

            {result && !loading && (
              <>
                {/* Recommendation Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5"
                  style={{
                    background:
                      result.recommended_regime === "New Regime"
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(249, 115, 22, 0.1)",
                    borderColor:
                      result.recommended_regime === "New Regime"
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(249, 115, 22, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold">{result.recommended_regime} is Better</h3>
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    You save{" "}
                    <span className="font-bold text-green-400">
                      {formatINR(result.savings)}
                    </span>{" "}
                    annually by choosing {result.recommended_regime}.
                  </p>
                </motion.div>

                {/* Tax Comparison Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-bold mb-4">Tax Comparison</h3>
                  {mounted && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                        />
                        <YAxis
                          tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            color: "var(--color-text-primary)",
                          }}
                          formatter={(value: any) => [formatINR(Number(value)), "Tax Payable"]}
                        />
                        <Bar dataKey="tax" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                {/* Side-by-Side Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Old Regime */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-5"
                    style={{ borderColor: "rgba(249, 115, 22, 0.3)" }}
                  >
                    <h4
                      className="text-sm font-bold mb-3 flex items-center gap-2"
                      style={{ color: "#F97316" }}
                    >
                      <TrendingDown className="w-4 h-4" />
                      Old Regime
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Deductions</span>
                        <span className="font-medium">{formatINR(result.old_regime.total_deductions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Taxable</span>
                        <span className="font-medium">{formatINR(result.old_regime.taxable_income)}</span>
                      </div>
                      <div
                        className="flex justify-between pt-2 mt-2"
                        style={{ borderTop: "1px solid var(--color-border)" }}
                      >
                        <span className="font-bold">Tax Payable</span>
                        <span className="font-bold" style={{ color: "#F97316" }}>
                          {formatINR(result.old_regime.tax_payable)}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* New Regime */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-5"
                    style={{ borderColor: "rgba(59, 130, 246, 0.3)" }}
                  >
                    <h4
                      className="text-sm font-bold mb-3 flex items-center gap-2"
                      style={{ color: "#3B82F6" }}
                    >
                      <ArrowDown className="w-4 h-4" />
                      New Regime
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Std Deduction</span>
                        <span className="font-medium">{formatINR(result.new_regime.standard_deduction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Taxable</span>
                        <span className="font-medium">{formatINR(result.new_regime.taxable_income)}</span>
                      </div>
                      <div
                        className="flex justify-between pt-2 mt-2"
                        style={{ borderTop: "1px solid var(--color-border)" }}
                      >
                        <span className="font-bold">Tax Payable</span>
                        <span className="font-bold" style={{ color: "#3B82F6" }}>
                          {formatINR(result.new_regime.tax_payable)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Deduction Breakdown (Old Regime) */}
                {result.old_regime.deduction_breakdown.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-5"
                  >
                    <h4 className="text-sm font-bold mb-3">Old Regime — Deduction Breakdown</h4>
                    <div className="space-y-2">
                      {result.old_regime.deduction_breakdown.map((d) => (
                        <div
                          key={d.name}
                          className="flex justify-between text-xs py-1"
                          style={{ borderBottom: "1px solid var(--color-border)" }}
                        >
                          <span style={{ color: "var(--color-text-secondary)" }}>{d.name}</span>
                          <span className="font-medium">{formatINR(d.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Disclaimer */}
                <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
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
