"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Calculator,
  Flame,
  TrendingUp,
  ArrowRight,
  Shield,
  Brain,
  IndianRupee,
} from "lucide-react";

const modules = [
  {
    href: "/health-score",
    icon: Activity,
    title: "Money Health Score",
    description:
      "AI-powered analysis of your complete financial profile. Get a 0-100 score with SHAP explainability showing exactly what's helping and hurting your finances.",
    features: ["XGBoost ML Model", "SHAP Analysis", "6D Radar Chart"],
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  {
    href: "/tax-wizard",
    icon: Calculator,
    title: "Tax Wizard",
    description:
      "Compare Old vs New tax regimes instantly. Maximize your deductions under 80C, 80D, HRA, NPS and find the optimal regime for your income.",
    features: ["FY 2024-25 Slabs", "Deduction Planner", "Regime Comparison"],
    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    glow: "rgba(59, 130, 246, 0.15)",
  },
  {
    href: "/fire-planner",
    icon: Flame,
    title: "FIRE Planner",
    description:
      "Plan your Financial Independence journey with SIP projections, step-up calculations, and inflation-adjusted corpus targets. See your path to FIRE.",
    features: ["SIP Projections", "Step-up Calculator", "FIRE Milestones"],
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    glow: "rgba(245, 158, 11, 0.15)",
  },
];

const stats = [
  { label: "ML Model Accuracy", value: "R² 0.98", icon: Brain },
  { label: "Indian Market Focused", value: "SEBI Aligned", icon: Shield },
  { label: "Tax Savings Potential", value: "₹46,800/yr", icon: IndianRupee },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

import { useState, useEffect } from "react";
import GamificationDashboard from "@/components/GamificationDashboard";
import VoiceMentor from "@/components/VoiceMentor";

export default function Dashboard() {
  const [progression, setProgression] = useState({
    level: 1,
    current_xp: 0,
    xp_to_next: 1000,
    badges: [],
  });

  useEffect(() => {
    // Fetch mock user progression on load
    fetch("https://ai-money-mentor-n5kt.onrender.com/api/gamification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emergency_fund_months: 6,
        sip_streak_months: 14,
        has_health_insurance: true,
        has_term_insurance: true,
        credit_utilisation: 0.15,
        debt_to_income_ratio: 0.2,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API Route failed");
        return res.json();
      })
      .then((data) => {
        setProgression({
          level: data.level || 1,
          current_xp: data.current_xp || 0,
          xp_to_next: data.xp_to_next_level || 1000,
          badges: data.badges_unlocked || [],
        });
      })
      .catch((err) => console.error("Failed to fetch progression:", err));
  }, []);

  return (
    <div className="pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-emerald-primary), var(--color-emerald-dark))",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
            }}
          >
            <TrendingUp className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="text-gradient">AI Money</span>
            <br />
            <span style={{ color: "var(--color-text-primary)" }}>Mentor</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ML-powered financial intelligence for the Indian market. Analyze
            your financial health, optimize taxes, and plan your FIRE
            journey — all in one place.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass-card px-6 py-3 flex items-center gap-3"
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--color-emerald-primary)" }}
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold">{stat.value}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mb-16">
            <GamificationDashboard
              level={progression.level}
              current_xp={progression.current_xp}
              xp_to_next={progression.xp_to_next}
              badges={progression.badges}
            />
            
            <VoiceMentor />
          </div>
        </motion.div>

        {/* Module Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-6"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div key={mod.href} variants={item}>
                <Link href={mod.href} className="block group">
                  <div
                    className="glass-card glow-border p-6 h-full flex flex-col"
                    style={{ minHeight: "320px" }}
                  >
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: mod.gradient,
                        boxShadow: `0 4px 20px ${mod.glow}`,
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3">{mod.title}</h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-4 flex-1"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {mod.description}
                    </p>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mod.features.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{
                            background: mod.glow,
                            color: "var(--color-text-primary)",
                            border: `1px solid ${mod.glow}`,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div
                      className="flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                      style={{ color: "var(--color-emerald-primary)" }}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
