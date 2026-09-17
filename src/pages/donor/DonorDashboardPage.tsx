import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Truck,
  Building2,
  TrendingUp,
  ArrowRight,
  Filter,
  Eye,
  Bike,
  UserCheck,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Donation } from '../../types';
import { matchDonationToReceivers, matchDonationToCollectors, calculateDistanceKm } from '../../services/matchingEngine';

export const DonorDashboardPage: React.FC = () => {
  const { donations, currentUser, acceptDonationAllocation, assignCollectorToDonation, ngos, volunteers } = useApp();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [assignmentSuccessToast, setAssignmentSuccessToast] = useState<string | null>(null);

  // Filter donations for donor
  const myDonations = donations.filter((d) => {
    if (currentUser?.role === 'DONOR' && currentUser?.id && d.donorId && d.donorId !== currentUser.id) return false;
    if (activeFilter === 'ACTIVE') return d.status !== 'COMPLETED' && d.status !== 'CANCELLED';
    if (activeFilter === 'COMPLETED') return d.status === 'COMPLETED';
    return true;
  });

  const totalServingsDonated = myDonations.reduce((acc, d) => acc + d.servings, 0);
  const activeCount = myDonations.filter((d) => d.status !== 'COMPLETED').length;
  const completedCount = myDonations.filter((d) => d.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Commercial Food Donor Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {currentUser?.organizationName || currentUser?.name || 'Food Donor Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track active surplus batches, monitor matching allocations, and verify courier pickups.
          </p>
        </div>

        <Link
          to="/donor/donate"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Donate Surplus Food</span>
        </Link>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Batches</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
            {activeCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Currently matching / in transit</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meals Donated</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-2">
            {totalServingsDonated.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {donations.length} total logged donations
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rescued Deliveries</div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-display mt-2">
            {completedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Successfully delivered to shelters
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rescue Success Rate</div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display mt-2">
            98.4%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Zero edible food wasted
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Donations ({donations.length})
          </button>
          <button
            onClick={() => setActiveFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Active In-Progress ({activeCount})
          </button>
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Completed & Rescued ({completedCount})
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {myDonations.length} recorded items
        </span>
      </div>

      {/* Donations Table & Cards */}
      <div className="space-y-4">
        {myDonations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Food Donations Logged Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You haven't logged any surplus meals yet. Once you submit a donation, it will be listed here with intelligent shelter matching and status tracking.
            </p>
            <Link
              to="/donor/donate"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Donate Surplus Food</span>
            </Link>
          </div>
        ) : (
          myDonations.map((donation) => {
          const isCritical = donation.urgencyLevel === 'CRITICAL' || donation.isRescueMode;

          return (
            <div
              key={donation.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                isCritical
                  ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Info block */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {donation.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {donation.id}
                    </span>
                    
                    {/* Urgency Pill */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCritical
                        ? 'bg-red-500 text-white animate-pulse'
                        : donation.urgencyLevel === 'HIGH'
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {donation.urgencyLevel} (Score {donation.priorityScore}/100)
                    </span>

                    {/* Status Pill */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {donation.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {donation.foodName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {donation.servings} Servings ({donation.quantity})
                    </span>
                    <span>Storage: {donation.storageCondition}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Window: ~{donation.estimatedWindowMinutes} mins left
                    </span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {donation.area || 'Nizamabad'}
                    </span>
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {donation.pickupLocation || donation.location}
                    </span>
                  </div>
                </div>

                {/* Receiver & Volunteer Info */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-[260px] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Matched Receiver:</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      {donation.allocations?.[0]?.receiverName || donation.matchedNgoName || 'Matching nearby...'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Assigned Courier:</span>
                    {donation.assignedVolunteerName ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-500" />
                        {donation.assignedVolunteerName}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-[11px] hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                      >
                        + Assign Collector
                      </button>
                    )}
                  </div>

                  {donation.allocations && donation.allocations.length > 1 && (
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-emerald-600 dark:text-emerald-400">
                      Multi-Split: Matched across {donation.allocations.length} local shelters
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 justify-end">
                  <button
                    onClick={() => setSelectedDonation(donation)}
                    className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Status & Match
                  </button>
                  <Link
                    to="/map"
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold text-center transition-colors"
                  >
                    Track on Map
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Details & Collector Matching Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Rescue Pipeline Tracking & Matching
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedDonation.foodName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Area: <strong>{selectedDonation.area || 'Nizamabad'}</strong></span>
                  <span>•</span>
                  <span>{selectedDonation.pickupLocation || selectedDonation.location}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {assignmentSuccessToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{assignmentSuccessToast}</span>
              </div>
            )}

            {/* Pipeline Stage Visualizer */}
            <div className="space-y-3 py-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Current Status: <strong className="text-emerald-600 dark:text-emerald-400">{selectedDonation.status.replace(/_/g, ' ')}</strong></span>
                <span className="text-amber-600 font-mono">~{selectedDonation.estimatedWindowMinutes}m remaining</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{
                    width:
                      selectedDonation.status === 'COMPLETED'
                        ? '100%'
                        : selectedDonation.status === 'DELIVERED'
                        ? '90%'
                        : selectedDonation.status === 'IN_TRANSIT'
                        ? '75%'
                        : selectedDonation.status === 'PICKED_UP'
                        ? '60%'
                        : selectedDonation.status === 'VOLUNTEER_ASSIGNED'
                        ? '45%'
                        : selectedDonation.status === 'ACCEPTED'
                        ? '30%'
                        : '15%'
                  }}
                />
              </div>
            </div>

            {/* Smart Matching: Receivers (NGOs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Matched Receivers (NGOs)</span>
                </h4>
                <span className="text-[11px] text-slate-400">Ranked by Proximity & Demand</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchDonationToReceivers(selectedDonation, ngos).slice(0, 4).map((match) => {
                  const isAllocated = selectedDonation.allocations?.some((a) => a.receiverId === match.receiver.id);
                  return (
                    <div
                      key={match.receiver.id}
                      className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-colors ${
                        isAllocated
                          ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{match.receiver.name}</span>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {match.matchScore}% Match
                          </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{match.receiver.area || 'Nizamabad'} ({match.distanceKm.toFixed(1)} km away)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Capacity: {match.receiver.capacity} servings • {match.receiver.demandLevel} Demand
                        </div>
                      </div>

                      {isAllocated && (
                        <div className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Allocated Portion</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Matching: Collectors / Couriers (Requirement 4) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Collector Matching (Same Area First)</span>
                </h4>
                <span className="text-[11px] text-slate-400">Prioritized by Area & Distance</span>
              </div>

              <div className="space-y-2">
                {matchDonationToCollectors(selectedDonation, volunteers).map((match) => {
                  const collector = match.collector;
                  const isAssigned = selectedDonation.assignedVolunteerId === collector.id;
                  const isSameArea = (collector.area || '').toLowerCase() === (selectedDonation.area || '').toLowerCase();

                  return (
                    <div
                      key={collector.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isAssigned
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {collector.name}
                          </span>
                          {isSameArea && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                              Same Area ({collector.area})
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Bike className="w-3 h-3" />
                            {collector.vehicleType || 'Bike'}
                          </span>
                        </div>

                        <div className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {match.distanceKm.toFixed(1)} km away
                          </span>
                          <span>•</span>
                          <span>{collector.availability === 'AVAILABLE' ? '🟢 Available' : '🟡 Active'}</span>
                          <span>•</span>
                          <span>{match.activeMissionsCount} active mission{match.activeMissionsCount === 1 ? '' : 's'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAssigned ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Assigned</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              assignCollectorToDonation(selectedDonation.id, collector.id);
                              setSelectedDonation({
                                ...selectedDonation,
                                assignedVolunteerId: collector.id,
                                assignedVolunteerName: collector.name,
                                status: 'VOLUNTEER_ASSIGNED'
                              });
                              setAssignmentSuccessToast(
                                `Assigned ${collector.name} (${collector.vehicleType}, ${match.distanceKm.toFixed(1)} km away) in ${collector.area} to pickup mission!`
                              );
                              setTimeout(() => setAssignmentSuccessToast(null), 4000);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Assign Collector
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
