import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RescueBanner: React.FC = () => {
  const location = useLocation();
  const { donations, currentUser } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(52 * 60);

  // Unconditional hook execution - MUST be called on every render before any returns
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Safe conditional return AFTER all hooks have executed:
  // Must NOT appear on public homepage or when user is not authenticated
  if (!currentUser || location.pathname === '/') {
    return null;
  }

  // Find most critical active donation
  const criticalDonation = donations.find(
    (d) => d.isRescueMode && d.status !== 'COMPLETED' && d.status !== 'CANCELLED' && d.status !== 'EXPIRED'
  );

  if (!criticalDonation) {
    return null;
  }

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <aside aria-label="Rescue mode alert" className="relative z-30 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-red-700 tracking-wider shadow-sm animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-current" />
            RESCUE MODE ACTIVE
          </span>
          <span className="font-semibold text-white/95">
            {criticalDonation.donorName}:
          </span>
          <span className="text-white/90">
            {criticalDonation.foodName} ({criticalDonation.servings} servings)
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/20 text-xs font-mono">
            <ShieldAlert className="w-3 h-3 text-amber-300" />
            Score: {criticalDonation.priorityScore}/100 CRITICAL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono font-bold text-amber-100 bg-black/25 px-2.5 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{timeFormatted} remaining</span>
          </div>

          <Link
            to="/listings"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-slate-900 font-semibold text-xs hover:bg-amber-50 transition-colors shadow-sm"
          >
            <span>View Mission</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

