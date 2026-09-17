import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  Users,
  Building2,
  Truck,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboardPage: React.FC<{
  initialTab?: 'DONATIONS' | 'MISSIONS' | 'NGOS' | 'VOLUNTEERS';
}> = ({ initialTab }) => {
  const {
    donations,
    ngos,
    volunteers,
    missions,
    impactStats,
    isRescueModeActive,
    toggleRescueMode,
    resetToDemoBaseline,
    startDemoScenario
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DONATIONS' | 'MISSIONS' | 'NGOS' | 'VOLUNTEERS'>(
    initialTab || 'DONATIONS'
  );
  const [resetSuccessToast, setResetSuccessToast] = useState(false);

  const handleReset = () => {
    resetToDemoBaseline();
    setResetSuccessToast(true);
    setTimeout(() => setResetSuccessToast(false), 4000);
  };

  const criticalDonations = donations.filter((d) => d.urgencyLevel === 'CRITICAL' || d.isRescueMode);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast */}
      {resetSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Demo dataset reset to initial baseline state!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Regional Platform Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            ShareBite Mission Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            System health, live courier telemetry, priority overrides, and multi-organization dispatch.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={toggleRescueMode}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isRescueModeActive
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className={`w-4 h-4 ${isRescueModeActive ? 'fill-current' : 'text-amber-500'}`} />
            <span>{isRescueModeActive ? 'Rescue Mode Active' : 'Trigger Rescue Mode'}</span>
          </button>

          <button
            onClick={startDemoScenario}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>16-Step Demo Walkthrough</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset to Demo baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Network Health KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Active Donations</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display mt-1">
            {donations.filter((d) => d.status !== 'COMPLETED').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Critical Priority</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-display mt-1">
            {criticalDonations.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Active Missions</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display mt-1">
            {missions.filter((m) => m.stage !== 'RESCUED_COMPLETED' && m.stage !== 'RESCUED').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Registered NGOs</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-display mt-1">
            {ngos.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Couriers Online</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-display mt-1">
            {volunteers.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Rescued</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-1">
            {impactStats.mealsRescued.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('DONATIONS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'DONATIONS'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Donations Stream ({donations.length})
        </button>
        <button
          onClick={() => setActiveTab('MISSIONS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'MISSIONS'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Courier Dispatch Missions ({missions.length})
        </button>
        <button
          onClick={() => setActiveTab('NGOS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'NGOS'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Shelter Directory ({ngos.length})
        </button>
        <button
          onClick={() => setActiveTab('VOLUNTEERS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'VOLUNTEERS'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Volunteer Fleet ({volunteers.length})
        </button>
      </div>

      {/* Tab Content 1: Donations Stream */}
      {activeTab === 'DONATIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Donation & Item</th>
                  <th className="p-3.5">Donor</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Servings</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Receiver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      <div>{d.foodName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {d.id}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{d.donorName}</td>
                    <td className="p-3.5">{d.category}</td>
                    <td className="p-3.5 font-mono font-semibold">{d.servings} meals</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.urgencyLevel === 'CRITICAL'
                          ? 'bg-red-500 text-white'
                          : d.urgencyLevel === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {d.priorityScore}/100 [{d.urgencyLevel}]
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {d.status.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3.5 text-slate-500">{d.allocations?.[0]?.receiverName || d.matchedNgoName || 'Matching...'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Missions */}
      {activeTab === 'MISSIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Mission ID</th>
                  <th className="p-3.5">Origin Kitchen</th>
                  <th className="p-3.5">Drop-off Shelter</th>
                  <th className="p-3.5">Servings</th>
                  <th className="p-3.5">Assigned Courier</th>
                  <th className="p-3.5">Pipeline Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {missions.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {m.id}
                    </td>
                    <td className="p-3.5">{m.donorName}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {m.receiverNgoName || m.receiverName}
                    </td>
                    <td className="p-3.5 font-mono">{m.servings} meals</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {m.assignedVolunteerName || m.volunteerName || 'Unassigned'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {m.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: NGOs */}
      {activeTab === 'NGOS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Verified Receiver
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  (ngo.demandLevel || ngo.currentDemand) === 'CRITICAL'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                }`}>
                  Demand: {ngo.demandLevel || ngo.currentDemand}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {ngo.name}
              </h4>
              <p className="text-xs text-slate-500">{ngo.address}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Absorption Capacity:</span>
                <span className="font-bold text-slate-900 dark:text-white">{ngo.capacity} meals/day</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 4: Volunteers */}
      {activeTab === 'VOLUNTEERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {volunteers.map((vol) => (
            <div
              key={vol.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Active Courier
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {vol.status || vol.availability}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {vol.name}
              </h4>
              <p className="text-xs text-slate-500">Vehicle: {vol.vehicleType}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Rescues Completed:</span>
                <span className="font-bold text-slate-900 dark:text-white">{vol.completedMissions ?? vol.totalMissionsCompleted} missions</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
