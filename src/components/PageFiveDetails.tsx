import React from 'react';
import { ArrowLeft, Star, Phone, Globe, Check, Activity, Shield, Sparkles } from 'lucide-react';
import { ServiceProvider, LocationCoordinates } from '../types';
import InteractiveMap from './InteractiveMap';

interface PageFiveDetailsProps {
  address: string;
  coordinates: LocationCoordinates;
  setCoordinates: (coords: { latitude: number; longitude: number }) => void;
  setAddress: (addr: string) => void;
  servicesWithDistance: ServiceProvider[];
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  activeDetailService: ServiceProvider | null;
  bookingSubmitted: boolean;
  setBookingSubmitted: (val: boolean) => void;
  bookingName: string;
  setBookingName: (val: string) => void;
  setCurrentPage: (page: 1 | 2 | 3 | 4 | 5) => void;
}

export default function PageFiveDetails({
  address,
  coordinates,
  setCoordinates,
  setAddress,
  servicesWithDistance,
  selectedServiceId,
  setSelectedServiceId,
  activeDetailService,
  bookingSubmitted,
  setBookingSubmitted,
  bookingName,
  setBookingName,
  setCurrentPage,
}: PageFiveDetailsProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in" id="details-root-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <button
          onClick={() => setCurrentPage(4)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand border border-slate-200 font-black text-xs py-2.5 px-5 rounded-full shadow-sm transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-brand" />
          <span>Back to Search Results</span>
        </button>
        <span className="text-xs font-bold text-slate-400 tracking-wider font-mono">
          STAGE 5 OF 5 • DETAILED FACILITY PROFILE / SLOTS INTAKE
        </span>
      </div>

      {activeDetailService ? (
        <div className="space-y-6">
          {/* Profile Top Jumbotron Banner block */}
          <div className="bg-white border border-slate-200 shadow-md rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
            {/* Visual decorative accents */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-brand/5 rounded-full pointer-events-none filter blur-2xl"></div>
            
            <div className="flex gap-4 items-start md:items-center min-w-0">
              <div className="h-16 w-16 rounded-3xl bg-brand/10 text-brand flex items-center justify-center text-3xl shrink-0 shadow-xs">
                {activeDetailService.category === 'hospital' ? '🏥' : (activeDetailService.category === 'bank' ? '🏦' : (activeDetailService.category === 'xerox_shop' ? '📄' : '🛍️'))}
              </div>
              
              <div className="min-w-0">
                <span className="text-[10px] font-black text-brand tracking-widest uppercase block bg-brand-light px-2.5 py-0.5 rounded-full w-fit font-mono">
                  {activeDetailService.category.replace('_', ' ')} Directory Check
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-905 tracking-tight font-display mt-2 leading-tight">
                  {activeDetailService.name}
                </h1>
                <span className="block mt-1 text-sm text-slate-500 font-semibold flex items-center gap-1.5">
                  📍 {activeDetailService.address}
                </span>
              </div>
            </div>

            {/* Star Rating summary score */}
            <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 self-start md:self-auto font-sans font-semibold">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <Star 
                    key={starIndex}
                    className={`h-4.5 w-4.5 ${
                      starIndex <= Math.floor(activeDetailService.rating) 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-slate-200 fill-slate-200'
                    }`} 
                  />
                ))}
                <strong className="text-sm font-black text-slate-850 ml-1.5">{activeDetailService.rating} / 5.0</strong>
              </div>
              <span className="text-[10.5px] font-mono text-slate-450 uppercase font-black">Google Verified Index</span>
            </div>
          </div>

          {/* Two-Column Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* LEFT COLUMN: Map Visualizer and description */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Live SVG Map display */}
              <InteractiveMap
                services={servicesWithDistance}
                userLocation={{ latitude: coordinates.latitude, longitude: coordinates.longitude, name: address }}
                onSetUserLocation={(newCoords) => {
                  setCoordinates(newCoords);
                  setAddress(newCoords.name || "Custom GPS Signal");
                }}
                selectedServiceId={selectedServiceId}
                onSelectService={(id) => {
                  if (id) {
                    setSelectedServiceId(id);
                  }
                }}
              />

              {/* Description Box */}
              <div className="bg-white border border-slate-200 rounded-[2.2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-base font-display mb-3">About this facility</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans font-medium">
                  {activeDetailService.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <Phone className="h-5 w-5 text-brand bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block font-mono">DIRECT LINE CALL</span>
                      <span className="font-mono text-slate-800 font-extrabold">{activeDetailService.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-650">
                    <Globe className="h-5 w-5 text-brand bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block font-mono">CHECK-IN STATUS</span>
                      <span className="text-slate-800 font-extrabold uppercase">
                        {activeDetailService.isOpen ? '🟢 Open to Public' : '🔴 Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Treatments list */}
              <div className="bg-white border border-slate-200 rounded-[2.2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-sm font-display mb-4 uppercase tracking-widest block font-mono">
                  Specialized Triage Services Offered
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeDetailService.servicesOffered.map((feat, ix) => (
                    <div key={ix} className="flex items-center gap-3 p-3 rounded-2xl bg-[#fbfcff] border border-indigo-50/50">
                      <Check className="h-4.5 w-4.5 text-brand bg-brand-light p-1 rounded-full shrink-0" />
                      <span className="text-xs font-extrabold text-slate-700">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Queue dashboard stats & intake check-in ticket panel */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              
              {/* Crowd metrics details */}
              <div className="bg-white border border-slate-200 rounded-[2.2rem] p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-base font-display mb-4 font-semibold text-[15px]">
                  Live Congestion Index
                </h3>

                <div className="space-y-4 font-sans font-semibold">
                  {/* Meter bar */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-black text-slate-400 uppercase block font-mono text-[9px]">CONGESTION BANDWIDTH</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        activeDetailService.crowdLevel === 'low'
                          ? 'bg-emerald-50 text-emerald-800'
                          : activeDetailService.crowdLevel === 'medium'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {activeDetailService.crowdLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          activeDetailService.crowdLevel === 'low'
                            ? 'bg-emerald-500 w-1/4 animate-pulse'
                            : activeDetailService.crowdLevel === 'medium'
                            ? 'bg-amber-500 w-2/4'
                            : 'bg-rose-500 w-[95%] animate-pulse'
                        }`}
                      ></div>
                    </div>
                    <span className="block text-[10px] text-slate-500 font-medium mt-2 leading-relaxed font-semibold">
                      {activeDetailService.crowdLevel === 'low' 
                        ? 'Optimal loading: Highly recommended to proceed now!' 
                        : (activeDetailService.crowdLevel === 'medium' 
                        ? 'Moderate load index: Standard reception delay is expected.' 
                        : 'Extreme backup levels: We recommend looking for alternative lower crowd nodes.')}
                    </span>
                  </div>

                  {/* Display Numbers Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#fbfcff] border border-indigo-50 p-4 rounded-2xl text-center">
                      <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-mono">AVG WAIT</span>
                      <span className="block text-2xl font-black text-slate-900 mt-1">~{activeDetailService.estimatedWaitTime} min</span>
                    </div>
                    <div className="bg-[#fbfcff] border border-indigo-50 p-4 rounded-2xl text-center">
                      <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-mono">DISTANCE</span>
                      <span className="block text-2xl font-black text-slate-900 mt-1">{activeDetailService.distance} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Booking Form simulation */}
              <div className="bg-white border border-slate-200 rounded-[2.2rem] p-6 shadow-md">
                <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2 mb-1.5" id="ticket-header-title">
                  <Activity className="h-5 w-5 text-brand animate-pulse" />
                  Get Smart Intake Ticket
                </h3>
                <p className="text-xs text-slate-500 font-sans leading-normal mb-4 font-medium">
                  Bypass massive delays by compiling an interactive registration pass prior to physical arrival.
                </p>

                {bookingSubmitted ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-150 rounded-2xl text-center flex flex-col items-center animate-fade-in" id="ticket-success-receipt">
                    {/* Barcode line representation mockup */}
                    <div className="w-full flex flex-col items-center justify-center bg-white p-4 mb-4 border border-emerald-100 rounded-xl space-y-2">
                      <div className="flex h-12 w-full justify-around items-center opacity-85 px-4">
                        {[1,1,2,1,1,3,1,2,1,2,1,1,3,1,1,1,2,1,2,1].map((barSize, idx) => (
                          <div key={idx} className="bg-slate-900 h-10" style={{ width: `${barSize * 2}px` }}></div>
                        ))}
                      </div>
                      <span className="text-[11px] font-mono font-black text-slate-800 tracking-wider">CR-{Math.floor(1000 + Math.random() * 9000)}-TICKET</span>
                    </div>

                    <span className="text-sm font-black text-emerald-800 block">Intake Pass Secured!</span>
                    <p className="text-xs text-emerald-650 font-sans font-medium mt-1 leading-relaxed">
                      Your triage fast track slot is secured. Present this pass at reception index intake counter. Expected delay is ~{activeDetailService.estimatedWaitTime} min.
                    </p>

                    <button
                      onClick={() => setBookingSubmitted(false)}
                      className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 cursor-pointer transition active:scale-95 shadow-sm text-center"
                    >
                      Request Another Pass
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!bookingName.trim()) return;
                      setBookingSubmitted(true);
                      setBookingName('');
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono" htmlFor="patient-name-field">
                        PRACTITIONER OR VISITOR NAME
                      </label>
                      <input
                        type="text"
                        id="patient-name-field"
                        required
                        placeholder="Enter full name..."
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3.5 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                        DISCLAIMER AGREEMENT Checkbox
                      </label>
                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <input 
                          type="checkbox" 
                          required 
                          id="triage-disclaimer" 
                          className="mt-0.5" 
                          defaultChecked 
                        />
                        <label htmlFor="triage-disclaimer" className="text-[10px] text-slate-505 leading-normal font-sans font-medium">
                          I accept that estimated wait values are computed dynamically based on current load congestion.
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-brand hover:bg-brand-hover text-white font-extrabold text-xs py-3.5 px-6 shadow-sm cursor-pointer transition active:scale-95 text-center flex items-center justify-center gap-1.5"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Generate Fast Intake Pass</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Informational Guidelines widget illustrating design depth */}
              <div className="p-5.5 bg-slate-900 text-slate-100 rounded-[2.2rem] border border-slate-800 shadow-md relative overflow-hidden">
                <div className="absolute top-[-5rem] right-[-5rem] h-28 w-28 bg-[#4a3aff]/15 rounded-full pointer-events-none filter blur-xl"></div>
                
                <h4 className="text-xs font-black tracking-wide uppercase text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-light" />
                  About Travel Penalties
                </h4>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-medium mt-2 text-slate-300">
                  Our Ontario Crowd Matrix cross-references live branch status with transport distance factors. A 20-minute drive to a low-queue hospital beats a 5-minute walk to a 2-hour queue every single time!
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>Triage Index Formula v12</span>
                  <span>100% SECURE</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2.2rem] p-12 text-center flex flex-col items-center justify-center">
          <p className="text-slate-500 text-xs">No service selected. Choose one from your Search Results list.</p>
          <button
            onClick={() => setCurrentPage(4)}
            className="mt-5 rounded-full bg-brand hover:bg-brand-hover text-white text-[11px] font-black py-2.5 px-6 transition cursor-pointer"
          >
            Go back to Search Results
          </button>
        </div>
      )}
    </div>
  );
}
