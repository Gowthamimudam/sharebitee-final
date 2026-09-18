import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Heart,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  PlusCircle,
  MapPin,
  Shield,
  Truck,
  Building2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    switchRole,
    isDarkMode,
    toggleDarkMode,
    unreadNotificationCount,
    startDemoScenario
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const roleLabelMap: Record<UserRole, { label: string; badgeColor: string; icon: any }> = {
    DONOR: { label: 'Food Donor', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800', icon: UtensilsCrossed },
    NGO: { label: 'NGO / Receiver', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800', icon: Building2 },
    VOLUNTEER: { label: 'Volunteer Courier', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800', icon: Truck },
    ADMIN: { label: 'Platform Admin', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800', icon: Shield }
  };

  // Public links when not logged in
  const publicLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Impact', path: '/impact' },
    { name: 'Contact', path: '/contact' }
  ];

  // Role specific navigation
  const getRoleLinks = () => {
    if (!currentUser) return [];
    switch (currentUser.role) {
      case 'DONOR':
        return [
          { name: 'Home', path: '/home' },
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Donate Food', path: '/donate', highlight: true },
          { name: 'My Donations', path: '/my-donations' },
          { name: 'Matches', path: '/matches' },
          { name: 'Food Map', path: '/map' },
          { name: 'Impact', path: '/impact' }
        ];
      case 'NGO':
        return [
          { name: 'Home', path: '/home' },
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Food Listings', path: '/food-listings' },
          { name: 'Matches', path: '/matches' },
          { name: 'Pickup Requests', path: '/pickups' },
          { name: 'Food Map', path: '/map' },
          { name: 'Impact', path: '/impact' }
        ];
      case 'VOLUNTEER':
        return [
          { name: 'Home', path: '/home' },
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Available Pickups', path: '/available-pickups' },
          { name: 'My Missions', path: '/missions' },
          { name: 'Food Map', path: '/map' },
          { name: 'Impact', path: '/impact' }
        ];
      case 'ADMIN':
        return [
          { name: 'Home', path: '/home' },
          { name: 'Admin Dashboard', path: '/admin/dashboard' },
          { name: 'Users', path: '/admin/users' },
          { name: 'Donations', path: '/admin/donations' },
          { name: 'Matches', path: '/matches' },
          { name: 'Missions', path: '/admin/missions' },
          { name: 'Impact', path: '/impact' },
          { name: 'Settings', path: '/profile' }
        ];
      default:
        return [];
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setRoleSwitcherOpen(false);
    setProfileDropdownOpen(false);
    if (role === 'DONOR') navigate('/donor/dashboard');
    else if (role === 'NGO') navigate('/ngo/dashboard');
    else if (role === 'VOLUNTEER') navigate('/volunteer/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow">
                  <Heart className="w-2.5 h-2.5 fill-current" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-none">
                  Share<span className="text-emerald-600 dark:text-emerald-400">Bite</span>
                </span>
                <span className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
                  Surplus Food Rescue
                </span>
              </div>
            </Link>

            {/* Role indicator pill if logged in */}
            {currentUser && (
              <div className="hidden xl:flex items-center ml-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    roleLabelMap[currentUser.role].badgeColor
                  }`}
                >
                  {React.createElement(roleLabelMap[currentUser.role].icon, { className: 'w-3 h-3' })}
                  <span>{roleLabelMap[currentUser.role].label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentUser ? (
              getRoleLinks().map((rLink) => (
                <Link
                  key={rLink.path}
                  to={rLink.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    rLink.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm'
                      : isActive(rLink.path)
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {rLink.name}
                </Link>
              ))
            ) : (
              publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell - ONLY AFTER LOGIN */}
            {currentUser && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Buttons or User Menu */}
            {currentUser ? (
              <div className="relative">
               
               <button
  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
>
  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center ring-2 ring-emerald-500/30">
    <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
  </div>

  <span className="hidden md:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate text-left">
    {currentUser.name.split(' ')[0]}
  </span>

  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
</button>
                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${roleLabelMap[currentUser.role].badgeColor}`}>
                        {roleLabelMap[currentUser.role].label}
                      </span>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                      >
                        Profile & Location Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg">
          {currentUser ? (
            <>
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.area || 'Nizamabad'} • {currentUser.role}</p>
              </div>
              {getRoleLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    link.highlight
                      ? 'bg-emerald-600 text-white font-semibold'
                      : isActive(link.path)
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Profile & Location
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg"
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
