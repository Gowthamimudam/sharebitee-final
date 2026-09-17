import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Shield, Building2, Truck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationFields } from './AuthPages';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-xs text-slate-500">Please sign in to view and edit your profile.</p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [area, setArea] = useState(currentUser.area || 'Nizamabad');
  const [location, setLocation] = useState(currentUser.location || currentUser.address || '');
  const [latitude, setLatitude] = useState<number | null>(currentUser.latitude || 18.6725);
  const [longitude, setLongitude] = useState<number | null>(currentUser.longitude || 78.0941);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      area,
      location,
      address: location,
      latitude: latitude || undefined,
      longitude: longitude || undefined
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'DONOR':
        return { label: 'Food Donor', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'NGO':
        return { label: 'NGO / Shelter', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'VOLUNTEER':
        return { label: 'Delivery Collector', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      default:
        return { label: 'System Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
    }
  };

  const badge = getRoleBadge();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Profile & Location Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Update your contact and location details to ensure accurate proximity matching
          </p>
        </div>

        {savedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile and location updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name / Organization *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <LocationFields
            area={area}
            setArea={setArea}
            location={location}
            setLocation={setLocation}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            label="Default Address / Operating Hub"
          />

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
