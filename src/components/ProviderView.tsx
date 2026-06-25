/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ServiceProvider, CrowdLevel, Booking, ServiceCategory } from '../types';
import { 
  Building2, Users, Clock, Flame, 
  ToggleLeft, ToggleRight, Check, X, 
  Plus, Smartphone, MapPin, ClipboardList, Info, Sparkles 
} from 'lucide-react';

interface ProviderViewProps {
  services: ServiceProvider[];
  onUpdateService: (updated: ServiceProvider) => void;
  onAddService: (newService: ServiceProvider) => void;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: 'confirmed' | 'declined') => void;
}

export default function ProviderView({
  services,
  onUpdateService,
  onAddService,
  bookings,
  onUpdateBookingStatus
}: ProviderViewProps) {
  // Let the user select which store they want to manage. By default, pick the demo urgent care.
  const [activeManageId, setActiveManageId] = useState<string>("hosp-2");
  
  // Create business form state
  const [isCreating, setIsCreating] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState<ServiceCategory>('shop');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizAddress, setNewBizAddress] = useState('');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizDelivery, setNewBizDelivery] = useState(false);
  const [newBizHomeService, setNewBizHomeService] = useState(false);
  const [newBizCrowd, setNewBizCrowd] = useState<CrowdLevel>('low');

  const activeService = useMemo(() => {
    return services.find(s => s.id === activeManageId) || services[0];
  }, [services, activeManageId]);

  // Handle status/crowd state switches
  const handleCrowdChange = (level: CrowdLevel) => {
    if (!activeService) return;
    
    // Auto-calculate dynamic estimated wait-time mapping
    let wait = 5;
    if (level === 'medium') wait = activeService.category === 'hospital' ? 35 : 20;
    if (level === 'high') wait = activeService.category === 'hospital' ? 90 : 45;

    onUpdateService({
      ...activeService,
      crowdLevel: level,
      estimatedWaitTime: wait
    });
  };

  const handleToggleOpen = () => {
    if (!activeService) return;
    onUpdateService({
      ...activeService,
      isOpen: !activeService.isOpen
    });
  };

  const handleToggleDelivery = () => {
    if (!activeService) return;
    onUpdateService({
      ...activeService,
      hasDelivery: !activeService.hasDelivery
    });
  };

  const handleToggleHomeService = () => {
    if (!activeService) return;
    onUpdateService({
      ...activeService,
      hasHomeService: !activeService.hasHomeService
    });
  };

  // Register a brand new business
  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    // Place business at a randomized offset near Downtown
    const offsetLat = (Math.random() - 0.5) * 0.015;
    const offsetLng = (Math.random() - 0.5) * 0.015;

    const newProvider: ServiceProvider = {
      id: `custom-biz-${Date.now()}`,
      name: newBizName,
      category: newBizCategory,
      crowdLevel: newBizCrowd,
      isOpen: true,
      rating: 4.5,
      latitude: 43.6487 + offsetLat,
      longitude: -79.3817 + offsetLng,
      address: newBizAddress || "Simulated Business Strip, Downtown",
      phone: newBizPhone || "+1 (555) 999-0000",
      hasDelivery: newBizDelivery,
      hasHomeService: newBizHomeService,
      estimatedWaitTime: newBizCrowd === 'high' ? 60 : (newBizCrowd === 'medium' ? 25 : 5),
      ownerId: "custom-user-provider",
      description: newBizDesc || "A registered provider supporting real-time Crowd Tracker status updates.",
      servicesOffered: ["Regular Triage", newBizCategory === 'hospital' ? "Emergency Support" : (newBizCategory === 'bank' ? "Teller Operations" : "Express Checkout")]
    };

    onAddService(newProvider);
    setActiveManageId(newProvider.id);
    setIsCreating(false);

    // Reset Form
    setNewBizName('');
    setNewBizPhone('');
    setNewBizAddress('');
    setNewBizDesc('');
    setNewBizDelivery(false);
    setNewBizHomeService(false);
    setNewBizCrowd('low');
  };

  // Filter bookings belonging to the active business
  const activeBookings = useMemo(() => {
    if (!activeService) return [];
    return bookings.filter(b => b.serviceId === activeService.id);
  }, [bookings, activeService]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in" id="provider-workspace">
      {/* Sidebar: Business selector & Registration */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Business Selector */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-350 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-display">My Spaces</h3>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1 text-[11px] font-black text-brand hover:text-brand-hover transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register New
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
            Select a facility from your ledger to broadcast live congestion updates to community channels:
          </p>

          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
            {services.map((svc) => {
              const isSelected = svc.id === activeManageId;
              
              let badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
              if (svc.crowdLevel === 'medium') badgeColor = "bg-amber-50 text-amber-805 border border-amber-200/50";
              if (svc.crowdLevel === 'high') badgeColor = "bg-rose-50 text-rose-700 border border-rose-200/50";

              return (
                <button
                  key={svc.id}
                  onClick={() => {
                    setActiveManageId(svc.id);
                    setIsCreating(false);
                  }}
                  className={`w-full rounded-[1.2rem] p-3.5 border text-left transition duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-brand bg-[#f7f6fd] shadow-sm ring-2 ring-brand/10' 
                      : 'border-slate-100 bg-white hover:border-brand/35 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-slate-850 truncate font-display" style={{ maxWidth: '140px' }}>
                      {svc.name}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black capitalize ${badgeColor}`}>
                      {svc.crowdLevel}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-450">
                    <span className="capitalize font-mono text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                      {svc.category === 'hospital' ? '🏥 Hospital' : (svc.category === 'bank' ? '🏦 Bank' : '🛍️ Shop')}
                    </span>
                    <span className="font-extrabold text-[10px]">{svc.isOpen ? "🟢 Open" : "🔴 Closed"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative Tip Box */}
        <div className="rounded-[2rem] border border-brand/10 bg-brand-light p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4.5 w-4.5 text-brand flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-display">Automated Sync</h4>
              <p className="mt-1 text-[11px] text-slate-650 leading-relaxed font-sans font-medium">
                Altering congestion levels below instantly updates patient discovery vectors in real-time, sending priority check-in spot alerts to clients nearby.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel: Live Editor or Registration Form */}
      <div className="lg:col-span-8">
        {isCreating ? (
          /* Register New Business Form */
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in" id="register-new-form">
            <h3 className="text-lg font-black text-slate-950 mb-1 flex items-center gap-1.5 font-display tracking-tight">
              <Building2 className="h-5.5 w-5.5 text-brand" />
              Register Space Branch
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Join the real-time congestion mesh network to promote fast-line discovery in your region.
            </p>

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="St. Jude Urgent Care Clinic"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Service Category *</label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value as ServiceCategory)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                  >
                    <option value="hospital">🏥 Hospital / Emergency Unit</option>
                    <option value="bank">🏦 Bank / Financial Hub</option>
                    <option value="shop">🛍️ Retail Shop / Local Market</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Contact Line</label>
                  <input
                    type="tel"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Full Street Address</label>
                  <input
                    type="text"
                    value={newBizAddress}
                    onChange={(e) => setNewBizAddress(e.target.value)}
                    placeholder="e.g., 55 Yonge St, Downtown"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-805 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Branch Operations Description</label>
                <textarea
                  value={newBizDesc}
                  onChange={(e) => setNewBizDesc(e.target.value)}
                  placeholder="Describe direct triage procedures, physical location characteristics, access rules..."
                  rows={2}
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand font-sans font-medium"
                />
              </div>

              {/* Initial states */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-[1.5rem] bg-[#f7f6fd]/50 p-4 border border-indigo-50/50">
                <div>
                  <label className="block text-[10px] font-black text-slate-450 tracking-wider mb-2 uppercase">Initial Load Status</label>
                  <div className="flex gap-1">
                    {['low', 'medium', 'high'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewBizCrowd(c as CrowdLevel)}
                        className={`capitalize px-3 py-1.5 rounded-full text-[10px] font-black border transition cursor-pointer ${
                          newBizCrowd === c 
                            ? 'bg-brand border-brand text-white shadow-sm shadow-brand/10' 
                            : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2.5 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={newBizDelivery}
                      onChange={(e) => setNewBizDelivery(e.target.checked)}
                      className="rounded border-slate-305 text-brand focus:ring-brand h-4 w-4 accent-brand"
                    />
                    <span className="text-xs font-extrabold text-slate-705">Offers Delivery</span>
                  </label>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2.5 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={newBizHomeService}
                      onChange={(e) => setNewBizHomeService(e.target.checked)}
                      className="rounded border-slate-305 text-brand focus:ring-brand h-4 w-4 accent-brand"
                    />
                    <span className="text-xs font-extrabold text-slate-705">Offers Home Visit</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-full border border-slate-250 py-2.5 px-5 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-brand py-2.5 px-6 text-xs font-black text-white hover:bg-brand-hover transition active:scale-95 shadow-md shadow-brand/15 cursor-pointer"
                >
                  Register Space
                </button>
              </div>
            </form>
          </div>
        ) : activeService ? (
          /* Live Status Control Panel */
          <div className="flex flex-col gap-6">
            {/* Main Manager Dashboard Header */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-indigo-50/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase font-black tracking-widest bg-brand-light text-brand px-2.5 py-0.5 rounded-full border border-brand/10">
                      Operational Console
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">NODE ID: {activeService.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-950 font-display mt-1 leading-snug">{activeService.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-405 text-slate-400" />
                    {activeService.address}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">Active Status</p>
                    <p className={`text-xs font-extrabold ${activeService.isOpen ? 'text-emerald-600' : 'text-slate-500'} mt-0.5`}>
                      {activeService.isOpen ? "🟢 Receiving Visitors" : "🔴 Temporarily Closed"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleOpen}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{ backgroundColor: activeService.isOpen ? '#059669' : '#cbd5e1' }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      style={{ transform: activeService.isOpen ? 'translateX(20px)' : 'translateX(0px)' }}
                    />
                  </button>
                </div>
              </div>

              {/* Crowd Adjuster Panel */}
              <div className="mb-6 bg-slate-50/40 p-5 rounded-[1.8rem] border border-slate-100">
                <span className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-display">
                  <Flame className="h-4.5 w-4.5 text-[#ff7145] animate-pulse" />
                  Live Congestion Broadcasting
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { level: 'low' as CrowdLevel, text: 'Low Wait / Steady', desc: '< 15 mins wait', color: 'border-emerald-250 bg-emerald-50 text-emerald-800', iconColor: 'bg-emerald-500', activeBg: 'bg-emerald-600 text-white' },
                    { level: 'medium' as CrowdLevel, text: 'Moderate Load', desc: '15 - 45 mins wait', color: 'border-amber-205 bg-amber-50 text-amber-800', iconColor: 'bg-amber-500', activeBg: 'bg-amber-500 text-white' },
                    { level: 'high' as CrowdLevel, text: 'Highly Congested', desc: '60+ mins wait delay', color: 'border-rose-200 bg-rose-50 text-rose-800', iconColor: 'bg-rose-600', activeBg: 'bg-rose-600 text-white' }
                  ].map((option) => {
                    const isSelected = activeService.crowdLevel === option.level;
                    return (
                      <button
                        key={option.level}
                        onClick={() => handleCrowdChange(option.level)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition cursor-pointer duration-300 ${
                          isSelected 
                            ? `${option.activeBg} border-transparent shadow-md scale-[1.02] ring-2 ring-white/10` 
                            : 'bg-white border-slate-150 hover:bg-slate-50 hover:border-brand/45 text-slate-850'
                        }`}
                      >
                        <div className={`h-2.5 w-2.5 rounded-full mb-1.5 ${isSelected ? 'bg-white shadow' : option.iconColor}`} />
                        <span className="text-xs font-black capitalize tracking-wide font-display">{option.level}</span>
                        <span className={`text-[10.5px] font-semibold leading-tight mt-1 ${isSelected ? 'text-white/95' : 'text-slate-650'}`}>
                          {option.text}
                        </span>
                        <span className={`text-[9px] font-mono font-bold mt-1.5 ${isSelected ? 'text-white/80' : 'text-slate-450'}`}>
                          {option.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Services Configuration Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-2">
                <div className="flex items-center justify-between rounded-2xl border border-slate-150 p-4 bg-white hover:border-brand/35 transition duration-305">
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900 leading-tight">Dispatch Home Delivery</span>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-sans font-medium">Provide direct courier drops for orders</span>
                  </div>
                  <button
                    onClick={handleToggleDelivery}
                    className="relative inline-flex h-5.5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{ backgroundColor: activeService.hasDelivery ? '#4e3df5' : '#cbd5e1' }}
                  >
                    <span
                      className="pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                      style={{ transform: activeService.hasDelivery ? 'translateX(18px)' : 'translateX(0px)' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-150 p-4 bg-white hover:border-brand/35 transition duration-305">
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900 leading-tight">Mobile Home Visits</span>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-sans font-medium font-medium">Permit mobilization of care teams directly</span>
                  </div>
                  <button
                    onClick={handleToggleHomeService}
                    className="relative inline-flex h-5.5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{ backgroundColor: activeService.hasHomeService ? '#4e3df5' : '#cbd5e1' }}
                  >
                    <span
                      className="pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                      style={{ transform: activeService.hasHomeService ? 'translateX(18px)' : 'translateX(0px)' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Bookings & Checkin queue */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-50/50 pb-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                  <ClipboardList className="h-4.5 w-4.5 text-brand" />
                  Fast-Queue Ticket Ledger
                </h4>
                <span className="rounded-full bg-brand-light border border-brand/10 px-3 py-1 text-[10px] font-black text-brand uppercase tracking-wide">
                  {activeBookings.length} Active Tickets
                </span>
              </div>

              {activeBookings.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 py-10 px-4 text-center bg-slate-50/50">
                  <Info className="mx-auto h-6 w-6 text-slate-350 bg-transparent" />
                  <p className="mt-2 text-xs font-extrabold text-slate-705">Digital Queue is empty</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    No customers are checked-in. Place booking requests from the client maps panel check-in forms.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {activeBookings.map((chk) => (
                    <div 
                      key={chk.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-100 p-4 bg-[#fbfbfe] hover:bg-slate-50/80 hover:border-brand/20 transition duration-200 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-brand-light border border-brand/5 p-3.5 text-brand font-black text-xs font-display flex-shrink-0">
                          {chk.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">{chk.userName}</span>
                            <span className="text-[8.5px] rounded px-2 py-0.5 font-mono uppercase tracking-wider font-extrabold border" style={{
                              backgroundColor: chk.status === 'confirmed' ? '#ecfdf5' : (chk.status === 'declined' ? '#fef2f2' : '#fef9c3'),
                              borderColor: chk.status === 'confirmed' ? '#a7f3d0' : (chk.status === 'declined' ? '#fecaca' : '#fef08a'),
                              color: chk.status === 'confirmed' ? '#047857' : (chk.status === 'declined' ? '#b91c1c' : '#a16207')
                            }}>
                              {chk.status}
                            </span>
                          </div>
                          <div className="mt-1 text-[10.5px] text-slate-500 font-sans leading-tight">
                            Time: <span className="font-mono text-slate-600 font-bold">{chk.time}</span> • Service: <span className="italic font-medium text-slate-650">{chk.type}</span>
                          </div>
                        </div>
                      </div>

                      {chk.status === 'pending' ? (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => onUpdateBookingStatus(chk.id, 'declined')}
                            className="rounded-full border border-rose-250 p-2 text-rose-600 hover:bg-rose-5	 hover:text-rose-700 active:scale-95 transition cursor-pointer"
                            title="Decline / Reject Reservation"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => onUpdateBookingStatus(chk.id, 'confirmed')}
                            className="rounded-full bg-brand p-2 text-white hover:bg-brand-hover active:scale-95 transition shadow-sm cursor-pointer"
                            title="Confirm & Accept Patient"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[9.5px] font-mono text-slate-400 font-extrabold pr-2 select-none uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          Processed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 rounded-[2rem] border border-dashed border-slate-200 bg-white shadow-sm font-display font-black text-slate-600">
            No service selected to manage. Use select trigger on the left ledger!
          </div>
        )}
      </div>
    </div>
  );
}
