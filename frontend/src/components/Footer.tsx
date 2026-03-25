"use client";

import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-bg-secondary)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* SEBI Disclaimer */}
        <div
          className="glass-card p-4 mb-6 flex items-start gap-3"
          style={{
            background: "rgba(239, 68, 68, 0.05)",
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          <ShieldCheck
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "var(--color-accent-gold)" }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <strong style={{ color: "var(--color-accent-gold)" }}>
              SEBI Compliance Disclaimer:
            </strong>{" "}
            AI Analysis — Not Investment Advice. The information provided by AI
            Money Mentor is for educational and informational purposes only. It
            does not constitute financial advice, investment recommendations, or
            an offer to buy or sell securities. No guaranteed returns. Past
            performance does not indicate future results. Please consult a
            SEBI-registered investment advisor before making any financial
            decisions. Mutual fund investments are subject to market risks.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            © 2025 AI Money Mentor. Built for the Indian market. Not a
            SEBI-registered entity.
          </p>
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span>Powered by XGBoost + SHAP</span>
            <span>•</span>
            <span>Data is never stored</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
