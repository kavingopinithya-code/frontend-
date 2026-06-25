import React from 'react';
import { Search, MapPin, Sliders, Clock, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { ServiceProvider, LocationCoordinates } from '../types';

interface PageFourResultsProps {
  address: string;
  coordinates: LocationCoordinates;
  searchInputValue: string;
  setSearchInputValue: (val: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  categoriesList: Array<{ id: string; label: string; icon: string }>;
  servicesWithDistance: ServiceProvider[];
  sortedAndPrioritizedResults: ServiceProvider[];
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  setBookingSubmitted: (val: boolean) => void;
  handleToggleCrowdState: (id: string) => void;
  setCurrentPage: (page: 1 | 2 | 3 | 4 | 5) => void;
  setSearchQuery: (q: string) => void;
}

export default function PageFourResults({
  address,
  coordinates,
  searchInputValue,
  setSearchInputValue,
  handleSearchSubmit,
  categoriesList,
  servicesWithDistance,
  sortedAndPrioritizedResults,
  activeCategory,
  setActiveCategory,
  selectedServiceId,
  setSelectedServiceId,
  setBookingSubmitted,
  handleToggleCrowdState,
  setCurrentPage,
  setSearchQuery,
}: PageFourResultsProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in" id="results-matches-root">
      {/* Top Location Summary Header Card */}
      <div className="mb-8 rounded-[1.8rem] border border-brand/10 bg-gradient-to-r from-brand-light to-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="rounded-2xl bg-brand p-3 text-white shadow-md">
            <MapPin className="h-5 w-5 animate-bounce-slow" />
          </div>
          <div className="min-w-0">
            <span className="text-[9.5px] font-black text-brand tracking-widest uppercase block font-mono">Current Active Position Lock</span>
            <h3 className="text-sm font-black text-slate-900 truncate mt-1">{address}</h3>
            <span className="block text-[10px] text-slate-500 font-mono font-bold mt-0.5">
              Ontario Map Grid: lat {coordinates.latitude.toFixed(5)} / lon {coordinates.longitude.toFixed(5)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setCurrentPage(3)}
          className="rounded-full border border-brand/25 bg-white hover:bg-brand-light font-black text-[11px] text-brand py-2 px-4 shadow-sm cursor-pointer transition flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Search Category
        </button>
      </div>

      <div className="mb-6 max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            What service do you need?
          </h1>
        </div>

        {/* Smart Search Query input inside results view */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="Search hospitals, hostels, banks, supermarkets, shops, xerox shops..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-44 text-sm font-semibold text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all shadow-md animate-none"
            id="results-search-box"
          />
          <Search className="absolute left-4.5 top-4.5 h-5 w-5 text-brand" />
          <div className="absolute right-3.5 top-3 flex items-center gap-1.5">
            <button
              type="submit"
              className="bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition cursor-pointer font-sans"
            >
              Refine
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchInputValue('');
                setActiveCategory('all');
                setSelectedServiceId(null);
              }}
              className="text-[10px] uppercase font-black text-slate-450 hover:text-brand px-2.5 py-1.5 cursor-pointer font-mono"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Category selector pills row */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-4 mb-6" id="results-category-tag-pills">
        {categoriesList.map(cat => {
          const countOfItems = servicesWithDistance.filter(s => {
            if (cat.id === 'all') return true;
            return s.category === cat.id;
          }).length;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedServiceId(null);
              }}
              className={`rounded-2xl px-4.5 py-2.5 text-xs font-black tracking-wide transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-brand border-brand text-white shadow-md scale-102 font-extrabold'
                  : 'border-slate-200/60 bg-white text-slate-600 hover:border-brand/40 hover:text-brand'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                activeCategory === cat.id
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {countOfItems}
              </span>
            </button>
          );
        })}
      </div>

      {/* Smart sorting info warning banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-indigo-50/50 shadow-sm flex items-start gap-3 justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl bg-indigo-50 p-2 shrink-0 text-brand">
            <Sliders className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block">Smart sorting rules active ⚡️</span>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal font-sans font-medium max-w-2xl">
              <strong>This directory is NOT sorted by proximity distance.</strong> Instead, options are prioritized dynamically:
              <span className="text-brand font-black ml-1">1. Least Congested crowd level first,</span>
              <span className="text-slate-800 font-extrabold mx-1">2. Operating hours/availability status,</span>
              <span className="text-slate-600 font-medium font-bold">3. Shortest distance in km as the tier break factor.</span>
            </p>
          </div>
        </div>
        <div className="hidden lg:block shrink-0 bg-brand-light text-brand text-[9px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Optimal Crowd Matcher
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
            List of {sortedAndPrioritizedResults.length} live matching nodes
          </span>
          <span className="text-[10px] text-slate-450 font-extrabold bg-slate-100 px-2 py-0.5 rounded font-mono font-semibold">Triage Engine Connected</span>
        </div>

        {sortedAndPrioritizedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndPrioritizedResults.map((svc) => {
              const isSelected = selectedServiceId === svc.id;
              const iconMap: Record<string, string> = {
                hospital: '🏥', hospital_clinic: '🏥', hostel: '🏨', lodge: '🛖', bank: '🏦', supermarket: '🛒', shop: '🛍️', xerox_shop: '📄', general: '📍'
              };

              return (
                <div
                  key={svc.id}
                  onClick={() => {
                    setSelectedServiceId(svc.id);
                    setBookingSubmitted(false);
                    setCurrentPage(5);
                  }}
                  className={`rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-brand-light border-brand shadow-lg ring-1 ring-brand/10 scale-[1.01]'
                      : 'bg-white border-slate-200/75 hover:border-brand-light shadow-sm hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2.5 mb-3">
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                            {iconMap[svc.category] || '📍'} {svc.category.replace('_', ' ')}
                          </span>
                          <h3 className="text-sm font-black text-slate-905 mt-1 leading-snug truncate" title={svc.name}>
                            {svc.name}
                          </h3>
                        </div>
                        
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 border tracking-wide flex items-center gap-1.5 ${
                          svc.crowdLevel === 'low'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : svc.crowdLevel === 'medium'
                            ? 'bg-amber-50 text-amber-850 border-amber-100'
                            : 'bg-rose-50 text-rose-850 border-rose-100'
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${
                            svc.crowdLevel === 'low'
                              ? 'bg-emerald-500 animate-pulse'
                              : svc.crowdLevel === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-rose-500 animate-pulse'
                          }`}></span>
                          {svc.crowdLevel === 'low' ? '🟢 Low Crowd' : (svc.crowdLevel === 'medium' ? '🟡 Medium' : '🔴 Congested')}
                        </span>
                      </div>

                      <span className="block text-[11px] text-slate-500 truncate">
                        📍 {svc.address}
                      </span>
                      
                      <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed font-sans line-clamp-2 font-medium">
                        {svc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs w-full">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
                        <span className="text-[11px] font-black text-slate-705">~{svc.estimatedWaitTime} min wait</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        <span className={`font-black uppercase px-2 py-0.5 rounded ${
                          svc.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {svc.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                        <span className="text-slate-300 font-bold">•</span>
                        <span className="font-mono font-extrabold text-slate-750">{svc.distance} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Footer Switcher & ticket indicators */}
                  <div className="bg-slate-50/50 p-3.5 border-t border-slate-100 flex items-center justify-between gap-2 w-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCrowdState(svc.id);
                      }}
                      className="text-[10px] uppercase font-black text-slate-500 hover:text-brand cursor-pointer flex items-center gap-1 hover:bg-white p-1 px-2.5 rounded-lg border border-slate-200 transition font-mono"
                    >
                      <RefreshCw className="h-3 w-3 text-slate-400 group-hover:text-brand animate-spin-slow" />
                      <span>Change Crowd</span>
                    </button>

                    <button
                      type="button"
                      className="text-[10.5px] font-black rounded-full px-4 py-1.5 bg-brand group-hover:bg-brand-hover text-white flex items-center gap-0.5 shadow-sm transition"
                    >
                      <span>Get Ticket</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2.2rem] border-2 border-dashed border-slate-250 py-16 px-6 text-center bg-white">
            <p className="text-slate-500 text-xs font-sans font-medium">No results match your search keywords or active categorical filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchInputValue('');
                setActiveCategory('all');
              }}
              className="mt-4 rounded-full bg-brand hover:bg-brand-hover text-white text-[11px] font-black py-2.5 px-6 transition cursor-pointer"
            >
              Clear Active Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
