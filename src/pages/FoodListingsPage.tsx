import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  UtensilsCrossed,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  ChevronRight,
  Split,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Donation, FoodCategory, UrgencyLevel } from '../types';
import { calculateDistanceKm, KNOWN_AREAS } from '../services/locationService';

export const FoodListingsPage: React.FC = () => {
  const { donations, currentUser, acceptDonationAllocation, ngos } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [portionModalDonation, setPortionModalDonation] = useState<Donation | null>(null);
  const [requestedPortion, setRequestedPortion] = useState<number>(30);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const categories: (FoodCategory | 'ALL')[] = [
    'ALL',
    'Cooked Meals',
    'Bakery & Bread',
    'Fresh Produce',
    'Packaged Goods',
    'Dairy & Grocery'
  ];

  const filteredDonations = donations.filter((donation) => {
    if (selectedCategory !== 'ALL' && donation.category !== selectedCategory) {
      return false;
    }
    if (selectedUrgency !== 'ALL' && donation.urgencyLevel !== selectedUrgency) {
      return false;
    }
    if (selectedArea !== 'ALL' && donation.area !== selectedArea) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = donation.foodName.toLowerCase().includes(q);
      const matchDonor = donation.donorName.toLowerCase().includes(q);
      const matchLocation = (donation.pickupLocation || '').toLowerCase().includes(q);
      const matchArea = (donation.area || '').toLowerCase().includes(q);
      if (!matchName && !matchDonor && !matchLocation && !matchArea) return false;
    }
    return true;
  });

  const handleAcceptFull = (donation: Donation) => {
    // If current user is NGO, use their ID, otherwise fallback to first registered NGO
    const ngoId = currentUser?.role === 'NGO' ? currentUser.id : (ngos[0]?.id || 'registered-ngo');
    acceptDonationAllocation(donation.id, ngoId, donation.servings);
    setFeedbackToast(`Successfully accepted all ${donation.servings} meals from ${donation.foodName}! Courier dispatched.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleConfirmPortion = () => {
    if (!portionModalDonation) return;
    const ngoId = currentUser?.role === 'NGO' ? currentUser.id : (ngos[0]?.id || 'registered-ngo');
    acceptDonationAllocation(portionModalDonation.id, ngoId, requestedPortion);
    setFeedbackToast(`Successfully claimed portion of ${requestedPortion} meals!`);
    setPortionModalDonation(null);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast alert */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Live Food Rescue Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Available Food Donations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time commercial kitchen surplus ready for immediate pickup and redistribution.
          </p>
        </div>

        {currentUser?.role === 'DONOR' && (
          <a
            href="/donor/donate"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Donate Surplus Food</span>
          </a>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, restaurant, or pickup address..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Area select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden md:inline">Area:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Areas</option>
              {KNOWN_AREAS.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.pincode})
                </option>
              ))}
            </select>
          </div>

          {/* Urgency select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden md:inline">Urgency:</span>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">⚡ CRITICAL (Rescue Mode)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Food Listings */}
      {filteredDonations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching food donations
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or clear category filters to view other available surplus batches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => {
            const isCritical = donation.urgencyLevel === 'CRITICAL' || donation.isRescueMode;

            return (
              <div
                key={donation.id}
                className={`rounded-2xl bg-white dark:bg-slate-900 border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isCritical
                    ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={donation.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                    alt={donation.foodName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />

                  {/* Priority Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md animate-pulse">
                        <Zap className="w-3 h-3 fill-current" />
                        RESCUE MODE
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                        donation.urgencyLevel === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : donation.urgencyLevel === 'MEDIUM'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        Score {donation.priorityScore}/100
                      </span>
                    )}
                  </div>

                  {/* Category Chip */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 backdrop-blur-xs text-white">
                      {donation.category}
                    </span>
                  </div>

                  {/* Status chip at bottom */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-xs">
                      Status: {donation.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[180px]">
                        {donation.donorName}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        ~{donation.estimatedWindowMinutes}m left
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {donation.foodName}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {donation.description}
                    </p>
                  </div>

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div className="font-bold text-slate-900 dark:text-white">{donation.servings}</div>
                      <div className="text-[10px] text-slate-400">Servings</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div className="font-bold text-slate-900 dark:text-white">{donation.storageCondition}</div>
                      <div className="text-[10px] text-slate-400">Storage</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{donation.packaging.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">Packaging</div>
                    </div>
                  </div>

                  {/* Location & Distance Pin */}
                  <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {donation.area || 'Nizamabad'}
                      </span>
                      {currentUser?.latitude && currentUser?.longitude && donation.latitude && donation.longitude && (
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm">
                          {calculateDistanceKm(
                            currentUser.latitude,
                            currentUser.longitude,
                            donation.latitude,
                            donation.longitude
                          ).toFixed(1)}{' '}
                          km away
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate pl-5">
                      {donation.location || donation.pickupLocation}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {donation.status !== 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => {
                            setPortionModalDonation(donation);
                            setRequestedPortion(Math.min(30, donation.servings));
                          }}
                          className="py-2 px-2.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition-colors cursor-pointer"
                          title="Request a partial split portion"
                        >
                          <Split className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleAcceptFull(donation)}
                          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedDonation.donorName}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedDonation.foodName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Urgency & Priority Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Intelligent Rescue Priority: {selectedDonation.priorityScore}/100
                </span>
                <span className="font-bold uppercase text-red-600 dark:text-red-400">
                  [{selectedDonation.urgencyLevel}]
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                "{selectedDonation.priorityReason}"
              </p>
            </div>

            {/* Details Table */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-slate-400">Total Servings</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedDonation.servings} meals</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-slate-400">Storage Condition</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedDonation.storageCondition}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-slate-400">Packaging Type</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedDonation.packaging}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-slate-400">Pickup Address</div>
                <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 truncate">{selectedDonation.pickupLocation}</div>
              </div>
            </div>

            {/* Food Safety Checklist Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verified Food Safety Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Safe for immediate consumption</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hygienically prepared in kitchen</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Packaging sealed & secure</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Accurate pickup window</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAcceptFull(selectedDonation);
                  setSelectedDonation(null);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
              >
                Accept Complete Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portion Request Modal */}
      {portionModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Request Portion / Split
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Can't receive all {portionModalDonation.servings} meals? Claim a portion suited to your shelter's immediate kitchen capacity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Requested Servings:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
                  {requestedPortion} of {portionModalDonation.servings} meals
                </span>
              </div>
              <input
                type="range"
                min="5"
                max={portionModalDonation.servings}
                step="5"
                value={requestedPortion}
                onChange={(e) => setRequestedPortion(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Min: 5</span>
                <span>Max: {portionModalDonation.servings}</span>
              </div>
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
                Confirm {requestedPortion} Meals
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
