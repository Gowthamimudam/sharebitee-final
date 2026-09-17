/**
 * Location and Area Intelligence Service
 * Provides area coordinates, Haversine distance calculations,
 * and browser geolocation helpers.
 */

export interface AreaDefinition {
  name: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  pincode?: string;
}

export const RECOGNIZED_AREAS: AreaDefinition[] = [
  {
    name: 'Nizamabad',
    state: 'Telangana',
    lat: 18.6725,
    lng: 78.0941,
    pincode: '503001',
    description: 'Nizamabad Municipal Area & Commercial Corridor'
  },
  {
    name: 'Armoor',
    state: 'Telangana',
    lat: 18.7900,
    lng: 78.2900,
    pincode: '503224',
    description: 'Armoor Town & Highway Transit Belt'
  },
  {
    name: 'Bodhan',
    state: 'Telangana',
    lat: 18.6600,
    lng: 77.8800,
    pincode: '503185',
    description: 'Bodhan Commercial & Sugar Belt'
  },
  {
    name: 'Basar',
    state: 'Telangana',
    lat: 18.8770,
    lng: 77.9542,
    pincode: '504101',
    description: 'Basar Temple Town & Godavari River Hub'
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    pincode: '500001',
    description: 'Greater Hyderabad Metro & Tech/Culinary Hub'
  }
];

export const KNOWN_AREAS = RECOGNIZED_AREAS;

/**
 * Get standard coordinates for a named area, case-insensitive match
 */
export function getAreaCoordinates(areaName?: string): { lat: number; lng: number } {
  if (!areaName) {
    return { lat: 18.6725, lng: 78.0941 }; // Default to Nizamabad center
  }

  const normalized = areaName.trim().toLowerCase();
  const match = RECOGNIZED_AREAS.find(
    (a) => a.name.toLowerCase() === normalized || normalized.includes(a.name.toLowerCase())
  );

  if (match) {
    return { lat: match.lat, lng: match.lng };
  }

  return { lat: 18.6725, lng: 78.0941 };
}

/**
 * Standard Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 3.0; // fallback estimated proximity
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Request device location via browser Geolocation API with timeout and graceful fallback
 */
export function requestCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 18.6725,
        longitude: 78.0941,
        error: 'Geolocation not supported by browser. Defaulted to Nizamabad.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        let errorMsg = 'Location access denied or unavailable.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can still enter your address manually.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Location request timed out. Using area defaults.';
        }
        resolve({
          latitude: 18.6725,
          longitude: 78.0941,
          error: errorMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000
      }
    );
  });
}
