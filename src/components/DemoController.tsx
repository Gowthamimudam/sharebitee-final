import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, ChevronRight, ChevronLeft, RotateCcw, Award, CheckCircle2, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

export const DemoController: React.FC = () => {
  const {
    demoScenario,
    startDemoScenario,
    nextDemoStep,
    prevDemoStep,
    resetDemoScenario,
    toggleAutoPlayDemo,
    currentUser,
    switchRole
  } = useApp();

  // Do not expose demo controller on public unauthenticated views
  if (!currentUser) return null;

  if (!demoScenario.isActive) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 text-slate-200 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Hackathon Jury Evaluation Mode</span>
            <span className="hidden sm:inline text-slate-400">— Run the complete 16-step surplus food rescue lifecycle</span>
          </div>
          <button
            onClick={startDemoScenario}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            Launch 16-Step Demo
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((demoScenario.step / demoScenario.totalSteps) * 100);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'DONOR', label: 'Donor' },
    { role: 'NGO', label: 'NGO / Receiver' },
    { role: 'VOLUNTEER', label: 'Volunteer' },
    { role: 'ADMIN', label: 'Admin' }
  ];

  return (
    <div className="bg-slate-950 text-white border-b border-emerald-500/30 shadow-xl transition-all">
      {/* Top progress line */}
      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Step Info */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs shrink-0">
              {demoScenario.step}/{demoScenario.totalSteps}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Jury Step {demoScenario.step}:
                </span>
                <span className="text-sm font-bold text-white">{demoScenario.title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {demoScenario.description}
              </p>
            </div>
          </div>

          {/* Controls & Role Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap justify-between lg:justify-end">
            {/* Role switcher buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 px-2 font-medium hidden sm:inline">View as:</span>
              {roles.map((r) => {
                const isActive = currentUser?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => switchRole(r.role)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevDemoStep}
                disabled={demoScenario.step <= 1}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={toggleAutoPlayDemo}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  demoScenario.isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {demoScenario.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>

              <button
                onClick={nextDemoStep}
                disabled={demoScenario.step >= demoScenario.totalSteps}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium disabled:opacity-40 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={resetDemoScenario}
                className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors border border-slate-800"
                title="Reset demo scenario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
