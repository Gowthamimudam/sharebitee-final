import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Donation,
  DonationAllocation,
  DonationStatus,
  FoodType,
  ImpactStats,
  MissionStage,
  NotificationItem,
  PickupMission,
  ReceiverNGO,
  StorageCondition,
  UrgencyLevel,
  User,
  UserRole,
  Volunteer
} from '../types';
import {
  INITIAL_DONATIONS,
  INITIAL_IMPACT_STATS,
  INITIAL_MISSIONS,
  INITIAL_NGOS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_VOLUNTEERS
} from '../services/mockData';
import { calculateRescuePriority } from '../services/priorityEngine';
import { matchDonationToReceivers, matchDonationToCollectors, calculateDistanceKm } from '../services/matchingEngine';

interface DemoScenarioState {
  isActive: boolean;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  roleHint: UserRole;
  isPlaying: boolean;
}

export interface LoginResult {
  success: boolean;
  reason?: 'ACCOUNT_NOT_FOUND' | 'ROLE_MISMATCH' | 'INVALID_PASSWORD';
}

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  users: User[];
  donations: Donation[];
  ngos: ReceiverNGO[];
  volunteers: Volunteer[];
  missions: PickupMission[];
  notifications: NotificationItem[];
  impactStats: ImpactStats;
  isDarkMode: boolean;
  demoScenario: DemoScenarioState;
  
  // Theme
  toggleDarkMode: () => void;
  
  // Auth
  login: (email: string, passwordOrRole?: string | UserRole, role?: UserRole) => LoginResult;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  registerUser: (newUser: Partial<User> & { password?: string; transportType?: string }) => User;
  updateUserProfile: (updates: Partial<User>) => void;
  
  // Donations
  createDonation: (data: Partial<Donation>) => Donation;
  addDonation: (data: Partial<Donation>) => Donation;
  updateDonationStatus: (donationId: string, status: DonationStatus) => void;
  updateDonationAllocations: (donationId: string, allocations: DonationAllocation[]) => void;
  
  // NGO actions
  acceptDonationAllocation: (donationId: string, receiverId: string, servings?: number) => void;
  updateNgoProfile: (ngoId: string, updates: Partial<ReceiverNGO>) => void;
  updateNgoSettings: (ngoId: string, updates: Partial<ReceiverNGO>) => void;
  
  // Volunteer & Missions
  assignCollectorToDonation: (donationId: string, volunteerId: string) => void;
  acceptMission: (missionId: string) => void;
  startPickup: (missionId: string) => void;
  verifyPickup: (missionId: string, servings: number, condition: 'Good' | 'Fair' | 'Poor', packaging: 'Secure' | 'Damaged') => void;
  markCollected: (missionId: string) => void;
  startDelivery: (missionId: string) => void;
  markDelivered: (missionId: string) => void;
  completeMission: (missionId: string) => void;
  updateMissionStage: (missionId: string, nextStage: MissionStage, extra?: Partial<PickupMission>) => void;

  // Rescue Mode
  isRescueModeActive: boolean;
  toggleRescueMode: () => void;
  
  // Notifications
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'> & { isRead?: boolean }) => void;
  
  // Demo Engine
  startDemoScenario: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  resetDemoScenario: () => void;
  toggleAutoPlayDemo: () => void;
  resetAllDataToDefaults: () => void;
  resetToDemoBaseline: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'sharebite_prod_auth_v3',
  USERS: 'sharebite_prod_users_v3',
  DONATIONS: 'sharebite_prod_donations_v3',
  MISSIONS: 'sharebite_prod_missions_v3',
  NGOS: 'sharebite_prod_ngos_v3',
  VOLUNTEERS: 'sharebite_prod_volunteers_v3',
  NOTIFICATIONS: 'sharebite_prod_notifications_v3',
  IMPACT: 'sharebite_prod_impact_v3',
  THEME: 'sharebite_theme_v3'
};

const DEMO_STEPS = [
  {
    step: 1,
    title: 'Open ShareBite Network',
    description: 'Welcome to ShareBite. Browse current surplus alerts, live map, and active community organizations.',
    roleHint: 'DONOR' as UserRole
  },
  {
    step: 2,
    title: 'Launch Demo Mode',
    description: 'Hackathon Demo Mode initialized with Green Leaf Restaurant batch of 120 warm meals.',
    roleHint: 'DONOR' as UserRole
  },
  {
    step: 3,
    title: 'Show Green Leaf Restaurant Donation',
    description: 'Donor "Green Leaf Restaurant" posts 120 freshly prepared warm pasta & grain bowls.',
    roleHint: 'DONOR' as UserRole
  },
  {
    step: 4,
    title: 'Review Servings & Specs',
    description: '120 nutritious meals ready in thermal containers. Food safety checklist verified 5/5.',
    roleHint: 'DONOR' as UserRole
  },
  {
    step: 5,
    title: 'Intelligent Rescue Priority: 94/100 CRITICAL',
    description: 'Rescue Priority Engine activates RESCUE MODE (52 mins window remaining, hot storage required).',
    roleHint: 'DONOR' as UserRole
  },
  {
    step: 6,
    title: 'Smart Matching Engine Recommends Receivers',
    description: 'Algorithm matches: Hope Foundation (60 meals), Community Care (40 meals), Helping Hands (20 meals). 100% matched!',
    roleHint: 'DONOR' as UserRole
  },
  {
    step: 7,
    title: 'NGO Accepts Food Portions',
    description: 'Sarah Jenkins (Hope Foundation) accepts allocation of 60 meals. Network notifies nearest courier.',
    roleHint: 'NGO' as UserRole
  },
  {
    step: 8,
    title: 'Volunteer Receives Dispatch Alert',
    description: 'Courier Arjun Patel receives rapid-dispatch notification for 2.4 km hot meal rescue.',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 9,
    title: 'Volunteer Accepts Mission',
    description: 'Arjun accepts the mission in the Mission Cockpit. ETA calculated at 14 minutes.',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 10,
    title: 'Start Pickup to Donor Location',
    description: 'Volunteer is en route to Green Leaf Restaurant (742 Evergreen Terrace).',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 11,
    title: 'Verify Food Condition at Donor Door',
    description: 'Hygienic inspection confirmed: 120 meals, Good temperature, Secure tamper packaging.',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 12,
    title: 'Mark Food Collected',
    description: 'Batch loaded into insulated thermal carriers. Status updated to FOOD COLLECTED.',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 13,
    title: 'Start Delivery (In Transit)',
    description: 'Courier departs donor kitchen heading towards Hope Foundation receiving dock.',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 14,
    title: 'Mark Delivered at Receiving Shelter',
    description: 'Arrived at Hope Foundation. Shelter kitchen supervisor signs for delivery receipt.',
    roleHint: 'VOLUNTEER' as UserRole
  },
  {
    step: 15,
    title: 'Complete Mission & Close Loop',
    description: 'Mission marked RESCUED. Both donor and NGO logs synchronized across network.',
    roleHint: 'ADMIN' as UserRole
  },
  {
    step: 16,
    title: '120 Meals Rescued!',
    description: 'Impact updated in real time: +120 meals served, +54 kg food waste diverted, +138 kg CO2 avoided!',
    roleHint: 'ADMIN' as UserRole
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Users State: Strict Default is empty (NO HARDCODED DEFAULT USERS)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Active User State: Strict Default is null (NOT AUTHENTICATED ON STARTUP)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Authenticate session safely on startup
  useEffect(() => {
    try {
      // Invalidate and purge old demo session keys so Maya / Green Leaf never auto-log in
      const obsoleteKeys = [
        'sharebite_session_auth_v5',
        'sharebite_session_auth_v4',
        'sharebite_session_auth_v3',
        'sharebite_session_auth_v2',
        'sharebite_session_auth_v1',
        'sharebite_authenticated_user_v3',
        'sharebite_authenticated_user_v2',
        'sharebite_authenticated_user_v1',
        'sharebite_current_user_v1',
        'sharebite_current_user_v2',
        'sharebite_current_user',
        'sharebite_user',
        'sharebite_donor',
        'sharebite_ngo',
        'sharebite_collector',
        'sharebite_donations_v1',
        'sharebite_missions_v1',
        'sharebite_ngos_v1',
        'sharebite_volunteers_v1',
        'sharebite_notifications_v1',
        'sharebite_impact_v1'
      ];
      obsoleteKeys.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only keep if the user exists in stored registered users
        const savedUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
        const registeredUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
        const match = registeredUsers.find((u) => u.id === parsed.id && u.email.toLowerCase() === parsed.email.toLowerCase());
        if (match && match.isExplicitLogin) {
          setCurrentUser(match);
        } else {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Donations State: Strict Default is empty
  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // NGOs State: Strict Default is empty
  const [ngos, setNgos] = useState<ReceiverNGO[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NGOS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Volunteers State: Strict Default is empty
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Critical Rescue Mode State
  const [isRescueModeActive, setIsRescueModeActive] = useState<boolean>(false);
  const toggleRescueMode = () => setIsRescueModeActive((prev) => !prev);

  // Missions State: Strict Default is empty
  const [missions, setMissions] = useState<PickupMission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Notifications State: Strict Default is empty
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Impact Stats State: Strict Default is 0
  const [impactStats, setImpactStats] = useState<ImpactStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IMPACT);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use zero */ }
    }
    return {
      mealsDonated: 0,
      mealsRescued: 0,
      donationsCompleted: 0,
      foodWasteDivertedKg: 0,
      co2AvoidedKg: 0,
      activeDonors: 0,
      ngosSupported: 0,
      volunteerMissions: 0
    };
  });

  // Demo Scenario State
  const [demoScenario, setDemoScenario] = useState<DemoScenarioState>({
    isActive: false,
    step: 1,
    totalSteps: DEMO_STEPS.length,
    title: DEMO_STEPS[0].title,
    description: DEMO_STEPS[0].description,
    roleHint: DEMO_STEPS[0].roleHint,
    isPlaying: false
  });

  // Theme Synchronizer
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Persistence Synchronizers
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(ngos));
  }, [ngos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IMPACT, JSON.stringify(impactStats));
  }, [impactStats]);

  // Notifications Helpers
  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'> & { isRead?: boolean }) => {
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: 'Just now',
      isRead: item.isRead ?? false,
      ...item
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => {
    if (n.isRead) return false;
    if (!currentUser) return true;
    if (!n.recipientRole || n.recipientRole === 'ALL') return true;
    return n.recipientRole === currentUser.role;
  }).length;

  // Auth Methods: REAL AUTHENTICATION ONLY
  const login = (
    email: string,
    passwordOrRole?: string | UserRole,
    requestedRole?: UserRole
  ): LoginResult => {
    let password: string | undefined = undefined;
    let targetRole: UserRole | undefined = requestedRole;

    if (passwordOrRole === 'DONOR' || passwordOrRole === 'NGO' || passwordOrRole === 'VOLUNTEER' || passwordOrRole === 'ADMIN') {
      targetRole = passwordOrRole;
    } else if (typeof passwordOrRole === 'string') {
      password = passwordOrRole;
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // 1. Strictly look for a registered user with this email
    const found = users.find((u) => u.email.trim().toLowerCase() === trimmedEmail);
    if (!found) {
      return { success: false, reason: 'ACCOUNT_NOT_FOUND' };
    }

    // 2. Check role match if requested
    if (targetRole && found.role !== targetRole) {
      return { success: false, reason: 'ROLE_MISMATCH' };
    }

    // 3. Check password match if user has a registered password
    if (found.password && password && found.password !== password) {
      return { success: false, reason: 'INVALID_PASSWORD' };
    }

    const authenticatedUser = { ...found, isExplicitLogin: true };
    setCurrentUser(authenticatedUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authenticatedUser));
    
    addNotification({
      recipientRole: found.role,
      title: 'Logged in successfully',
      message: `Welcome back, ${found.name}! Signed in as ${found.role}.`,
      type: 'info'
    });

    return { success: true };
  };

  const demoLogin = (role: UserRole) => {
    const demoUser = users.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role);
    if (demoUser) {
      const authenticatedUser = { ...demoUser, isExplicitLogin: true };
      setCurrentUser(authenticatedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authenticatedUser));
      addNotification({
        recipientRole: role,
        title: `Switched to Demo ${role}`,
        message: `Now viewing ShareBite from the perspective of ${demoUser.name} (${demoUser.organizationName || role}).`,
        type: 'info'
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem('sharebite_current_user_v1');
    localStorage.removeItem('sharebite_current_user_v2');
    localStorage.removeItem('sharebite_authenticated_user_v3');
    sessionStorage.clear();
  };

  const switchRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    }
  };

  const registerUser = (newUser: Partial<User> & { password?: string; transportType?: string }): User => {
    const userRole = newUser.role || 'DONOR';
    const area = newUser.area || 'Nizamabad';
    const lat = newUser.latitude ?? 18.6740;
    const lng = newUser.longitude ?? 78.0960;

    const createdUser: User = {
      id: `user-${userRole.toLowerCase()}-${Date.now()}`,
      name: newUser.name || (userRole === 'DONOR' ? 'Registered Food Donor' : userRole === 'NGO' ? 'Registered NGO' : 'Registered Collector'),
      email: newUser.email || '',
      role: userRole,
      password: newUser.password,
      phone: newUser.phone || '',
      area,
      location: newUser.location || newUser.address || area,
      address: newUser.address || newUser.location || area,
      latitude: lat,
      longitude: lng,
      organizationName: newUser.organizationName || (userRole === 'NGO' ? newUser.name : undefined),
      contactPerson: newUser.contactPerson || newUser.name,
      website: newUser.website,
      description: newUser.description,
      availability: newUser.availability || 'AVAILABLE',
      capacity: newUser.capacity || (userRole === 'NGO' ? 50 : undefined),
      demandLevel: newUser.demandLevel || (userRole === 'NGO' ? 'HIGH' : undefined),
      serviceArea: newUser.serviceArea || area,
      vehicleType: newUser.vehicleType || newUser.transportType,
      transportType: newUser.transportType || newUser.vehicleType,
      isExplicitLogin: true,
      avatar: userRole === 'DONOR'
        ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80'
        : userRole === 'NGO'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setUsers((prev) => [...prev, createdUser]);
    setCurrentUser(createdUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(createdUser));

    // If registered as NGO, also register into receiving directory
    if (userRole === 'NGO') {
      const newNgo: ReceiverNGO = {
        id: createdUser.id,
        name: createdUser.organizationName || createdUser.name,
        contactPerson: createdUser.contactPerson || createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone || '',
        area,
        address: createdUser.address || createdUser.location || '',
        latitude: lat,
        longitude: lng,
        serviceArea: createdUser.serviceArea || area,
        capacity: createdUser.capacity || 50,
        currentDemand: createdUser.demandLevel || 'HIGH',
        demandLevel: createdUser.demandLevel || 'HIGH',
        acceptedCategories: ['Cooked Meals', 'Fresh Produce', 'Bakery & Bread', 'Packaged Goods'],
        operatingHours: '08:00 - 20:00 Daily',
        description: createdUser.description || 'Verified Community NGO'
      };
      setNgos((prev) => [...prev, newNgo]);
    }

    // If registered as Volunteer, also register into volunteer fleet
    if (userRole === 'VOLUNTEER') {
      const newVol: Volunteer = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone || '',
        area,
        address: createdUser.address || createdUser.location || '',
        availability: 'AVAILABLE',
        vehicleType: createdUser.vehicleType || 'Bike',
        serviceArea: createdUser.serviceArea || area,
        totalMissionsCompleted: 0,
        rating: 5.0,
        latitude: lat,
        longitude: lng
      };
      setVolunteers((prev) => [...prev, newVol]);
    }

    addNotification({
      recipientRole: userRole,
      title: 'Registration Complete',
      message: `Welcome to ShareBite, ${createdUser.name}! Your account is active.`,
      type: 'success'
    });

    return createdUser;
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
  };

  // Donation Actions
  const createDonation = (data: Partial<Donation>): Donation => {
    const servings = Number(data.servings) || 30;
    const foodType: FoodType = data.foodType || 'Cooked';
    const storageCondition: StorageCondition = data.storageCondition || 'Room temperature';
    const bestBefore = data.bestBefore || new Date(Date.now() + 120 * 60 * 1000).toISOString();

    // Run Intelligent Rescue Priority Engine
    const priority = calculateRescuePriority({
      foodType,
      storageCondition,
      servings,
      bestBefore,
      nearbyDemandLevel: 'HIGH'
    });

    const donationId = 'don-' + Date.now();
    const donorName = currentUser?.organizationName || currentUser?.name || 'Registered Donor';

    const newDonation: Donation = {
      id: donationId,
      donorId: currentUser?.id || 'donor-' + Date.now(),
      donorName,
      donorEmail: currentUser?.email || '',
      donorPhone: currentUser?.phone || '',
      foodName: data.foodName || 'Surplus Food Batch',
      category: data.category || 'Cooked Meals',
      description: data.description || 'Surplus wholesome food prepared with care.',
      quantity: Number(data.quantity) || servings,
      unit: data.unit || 'servings',
      servings,
      foodType,
      preparationDateTime: data.preparationDateTime || new Date().toISOString(),
      availableFrom: data.availableFrom || new Date().toISOString(),
      bestBefore,
      storageCondition,
      packaging: data.packaging || 'Individual containers',
      area: data.area || currentUser?.area || '',
      location: data.location || data.pickupLocation || currentUser?.location || currentUser?.address || '',
      pickupLocation: data.pickupLocation || data.location || currentUser?.location || currentUser?.address || '',
      latitude: data.latitude ?? currentUser?.latitude ?? 18.6740,
      longitude: data.longitude ?? currentUser?.longitude ?? 78.0960,
      allergens: data.allergens || [],
      safetyChecklist: data.safetyChecklist || {
        isSafeForConsumption: true,
        isHygienicallyPrepared: true,
        isPackagingSecure: true,
        isAllergenInfoProvided: true,
        isPickupWindowAccurate: true
      },
      priorityScore: priority.score,
      urgencyLevel: priority.urgencyLevel,
      priorityReason: priority.explanation,
      status: 'MATCHING',
      allocations: [],
      totalAllocated: 0,
      isRescueMode: priority.isRescueMode,
      estimatedWindowMinutes: priority.remainingMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    };

    // Calculate initial smart matches
   // Calculate matches only for recommendation purposes.
// IMPORTANT: matching must NOT consume or allocate food quantity.
const matches = matchDonationToReceivers(newDonation, ngos);

newDonation.allocations = [];
newDonation.totalAllocated = 0;

    setDonations((prev) => [newDonation, ...prev]);

    // Update impact metrics: +mealsDonated
    setImpactStats((prev) => ({
      ...prev,
      mealsDonated: prev.mealsDonated + servings
    }));

    // Notifications
    addNotification({
      recipientRole: 'DONOR',
      title: 'Donation Posted',
      message: `"${newDonation.foodName}" (${servings} servings) posted. Intelligent Rescue Priority: ${priority.score}/100 [${priority.urgencyLevel}].`,
      type: priority.isRescueMode ? 'urgent' : 'success'
    });

    if (priority.isRescueMode) {
      addNotification({
        recipientRole: 'ALL',
        title: '⚡ RESCUE MODE ACTIVATED',
        message: `${donorName} posted ${servings} perishable servings expiring soon! Immediate pickup needed.`,
        type: 'urgent',
        actionUrl: '/listings'
      });
    }

    return newDonation;
  };

  const updateDonationStatus = (donationId: string, status: DonationStatus) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === donationId ? { ...d, status, updatedAt: new Date().toISOString() } : d))
    );
  };

  const updateDonationAllocations = (donationId: string, allocations: DonationAllocation[]) => {
    const totalAllocated = allocations.reduce((acc, a) => acc + (a.servingsAllocated || 0), 0);
    setDonations((prev) =>
      prev.map((d) =>
        d.id === donationId
          ? {
              ...d,
              allocations,
              totalAllocated,
              status: totalAllocated >= d.servings ? 'ACCEPTED' : 'MATCHING',
              updatedAt: new Date().toISOString()
            }
          : d
      )
    );
  };

  // NGO Acceptance
 // NGO Acceptance
const acceptDonationAllocation = (
  donationId: string,
  receiverId: string,
  servingsRequested?: number
) => {
  const donation = donations.find((d) => d.id === donationId);
  const ngo = ngos.find((n) => n.id === receiverId);

  if (!donation || !ngo) return;

  // Calculate how much has already been accepted.
  const currentTotalAllocated = donation.allocations.reduce(
    (sum, allocation) =>
      sum + (allocation.servingsAllocated || 0),
    0
  );

  // Calculate the CURRENT remaining quantity.
  const remainingServings = Math.max(
    0,
    donation.servings - currentTotalAllocated
  );

  // Accept requested amount, or all remaining amount.
  const requested =
    servingsRequested ?? remainingServings;

  // Validate the requested quantity.
  if (!Number.isFinite(requested) || requested <= 0) {
    return;
  }

  // Never allow accepting more than what remains.
  if (requested > remainingServings) {
    return;
  }

  const acceptedServings = requested;

  // Create a NEW allocation for this acceptance.
  // Do NOT overwrite previous allocations.
  const newAllocation: DonationAllocation = {
    receiverId: ngo.id,
    receiverName: ngo.name,
    servingsAllocated: acceptedServings,
    status: 'ACCEPTED',
    distanceKm: calculateDistanceKm(
      donation.latitude,
      donation.longitude,
      ngo.latitude,
      ngo.longitude
    ),
    contactPhone: ngo.phone,
    address: ngo.address
  };

  const updatedAllocations = [
    ...donation.allocations,
    newAllocation
  ];

  const newTotalAllocated = updatedAllocations.reduce(
    (sum, allocation) =>
      sum + (allocation.servingsAllocated || 0),
    0
  );

  const newRemainingServings = Math.max(
    0,
    donation.servings - newTotalAllocated
  );

  // Update the donation.
  setDonations((prev) =>
    prev.map((d) => {
      if (d.id !== donationId) return d;

      return {
        ...d,
        allocations: updatedAllocations,
        totalAllocated: newTotalAllocated,

        // Completely accepted = CLOSED.
        // Otherwise it remains available.
        status:
          newRemainingServings === 0
            ? 'CLOSED'
            : 'VOLUNTEER_ASSIGNED',

        updatedAt: new Date().toISOString()
      };
    })
  );

  // Find a volunteer for THIS accepted portion.
  const collectorMatches = matchDonationToCollectors(
    donation,
    volunteers
  );

  const topMatch = collectorMatches[0];

  const assignedVol =
    topMatch?.collector || volunteers[0];

  const dist =
    topMatch?.distanceKm ??
    calculateDistanceKm(
      donation.latitude,
      donation.longitude,
      ngo.latitude,
      ngo.longitude
    );

  const eta = Math.max(
    8,
    Math.round(dist * 3.5)
  );

  // Create a NEW mission for THIS acceptance.
  //
  // Example:
  // Original = 100
  // NGO accepts 30 -> mission for 30
  // NGO accepts 20 -> another mission for 20
  // Remaining = 50
  const newMission: PickupMission = {
    id:
      'mission-' +
      Date.now() +
      '-' +
      Math.random().toString(36).slice(2, 8),

    donationId: donation.id,

    // Only the accepted portion belongs to this mission.
    foodName: donation.foodName,
    servings: acceptedServings,

    donorName: donation.donorName,
    donorAddress:
      donation.pickupLocation ||
      donation.location ||
      'Nizamabad',
    donorPhone: donation.donorPhone,

    donorCoordinates: {
      lat: donation.latitude,
      lng: donation.longitude
    },

    receiverId: ngo.id,
    receiverName: ngo.name,
    receiverAddress: ngo.address,
    receiverPhone: ngo.phone,

    receiverCoordinates: {
      lat: ngo.latitude,
      lng: ngo.longitude
    },

    volunteerId: assignedVol?.id,
    volunteerName: assignedVol?.name,
    volunteerPhone: assignedVol?.phone,

    stage: 'VOLUNTEER_ASSIGNED',

    distanceKm: dist,
    etaMinutes: eta,

    pickupTimeScheduled:
      `Within ${Math.max(15, eta + 5)} minutes`,

    notes:
      `Handle ${donation.packaging.toLowerCase()} with care. ` +
      `Storage: ${donation.storageCondition}.`
  };

  // Always create a new mission for every acceptance.
  setMissions((prev) => [
    newMission,
    ...prev
  ]);

  // Update assigned volunteer information.
  if (assignedVol) {
    setDonations((prev) =>
      prev.map((d) =>
        d.id === donationId
          ? {
              ...d,
              assignedVolunteerId: assignedVol.id,
              assignedVolunteerName: assignedVol.name,
              assignedVolunteerPhone: assignedVol.phone,
              updatedAt: new Date().toISOString()
            }
          : d
      )
    );
  }

  // Notify donor.
  addNotification({
    recipientId: donation.donorId,
    recipientRole: 'DONOR',
    title: 'Allocation Accepted by NGO',
    message:
      `${ngo.name} accepted ${acceptedServings} meals from ` +
      `"${donation.foodName}". ` +
      `${newRemainingServings} servings remain available.`,
    type: 'success',
    actionUrl: '/my-donations'
  });

  // Notify NGO.
  addNotification({
    recipientId: ngo.id,
    recipientRole: 'NGO',
    title: 'Food Accepted',
    message:
      `You accepted ${acceptedServings} servings of ` +
      `"${donation.foodName}".`,
    type: 'success',
    actionUrl: '/pickups'
  });

  // Notify volunteer only if one exists.
  if (assignedVol) {
    addNotification({
      recipientId: assignedVol.id,
      recipientRole: 'VOLUNTEER',
      title: 'New Rescue Mission Assigned',
      message:
        `Pickup mission ready: Collect ${acceptedServings} ` +
        `meals from ${donation.donorName} for ${ngo.name}.`,
      type: 'mission',
      actionUrl: '/missions'
    });
  }
};
 
  const updateNgoProfile = (ngoId: string, updates: Partial<ReceiverNGO>) => {
    setNgos((prev) => prev.map((n) => (n.id === ngoId ? { ...n, ...updates } : n)));
  };

  const assignCollectorToDonation = (donationId: string, volunteerId: string) => {
    const donation = donations.find((d) => d.id === donationId);
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    if (!donation || !volunteer) return;

    const donLat = donation.latitude || 18.6725;
    const donLng = donation.longitude || 78.0941;
    const volLat = volunteer.latitude || 18.6725;
    const volLng = volunteer.longitude || 78.0941;
    const dist = calculateDistanceKm(donLat, donLng, volLat, volLng);
    const eta = Math.max(8, Math.round(dist * 3.5));

    // Update donation status & assigned volunteer
    setDonations((prev) =>
      prev.map((d) =>
        d.id === donationId
          ? {
              ...d,
              assignedVolunteerId: volunteer.id,
              assignedVolunteerName: volunteer.name,
              status: 'VOLUNTEER_ASSIGNED',
              updatedAt: new Date().toISOString()
            }
          : d
      )
    );

    // Update or create pickup mission
    setMissions((prev) => {
      const existing = prev.find((m) => m.donationId === donationId);
      if (existing) {
        return prev.map((m) =>
          m.donationId === donationId
            ? {
                ...m,
                volunteerId: volunteer.id,
                volunteerName: volunteer.name,
                volunteerPhone: volunteer.phone,
                stage: 'VOLUNTEER_ASSIGNED',
                distanceKm: dist,
                etaMinutes: eta
              }
            : m
        );
      }
      const newMission: PickupMission = {
        id: 'mission-' + Date.now(),
        donationId: donation.id,
        foodName: donation.foodName,
        servings: donation.servings,
        donorName: donation.donorName,
        donorAddress: donation.pickupLocation || donation.location || 'Nizamabad',
        donorPhone: donation.donorPhone,
        donorCoordinates: { lat: donLat, lng: donLng },
        receiverId: donation.allocations?.[0]?.receiverId || 'ngo-hope',
        receiverName: donation.allocations?.[0]?.receiverName || 'Hope Foundation',
        receiverAddress: donation.allocations?.[0]?.address || 'Gandhi Road, Nizamabad',
        receiverPhone: donation.allocations?.[0]?.contactPhone || '+91 98490 12345',
        receiverCoordinates: { lat: 18.6740, lng: 78.0960 },
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        volunteerPhone: volunteer.phone,
        stage: 'VOLUNTEER_ASSIGNED',
        distanceKm: dist,
        etaMinutes: eta,
        pickupTimeScheduled: `Within ${Math.max(15, eta + 5)} minutes`,
        notes: `Handle ${donation.packaging.toLowerCase()} with care. Storage: ${donation.storageCondition}.`
      };
      return [newMission, ...prev];
    });

    addNotification({
      recipientRole: 'VOLUNTEER',
      title: 'Direct Mission Assignment',
      message: `You have been assigned to pick up "${donation.foodName}" (${donation.servings} servings) from ${donation.donorName}. Distance: ${dist.toFixed(1)} km.`,
      type: 'mission'
    });

    addNotification({
      recipientRole: 'DONOR',
      title: 'Collector Assigned',
      message: `${volunteer.name} (${volunteer.vehicleType}, ${dist.toFixed(1)} km away) has been assigned to your pickup mission.`,
      type: 'success'
    });
  };

  // Volunteer Mission Lifecycle Handlers
  const updateMissionStage = (missionId: string, nextStage: MissionStage, extra: Partial<PickupMission> = {}) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== missionId) return m;
        const updated = { ...m, stage: nextStage, ...extra };

        // Synchronize donation status
        if (nextStage === 'PICKUP_STARTED') {
          updateDonationStatus(m.donationId, 'PICKUP_SCHEDULED');
        } else if (nextStage === 'FOOD_COLLECTED') {
          updateDonationStatus(m.donationId, 'PICKED_UP');
        } else if (nextStage === 'DELIVERY_STARTED') {
          updateDonationStatus(m.donationId, 'IN_TRANSIT');
        } else if (nextStage === 'DELIVERED') {
          updateDonationStatus(m.donationId, 'DELIVERED');
        } else if (nextStage === 'RESCUED_COMPLETED') {
          updateDonationStatus(m.donationId, 'COMPLETED');
          // Increment impact stats
          setImpactStats((prevStats) => ({
            ...prevStats,
            mealsRescued: prevStats.mealsRescued + m.servings,
            donationsCompleted: prevStats.donationsCompleted + 1,
            foodWasteDivertedKg: prevStats.foodWasteDivertedKg + Math.round(m.servings * 0.45),
            co2AvoidedKg: prevStats.co2AvoidedKg + Math.round(m.servings * 1.15),
            volunteerMissions: prevStats.volunteerMissions + 1
          }));

          // Trigger joyful celebration confetti
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // Ignore if in test env
          }
        }
        return updated;
      })
    );
  };

  const acceptMission = (missionId: string) => {
    updateMissionStage(missionId, 'MISSION_ACCEPTED', {
      startedAt: new Date().toISOString()
    });
    addNotification({
      recipientRole: 'NGO',
      title: 'Volunteer Accepted Mission',
      message: 'Courier has accepted the pickup run and is prepping thermal carrier bags.',
      type: 'info'
    });
  };

  const startPickup = (missionId: string) => {
    updateMissionStage(missionId, 'PICKUP_STARTED', {
      etaMinutes: 8
    });
    addNotification({
      recipientRole: 'DONOR',
      title: 'Courier En Route to Donor Kitchen',
      message: 'Courier is heading to your pickup location (ETA ~8 mins). Please ensure food is packaged.',
      type: 'info'
    });
  };

  const verifyPickup = (
    missionId: string,
    servings: number,
    condition: 'Good' | 'Fair' | 'Poor',
    packaging: 'Secure' | 'Damaged'
  ) => {
    updateMissionStage(missionId, 'FOOD_COLLECTED', {
      conditionVerification: {
        foodServings: servings,
        condition,
        packaging,
        verifiedAt: new Date().toISOString()
      },
      collectedAt: new Date().toISOString()
    });
    addNotification({
      recipientRole: 'ALL',
      title: 'Food Inspected & Collected',
      message: `Verified: ${servings} servings in ${condition} condition loaded securely for transit.`,
      type: 'success'
    });
  };

  const markCollected = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    verifyPickup(missionId, mission?.servings || 120, 'Good', 'Secure');
  };

  const startDelivery = (missionId: string) => {
    updateMissionStage(missionId, 'DELIVERY_STARTED', {
      inTransitAt: new Date().toISOString(),
      etaMinutes: 12
    });
    addNotification({
      recipientRole: 'NGO',
      title: 'Food In Transit',
      message: 'Rescue vehicle has departed donor location and is en route to your receiving dock.',
      type: 'info'
    });
  };

  const markDelivered = (missionId: string) => {
    updateMissionStage(missionId, 'DELIVERED', {
      deliveredAt: new Date().toISOString(),
      etaMinutes: 0
    });
    addNotification({
      recipientRole: 'ALL',
      title: 'Food Successfully Delivered',
      message: 'Receiver has confirmed safe arrival and receipt at distribution kitchen.',
      type: 'success'
    });
  };

  const completeMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    updateMissionStage(missionId, 'RESCUED_COMPLETED', {
      completedAt: new Date().toISOString()
    });
    addNotification({
      recipientRole: 'ALL',
      title: '🎉 MISSION COMPLETED: FOOD RESCUED!',
      message: `${mission?.servings || 120} meals rescued from food waste and distributed to people in need!`,
      type: 'success'
    });
  };

  // Demo Scenario Controller (Section 19 & 39)
  const applyDemoStepState = useCallback((stepNumber: number) => {
    const stepDef = DEMO_STEPS[stepNumber - 1];
    if (!stepDef) return;

    setDemoScenario((prev) => ({
      ...prev,
      isActive: true,
      step: stepNumber,
      title: stepDef.title,
      description: stepDef.description,
      roleHint: stepDef.roleHint
    }));

    // Auto-switch viewing perspective to match narrative
    const targetUser = users.find((u) => u.role === stepDef.roleHint);
    if (targetUser) {
      setCurrentUser(targetUser);
    }

    const pastaMissionId = 'mission-demo-pasta';
    const pastaDonationId = 'don-demo-pasta';

    // Execute state transitions based on exact step
    if (stepNumber <= 4) {
      updateDonationStatus(pastaDonationId, 'POSTED');
    } else if (stepNumber === 5 || stepNumber === 6) {
      updateDonationStatus(pastaDonationId, 'MATCHING');
    } else if (stepNumber === 7) {
      // NGO accepts
      setDonations((prev) =>
        prev.map((d) =>
          d.id === pastaDonationId
            ? {
                ...d,
                status: 'ACCEPTED',
                allocations: [
                  {
                    receiverId: 'ngo-1',
                    receiverName: 'Hope Foundation',
                    servingsAllocated: 60,
                    status: 'ACCEPTED',
                    distanceKm: 2.4,
                    contactPhone: '+1 (555) 890-1234',
                    address: '104 Hope Avenue, Eastside'
                  },
                  {
                    receiverId: 'ngo-2',
                    receiverName: 'Community Care Center',
                    servingsAllocated: 40,
                    status: 'ACCEPTED',
                    distanceKm: 3.8,
                    contactPhone: '+1 (555) 345-6789',
                    address: '520 4th Street, South Market'
                  },
                  {
                    receiverId: 'ngo-3',
                    receiverName: 'Helping Hands',
                    servingsAllocated: 20,
                    status: 'ACCEPTED',
                    distanceKm: 5.1,
                    contactPhone: '+1 (555) 678-9012',
                    address: '89 Mission Boulevard, Mission District'
                  }
                ],
                totalAllocated: 120
              }
            : d
        )
      );
    } else if (stepNumber === 8 || stepNumber === 9) {
      // Volunteer assigned / accepted
      setMissions((prev) =>
        prev.map((m) =>
          m.id === pastaMissionId
            ? { ...m, stage: stepNumber === 8 ? 'VOLUNTEER_ASSIGNED' : 'MISSION_ACCEPTED' }
            : m
        )
      );
      updateDonationStatus(pastaDonationId, 'VOLUNTEER_ASSIGNED');
    } else if (stepNumber === 10) {
      // Start pickup
      setMissions((prev) =>
        prev.map((m) => (m.id === pastaMissionId ? { ...m, stage: 'PICKUP_STARTED', etaMinutes: 8 } : m))
      );
      updateDonationStatus(pastaDonationId, 'PICKUP_SCHEDULED');
    } else if (stepNumber === 11 || stepNumber === 12) {
      // Verify and collect
      setMissions((prev) =>
        prev.map((m) =>
          m.id === pastaMissionId
            ? {
                ...m,
                stage: 'FOOD_COLLECTED',
                conditionVerification: {
                  foodServings: 120,
                  condition: 'Good',
                  packaging: 'Secure',
                  verifiedAt: new Date().toISOString()
                }
              }
            : m
        )
      );
      updateDonationStatus(pastaDonationId, 'PICKED_UP');
    } else if (stepNumber === 13) {
      // Transit
      setMissions((prev) =>
        prev.map((m) => (m.id === pastaMissionId ? { ...m, stage: 'DELIVERY_STARTED', etaMinutes: 12 } : m))
      );
      updateDonationStatus(pastaDonationId, 'IN_TRANSIT');
    } else if (stepNumber === 14) {
      // Delivered
      setMissions((prev) =>
        prev.map((m) => (m.id === pastaMissionId ? { ...m, stage: 'DELIVERED', etaMinutes: 0 } : m))
      );
      updateDonationStatus(pastaDonationId, 'DELIVERED');
    } else if (stepNumber >= 15) {
      // Rescued & Completed
      setMissions((prev) =>
        prev.map((m) => (m.id === pastaMissionId ? { ...m, stage: 'RESCUED_COMPLETED' } : m))
      );
      updateDonationStatus(pastaDonationId, 'COMPLETED');
      if (stepNumber === 16) {
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch (e) {}
      }
    }
  }, [users]);

  const startDemoScenario = () => {
    applyDemoStepState(1);
  };

  const nextDemoStep = () => {
    if (demoScenario.step < DEMO_STEPS.length) {
      applyDemoStepState(demoScenario.step + 1);
    }
  };

  const prevDemoStep = () => {
    if (demoScenario.step > 1) {
      applyDemoStepState(demoScenario.step - 1);
    }
  };

  const resetDemoScenario = () => {
    setDemoScenario({
      isActive: false,
      step: 1,
      totalSteps: DEMO_STEPS.length,
      title: DEMO_STEPS[0].title,
      description: DEMO_STEPS[0].description,
      roleHint: 'DONOR',
      isPlaying: false
    });
    setDonations(INITIAL_DONATIONS);
    setMissions(INITIAL_MISSIONS);
    setImpactStats(INITIAL_IMPACT_STATS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  const toggleAutoPlayDemo = () => {
    setDemoScenario((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // Auto Play Timer
  useEffect(() => {
    if (!demoScenario.isPlaying) return;
    const timer = setInterval(() => {
      setDemoScenario((prev) => {
        if (prev.step >= DEMO_STEPS.length) {
          return { ...prev, isPlaying: false };
        }
        applyDemoStepState(prev.step + 1);
        return prev;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [demoScenario.isPlaying, applyDemoStepState]);

  const resetAllDataToDefaults = () => {
    localStorage.clear();
    setDonations(INITIAL_DONATIONS);
    setMissions(INITIAL_MISSIONS);
    setNgos(INITIAL_NGOS);
    setVolunteers(INITIAL_VOLUNTEERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setImpactStats(INITIAL_IMPACT_STATS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setDemoScenario({
      isActive: false,
      step: 1,
      totalSteps: DEMO_STEPS.length,
      title: DEMO_STEPS[0].title,
      description: DEMO_STEPS[0].description,
      roleHint: 'DONOR',
      isPlaying: false
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        users,
        donations,
        ngos,
        volunteers,
        missions,
        notifications,
        impactStats,
        isDarkMode,
        demoScenario,
        toggleDarkMode,
        login,
        demoLogin,
        logout,
        switchRole,
        registerUser,
        updateUserProfile,
        createDonation,
        addDonation: createDonation,
        updateDonationStatus,
        updateDonationAllocations,
        acceptDonationAllocation,
        updateNgoProfile,
        updateNgoSettings: updateNgoProfile,
        assignCollectorToDonation,
        acceptMission,
        startPickup,
        verifyPickup,
        markCollected,
        startDelivery,
        markDelivered,
        completeMission,
        updateMissionStage,
        isRescueModeActive,
        toggleRescueMode,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        startDemoScenario,
        nextDemoStep,
        prevDemoStep,
        resetDemoScenario,
        toggleAutoPlayDemo,
        resetAllDataToDefaults,
        resetToDemoBaseline: resetAllDataToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
