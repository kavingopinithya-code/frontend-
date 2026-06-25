/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CrowdLevel = 'low' | 'medium' | 'high';
export type ServiceCategory = 'hospital' | 'bank' | 'shop' | 'hotel' | 'lodge' | 'market' | 'supermarket' | 'hostel' | 'xerox_shop' | 'general';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  crowdLevel: CrowdLevel;
  isOpen: boolean;
  rating: number;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  hasDelivery: boolean;
  hasHomeService: boolean;
  estimatedWaitTime: number; // in minutes
  ownerId: string | null;     // matches a provider's ID if owned
  description: string;
  servicesOffered: string[];
  distance?: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  userName: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: string;
}

export interface CrowdAlert {
  id: string;
  serviceId: string;
  serviceName: string;
  previousLevel: CrowdLevel;
  currentLevel: CrowdLevel;
  timestamp: string;
}

export interface ServiceFilter {
  category: ServiceCategory | 'all';
  maxDistance: number; // in km
  crowdLevel: CrowdLevel | 'all';
  hasDelivery: boolean;
  hasHomeService: boolean;
  isOpenOnly: boolean;
}
