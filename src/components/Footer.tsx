import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, ShieldCheck, Mail, MapPin, ExternalLink, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { switchRole } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-extrabold font-display text-white">
                Share<span className="text-emerald-400">Bite</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              "Turn Surplus Food Into Shared Hope." ShareBite bridges commercial food donors, community shelters, and volunteer couriers with smart rescue prioritization.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Safe Surplus Redistribution Protocols</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/listings" className="hover:text-emerald-400 transition-colors">Food Listings</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-emerald-400 transition-colors">Interactive Map</Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-emerald-400 transition-colors">Impact & Statistics</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Participate
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/donor/donate" className="hover:text-emerald-400 transition-colors">Donate Food</Link>
              </li>
              <li>
                <Link to="/ngo-register" className="hover:text-emerald-400 transition-colors">Register as NGO</Link>
              </li>
              <li>
                <Link to="/volunteer-register" className="hover:text-emerald-400 transition-colors">Join as Volunteer</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">About Mission</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Coordination</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hackathon Demo Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Demo Portals
            </h4>
            <p className="text-xs text-slate-400">
              Instant evaluation access for juries and testers:
            </p>
            <div className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => switchRole('DONOR')}
                className="text-left py-1 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                → Food Donor Dashboard
              </button>
              <button
                onClick={() => switchRole('NGO')}
                className="text-left py-1 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                → NGO / Receiver Dashboard
              </button>
              <button
                onClick={() => switchRole('VOLUNTEER')}
                className="text-left py-1 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                → Volunteer Courier Cockpit
              </button>
              <button
                onClick={() => switchRole('ADMIN')}
                className="text-left py-1 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                → Platform Admin Command Center
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Demo Notice */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ShareBite. Built for positive community impact.
          </p>
          <div className="px-3 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400 text-center font-mono text-[11px]">
            Demo Mode Notice: All demonstration metrics and location markers are labelled demo data.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for zero food waste</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
