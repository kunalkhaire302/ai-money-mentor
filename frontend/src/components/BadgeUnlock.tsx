"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  icon: string;
}

interface BadgeUnlockProps {
  badges: string[]; // List of badge names or objects
  onClose: () => void;
}

export default function BadgeUnlock({ badges, onClose }: BadgeUnlockProps) {
  useEffect(() => {
    if (badges.length > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card max-w-sm w-full p-8 border-accent-gold/40 text-center relative overflow-hidden"
      >
        {/* Animated background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-gold/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-emerald/20 rounded-full blur-3xl animate-pulse" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent-gold/20">
          <Trophy className="w-10 h-10 text-accent-gold" />
        </div>

        <h2 className="text-2xl font-black text-text-primary mb-2 uppercase tracking-tight">Milestone Unlocked!</h2>
        <p className="text-sm text-text-muted mb-6">Your financial discipline is paying off. You've earned new badges:</p>

        <div className="space-y-3 mb-8">
          {badges.map((badge, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex items-center gap-3 bg-bg-secondary p-3 rounded-xl border border-border"
            >
              <span className="text-2xl">{badge.split(' ')[0]}</span>
              <span className="text-sm font-bold text-text-primary">{badge.split(' ').slice(1).join(' ')}</span>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="btn-primary w-full py-4 font-black tracking-widest uppercase text-xs"
        >
          Awesome!
        </button>
      </motion.div>
    </div>
  );
}
