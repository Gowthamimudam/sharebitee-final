export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export type FoodCategory = 
  | 'Cooked Meals' 
  | 'Packaged Goods' 
  | 'Fresh Produce' 
  | 'Bakery & Bread' 
  | 'Dairy & Grocery' 
  | 'Beverages' 
  | 'Other';

export type FoodType = 
  | 'Cooked' 
  | 'Packaged' 
  | 'Fresh Produce' 
  | 'Bakery' 
  | 'Grocery' 
  | 'Other';

export type StorageCondition = 
  | 'Room temperature' 
  | 'Refrigerated' 
  | 'Frozen' 
  | 'Hot';

export type PackagingType = 
  | 'Individual containers' 
  | 'Bulk trays' 
  | 'Sealed packages' 
  | 'Cartons & Boxes' 
  | 'Other';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DonationStatus = 
  | 'POSTED'
  | 'MATCHING'
  | 'ACCEPTED'
  | 'VOLUNTEER_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  area?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  organizationName?: string;
  contactPerson?: string;
  website?: string;
  description?: string;
  availability?: string;
  capacity?: number;
  demandLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  serviceArea?: string;
  vehicleType?: string;
  transportType?: string;
  avatar?: string;
  isExplicitLogin?: boolean;
  password?: string;
}

export interface DonationAllocation {
  receiverId: string;
  receiverName: string;
  servingsAllocated: number;
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED';
  distanceKm: number;
  contactPhone?: string;
  address?: string;
}

export interface FoodSafetyChecklist {
  isSafeForConsumption: boolean;
  isHygienicallyPrepared: boolean;
  isPackagingSecure: boolean;
  isAllergenInfoProvided: boolean;
  isPickupWindowAccurate: boolean;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  foodName: string;
  category: FoodCategory;
  description: string;
  quantity: number;
  unit: string;
  servings: number;
  foodType: FoodType;
  preparationDateTime: string;
  preparedAt?: string;
  availableFrom: string;
  bestBefore: string;
  storageCondition: StorageCondition;
  packaging: PackagingType;
  pickupLocation: string;
  location?: string;
  area?: string;
  latitude: number;
  longitude: number;
  allergens: string[];
  safetyChecklist: FoodSafetyChecklist;
  priorityScore: number;
  urgencyLevel: UrgencyLevel;
  priorityReason: string;
  status: DonationStatus;
  allocations: DonationAllocation[];
  totalAllocated: number;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  assignedVolunteerPhone?: string;
  matchedNgoId?: string;
  matchedNgoName?: string;
  matchedReceivers?: { ngoId: string; ngoName: string; servings: number }[];
  isRescueMode: boolean;
  estimatedWindowMinutes: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface ReceiverNGO {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  area?: string;
  location?: string;
  address: string;
  latitude: number;
  longitude: number;
  serviceArea: string;
  capacity: number;
  currentDemand: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  demandLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acceptedCategories: FoodCategory[];
  operatingHours: string;
  website?: string;
  description: string;
  matchScore?: number;
  distanceKm?: number;
}

export interface Volunteer {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone: string;
  area?: string;
  location?: string;
  address: string;
  availability: 'AVAILABLE' | 'ON_MISSION' | 'OFFLINE';
  status?: string;
  vehicleType: string;
  serviceArea?: string;
  totalMissionsCompleted: number;
  completedMissions?: number;
  rating: number;
  latitude: number;
  longitude: number;
  activeMissionsCount?: number;
}

export type MissionStage = 
  | 'POSTED'
  | 'MATCHED'
  | 'RECEIVER_ACCEPTED'
  | 'VOLUNTEER_ASSIGNED'
  | 'MISSION_ACCEPTED'
  | 'PICKUP_STARTED'
  | 'FOOD_COLLECTED'
  | 'DELIVERY_STARTED'
  | 'DELIVERED'
  | 'RESCUED_COMPLETED'
  | 'RESCUED';

export interface PickupMission {
  id: string;
  donationId: string;
  foodName: string;
  servings: number;
  donorName: string;
  donorAddress: string;
  pickupAddress?: string;
  donorPhone: string;
  donorCoordinates: { lat: number; lng: number };
  receiverId: string;
  receiverName: string;
  receiverNgoName?: string;
  receiverAddress: string;
  dropoffAddress?: string;
  receiverPhone: string;
  receiverCoordinates: { lat: number; lng: number };
  volunteerId?: string;
  volunteerName?: string;
  assignedVolunteerName?: string;
  volunteerPhone?: string;
  stage: MissionStage;
  distanceKm: number;
  etaMinutes: number;
  pickupTimeScheduled?: string;
  conditionVerification?: {
    foodServings: number;
    condition: 'Good' | 'Fair' | 'Poor';
    packaging: 'Secure' | 'Damaged';
    verifiedAt: string;
  };
  notes?: string;
  startedAt?: string;
  collectedAt?: string;
  inTransitAt?: string;
  deliveredAt?: string;
  completedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole?: UserRole | 'ALL';
  recipientId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent' | 'mission';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ImpactStats {
  mealsDonated: number;
  mealsRescued: number;
  donationsCompleted: number;
  foodWasteDivertedKg: number;
  co2AvoidedKg: number;
  activeDonors: number;
  ngosSupported: number;
  volunteerMissions: number;
}

export interface DemoStepState {
  stepIndex: number;
  totalSteps: number;
  stepName: string;
  description: string;
  activeRole: UserRole;
  isPlaying: boolean;
}
