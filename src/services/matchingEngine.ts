import { Donation, ReceiverNGO, Volunteer } from '../types';
import { calculateDistanceKm, getAreaCoordinates } from './locationService';

export interface ReceiverMatchResult {
  receiver: ReceiverNGO;
  matchScore: number; // 0 - 100%
  distanceKm: number;
  capacityFit: number; // suggested meals to allocate
  compatibilityReasons: string[];
  isInServiceArea: boolean;
  displaySummary: string; // e.g. "92% Match • 2.4 km away • Nizamabad • Capacity: 60 meals • Available now"
}

export interface CollectorMatchResult {
  collector: Volunteer;
  matchScore: number; // 0 - 100%
  distanceKm: number;
  availability: 'AVAILABLE' | 'ON_MISSION' | 'OFFLINE';
  activeMissionsCount: number;
  transportCapability: string;
  displaySummary: string; // e.g. "Collector: Ravi • Area: Nizamabad • Distance: 1.8 km • Availability: Available • Transport: Bike • Mission Load: 1 active mission"
  reasons: string[];
}

export { calculateDistanceKm };

/**
 * Deterministic Smart Matching Engine for Receivers/NGOs
 * Score components:
 * - Location / Distance: 40%
 * - Receiver Capacity: 20%
 * - Food Compatibility: 15%
 * - Current Demand: 15%
 * - Availability / Operational: 10%
 */
export function matchDonationToReceivers(
  donation: Donation,
  receivers: ReceiverNGO[]
): ReceiverMatchResult[] {
  // Ensure we have donor coordinates or area fallback
  const donorCoords = (donation.latitude && donation.longitude)
    ? { lat: donation.latitude, lng: donation.longitude }
    : getAreaCoordinates(donation.area);

  const results: ReceiverMatchResult[] = receivers.map((receiver) => {
    // Receiver coordinates or area fallback
    const receiverCoords = (receiver.latitude && receiver.longitude)
      ? { lat: receiver.latitude, lng: receiver.longitude }
      : getAreaCoordinates(receiver.area);

    const distanceKm = calculateDistanceKm(
      donorCoords.lat,
      donorCoords.lng,
      receiverCoords.lat,
      receiverCoords.lng
    );

    // 1. Location / Distance (Max 40 points)
    const donorAreaNormalized = (donation.area || '').trim().toLowerCase();
    const receiverAreaNormalized = (receiver.area || '').trim().toLowerCase();
    const isSameArea = donorAreaNormalized && receiverAreaNormalized && donorAreaNormalized === receiverAreaNormalized;

    let locationScore = 10;
    if (distanceKm <= 3.0) {
      locationScore = 40;
    } else if (distanceKm <= 6.0) {
      locationScore = isSameArea ? 38 : 34;
    } else if (distanceKm <= 12.0) {
      locationScore = isSameArea ? 32 : 26;
    } else if (distanceKm <= 25.0) {
      locationScore = isSameArea ? 25 : 18;
    } else if (isSameArea) {
      locationScore = 28; // Same area fallback bonus even if distance is slightly larger
    } else {
      locationScore = 8;
    }

    // 2. Receiver Capacity (Max 20 points)
    let capacityScore = 8;
    if (receiver.capacity >= donation.servings) {
      capacityScore = 20;
    } else if (receiver.capacity >= Math.floor(donation.servings * 0.6)) {
      capacityScore = 16;
    } else if (receiver.capacity >= Math.floor(donation.servings * 0.3)) {
      capacityScore = 12;
    }

    // 3. Food Category Compatibility (Max 15 points)
    const categoryMatch = receiver.acceptedCategories && receiver.acceptedCategories.includes(donation.category);
    const categoryScore = categoryMatch ? 15 : 6;

    // 4. Current NGO Demand (Max 15 points)
    let demandScore = 5;
    const demand = receiver.currentDemand || receiver.demandLevel;
    if (demand === 'CRITICAL') demandScore = 15;
    else if (demand === 'HIGH') demandScore = 12;
    else if (demand === 'MEDIUM') demandScore = 8;
    else demandScore = 5;

    // 5. Availability / Operational Status (Max 10 points)
    const availabilityScore = 10; // Active network verified NGO

    const totalRaw = locationScore + capacityScore + categoryScore + demandScore + availabilityScore;
    const matchScore = Math.min(99, Math.max(40, totalRaw));

    const compatibilityReasons: string[] = [];
    if (isSameArea) {
      compatibilityReasons.push(`Same Area (${receiver.area || 'Local District'})`);
    }
    if (distanceKm <= 5.0) {
      compatibilityReasons.push(`Proximity: ${distanceKm} km away`);
    } else {
      compatibilityReasons.push(`${distanceKm} km away`);
    }
    if (categoryMatch) {
      compatibilityReasons.push(`Accepts ${donation.category}`);
    }
    if (demand === 'HIGH' || demand === 'CRITICAL') {
      compatibilityReasons.push(`High Community Demand`);
    }
    if (receiver.capacity >= donation.servings) {
      compatibilityReasons.push(`Ready for ${donation.servings} servings`);
    } else {
      compatibilityReasons.push(`Can absorb ${receiver.capacity} servings`);
    }

    const suggestedAllocation = Math.min(
      donation.servings,
      receiver.capacity || 50,
      donation.servings >= 100 ? 60 : donation.servings
    );

    const displaySummary = `${matchScore}% Match • ${distanceKm} km away • ${receiver.area || 'Local Area'} • Capacity: ${receiver.capacity} meals • Available now`;

    return {
      receiver: { ...receiver, matchScore, distanceKm },
      matchScore,
      distanceKm,
      capacityFit: suggestedAllocation,
      compatibilityReasons,
      isInServiceArea: distanceKm <= 35,
      displaySummary
    };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Smart Collector Matching Engine
 * Ranks nearby volunteers/couriers based on distance, availability, active missions, and transport.
 */
export function matchDonationToCollectors(
  donation: Donation,
  volunteers: Volunteer[]
): CollectorMatchResult[] {
  const donorCoords = (donation.latitude && donation.longitude)
    ? { lat: donation.latitude, lng: donation.longitude }
    : getAreaCoordinates(donation.area);

  const results: CollectorMatchResult[] = volunteers.map((collector) => {
    const collectorCoords = (collector.latitude && collector.longitude)
      ? { lat: collector.latitude, lng: collector.longitude }
      : getAreaCoordinates(collector.area);

    const distanceKm = calculateDistanceKm(
      donorCoords.lat,
      donorCoords.lng,
      collectorCoords.lat,
      collectorCoords.lng
    );

    const donorAreaNormalized = (donation.area || '').trim().toLowerCase();
    const collectorAreaNormalized = (collector.area || '').trim().toLowerCase();
    const isSameArea = donorAreaNormalized && collectorAreaNormalized && donorAreaNormalized === collectorAreaNormalized;

    // 1. Distance & Location (Max 45 points)
    let distScore = 10;
    if (distanceKm <= 2.5) distScore = 45;
    else if (distanceKm <= 5.0) distScore = isSameArea ? 40 : 35;
    else if (distanceKm <= 10.0) distScore = isSameArea ? 32 : 25;
    else if (distanceKm <= 20.0) distScore = 18;

    // 2. Availability (Max 30 points)
    let availScore = 10;
    if (collector.availability === 'AVAILABLE') availScore = 30;
    else if (collector.availability === 'ON_MISSION') availScore = 15;
    else availScore = 5;

    // 3. Mission Load (Max 15 points)
    const activeMissions = collector.activeMissionsCount || 0;
    let loadScore = 15;
    if (activeMissions === 0) loadScore = 15;
    else if (activeMissions === 1) loadScore = 10;
    else loadScore = 4;

    // 4. Transport Capability (Max 10 points)
    // Large batches (>80 servings) benefit from Van/Car, small from Bike/Scooter
    let transportScore = 8;
    const vehicle = collector.vehicleType || 'Bike';
    if (donation.servings > 80 && (vehicle.toLowerCase().includes('van') || vehicle.toLowerCase().includes('car'))) {
      transportScore = 10;
    } else if (donation.servings <= 80 && (vehicle.toLowerCase().includes('bike') || vehicle.toLowerCase().includes('scooter'))) {
      transportScore = 10;
    }

    const totalRaw = distScore + availScore + loadScore + transportScore;
    const matchScore = Math.min(99, Math.max(35, totalRaw));

    const reasons: string[] = [];
    if (isSameArea) reasons.push(`Based in ${collector.area || 'same area'}`);
    reasons.push(`${distanceKm} km from donor`);
    reasons.push(`Vehicle: ${collector.vehicleType || 'Courier'}`);
    if (activeMissions === 0) reasons.push('0 active missions (Immediate dispatch)');
    else reasons.push(`${activeMissions} active mission(s)`);

    const displaySummary = `Collector: ${collector.name} • Area: ${collector.area || 'Local'} • Distance: ${distanceKm} km • Availability: ${collector.availability === 'AVAILABLE' ? 'Available' : 'Busy'} • Transport: ${collector.vehicleType || 'Bike'} • Mission Load: ${activeMissions} active mission${activeMissions === 1 ? '' : 's'}`;

    return {
      collector,
      matchScore,
      distanceKm,
      availability: collector.availability,
      activeMissionsCount: activeMissions,
      transportCapability: collector.vehicleType || 'Bike',
      displaySummary,
      reasons
    };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Automatically calculates multi-receiver split allocations for large donations
 */
export function calculateMultiReceiverSplit(
  totalServings: number,
  matches: ReceiverMatchResult[]
): { receiverId: string; receiverName: string; servings: number; distanceKm: number }[] {
  let remaining = totalServings;
  const allocations: { receiverId: string; receiverName: string; servings: number; distanceKm: number }[] = [];

  for (const match of matches) {
    if (remaining <= 0) break;
    const alloc = Math.min(remaining, match.receiver.capacity);
    if (alloc > 0) {
      allocations.push({
        receiverId: match.receiver.id,
        receiverName: match.receiver.name,
        servings: alloc,
        distanceKm: match.distanceKm
      });
      remaining -= alloc;
    }
  }

  // If still remaining, distribute to top match
  if (remaining > 0 && allocations.length > 0) {
    allocations[0].servings += remaining;
  }

  return allocations;
}
