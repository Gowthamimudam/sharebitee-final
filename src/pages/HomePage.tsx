import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Heart,
  Building2,
  Truck,
  Shield,
  ArrowRight,
  LogIn,
  UserPlus,
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, demoLogin } = useApp();

  const handleQuickLogin = (role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN') => {
    navigate(`/login?role=${role}`);
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'NGO':
        return '/ngo/dashboard';
      case 'VOLUNTEER':
        return '/volunteer/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-20">
      
      {/* If already logged in, show personalized banner */}
      {currentUser && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold uppercase tracking-wider">
                Signed In Session
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Welcome back, {currentUser.name} ({currentUser.role})
              </h3>
            </div>
          </div>
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
          >
            <span>Open {currentUser.role === 'VOLUNTEER' ? 'Collector' : currentUser.role} Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 1. ShareBite Logo, Title, and Description */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center justify-center gap-3">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/25">
            <UtensilsCrossed className="w-7 h-7 stroke-[2.2]" />
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="text-left">
            <span className="text-3xl sm:text-4xl font-black tracking-tight font-display text-slate-900 dark:text-white leading-none block">
              Share<span className="text-emerald-600 dark:text-emerald-400">Bite</span>
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 block mt-1">
              Food Rescue Network
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.15]">
          Turn Surplus Food Into<br className="hidden sm:inline" /> Shared Hope
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
          ShareBite connects surplus food with organizations and communities that need it — before it goes to waste.
        </p>
      </section>

      {/* 2. Role-Based Login / Register Entry Points (Only shown when not logged in) */}
      {!currentUser && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Role Card A: Donor */}
            <div
              id="role-card-donor"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    FOOD DONOR
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Restaurants, caterers, households, supermarkets and businesses with surplus food.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/login/donor"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login as Donor</span>
                </Link>
                <Link
                  to="/register/donor"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register as Donor</span>
                </Link>
              </div>
            </div>

            {/* Role Card B: NGO / Receiver */}
            <div
              id="role-card-ngo"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    NGO / RECEIVER
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organizations, shelters, community kitchens and groups that receive and distribute food.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/login/ngo"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login as NGO</span>
                </Link>
                <Link
                  to="/register/ngo"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register as NGO</span>
                </Link>
              </div>
            </div>

            {/* Role Card C: Collector */}
            <div
              id="role-card-collector"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    COLLECTOR
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Volunteers and delivery partners who coordinate food pickups and deliveries.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/login/collector"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login as Collector</span>
                </Link>
                <Link
                  to="/register/collector"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register as Collector</span>
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 3. Clean "How ShareBite Works" 3-Step Section */}
      <section className="rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple 3-Step Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            How ShareBite Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A fast, closed-loop coordination pipeline that turns surplus food into community nourishment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Step 1: Donors Post Surplus Food
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Donors enter food category, portions, shelf-life, and pickup location with clear food safety verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Step 2: Smart Matching Pairs Nearby NGOs
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The matching engine calculates proximity, capacity, and demand to pair nearby NGOs and notifies active collectors.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Step 3: Safe Pickup & Verified Delivery
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Assigned collectors pick up from the donor and deliver to the verified receiving center with digital confirmation.
            </p>
          </div>

        </div>
      </section>

      {/* Subtle Admin Link at the bottom */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span>ShareBite © 2026 • Zero Food Waste Community Initiative</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/how-it-works"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            About
          </Link>
          <Link
            to="/login?role=ADMIN"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
          >
            <Shield className="w-3 h-3" />
            <span>Admin Login</span>
          </Link>
        </div>
      </footer>

    </div>
  );
};
