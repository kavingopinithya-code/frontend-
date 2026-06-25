/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ServiceProvider, LocationCoordinates, CrowdLevel, ServiceCategory, Booking, CrowdAlert, ServiceFilter } from '../types';
import { getDistanceInKm } from '../data';
import { 
  Search, ShieldAlert, Sparkles, Filter, Banknote, HelpCircle, 
  Phone, Clock, CheckCircle2, ChevronRight, ShoppingCart, Activity,
  Home, Bike, ArrowUpDown, BellRing, NavigationOff, MessageCircle
} from 'lucide-react';

// Using local SVG definitions for inline category decoration
interface ClientViewProps {
  services: ServiceProvider[];
  userLocation: LocationCoordinates;
  selectedServiceId: string | null;
  onSelectService: (serviceId: string | null) => void;
  onAddBooking: (booking: Booking) => void;
  onAddNotificationSetting: (serviceId: string, level: CrowdLevel) => void;
  activeNotifications: CrowdAlert[];
  notificationSettings: Record<string, CrowdLevel>;
}

export default function ClientView({
  services,
  userLocation,
  selectedServiceId,
  onSelectService,
  onAddBooking,
  onAddNotificationSetting,
  activeNotifications,
  notificationSettings
}: ClientViewProps) {
  // Filters
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'all'>('all');
  const [filterCrowd, setFilterCrowd] = useState<CrowdLevel | 'all'>('all');
  const [filterDistance, setFilterDistance] = useState<number>(8); // max kms
  const [isOpenOnly, setIsOpenOnly] = useState<boolean>(false);
  const [hasDeliveryOnly, setHasDeliveryOnly] = useState<boolean>(false);
  const [hasHomeServiceOnly, setHasHomeServiceOnly] = useState<boolean>(false);
  
  // Sorting Mode Toggles
  const [sortingMode, setSortingMode] = useState<'smart' | 'nearest'>('smart');
  
  // Search text query
  const [searchQuery, setSearchQuery] = useState('');

  // Bell/Notification box view
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Booking Form Modal State
  const [bookingName, setBookingName] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Parse list with dynamic computed distances
  const computedServices = useMemo(() => {
    return services.map(svc => {
      const dist = getDistanceInKm(
        userLocation.latitude, 
        userLocation.longitude, 
        svc.latitude, 
        svc.longitude
      );
      return {
        ...svc,
        distance: dist
      };
    });
  }, [services, userLocation]);

  // Apply filters
  const filteredServices = useMemo(() => {
    return computedServices.filter(svc => {
      // Category Filter
      if (filterCategory !== 'all' && svc.category !== filterCategory) return false;
      
      // Search Bar Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = svc.name.toLowerCase().includes(query);
        const matchesDesc = svc.description.toLowerCase().includes(query);
        const matchesSvc = svc.servicesOffered.some(s => s.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesSvc) return false;
      }

      // Max Distance
      if (svc.distance > filterDistance) return false;

      // Crowd Level Choice
      if (filterCrowd !== 'all' && svc.crowdLevel !== filterCrowd) return false;

      // Is Open Only
      if (isOpenOnly && !svc.isOpen) return false;

      // Delivery
      if (hasDeliveryOnly && !svc.hasDelivery) return false;

      // Home Service
      if (hasHomeServiceOnly && !svc.hasHomeService) return false;

      return true;
    });
  }, [computedServices, filterCategory, searchQuery, filterDistance, filterCrowd, isOpenOnly, hasDeliveryOnly, hasHomeServiceOnly]);

  // Apply Sorting Sequence based on Mode
  const sortedServices = useMemo(() => {
    const list = [...filteredServices];
    
    if (sortingMode === 'smart') {
      // SMART CROWD SORT:
      // 1. Availability (Open facilities first)
      // 2. Crowd Level priority (Low -> Medium -> High)
      // 3. Distance as tie breaker
      return list.sort((a, b) => {
        // Open first
        if (a.isOpen !== b.isOpen) {
          return a.isOpen ? -1 : 1;
        }

        // Crowd level translation
        const crowdWeight = { 'low': 1, 'medium': 2, 'high': 3 };
        const crowdDiff = crowdWeight[a.crowdLevel] - crowdWeight[b.crowdLevel];
        if (crowdDiff !== 0) return crowdDiff;

        // Distance tie breaker
        return a.distance - b.distance;
      });
    } else {
      // TRADITIONAL SORT:
      // Pure distance sort closest first
      return list.sort((a, b) => a.distance - b.distance);
    }
  }, [filteredServices, sortingMode]);

  // Pick out highlights for the comparison summary analysis
  const closestHospital = useMemo(() => {
    const hospitals = computedServices.filter(s => s.category === 'hospital' && s.isOpen);
    if (!hospitals.length) return null;
    return [...hospitals].sort((a, b) => a.distance - b.distance)[0];
  }, [computedServices]);

  const smartestHospital = useMemo(() => {
    const hospitals = computedServices.filter(s => s.category === 'hospital' && s.isOpen);
    if (!hospitals.length) return null;
    return [...hospitals].sort((a, b) => {
      const weight = { 'low': 1, 'medium': 2, 'high': 3 };
      const crowdDiff = weight[a.crowdLevel] - weight[b.crowdLevel];
      if (crowdDiff !== 0) return crowdDiff;
      return a.distance - b.distance;
    })[0];
  }, [computedServices]);

  // Active selected service detail
  const activeDetail = useMemo(() => {
    if (!selectedServiceId) return null;
    return computedServices.find(s => s.id === selectedServiceId) || null;
  }, [computedServices, selectedServiceId]);

  // Submit Booking Queue form
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetail || !bookingName.trim()) return;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      serviceId: activeDetail.id,
      serviceName: activeDetail.name,
      userName: bookingName,
      time: bookingTime || "Within 30 mins (ASAP)",
      type: bookingType || "General Intake Visit",
      status: 'pending',
      createdAt: new Date().toLocaleTimeString()
    };

    onAddBooking(newBooking);
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setBookingName('');
      setBookingTime('');
      setBookingType('');
    }, 3000);
  };

  const getCrowdLabel = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return { label: 'Low Crowd', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' };
      case 'medium': return { label: 'Medium Crowd', color: 'bg-amber-50 text-amber-800 border-amber-100' };
      case 'high': return { label: 'Highly Crowded', color: 'bg-rose-50 text-rose-800 border-rose-100' };
    }
  };

  const getWaitLevelDesc = (level: CrowdLevel, cat: string) => {
    if (cat === 'hospital') {
      if (level === 'low') return 'Immediate Care • ~12m wait';
      if (level === 'medium') return 'Steady Tsunami • ~40m wait';
      return 'Critical Delays • ~95m wait';
    } else {
      if (level === 'low') return 'Under 5 mins wait';
      if (level === 'medium') return 'Estimate ~20 mins wait';
      return 'Long Queues • 50m wait';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in" id="client-view-root">


      {/* LEFT COLUMN: Services, Search, Filters */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* Search and Category Selectors */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="relative mb-5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specific hospital, bank, pharmacy or services..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand transition-all font-sans"
              id="global-search-bar"
            />
            <Search className="absolute left-4.5 top-4 h-4.5 w-4.5 text-slate-405 text-brand" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4.5 top-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hover:text-brand transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick categories row styled as mockup tab capsule pills */}
          <div className="bg-[#f0effa] p-1.5 rounded-full flex gap-1 items-center border border-slate-200/50 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Services', icon: '🌐' },
              { id: 'hospital', label: 'Hospitals', icon: '🏥' },
              { id: 'hotel', label: 'Hotels', icon: '🏨' },
              { id: 'lodge', label: 'Lodges', icon: '🛖' },
              { id: 'market', label: 'Markets', icon: '🧺' },
              { id: 'supermarket', label: 'Supermarkets', icon: '🛒' },
              { id: 'shop', label: 'Shops', icon: '🛍️' },
              { id: 'bank', label: 'Banks', icon: '🏦' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id as ServiceCategory | 'all')}
                className={`rounded-full px-5 py-2.5 text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  filterCategory === cat.id 
                    ? 'bg-brand text-white shadow-md shadow-brand/20 scale-[1.01]' 
                    : 'text-slate-600 hover:text-brand'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filters panel */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-indigo-50/50">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-brand" />
              Granular Filters
            </h4>
            <button
              onClick={() => {
                setFilterCrowd('all');
                setFilterDistance(8);
                setIsOpenOnly(false);
                setHasDeliveryOnly(false);
                setHasHomeServiceOnly(false);
              }}
              className="text-[10px] font-extrabold text-slate-400 hover:text-brand transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Dist slider & Crowd selection */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">
                  <span>Max Limit (Distance)</span>
                  <span className="font-mono text-brand font-black">{filterDistance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={filterDistance}
                  onChange={(e) => setFilterDistance(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-2">Allowed Congestion</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'Any' },
                    { id: 'low', label: '🟢 Low' },
                    { id: 'medium', label: '🟡 Med' },
                    { id: 'high', label: '🔴 High' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setFilterCrowd(lvl.id as CrowdLevel | 'all')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold text-center border transition duration-250 cursor-pointer ${
                        filterCrowd === lvl.id 
                          ? 'border-slate-850 bg-slate-900 text-white shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-brand-light hover:text-brand'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-col justify-between gap-2.5 md:pl-5 md:border-l md:border-indigo-50/70">
              <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-[#f7f6fd] transition">
                <input
                  type="checkbox"
                  checked={isOpenOnly}
                  onChange={(e) => setIsOpenOnly(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-800">Open Business Only</span>
                  <span className="text-[10px] text-slate-450">Ignore closed facilities</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-[#f7f6fd] transition">
                <input
                  type="checkbox"
                  checked={hasDeliveryOnly}
                  onChange={(e) => setHasDeliveryOnly(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-800">Doorbell Delivery Offered</span>
                  <span className="text-[10px] text-slate-450">Filter shops with dispatch delivery</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-[#f7f6fd] transition">
                <input
                  type="checkbox"
                  checked={hasHomeServiceOnly}
                  onChange={(e) => setHasHomeServiceOnly(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-800">In-Home Care Services</span>
                  <span className="text-[10px] text-slate-450">Filter clinics with dispatched care</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SORT CORE DIFFERENTIATOR SELECTION CARD */}
        <div className="rounded-[2rem] border border-brand/15 bg-gradient-to-br from-[#f0effa]/30 to-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4 mb-3.5 bg-white p-4 rounded-[1.5rem] border border-dashed border-brand/15 shadow-sm">
            <div>
              <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest block mb-0.5">Core Differentiation Engine</span>
              <h3 className="text-sm font-black text-slate-905 tracking-tight font-display">Triage Prioritization Routing</h3>
            </div>
            
            <div className="inline-flex gap-1 p-1 bg-[#f0effa] rounded-full border border-slate-200/50" id="strategy-pill-wrapper">
              <button
                onClick={() => setSortingMode('smart')}
                className={`py-2 px-4 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                  sortingMode === 'smart' 
                    ? 'bg-brand text-white shadow-md shadow-brand/25 scale-[1.03]' 
                    : 'text-slate-600 hover:text-brand'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                SmartTriage
              </button>
              
              <button
                onClick={() => setSortingMode('nearest')}
                className={`py-2 px-4 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                  sortingMode === 'nearest' 
                    ? 'bg-slate-900 text-white shadow-md scale-[1.03]' 
                    : 'text-slate-600 hover:text-brand'
                }`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                Traditional
              </button>
            </div>
          </div>
          
          <p className="text-[11.5px] text-slate-600 leading-relaxed">
            {sortingMode === 'smart' ? (
              <span className="font-sans font-medium text-slate-600">
                ✨ <strong className="font-extrabold text-brand">Optimizing client discovery flow!</strong> Open facilities with LOW crowding levels are automatically promoted to the top, potentially bypassing 80+ minutes of waiting delays nearby.
              </span>
            ) : (
              <span className="text-slate-500 font-sans font-medium">
                ⚠️ <strong className="font-extrabold text-amber-600">Traditional distance sorting active.</strong> You might be matched with highly congested sites. For instance, you could be routed to heavy lines even if a clear branch lies 400 meters further.
              </span>
            )}
          </p>
        </div>

        {/* Master Listings Area */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Filtered Discovery Matches ({sortedServices.length})</span>

          {sortedServices.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-205 p-8 text-center bg-white">
              <NavigationOff className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-750">No Services Found Nearby</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
                No businesses match your exact tags or max distance slider value. Try sliding the distance filter upward or resetting category toggles.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {sortedServices.map((svc) => {
                const isSelected = svc.id === selectedServiceId;
                const crowd = getCrowdLabel(svc.crowdLevel);
                const waitDesc = getWaitLevelDesc(svc.crowdLevel, svc.category);

                return (
                  <div
                    key={svc.id}
                    onClick={() => onSelectService(svc.id === selectedServiceId ? null : svc.id)}
                    className={`rounded-[1.5rem] border p-5 text-left transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'border-brand bg-brand-light shadow-md ring-2 ring-brand/10 scale-[1.01]' 
                        : 'border-slate-200/60 bg-white hover:border-brand/45 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            {svc.category === 'hospital' ? '🏥 Hospital' : 
                             svc.category === 'bank' ? '🏦 Bank' : 
                             svc.category === 'shop' ? '🛍️ Shop' :
                             svc.category === 'hotel' ? '🏨 Hotel' :
                             svc.category === 'lodge' ? '🛖 Lodge' :
                             svc.category === 'market' ? '🧺 Market' :
                             svc.category === 'supermarket' ? '🛒 Supermarket' : '📍 ' + svc.category}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className={`text-[9.5px] font-mono font-extrabold ${svc.isOpen ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {svc.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mt-1 whitespace-normal leading-tight font-display">
                          {svc.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[260px] md:max-w-[340px]">
                          {svc.address}
                        </p>
                      </div>

                      {/* Distance indicators */}
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-black text-slate-700">
                          {svc.distance} km
                        </span>
                        <p className="text-[9px] text-slate-450 mt-1 font-mono uppercase tracking-widest font-extrabold">Distance</p>
                      </div>
                    </div>

                    {/* Crowd indicators highlighting */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black tracking-wide uppercase ${crowd.color}`}>
                          {crowd.label}
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-700">
                          {waitDesc}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* delivery/home-medical icons */}
                        <div className="flex items-center gap-1">
                          {svc.hasDelivery && (
                            <span className="p-1 rounded bg-brand-light text-brand" title="Delivery Service Active">
                              <Bike className="h-3.5 w-3.5 animate-pulse" />
                            </span>
                          )}
                          {svc.hasHomeService && (
                            <span className="p-1 rounded bg-teal-50 text-teal-600" title="Mobile Physical Visits Active">
                              <Home className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-brand group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          View details
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active details drawer & reservation form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Real-time Alerts Notification Center Trigger Widget */}
        <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="rounded-xl bg-[#fff2ee] p-2.5 text-[#ff7145] shadow-sm">
                  <BellRing className="h-5.5 w-5.5 animate-swing" />
                </div>
                {activeNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center justify-center border-2 border-white">
                    {activeNotifications.length}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Congestion Monitor Alerts</h4>
                <p className="text-[10px] text-slate-500 font-sans">Updates on drops in crowd traffic indices</p>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="text-xs font-black text-brand hover:text-brand-hover border-b border-brand/25 pb-0.5 cursor-pointer transition duration-200"
            >
              {showNotificationDrawer ? "Hide Alerts" : `View Logs (${activeNotifications.length})`}
            </button>
          </div>

          {/* Collapsible Alerts Log content */}
          {showNotificationDrawer && (
            <div className="mt-4 border-t border-indigo-50/50 pt-4 max-h-[190px] overflow-y-auto pr-1 flex flex-col gap-2">
              {activeNotifications.length === 0 ? (
                <p className="text-[10.5px] italic text-slate-405 py-3 text-center">
                  All systems operating steadily. No recent changes in neighborhood congestion profiles.
                </p>
              ) : (
                activeNotifications.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="rounded-xl border border-orange-100 bg-[#fffdfc] p-3.5 text-[11px] text-slate-750 leading-relaxed font-sans"
                  >
                    <div className="font-extrabold text-slate-900 mb-1 flex items-center justify-between">
                      <span className="truncate pr-2">🔔 {alert.serviceName}</span>
                      <span className="text-[8px] font-mono text-slate-400">{alert.timestamp}</span>
                    </div>
                    <span>
                      Congestion cleared! Status dropped from <span className="text-rose-600 font-extrabold capitalize">{alert.previousLevel}</span> to <span className="text-emerald-700 font-extrabold capitalize">{alert.currentLevel}</span>. Drop-ins are clear.
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Service Detailed Information Card */}
        {activeDetail ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md" id="facility-detail-panel">
            
            {/* Header elements */}
            <div>
              <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest block mb-0.5">
                Detailed Space Profile
              </span>
              <h3 className="text-lg font-black text-slate-950 font-display leading-snug">{activeDetail.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeDetail.address}</p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              <div className="rounded-2xl bg-[#f7f6fd] p-3.5 border border-indigo-50/50">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Wait Timing</span>
                <span className="text-base font-black text-brand font-mono">~{activeDetail.estimatedWaitTime} mins</span>
              </div>
              <div className="rounded-2xl bg-[#f7f6fd] p-3.5 border border-indigo-50/50">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">User Rating</span>
                <span className="text-base font-black text-slate-900">⭐ {activeDetail.rating} / 5</span>
              </div>
            </div>

            {/* Details Description */}
            <div>
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-[#f7f6fd]/50 p-3.5 rounded-2xl border border-indigo-55/60">
                {activeDetail.description}
              </p>
            </div>

            {/* Services checklist rendering */}
            <div>
              <h4 className="text-[10px] font-extrabold text-[#747185] uppercase tracking-wider mb-2">Available Operations</h4>
              <div className="grid grid-cols-2 gap-2">
                {activeDetail.servicesOffered.map((svcCheck, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{svcCheck}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact widget */}
            <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl bg-white/50">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-extrabold text-slate-700 font-mono">{activeDetail.phone}</span>
              </div>
              <a 
                href={`tel:${activeDetail.phone}`}
                className="text-[11px] bg-brand-light hover:bg-[#e1ddff] font-extrabold text-brand px-4 py-2 rounded-full transition cursor-pointer"
              >
                Call Branch
              </a>
            </div>

            {/* Smart Alerts Target level config */}
            <div className="p-4 bg-brand-light rounded-[1.5rem] border border-brand/10 space-y-2">
              <span className="block text-[9.5px] font-black text-brand uppercase tracking-wider">Set Clearing Notifications</span>
              <p className="text-[10.5px] text-slate-600 leading-normal font-sans font-medium">
                We will update you with sound pings the instant this facility's crowd indicators slide back down to Low or Medium!
              </p>
              
              <div className="flex items-center gap-2 pt-1.5">
                {(['low', 'medium'] as CrowdLevel[]).map((level) => {
                  const isActive = notificationSettings[activeDetail.id] === level;
                  return (
                    <button
                      key={level}
                      onClick={() => onAddNotificationSetting(activeDetail.id, level)}
                      className={`text-[10.5px] py-1.5 px-4 rounded-full border font-extrabold capitalize transition cursor-pointer ${
                        isActive 
                          ? 'bg-brand border-brand text-white shadow-md shadow-brand/20' 
                          : 'bg-white border-slate-205 text-slate-600 hover:bg-slate-55 hover:text-brand'
                      }`}
                    >
                      {level === 'low' ? '🟢 Alert Low' : '🟡 Alert Med'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check-In Reservation Form */}
            <div className="border-t border-slate-100 pt-5">
              <span className="block text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand animate-pulse" />
                Priority Digital Spot Request
              </span>
              
              {bookingSubmitted ? (
                <div className="rounded-[1.5rem] bg-emerald-50 border border-emerald-100 p-5 text-center shadow-inner">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
                  <h4 className="text-xs font-black text-emerald-800 mt-2 font-display">Triage Ticket Generated</h4>
                  <p className="text-[10.5px] text-emerald-750 mt-1 leading-relaxed">
                    Priority spot requested! Open the <strong className="font-extrabold">Manage Space</strong> portal now to grant entry tickets and manage line updates.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value)}
                      placeholder="e.g. Account Triage"
                      className="rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                    />
                    <input
                      type="text"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      placeholder="Preferred Hour"
                      className="rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-brand hover:bg-brand-hover text-white font-extrabold text-xs py-3 transition active:scale-[0.99] shadow-md shadow-brand/15 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Request Entry Ticket</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-205 p-8 sm:p-12 text-center bg-white transition-all duration-300 hover:shadow-md">
            <MessageCircle className="mx-auto h-8 w-8 text-brand/40 mb-3" />
            <h4 className="text-sm font-black text-slate-900 tracking-tight font-display">No Branch Selected</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Click on any list item or interactive map coordinate marker to load live congestion index profiles.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
