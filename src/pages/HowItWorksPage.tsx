import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  Split,
  Truck,
  CheckCircle2,
  Sliders,
  Clock,
  Building2,
  ArrowRight
} from 'lucide-react';
import { calculateRescuePriority } from '../services/priorityEngine';
import { FoodType, StorageCondition } from '../types';

export const HowItWorksPage: React.FC = () => {
  // Interactive Priority Engine Simulator State
  const [simFoodType, setSimFoodType] = useState<FoodType>('Cooked');
  const [simStorage, setSimStorage] = useState<StorageCondition>('Hot');
  const [simServings, setSimServings] = useState<number>(120);
  const [simMinutesRemaining, setSimMinutesRemaining] = useState<number>(52);
  const [simDemand, setSimDemand] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Compute live simulated priority
  const expiryDate = new Date(Date.now() + simMinutesRemaining * 60 * 1000).toISOString();
  const simResult = calculateRescuePriority({
    foodType: simFoodType,
    storageCondition: simStorage,
    servings: simServings,
    bestBefore: expiryDate,
    nearbyDemandLevel: simDemand
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <Zap className="w-3.5 h-3.5" />
          <span>Intelligent Rescue Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-display">
          How ShareBite Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Behind every meal rescued is an intelligent, deterministic logistics pipeline combining shelf-life analytics, multi-receiver demand matching, and verified courier transit.
        </p>
      </div>

      {/* 5-Stage Architecture Detailed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-sm">
            01
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Donation Specification
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The donor logs food type (Cooked, Bakery, Produce), storage temperature, packaging format, allergens, and certifies our 5-point food safety checklist.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
            02
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Intelligent Rescue Priority
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Deterministic formula calculates an urgency score (0–100). When time is under 60 minutes or score reaches 85+, <strong>Rescue Mode</strong> activates immediately.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-mono font-bold text-sm">
            03
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Smart Matching & Multi-Split
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Large donations (e.g. 120 meals) are mathematically matched and allocated across multiple nearby shelters based on proximity and kitchen absorption capacity.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-mono font-bold text-sm">
            04
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Verified Courier Dispatch
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Volunteers follow a 10-step interactive workflow: accepting mission, en-route ETA, verifying physical condition & tamper packaging at pickup, and transit.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-mono font-bold text-sm">
            05
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Receipt & Carbon Accounting
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Upon shelter receipt, the donation loop completes. Impact metrics automatically record food weight diverted, meals served, and CO₂e emissions avoided.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 font-display">
              Ready to See It Live?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Launch our guided 16-step Hackathon scenario to witness a complete commercial meal rescue in action.
            </p>
          </div>
          <Link
            to="/listings"
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            <span>Explore Active Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Priority Engine Simulator (Section 11) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-8">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Test the Intelligent Rescue Priority Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Adjust the sliders and parameters below to see how our deterministic engine calculates urgency and rescue mode in real time. (Rule-based, no fake AI).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
            {/* Food Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Food Type</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Cooked', 'Fresh Produce', 'Bakery', 'Packaged', 'Grocery'] as FoodType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSimFoodType(type)}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      simFoodType === type
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Storage Condition</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['Hot', 'Refrigerated', 'Room temperature', 'Frozen'] as StorageCondition[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSimStorage(st)}
                    className={`py-2 px-2 rounded-lg font-medium text-center truncate transition-all ${
                      simStorage === st
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Servings Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Number of Servings:</span>
                <span className="text-emerald-400 font-mono text-sm">{simServings} meals</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={simServings}
                onChange={(e) => setSimServings(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Window Remaining Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Rescue Window Remaining:</span>
                <span className="text-amber-400 font-mono text-sm">{simMinutesRemaining} minutes</span>
              </div>
              <input
                type="range"
                min="15"
                max="480"
                step="5"
                value={simMinutesRemaining}
                onChange={(e) => setSimMinutesRemaining(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Local Demand Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Local Shelter Demand</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((dm) => (
                  <button
                    key={dm}
                    type="button"
                    onClick={() => setSimDemand(dm)}
                    className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                      simDemand === dm
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {dm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Engine Output Display */}
          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Engine Output</span>
              {simResult.isRescueMode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  <Zap className="w-3 h-3 fill-current" />
                  RESCUE MODE ACTIVE
                </span>
              )}
            </div>

            <div className="text-center py-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-5xl font-black font-mono text-white">
                {simResult.score}
                <span className="text-xl text-slate-500 font-normal">/100</span>
              </div>
              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-wider ${
                simResult.urgencyLevel === 'CRITICAL'
                  ? 'bg-red-500 text-white'
                  : simResult.urgencyLevel === 'HIGH'
                  ? 'bg-orange-500 text-white'
                  : simResult.urgencyLevel === 'MEDIUM'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-white'
              }`}>
                {simResult.urgencyLevel} URGENCY
              </div>
            </div>

            {/* Factor breakdown bars */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Shelf-life & Remaining Time Factor (Max 40)</span>
                  <span className="font-mono text-white">{simResult.breakdown.timeScore}/40</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${(simResult.breakdown.timeScore / 40) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Quantity & Meal Servings Factor (Max 25)</span>
                  <span className="font-mono text-white">{simResult.breakdown.servingsScore}/25</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(simResult.breakdown.servingsScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Perishability & Storage Factor (Max 20)</span>
                  <span className="font-mono text-white">{simResult.breakdown.perishabilityScore}/20</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${(simResult.breakdown.perishabilityScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Local Shelter Demand Factor (Max 15)</span>
                  <span className="font-mono text-white">{simResult.breakdown.demandScore}/15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(simResult.breakdown.demandScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Generated Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-400 block mb-1">Deterministic Explanation:</span>
              "{simResult.explanation}"
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Receiver Splitting Explanation */}
      <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Split className="w-4 h-4" />
            <span>Multi-Receiver Splitting</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            How Large Batches Are Distributed
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When a single commercial kitchen has 120 surplus meals, no single local shelter may have refrigerator capacity to take all 120 at once. ShareBite calculates optimal splits:
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Total Surplus: 120 Meals</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Matched</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex">
            <div className="bg-emerald-500 h-full w-[50%]" />
            <div className="bg-blue-500 h-full w-[33.3%]" />
            <div className="bg-amber-500 h-full w-[16.7%]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white">Hope Foundation</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">60 meals (50%)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">2.4 km away • Capacity 60</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white">Community Care Center</div>
              <div className="text-blue-600 dark:text-blue-400 font-semibold">40 meals (33%)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">3.8 km away • Capacity 40</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white">Helping Hands</div>
              <div className="text-amber-600 dark:text-amber-400 font-semibold">20 meals (17%)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">5.1 km away • Capacity 30</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
