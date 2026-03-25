"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Calculator,
  Flame,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/health-score", label: "Health Score", icon: Activity },
  { href: "/tax-wizard", label: "Tax Wizard", icon: Calculator },
  { href: "/fire-planner", label: "FIRE Planner", icon: Flame },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background:
          "linear-gradient(180deg, rgba(10, 15, 13, 0.95), rgba(10, 15, 13, 0.8))",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-emerald-primary), var(--color-emerald-dark))",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
            }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gradient">
              AI Money Mentor
            </span>
            <p
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              Smart Finance • India
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive
                    ? "var(--color-emerald-light)"
                    : "var(--color-text-secondary)",
                  background: isActive
                    ? "var(--color-emerald-glow)"
                    : "transparent",
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{
                      background: "var(--color-emerald-primary)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
