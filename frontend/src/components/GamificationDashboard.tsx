"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Trophy, Star, ChevronRight } from "lucide-react";

interface GamificationProps {
  level: number;
  current_xp: number;
  xp_to_next: number;
  badges: string[];
}

export default function GamificationDashboard({
  level,
  current_xp,
  xp_to_next,
  badges,
}: GamificationProps) {
  const total_level_xp = current_xp + xp_to_next;
  const progress_pct = (current_xp / total_level_xp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border border-border mt-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy className="w-32 h-32 text-accent-gold" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        
        {/* Level Indicator */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-gold to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <span className="text-2xl font-black text-black">L{level}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Financial Master</h3>
            <p className="text-sm text-text-muted">Rank Progression</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex-1 w-full max-w-md">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-accent-emerald">{current_xp} XP</span>
            <span className="text-text-muted">{xp_to_next} XP to Level {level+1}</span>
          </div>
          <div className="h-3 w-full bg-bg-secondary rounded-full overflow-hidden border border-border/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress_pct}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-accent-emerald to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mt-8 relative z-10">
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-accent-gold" />
          Unlocked Achievements
        </h4>
        <div className="flex flex-wrap gap-3">
          {badges && badges.length > 0 ? (
            badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="px-4 py-2 rounded-full border border-accent-gold/30 bg-accent-gold/5 flex items-center gap-2"
              >
                <span className="text-sm font-medium text-accent-gold">{badge}</span>
              </motion.div>
            ))
          ) : (
            <span className="text-sm text-text-muted">No badges unlocked yet. Keep saving!</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
