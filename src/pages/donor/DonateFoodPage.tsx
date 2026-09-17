import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateRescuePriority } from '../../services/priorityEngine';
import { FoodCategory, FoodType, StorageCondition, PackagingType } from '../../types';
import { LocationFields } from '../AuthPages';

export const DonateFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDonation, currentUser } = useApp();

  // Form Fields
  const [foodName, setFoodName] = useState('Nutritious Warm Pasta & Rice Grain Bowls');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [foodType, setFoodType] = useState<FoodType>('Cooked');
  const [description, setDescription] = useState(
    'Fresh vegetarian pasta and brown rice bowls packaged in thermal containers, prepared for corporate event catering.'
  );
  const [quantity, setQuantity] = useState('24 trays');
  const [servings, setServings] = useState<number>(120);
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('Hot');
  const [packaging, setPackaging] = useState<PackagingType>('Bulk trays');
  
  // Location & Area
  const [area, setArea] = useState(currentUser?.area || 'Nizamabad');
  const [pickupLocation, setPickupLocation] = useState(
    currentUser?.location || currentUser?.address || '742 Tilak Road, Gandhi Chowk, Nizamabad'
  );
  const [latitude, setLatitude] = useState<number | null>(currentUser?.latitude || 18.6725);
  const [longitude, setLongitude] = useState<number | null>(currentUser?.longitude || 78.0941);
  const [donorContact, setDonorContact] = useState(currentUser?.phone || '+91 98765 43210');
  const [allergens, setAllergens] = useState<string[]>(['Gluten', 'Dairy']);
  
  // Timing
  const now = new Date();
  const defaultPrepared = new Date(now.getTime() - 45 * 60 * 1000).toISOString().slice(0, 16);
  const defaultAvailable = now.toISOString().slice(0, 16);
  const defaultExpiry = new Date(now.getTime() + 120 * 60 * 1000).toISOString().slice(0, 16);

  const [preparedAt, setPreparedAt] = useState(defaultPrepared);
  const [availableFrom, setAvailableFrom] = useState(defaultAvailable);
  const [bestBefore, setBestBefore] = useState(defaultExpiry);

  // 5-Point Safety Checklist
  const [safetyChecklist, setSafetyChecklist] = useState({
    safeForConsumption: true,
    hygienicPrep: true,
    securePackaging: true,
    allergenDeclared: true,
    accurateWindow: true
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Live Priority Engine Calculation
  const priorityPreview = useMemo(() => {
    return calculateRescuePriority({
      foodType,
      storageCondition,
      servings,
      bestBefore: new Date(bestBefore).toISOString(),
      nearbyDemandLevel: 'HIGH'
    });
  }, [foodType, storageCondition, servings, bestBefore]);

  const toggleAllergen = (item: string) => {
    if (allergens.includes(item)) {
      setAllergens(allergens.filter((a) => a !== item));
    } else {
      setAllergens([...allergens, item]);
    }
  };

  const handleAllChecklist = (checked: boolean) => {
    setSafetyChecklist({
      safeForConsumption: checked,
      hygienicPrep: checked,
      securePackaging: checked,
      allergenDeclared: checked,
      accurateWindow: checked
    });
  };

  const isChecklistComplete = Object.values(safetyChecklist).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecklistComplete) {
      setErrorMsg('Please confirm all 5 food safety and hygiene points before posting.');
      return;
    }

    addDonation({
      donorName: currentUser?.organizationName || currentUser?.name || 'Green Leaf Restaurant & Catering',
      foodName,
      category,
      foodType,
      description,
      quantity: parseFloat(quantity) || servings,
      unit: 'trays',
      servings,
      preparationDateTime: new Date(preparedAt).toISOString(),
      preparedAt: new Date(preparedAt).toISOString(),
      availableFrom: new Date(availableFrom).toISOString(),
      bestBefore: new Date(bestBefore).toISOString(),
      storageCondition,
      packaging,
      area: area || 'Nizamabad',
      location: pickupLocation,
      pickupLocation,
      latitude: latitude || 18.6725,
      longitude: longitude || 78.0941,
      donorPhone: donorContact,
      allergens,
      safetyChecklist: {
        isSafeForConsumption: safetyChecklist.safeForConsumption,
        isHygienicallyPrepared: safetyChecklist.hygienicPrep,
        isPackagingSecure: safetyChecklist.securePackaging,
        isAllergenInfoProvided: safetyChecklist.allergenDeclared,
        isPickupWindowAccurate: safetyChecklist.accurateWindow
      },
      imageUrl:
        category === 'Cooked Meals'
          ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
          : category === 'Bakery & Bread'
          ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
          : category === 'Fresh Produce'
          ? 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
    });

    navigate('/donor/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Surplus Intake System</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Donate Surplus Food
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Log commercial food surplus with temperature and storage specs. Our engine will immediately calculate rescue priority and notify matching shelters.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Food Details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              <span>Food Item Specifications</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Food Name / Title *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Vegetarian Pasta & Grain Bowls"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Cooked Meals">Cooked Meals</option>
                  <option value="Bakery & Bread">Bakery & Bread</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Packaged Goods">Packaged Goods</option>
                  <option value="Dairy & Grocery">Dairy & Grocery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Type
                </label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value as FoodType)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Cooked">Cooked (High Perishability)</option>
                  <option value="Fresh Produce">Fresh Produce (Medium Perishability)</option>
                  <option value="Bakery">Bakery (Medium Perishability)</option>
                  <option value="Packaged">Packaged (Standard Shelf-life)</option>
                  <option value="Grocery">Grocery / Pantry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description & Ingredients
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on food preparation, main ingredients, and instructions..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Description *
                </label>
                <input
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 24 trays / 30 kg"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Servings / Meals *
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  required
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Handling & Timing */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              <span>Handling, Temperature & Expiry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Condition
                </label>
                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Hot">Hot (&gt; 60°C / 140°F)</option>
                  <option value="Refrigerated">Refrigerated (&lt; 4°C / 40°F)</option>
                  <option value="Room temperature">Room temperature</option>
                  <option value="Frozen">Frozen (&lt; -18°C / 0°F)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Packaging Format
                </label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value as PackagingType)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Bulk trays">Bulk trays</option>
                  <option value="Individual containers">Individual containers</option>
                  <option value="Sealed packages">Sealed packages</option>
                  <option value="Cartons & Boxes">Cartons & Boxes</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prepared At
                </label>
                <input
                  type="datetime-local"
                  value={preparedAt}
                  onChange={(e) => setPreparedAt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Best Before / Expiry *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bestBefore}
                  onChange={(e) => setBestBefore(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-amber-600 dark:text-amber-400 font-semibold"
                />
              </div>
            </div>

            {/* Allergens Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Contains Allergens
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Gluten', 'Dairy', 'Nuts / Peanuts', 'Eggs', 'Soy', 'Shellfish', 'None / Allergen-Free'].map(
                  (allergen) => (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        allergens.includes(allergen)
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {allergens.includes(allergen) ? '✓ ' : ''}{allergen}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Location & Safety Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                3
              </span>
              <span>Pickup Coordination & 5-Point Safety Pledge</span>
            </h3>

            <div className="space-y-4">
              <LocationFields
                area={area}
                setArea={setArea}
                location={pickupLocation}
                setLocation={setPickupLocation}
                latitude={latitude}
                setLatitude={setLatitude}
                longitude={longitude}
                setLongitude={setLongitude}
                label="Pickup Address / Dock Location"
                placeholder="e.g. 742 Tilak Road, Gandhi Chowk, Nizamabad"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kitchen Dispatch Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={donorContact}
                  onChange={(e) => setDonorContact(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* 5-Point Safety Verification */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory 5-Point Food Safety Protocol
                </span>
                <button
                  type="button"
                  onClick={() => handleAllChecklist(!isChecklistComplete)}
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {isChecklistComplete ? 'Uncheck all' : 'Check all 5'}
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.safeForConsumption}
                    onChange={(e) =>
                      setSafetyChecklist({ ...safetyChecklist, safeForConsumption: e.target.checked })
                    }
                    className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                  />
                  <span>1. Food is wholesome and certified safe for immediate consumption.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.hygienicPrep}
                    onChange={(e) =>
                      setSafetyChecklist({ ...safetyChecklist, hygienicPrep: e.target.checked })
                    }
                    className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                  />
                  <span>2. Prepared and stored in a sanitized commercial facility.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.securePackaging}
                    onChange={(e) =>
                      setSafetyChecklist({ ...safetyChecklist, securePackaging: e.target.checked })
                    }
                    className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                  />
                  <span>3. Packaging is clean, tamper-sealed, and food-grade.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.allergenDeclared}
                    onChange={(e) =>
                      setSafetyChecklist({ ...safetyChecklist, allergenDeclared: e.target.checked })
                    }
                    className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                  />
                  <span>4. Allergen and dietary traits are declared accurately above.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.accurateWindow}
                    onChange={(e) =>
                      setSafetyChecklist({ ...safetyChecklist, accurateWindow: e.target.checked })
                    }
                    className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
                  />
                  <span>5. The pickup window is active and staff will be on-site to hand off.</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              Post Food Surplus & Dispatch Matches
            </button>
          </div>
        </div>

        {/* Right Column: Live Priority & Match Forecast */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rescue Forecast
              </span>
              {priorityPreview.isRescueMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  ⚡ RESCUE MODE
                </span>
              )}
            </div>

            <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div className="text-4xl font-black font-mono text-white">
                {priorityPreview.score}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mt-1">
                {priorityPreview.urgencyLevel} Urgency Priority
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Time & Window Factor:</span>
                <span className="font-mono text-white">{priorityPreview.breakdown.timeScore}/40</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Meal Servings Factor:</span>
                <span className="font-mono text-white">{priorityPreview.breakdown.servingsScore}/25</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Perishability Factor:</span>
                <span className="font-mono text-white">{priorityPreview.breakdown.perishabilityScore}/20</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Nearby Shelter Demand:</span>
                <span className="font-mono text-white">{priorityPreview.breakdown.demandScore}/15</span>
              </div>
            </div>

            {/* Smart Matching Preview */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Predicted Shelter Matches:</div>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                  <span>Hope Foundation Outreach (2.4 km)</span>
                  <span className="text-emerald-400 font-bold">60 meals</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                  <span>Community Care Center (3.8 km)</span>
                  <span className="text-blue-400 font-bold">40 meals</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                  <span>Helping Hands Shelter (5.1 km)</span>
                  <span className="text-amber-400 font-bold">20 meals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
