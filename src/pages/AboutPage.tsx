import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Heart,
  ShieldCheck,
  Zap,
  Building2,
  Truck,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          <span>Our Guiding Purpose</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-display">
          About ShareBite
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          "Turn Surplus Food Into Shared Hope." We believe that no wholesome meal should ever end up in a landfill while a neighbor goes to bed hungry.
        </p>
      </div>

      {/* Story & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            The Problem We Solve
          </h2>
          <p>
            Nearly 40% of all commercially produced food is discarded worldwide, while 1 in 8 families experiences nutritional insecurity. Commercial kitchens, caterers, and supermarkets routinely prepare surplus batches with strict shelf-life limitations.
          </p>
          <p>
            Traditional food recovery methods are hindered by cumbersome manual phone calls, delayed logistics, and rigid minimum pickup thresholds. By the time someone answers, fresh warm food has cooled past safe consumption windows.
          </p>
          <p>
            <strong>ShareBite replaces friction with precision:</strong> an Intelligent Rescue Priority Engine that evaluates perishability in seconds, multi-receiver split algorithms that distribute large batches across multiple shelters, and a dedicated 10-stage volunteer courier fleet.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">5-Point Safety Charter</h4>
              <p className="text-xs text-slate-400">Strict hygiene verification at every hand-off</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Deterministic Urgency Score</h4>
              <p className="text-xs text-slate-400">0–100 rule-based scoring without black-box drift</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Verified Courier Dispatch</h4>
              <p className="text-xs text-slate-400">Thermal container transport with live countdowns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Triad CTA */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4">
        <h3 className="text-2xl font-bold font-display">Join the Surplus Food Rescue Network</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Whether you are a commercial restaurant kitchen, a neighborhood shelter, or a courier looking to give back, ShareBite is ready for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/donor/donate"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Donate Food
          </Link>
          <Link
            to="/ngo-register"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Register Shelter
          </Link>
          <Link
            to="/volunteer-register"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
          >
            Join as Courier
          </Link>
        </div>
      </div>

    </div>
  );
};
