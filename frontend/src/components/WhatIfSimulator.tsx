"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Shield, Wallet, Zap, Loader2, Info } from "lucide-react";
import { apiFetch } from "@/lib/api";

// Debounce hook
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface WhatIfSimulatorProps {
  initialForm: any;
  currentScore: number;
}

export default function WhatIfSimulator({ initialForm, currentScore }: WhatIfSimulatorProps) {
  const [form, setForm] = useState(initialForm);
  const [simulatedScore, setSimulatedScore] = useState(currentScore);
  const [isSyncing, setIsSyncing] = useState(false);
  const debouncedForm = useDebounce(form, 400);

  const runSimulation = useCallback(async (formData: any) => {
    setIsSyncing(true);
    try {
      const data = await apiFetch("/api/health-score", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSimulatedScore(data.score);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (JSON.stringify(debouncedForm) !== JSON.stringify(initialForm)) {
      runSimulation(debouncedForm);
    }
  }, [debouncedForm, initialForm, runSimulation]);

  const scoreDiff = simulatedScore - currentScore;

  return (
    <div className="glass-card p-6 border-accent-gold/20 shadow-xl shadow-accent-gold/5 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="text-accent-gold w-5 h-5" />
          <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">What-If Simulator</h3>
        </div>
        
        <div className="flex items-center gap-3 bg-bg-secondary px-4 py-2 rounded-full border border-border">
          <span className="text-xs font-bold text-text-muted">PROJECTED SCORE</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-text-primary">{simulatedScore}</span>
            {scoreDiff !== 0 && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                key={scoreDiff}
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreDiff > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
              >
                {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)}
              </motion.span>
            )}
          </div>
          {isSyncing && <Loader2 className="w-4 h-4 text-accent-gold animate-spin" />}
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-8 leading-relaxed">
        Adjust the sliders below to see how changes in your financial habits would impact your health score in real-time. Powered by <span className="text-accent-emerald font-bold">XGBoost ML</span>.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-emerald" />
                Monthly SIP (₹)
              </label>
              <span className="text-sm font-mono text-accent-emerald">₹{form.monthly_sip.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={200000} 
              step={5000}
              className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-emerald"
              value={form.monthly_sip}
              onChange={(e) => setForm({...form, monthly_sip: Number(e.target.value)}) }
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-accent-gold" />
                Emergency Fund (Months)
              </label>
              <span className="text-sm font-mono text-accent-gold">{form.emergency_fund_months} Months</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={24} 
              step={0.5}
              className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-gold"
              value={form.emergency_fund_months}
              onChange={(e) => setForm({...form, emergency_fund_months: Number(e.target.value)}) }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border group hover:border-accent-emerald/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent-emerald" />
              <div>
                <p className="text-sm font-bold">Term Life Insurance</p>
                <p className="text-xs text-text-muted">10x annual income coverage</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={form.has_term_insurance}
                onChange={(e) => setForm({...form, has_term_insurance: e.target.checked, term_cover_multiple: e.target.checked ? 10 : 0})}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-emerald"></div>
            </label>
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-accent-emerald/5 border border-accent-emerald/20 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-accent-emerald mt-1 flex-shrink-0" />
                <h4 className="font-bold text-text-primary">How this works?</h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Our <span className="text-white font-medium">XGBoost Regressor</span> was trained on 15,000+ synthetic Indian financial profiles calibrated against RBI & SEBI reports.
            </p>
            <ul className="text-xs text-text-muted space-y-2">
                <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent-emerald rounded-full" />
                    Real-time inference via FastAPI backend
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent-emerald rounded-full" />
                    Non-linear correlation between 38+ features
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent-emerald rounded-full" />
                    Hardened with SHA-256 artifact integrity
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
}
