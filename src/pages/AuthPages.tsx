import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  Building2,
  Truck,
  Shield,
  AlertCircle,
  MapPin,
  Compass,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { KNOWN_AREAS, getAreaCoordinates } from '../services/locationService';

// ============================================================
// HELPER COMPONENT: LOCATION & AREA PICKER
// ============================================================
interface LocationFieldProps {
  area: string;
  setArea: (area: string) => void;
  location: string;
  setLocation: (location: string) => void;
  latitude: number | null;
  setLatitude: (lat: number | null) => void;
  longitude: number | null;
  setLongitude: (lng: number | null) => void;
  label?: string;
  placeholder?: string;
}

export const LocationFields: React.FC<LocationFieldProps> = ({
  area,
  setArea,
  location,
  setLocation,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  label = 'Address / Location',
  placeholder = 'e.g. 104 Gandhi Chowk, Main Road'
}) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');

  // When area changes, if no manual coordinates are set, auto-fill area defaults
  const handleAreaChange = (selectedArea: string) => {
    setArea(selectedArea);
    const coords = getAreaCoordinates(selectedArea);
    setLatitude(coords.lat);
    setLongitude(coords.lng);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Geolocation is not supported by your browser. Using area coordinates.');
      return;
    }
    setGeoLoading(true);
    setGeoMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setGeoMsg(`✓ GPS detected: ${lat}, ${lng}`);
      },
      (err) => {
        setGeoLoading(false);
        const fallback = getAreaCoordinates(area);
        setLatitude(fallback.lat);
        setLongitude(fallback.lng);
        setGeoMsg(`Using default coordinates for ${area}`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Location & Service Area
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Compass className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`} />
          <span>{geoLoading ? 'Detecting...' : 'Use Current Location'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Area / City *
          </label>
          <select
            value={area}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
          >
            {KNOWN_AREAS.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name} ({a.pincode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {label} *
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
            Latitude (for distance & dispatch)
          </label>
          <input
            type="number"
            step="any"
            value={latitude ?? ''}
            onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="18.6725"
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
            Longitude (for distance & dispatch)
          </label>
          <input
            type="number"
            step="any"
            value={longitude ?? ''}
            onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="78.0941"
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      {geoMsg && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
          {geoMsg}
        </p>
      )}
    </div>
  );
};

// ============================================================
// 1. UNIFIED / ROLE-AWARE LOGIN PAGE
// ============================================================
export const LoginPage: React.FC<{ defaultRole?: UserRole }> = ({ defaultRole }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, demoLogin } = useApp();

  const queryRole = searchParams.get('role')?.toUpperCase() as UserRole | undefined;
  const role: UserRole | undefined = queryRole || defaultRole;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address');
      return;
    }

    const targetRole = role || 'DONOR';
    const result = login(email, password, targetRole);
    if (!result.success) {
      if (result.reason === 'ACCOUNT_NOT_FOUND') {
        setErrorMsg('Account not found with this email. Please register first.');
      } else if (result.reason === 'ROLE_MISMATCH') {
        setErrorMsg('This email is registered under a different role. Please sign in via the matching portal.');
      } else if (result.reason === 'INVALID_PASSWORD') {
        setErrorMsg('Incorrect password. Please verify and try again.');
      } else {
        setErrorMsg('Invalid credentials. Please register first.');
      }
      return;
    }

    if (targetRole === 'DONOR') navigate('/donor/dashboard');
    else if (targetRole === 'NGO') navigate('/ngo/dashboard');
    else if (targetRole === 'VOLUNTEER') navigate('/volunteer/dashboard');
    else navigate('/admin/dashboard');
  };

  // If no role is specified in the URL or props, show the 3 public role entry points (Admin is protected and excluded)
  if (!role) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Sign In to ShareBite
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select your role to open your dedicated portal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <Link
              to="/login/donor"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Food Donor
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Restaurants, caterers, supermarkets & businesses donating food.
              </p>
            </Link>

            <Link
              to="/login/ngo"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                NGO / Receiver
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organizations, shelters, community kitchens & distribution centers.
              </p>
            </Link>

            <Link
              to="/login/collector"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-lg transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Collector
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Volunteers and couriers coordinating food pickups and deliveries.
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Exact Role Titles and Configurations matching Section 5 & 6
  const getRoleConfig = () => {
    switch (role) {
      case 'DONOR':
        return {
          title: 'Sign in as Donor',
          subtitle: 'Enter your donor account details to access your dashboard and donate food',
          emailLabel: 'Donor Email',
          emailPlaceholder: 'donor@yourdomain.com',
          buttonText: 'Sign In as Donor',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500',
          accentColor: 'text-emerald-600 dark:text-emerald-400',
          icon: UtensilsCrossed,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
          registerLink: '/register/donor',
          registerText: 'Register as Donor'
        };
      case 'NGO':
        return {
          title: 'Sign in as NGO / Receiver',
          subtitle: 'Enter your organization credentials to manage incoming food allocations',
          emailLabel: 'NGO Email',
          emailPlaceholder: 'ngo@yourdomain.org',
          buttonText: 'Sign In as NGO',
          btnBg: 'bg-blue-600 hover:bg-blue-500',
          accentColor: 'text-blue-600 dark:text-blue-400',
          icon: Building2,
          iconBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
          registerLink: '/register/ngo',
          registerText: 'Register as NGO'
        };
      case 'VOLUNTEER':
        return {
          title: 'Sign in as Collector',
          subtitle: 'Enter your collector credentials to view available pickups and manage missions',
          emailLabel: 'Collector Email',
          emailPlaceholder: 'collector@yourdomain.com',
          buttonText: 'Sign In as Collector',
          btnBg: 'bg-amber-600 hover:bg-amber-500',
          accentColor: 'text-amber-600 dark:text-amber-400',
          icon: Truck,
          iconBg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
          registerLink: '/register/collector',
          registerText: 'Register as Collector'
        };
      case 'ADMIN':
      default:
        return {
          title: 'Platform Admin Sign In',
          subtitle: 'Protected administration console for platform management',
          emailLabel: 'Admin Email',
          emailPlaceholder: 'admin@yourdomain.com',
          buttonText: 'Sign In as Admin',
          btnBg: 'bg-purple-600 hover:bg-purple-500',
          accentColor: 'text-purple-600 dark:text-purple-400',
          icon: Shield,
          iconBg: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
          registerLink: '/',
          registerText: 'Back to Home'
        };
    }
  };

  const config = getRoleConfig();
  const IconComponent = config.icon;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header - Role Specific */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center shadow-md`}>
              <IconComponent className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {config.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {config.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {config.emailLabel} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={config.emailPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden text-sm"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 ${config.btnBg}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{config.buttonText}</span>
            </button>
          </form>

          {role !== 'ADMIN' ? (
            <div className="pt-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Don't have an account?{' '}
              <Link
                to={config.registerLink}
                className={`font-semibold hover:underline ${config.accentColor}`}
              >
                {config.registerText}
              </Link>
            </div>
          ) : (
            <div className="pt-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <Link to="/" className="hover:underline">
                Return to Public Homepage
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ============================================================
// 2. DONOR REGISTRATION PAGE
// ============================================================
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Nizamabad');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(18.6725);
  const [longitude, setLongitude] = useState<number | null>(78.0941);
  const [foodCategories, setFoodCategories] = useState<string[]>(['Cooked Meals']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleCategory = (cat: string) => {
    setFoodCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!area || !location.trim()) {
      setErrorMsg('Please specify your Area and Address');
      return;
    }

    registerUser({
      name: fullName,
      organizationName: orgName || fullName,
      email,
      phone,
      area,
      location,
      address: location,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      password: password || undefined,
      role: 'DONOR'
    });

    navigate('/donor/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Create Your Donor Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Register to donate surplus food directly to verified local shelters
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Green Leaf Restaurant / Grand Caterers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Location & Area Section */}
            <LocationFields
              area={area}
              setArea={setArea}
              location={location}
              setLocation={setLocation}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              label="Pickup Address / Facility Location"
              placeholder="e.g. 742 Evergreen Terrace, Downtown Nizamabad"
            />

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Food Type / Donation Source <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Cooked Meals', 'Bakery & Bread', 'Fresh Produce', 'Packaged Goods', 'Dairy & Grocery'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      foodCategories.includes(cat)
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer mt-2"
            >
              Register as Donor
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{' '}
            <Link to="/login/donor" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Sign In as Donor
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================
// 3. NGO / RECEIVER REGISTRATION PAGE
// ============================================================
export const NgoRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useApp();

  const [ngoName, setNgoName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Nizamabad');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(18.6740);
  const [longitude, setLongitude] = useState<number | null>(78.0960);
  const [capacity, setCapacity] = useState(60);
  const [demandLevel, setDemandLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!area || !location.trim()) {
      setErrorMsg('Please enter your Area and Delivery Address');
      return;
    }

    registerUser({
      name: ngoName,
      organizationName: ngoName,
      contactPerson,
      email,
      phone,
      area,
      location,
      address: location,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      capacity,
      demandLevel,
      password: password || undefined,
      role: 'NGO'
    });

    navigate('/ngo/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Create Your NGO Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organizations, shelters, community kitchens and groups that receive and distribute food
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NGO / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  placeholder="e.g. Hope Foundation Outreach"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@hopeoutreach.demo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43220"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Location & Area Section */}
            <LocationFields
              area={area}
              setArea={setArea}
              location={location}
              setLocation={setLocation}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              label="Delivery Address / Shelter Dock"
              placeholder="e.g. 104 Hope Avenue, Gandhi Chowk, Nizamabad"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meal Capacity (People/Meals Per Batch) *
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="5000"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Demand *
                </label>
                <select
                  value={demandLevel}
                  onChange={(e) => setDemandLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="CRITICAL">Critical Demand (Urgent shortfall)</option>
                  <option value="HIGH">High Demand (Daily regular intake)</option>
                  <option value="MEDIUM">Medium Demand (Scheduled feeding)</option>
                  <option value="LOW">Low Demand (Pantry sufficient)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer mt-2"
            >
              Register as NGO
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{' '}
            <Link to="/login/ngo" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign In as NGO
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================
// 4. COLLECTOR / VOLUNTEER REGISTRATION PAGE
// ============================================================
export const VolunteerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Nizamabad');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(18.6710);
  const [longitude, setLongitude] = useState<number | null>(78.0920);
  const [serviceArea, setServiceArea] = useState('Central Nizamabad & Outskirts');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [availability, setAvailability] = useState<'AVAILABLE' | 'BUSY'>('AVAILABLE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!area || !location.trim()) {
      setErrorMsg('Please specify your Area and Base Location');
      return;
    }

    registerUser({
      name: fullName,
      email,
      phone,
      area,
      location,
      address: location,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      vehicleType,
      availability,
      password: password || undefined,
      role: 'VOLUNTEER'
    });

    navigate('/volunteer/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Create Your Collector Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Volunteers and delivery partners who coordinate food pickups and deliveries
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                  placeholder="ravi@sharebite.demo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43230"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Area *
                </label>
                <input
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Nizamabad Central, Bodhan Road"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Location & Area Section */}
            <LocationFields
              area={area}
              setArea={setArea}
              location={location}
              setLocation={setLocation}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              label="Base Location / Stand / Colony"
              placeholder="e.g. Tilak Road, Nizamabad"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transport Type *
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Bike">Bicycle / Cargo Bike</option>
                  <option value="Scooter">Scooter / Motorcycle</option>
                  <option value="Van">Delivery Van</option>
                  <option value="Car">Car / Auto</option>
                  <option value="On Foot">On Foot / Handcart</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Availability *
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="AVAILABLE">Available (Ready for missions)</option>
                  <option value="BUSY">Busy (Temporarily offline)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer mt-2"
            >
              Register as Collector
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{' '}
            <Link to="/login/collector" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              Sign In as Collector
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
