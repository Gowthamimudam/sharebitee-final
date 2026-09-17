import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  RefreshCw,
  LocateFixed,
  Building2,
  UtensilsCrossed,
  Info,
  Compass,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MapPoint {
  id: string;
  name: string;
  type: 'DONOR' | 'NGO';
  address: string;
  area: string;
  capacity?: number;
  demandLevel?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  x: number; // percentage on map canvas 0-100
  y: number; // percentage on map canvas 0-100
}

export const MapPage: React.FC = () => {
  const { currentUser, ngos } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Determine the donor's own location
  const donorName = currentUser?.organizationName || currentUser?.name || 'Your Donor Location';
  const donorAddress = currentUser?.address || currentUser?.location || 'Registered Facility Address';
  const donorArea = currentUser?.area || 'Local Area';
  const donorLat = currentUser?.latitude ?? 18.6725;
  const donorLng = currentUser?.longitude ?? 78.0941;

  const donorPoint: MapPoint = {
    id: currentUser?.id || 'donor-own-location',
    name: donorName,
    type: 'DONOR',
    address: donorAddress,
    area: donorArea,
    email: currentUser?.email,
    phone: currentUser?.phone,
    x: 50,
    y: 50
  };

  // 2. Real registered NGOs mapped relative to donor's location (no fake points)
  const registeredNgosCount = ngos.length;

  const ngoPoints: MapPoint[] = ngos.map((ngo, idx) => {
    // Offset calculation relative to donor location
    const dLat = (ngo.latitude ?? 18.6740) - donorLat;
    const dLng = (ngo.longitude ?? 78.0960) - donorLng;

    let x = 50 + dLng * 200;
    let y = 50 - dLat * 200;

    // If coordinates are identical or default, distribute radially around donor
    if (Math.abs(dLat) < 0.001 && Math.abs(dLng) < 0.001) {
      const angle = (idx / Math.max(1, registeredNgosCount)) * 2 * Math.PI + Math.PI / 4;
      const radius = 22; // 22% canvas radius
      x = 50 + radius * Math.cos(angle);
      y = 50 + radius * Math.sin(angle);
    }

    // Clamp coordinates safely within the interactive viewport
    x = Math.max(18, Math.min(82, x));
    y = Math.max(18, Math.min(82, y));

    return {
      id: ngo.id,
      name: ngo.name,
      type: 'NGO',
      address: ngo.address || ngo.location || 'Registered NGO Facility',
      area: ngo.area || 'Local Area',
      capacity: ngo.capacity,
      demandLevel: ngo.demandLevel || 'HIGH',
      contactPerson: ngo.contactPerson,
      email: ngo.email,
      phone: ngo.phone,
      x: Math.round(x),
      y: Math.round(y)
    };
  });

  // Filter registered NGOs based on search query
  const filteredNgos = ngoPoints.filter((ngo) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ngo.name.toLowerCase().includes(q) ||
      ngo.address.toLowerCase().includes(q) ||
      ngo.area.toLowerCase().includes(q) ||
      (ngo.contactPerson && ngo.contactPerson.toLowerCase().includes(q))
    );
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Donor Food Map</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Local NGO & Shelter Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Showing your donor organization location and real registered receiving NGOs in your community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/donor/donate"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            + Donate Surplus Food
          </Link>
        </div>
      </div>

      {/* Clean Zero Registered NGOs Notice */}
      {registeredNgosCount === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              No registered NGOs/receivers nearby yet. When NGOs register in your area, they will appear here.
            </span>
          </div>
          <Link
            to="/register/ngo"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold whitespace-nowrap shrink-0 transition-colors"
          >
            Register an NGO
          </Link>
        </div>
      )}

      {/* Control and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input for Registered NGOs */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registered shelters by name or address..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Action icons: Center Donor Location & Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setSelectedPoint(donorPoint)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Center on my location"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Location</span>
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh map"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Canvas Visualizer */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-lg min-h-[500px] h-[550px]">
        
        {/* Clean Stylized SVG Map Grid & Coordinate Concentric Rings */}
        <svg className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-300 dark:text-slate-800" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Radial Range Rings around Donor Reference Point */}
          <circle cx="50%" cy="50%" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-emerald-500/20 dark:text-emerald-400/20" />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-emerald-500/15 dark:text-emerald-400/15" />
          <circle cx="50%" cy="50%" r="240" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" className="text-emerald-500/10 dark:text-emerald-400/10" />

          {/* Transit Connecting Vectors from Donor to Registered NGOs */}
          {filteredNgos.map((ngo) => (
            <line
              key={`line-${ngo.id}`}
              x1="50%"
              y1="50%"
              x2={`${ngo.x}%`}
              y2={`${ngo.y}%`}
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-70 dark:opacity-50"
            />
          ))}
        </svg>

        {/* Legend Box: Strictly Donor Location and Registered NGOs only */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-md space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
            Map Legend
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[9px] shadow-xs">★</span>
            <span>Your Donor Location (Reference)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] shadow-xs">●</span>
            <span>Registered NGOs ({registeredNgosCount})</span>
          </div>
        </div>

        {/* 1. DONOR'S OWN LOCATION PIN (Reference Point at 50%, 50%) */}
        <div
          onClick={() => setSelectedPoint(donorPoint)}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all"
          style={{ left: `${donorPoint.x}%`, top: `${donorPoint.y}%` }}
        >
          {/* Subtle pulse ring around donor center */}
          <span className="absolute -inset-3 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" />

          {/* Marker pin */}
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow-xl ring-4 ring-white dark:ring-slate-900 bg-emerald-600 text-white transition-transform group-hover:scale-125 ${
              selectedPoint?.id === donorPoint.id ? 'scale-125 ring-emerald-400' : ''
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
          </div>

          {/* Hover Tag */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block whitespace-nowrap z-30 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-md shadow-md pointer-events-none">
            {donorPoint.name} (Your Location)
          </div>
        </div>

        {/* 2. REAL REGISTERED NGOS PINS */}
        {filteredNgos.map((ngo) => {
          const isSelected = selectedPoint?.id === ngo.id;

          return (
            <div
              key={ngo.id}
              onClick={() => setSelectedPoint(ngo)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all"
              style={{ left: `${ngo.x}%`, top: `${ngo.y}%` }}
            >
              {/* Marker pin */}
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full shadow-lg ring-3 ring-white dark:ring-slate-900 bg-blue-600 text-white transition-transform group-hover:scale-125 ${
                  isSelected ? 'scale-125 ring-blue-400' : ''
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>

              {/* Marker hover label */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block whitespace-nowrap z-30 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-md shadow-md pointer-events-none">
                {ngo.name}
              </div>
            </div>
          );
        })}

        {/* Selected Marker Detail Card (NO distance or km display) */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-2xl text-white ${
                    selectedPoint.type === 'DONOR' ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                >
                  {selectedPoint.type === 'DONOR' ? (
                    <UtensilsCrossed className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedPoint.type === 'DONOR' ? 'Your Location (Donor)' : 'Registered NGO / Receiver'}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedPoint.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{selectedPoint.address}</span>
              </div>
              <div className="text-[11px] text-slate-400 pl-5">
                Area: {selectedPoint.area}
              </div>

              {selectedPoint.type === 'NGO' && selectedPoint.capacity && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Absorption Capacity:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedPoint.capacity} meals / day
                  </span>
                </div>
              )}

              {selectedPoint.type === 'NGO' && selectedPoint.demandLevel && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Current Demand:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {selectedPoint.demandLevel}
                  </span>
                </div>
              )}

              {selectedPoint.contactPerson && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedPoint.contactPerson} {selectedPoint.phone ? `(${selectedPoint.phone})` : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              {selectedPoint.type === 'DONOR' ? (
                <Link
                  to="/donor/donate"
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                >
                  Create Donation
                </Link>
              ) : (
                <Link
                  to="/donor/donate"
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                >
                  Direct Donation to this NGO
                </Link>
              )}
              <button
                onClick={() => setSelectedPoint(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
