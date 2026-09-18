import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  UtensilsCrossed,
  Clock,
  MapPin,
  CheckCircle2,
  Truck,
  Zap,
  Sliders,
  Split,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Donation } from '../../types';
import { calculateDistanceKm } from '../../services/locationService';

export const NgoDashboardPage: React.FC<{
  initialTab?: 'OVERVIEW' | 'AVAILABLE' | 'INCOMING' | 'SETTINGS';
}> = ({ initialTab }) => {
  const { donations, currentUser, acceptDonationAllocation, updateNgoSettings, ngos } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AVAILABLE' | 'INCOMING' | 'SETTINGS'>(
    initialTab || 'OVERVIEW'
  );
  const [portionModalDonation, setPortionModalDonation] = useState<Donation | null>(null);
  const [portionAmount, setPortionAmount] = useState<number>(40);
  const [capacityInput, setCapacityInput] = useState<number>(currentUser?.capacity || 60);
  const [demandInput, setDemandInput] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    currentUser?.demandLevel || 'HIGH'
  );
  const [savedSuccessToast, setSavedSuccessToast] = useState<string | null>(null);

  const currentNgo = ngos.find((n) => n.id === currentUser?.id) || (currentUser?.role === 'NGO' ? {
    id: currentUser.id,
    name: currentUser.organizationName || currentUser.name,
    contactPerson: currentUser.contactPerson || currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    area: currentUser.area || 'Nizamabad',
    location: currentUser.location || currentUser.address || 'Nizamabad',
    address: currentUser.address || currentUser.location || 'Nizamabad',
    latitude: currentUser.latitude || 18.6740,
    longitude: currentUser.longitude || 78.0960,
    capacity: currentUser.capacity || 60,
    demandLevel: currentUser.demandLevel || 'HIGH',
    status: 'VERIFIED' as const
  } : ngos[0]);

  // If no NGO exists or logged in
  if (!currentNgo) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">NGO Portal</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          No registered NGO profile found. Please register or sign in as an NGO / Receiver organization to manage incoming food allocations.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/register/ngo"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
          >
            Register as NGO
          </Link>
          <Link
            to="/login/ngo"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
          >
            Sign In as NGO
          </Link>
        </div>
      </div>
    );
  }
  
  const getRemainingServings = (donation: Donation) => {
  const totalAllocated =
    donation.allocations?.reduce(
      (sum, allocation) =>
        sum + (allocation.servingsAllocated || 0),
      0
    ) || 0;

  return Math.max(
    0,
    donation.servings - totalAllocated
  );
};

  // Donations matching this NGO
 const availableSurplus = donations.filter((d) => {
  if (d.status === 'CLOSED') return false;

  const remaining = getRemainingServings(d);

  return (
    remaining > 0 &&
    (d.status === 'POSTED' ||
      d.status === 'MATCHING' ||
      d.status === 'VOLUNTEER_ASSIGNED')
  );
});
  const incomingDonations = donations.filter(
    (d) =>
      (d.status === 'ACCEPTED' ||
        d.status === 'VOLUNTEER_ASSIGNED' ||
        d.status === 'PICKED_UP' ||
        d.status === 'IN_TRANSIT') &&
      (d.matchedNgoId === currentNgo.id ||
        d.allocations?.some((a) => a.receiverId === currentNgo.id) ||
        d.matchedReceivers?.some((r: any) => r.ngoId === currentNgo.id))
  );
  const completedDonations = donations.filter(
    (d) => d.status === 'COMPLETED' || d.status === 'DELIVERED'
  );

  const handleAcceptFull = (donation: Donation) => {
  const remaining = getRemainingServings(donation);

  if (remaining <= 0) return;

  acceptDonationAllocation(
    donation.id,
    currentNgo.id,
    remaining
  );

  setSavedSuccessToast(
    `Accepted all ${remaining} meals from ${donation.foodName}! Courier notified.`
  );

  setTimeout(() => setSavedSuccessToast(null), 4000);
};

  const handleConfirmPortion = () => {
    if (!portionModalDonation) return;
    acceptDonationAllocation(portionModalDonation.id, currentNgo.id, portionAmount);
    setSavedSuccessToast(`Claimed portion of ${portionAmount} meals!`);
    setPortionModalDonation(null);
    setTimeout(() => setSavedSuccessToast(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateNgoSettings(currentNgo.id, {
      capacity: capacityInput,
      demandLevel: demandInput
    });
    setSavedSuccessToast('NGO capacity and demand settings updated successfully!');
    setTimeout(() => setSavedSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast */}
      {savedSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Community Receiver Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {currentNgo.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {currentNgo.address} • Daily Absorption Capacity: {currentNgo.capacity} meals • Demand: [{currentNgo.demandLevel || currentNgo.currentDemand}]
          </p>
        </div>

        <Link
          to="/listings"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Browse Available Surplus</span>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Batches</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
            {availableSurplus.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Within 5 km radius
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Incoming Deliveries</div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-display mt-2">
            {incomingDonations.length}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Courier dispatch active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meals Received Today</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-2">
            180
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Diverted from waste
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">People Fed</div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display mt-2">
            320
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Local families & residents
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-4">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Overview & Matches
        </button>
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'INCOMING'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Incoming En Route</span>
          {incomingDonations.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
              {incomingDonations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Capacity & Demand Controls
        </button>
      </div>

      {/* Tab 1: Overview & Matched Donations */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended Surplus Batches For You
            </h3>
            <span className="text-xs text-slate-400">
              Sorted by proximity and diet compatibility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donations
              .filter((d) => d.status !== 'COMPLETED')
              .map((donation) => {
                const ngoLat = currentNgo.latitude || currentUser?.latitude || 18.6725;
                const ngoLng = currentNgo.longitude || currentUser?.longitude || 78.0941;
                const donLat = donation.latitude || 18.6725;
                const donLng = donation.longitude || 78.0941;
                const distKm = calculateDistanceKm(ngoLat, ngoLng, donLat, donLng);
                const isSameArea = (donation.area || '').toLowerCase() === (currentNgo.area || currentUser?.area || '').toLowerCase();
                
                // Higher compatibility score for closer batches
                let matchScore = 98;
                if (distKm > 50) matchScore = 55;
                else if (distKm > 20) matchScore = 72;
                else if (distKm > 5) matchScore = 86;
                else if (distKm > 2) matchScore = 92;

                return { donation, distKm, isSameArea, matchScore };
              })
              .sort((a, b) => {
                if (a.isSameArea && !b.isSameArea) return -1;
                if (!a.isSameArea && b.isSameArea) return 1;
                return a.distKm - b.distKm;
              })
              .map(({ donation, distKm, isSameArea, matchScore }) => {
                return (
                  <div
                    key={donation.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {donation.donorName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isSameArea && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Same Area
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {matchScore}% Compatibility
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {donation.foodName}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {donation.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {getRemainingServings(donation)} Servings Available
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-amber-600">
                          <Clock className="w-3 h-3" />
                          ~{donation.estimatedWindowMinutes}m left
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <MapPin className="w-3 h-3" />
                          {distKm.toFixed(1)} km away ({donation.area || 'Nizamabad'})
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPortionModalDonation(donation);
                         setPortionAmount(
  Math.min(40, getRemainingServings(donation))
);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Split className="w-3.5 h-3.5" />
                        <span>Request Split Portion</span>
                      </button>

                      <button
                        onClick={() => handleAcceptFull(donation)}
                        className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                       Accept All ({getRemainingServings(donation)})
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 2: Incoming En Route Deliveries */}
      {activeTab === 'INCOMING' && (
        <div className="space-y-4">
          {incomingDonations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No deliveries currently in transit to your dock.</p>
            </div>
          ) : (
            incomingDonations.map((donation) => (
              <div
                key={donation.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Courier In Transit
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {donation.foodName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ETA: ~14 minutes
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Assigned: {donation.assignedVolunteerName || 'Arjun Patel'}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1. Food Collected at Kitchen</span>
                    <span className="text-blue-600 font-bold">2. En Route to Your Shelter</span>
                    <span>3. Delivery Confirmed</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-2/3 animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-500">
                    Portion: <strong>{donation.servings} meals</strong> ({donation.packaging})
                  </span>
                  <Link
                    to="/map"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    View Live Courier Position on Map →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Capacity & Demand Controls */}
      {activeTab === 'SETTINGS' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Receiving Kitchen Capacity & Demand Parameters</span>
            </h3>
            <p className="text-xs text-slate-500">
              Update your daily meal handling capacity so the matching engine allocates optimal quantities without overwhelming your kitchen.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Refrigerator & Meal Handling Capacity (Meals / Servings)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={capacityInput}
                onChange={(e) => setCapacityInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Current ceiling: {capacityInput} meals per batch allocation
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Community Meal Demand Level
              </label>
              <select
                value={demandInput}
                onChange={(e) => setDemandInput(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="CRITICAL">⚡ CRITICAL - Extreme shortage, urgent food needed</option>
                <option value="HIGH">HIGH - High dinner attendance anticipated</option>
                <option value="MEDIUM">MEDIUM - Standard pantry operation</option>
                <option value="LOW">LOW - Shelters stocked, lower immediate demand</option>
              </select>
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Update Kitchen Parameters
            </button>
          </form>
        </div>
      )}

      {/* Portion Request Modal */}
      {portionModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Request Custom Split Portion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify the exact number of meals your facility can store from {portionModalDonation.foodName}:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Portion to Claim:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold font-mono text-sm">
                   {portionAmount} of {getRemainingServings(portionModalDonation)} meals
                </span>
              </div>
              <input
                type="range"
                min="5"
                max={getRemainingServings(portionModalDonation)}
                step="5"
                value={portionAmount}
                onChange={(e) => setPortionAmount(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPortionModalDonation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPortion}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
              >
                Confirm Claim ({portionAmount} Meals)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
