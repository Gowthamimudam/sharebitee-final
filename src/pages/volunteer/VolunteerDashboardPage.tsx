import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Navigation,
  Sparkles,
  PhoneCall,
  Building2,
  UtensilsCrossed,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupMission } from '../../types';

export const VolunteerDashboardPage: React.FC = () => {
  const { missions, updateMissionStage, currentUser } = useApp();

  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<PickupMission | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('Inspected: packaging intact, warm containers above 60°C, zero tampering.');
  const [tempChecked, setTempChecked] = useState(true);
  const [sealChecked, setSealChecked] = useState(true);
  const [quantityChecked, setQuantityChecked] = useState(true);

  // Active mission
  const activeMission = missions.find((m) => m.stage !== 'RESCUED_COMPLETED' && m.stage !== 'RESCUED') || missions[0];

  const completedMissions = missions.filter((m) => m.stage === 'RESCUED' || m.stage === 'RESCUED_COMPLETED');
  const completedCount = completedMissions.length;
  const mealsTransported = completedMissions.reduce((acc, m) => acc + (m.servings || 0), 0);
  const co2Saved = Math.round(mealsTransported * 1.5);

  const handleStageAdvance = (stage: PickupMission['stage']) => {
    if (!activeMission) return;

    if (stage === 'FOOD_COLLECTED') {
      setSelectedMission(activeMission);
      setConditionModalOpen(true);
      return;
    }

    updateMissionStage(activeMission.id, stage);

    if (stage === 'RESCUED' || stage === 'RESCUED_COMPLETED') {
      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleConfirmVerification = () => {
    if (!selectedMission) return;
    updateMissionStage(selectedMission.id, 'FOOD_COLLECTED', {
      conditionVerification: {
        foodServings: selectedMission.servings,
        condition: 'Good',
        packaging: sealChecked ? 'Secure' : 'Damaged',
        verifiedAt: new Date().toISOString()
      },
      collectedAt: new Date().toISOString(),
      notes: verificationNotes
    });
    setConditionModalOpen(false);
  };

  // Pipeline stages
  const stagesList: { key: PickupMission['stage']; label: string; num: string }[] = [
    { key: 'POSTED', label: 'Surplus Posted', num: '01' },
    { key: 'MATCHED', label: 'Shelter Matched', num: '02' },
    { key: 'RECEIVER_ACCEPTED', label: 'Receiver Accepted', num: '03' },
    { key: 'VOLUNTEER_ASSIGNED', label: 'Courier Assigned', num: '04' },
    { key: 'MISSION_ACCEPTED', label: 'Mission Accepted', num: '05' },
    { key: 'PICKUP_STARTED', label: 'En Route to Donor', num: '06' },
    { key: 'FOOD_COLLECTED', label: 'Food Collected', num: '07' },
    { key: 'DELIVERY_STARTED', label: 'In Transit to Shelter', num: '08' },
    { key: 'DELIVERED', label: 'Shelter Received', num: '09' },
    { key: 'RESCUED', label: 'Mission Completed', num: '10' }
  ];

  const currentStageIndex = stagesList.findIndex((s) => s.key === activeMission?.stage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>Volunteer Courier Cockpit</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {currentUser?.name || 'Volunteer Courier'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time rescue navigation, pickup condition auditing, and shelter hand-off verification.
          </p>
        </div>

        <Link
          to="/map"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Live Navigation Map</span>
        </Link>
      </div>

      {/* Courier Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Rescues</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
            {completedCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Successful food deliveries
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meals Transported</div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display mt-2">
            {mealsTransported}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero spoilage logged
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CO₂e Emissions Prevented</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-2">
            {co2Saved} kg
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Calculated environmental impact
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Courier Status</div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-display mt-2 flex items-center gap-1">
            <span>{currentUser?.availability || 'AVAILABLE'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ready for dispatch
          </div>
        </div>
      </div>

      {/* Active Rescue Mission Cockpit */}
      {!activeMission ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Pickup Missions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You have no active rescue missions assigned at the moment. When food donations are matched to shelters and assigned to you, the dispatch route and checklist will appear here.
          </p>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-500 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Browse Available Food Listings</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-8">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  MISSION #{activeMission.id}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Batch: {activeMission.donationId}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display mt-1">
                {activeMission.servings} Servings from {activeMission.donorName}
              </h2>
            </div>

            {/* Stage indicator chip */}
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Mission Stage</div>
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-display">
                Stage {currentStageIndex + 1} of 10: {activeMission.stage.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* 10-Stage Pipeline Visualizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Interactive 10-Stage Rescue Pipeline</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {Math.round(((currentStageIndex + 1) / 10) * 100)}% Completed
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStageIndex + 1) / 10) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 pt-2 text-center text-[10px]">
              {stagesList.map((st, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={st.key}
                    className={`p-2 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-white font-bold shadow-md scale-105 ring-2 ring-amber-300 dark:ring-amber-800'
                        : isPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <div className="font-mono text-[9px] opacity-80">{st.num}</div>
                    <div className="truncate">{st.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route & Contact Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            
            {/* Origin Donor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Pickup Origin (Commercial Kitchen)</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {activeMission.donorName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{activeMission.pickupAddress || activeMission.donorAddress}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                <span>Contact: +1 (555) 234-5678 (Kitchen Manager)</span>
              </div>
            </div>

            {/* Destination Shelter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Drop-off Destination (Shelter Dock)</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {activeMission.receiverNgoName || activeMission.receiverName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{activeMission.dropoffAddress || activeMission.receiverAddress}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Target Arrival Window: Next 30 minutes</span>
              </div>
            </div>
          </div>

          {/* Interactive Action Control Center */}
          <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Next Mission Action</span>
              </h4>
              <span className="text-xs text-slate-500">
                Tap button to transition stage
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeMission.stage === 'VOLUNTEER_ASSIGNED' && (
                <button
                  onClick={() => handleStageAdvance('MISSION_ACCEPTED')}
                  className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Accept Rescue Mission
                </button>
              )}

              {activeMission.stage === 'MISSION_ACCEPTED' && (
                <button
                  onClick={() => handleStageAdvance('PICKUP_STARTED')}
                  className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Start Pickup Route (En Route to Donor)
                </button>
              )}

              {activeMission.stage === 'PICKUP_STARTED' && (
                <button
                  onClick={() => handleStageAdvance('FOOD_COLLECTED')}
                  className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Arrived at Kitchen: Verify & Collect Food</span>
                </button>
              )}

              {activeMission.stage === 'FOOD_COLLECTED' && (
                <button
                  onClick={() => handleStageAdvance('DELIVERY_STARTED')}
                  className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Depart Kitchen & Start Delivery to Shelter
                </button>
              )}

              {activeMission.stage === 'DELIVERY_STARTED' && (
                <button
                  onClick={() => handleStageAdvance('DELIVERED')}
                  className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Arrived at Shelter Dock: Mark Delivered
                </button>
              )}

              {activeMission.stage === 'DELIVERED' && (
                <button
                  onClick={() => handleStageAdvance('RESCUED')}
                  className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Shelter Sign-off: Complete Rescue Mission!</span>
                </button>
              )}

              {activeMission.stage === 'RESCUED' && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mission successfully rescued! Zero waste achieved.</span>
                </div>
              )}

              <button
                onClick={() => handleStageAdvance('RESCUED')}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer ml-auto"
              >
                Mark Mission Completed
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Food Condition Verification Modal (Stage 7) */}
      {conditionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Physical Food Safety Verification</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Pickup Condition Audit
              </h3>
              <p className="text-xs text-slate-500">
                Before loading food containers into your vehicle, verify food safety checklist:
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempChecked}
                  onChange={(e) => setTempChecked(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  1. Temperature verified (Warm containers &gt; 60°C or Chilled &lt; 4°C)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sealChecked}
                  onChange={(e) => setSealChecked(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  2. Packaging sealed, leak-proof, and tamper-evident
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quantityChecked}
                  onChange={(e) => setQuantityChecked(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  3. Quantity matches declared servings ({activeMission?.servings} meals)
                </span>
              </label>

              <div className="pt-2">
                <label className="block text-slate-400 mb-1 font-semibold">
                  Courier Condition Notes:
                </label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConditionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerification}
                disabled={!tempChecked || !sealChecked || !quantityChecked}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                Certify & Load Into Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
