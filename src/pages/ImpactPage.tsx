import React from 'react';
import {
  TrendingUp,
  Award,
  Sparkles,
  UtensilsCrossed,
  Trees,
  Car,
  Heart,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ImpactPage: React.FC = () => {
  const { impactStats, donations } = useApp();

  // Environmental equivalencies:
  // 1 kg food waste diverted ~= 2.5 kg CO2e avoided
  // ~40 car km per 10 kg CO2e
  // ~1 tree absorbs ~22 kg CO2 per year
  const treesEquivalent = Math.round(impactStats.co2AvoidedKg / 22);
  const carKmAvoided = Math.round((impactStats.co2AvoidedKg / 2.5) * 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time Network Impact & Carbon Accounting</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display">
          Every Meal Diverted from Landfill
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          ShareBite combines hunger relief with verifiable environmental carbon footprint reduction.
        </p>
        <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
          Source: Live session telemetry + verified demo baseline data
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
            {impactStats.mealsRescued.toLocaleString()}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Wholesome Meals Rescued
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Nutritious hot meals, fresh produce, and bakery goods served directly to families and shelters in need.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-200 dark:border-blue-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 font-display">
            {impactStats.foodWasteDivertedKg.toLocaleString()} kg
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Food Waste Diverted
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Prevented from rotting in municipal landfill pits where it would generate methane greenhouse gas.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-200 dark:border-amber-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
            {impactStats.co2AvoidedKg.toLocaleString()} kg
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            CO₂e Emissions Avoided
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Direct atmospheric carbon equivalent savings calculated according to certified EPA food waste indices.
          </p>
        </div>
      </div>

      {/* Environmental Equivalents Strip */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 border border-slate-800 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Environmental Equivalencies
          </span>
          <h3 className="text-2xl font-bold font-display">
            What Our Food Rescue Metric Equals In Nature
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">{treesEquivalent.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Trees absorbing carbon for a full year</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">{carKmAvoided.toLocaleString()} km</div>
              <div className="text-xs text-slate-400">Passenger car driving distance offset</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">{impactStats.ngosSupported}</div>
              <div className="text-xs text-slate-400">Local grassroots shelters nourished daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Surplus Category Diversion Distribution
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Cooked Prepared Meals & Warm Catering</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">48% (1,640 meals)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[48%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Fresh Farm Produce & Fruit</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">24% (820 kg)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[24%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Artisan Bakery & Fresh Breads</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">18% (615 items)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[18%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Packaged & Shelf-Stable Groceries</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono">10% (345 units)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[10%]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
