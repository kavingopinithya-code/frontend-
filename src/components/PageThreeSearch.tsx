import React from 'react';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { ServiceProvider, LocationCoordinates } from '../types';

interface PageThreeSearchProps {
  address: string;
  coordinates: LocationCoordinates;
  searchInputValue: string;
  setSearchInputValue: (val: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  categoriesList: Array<{ id: string; label: string; icon: string }>;
  servicesWithDistance: ServiceProvider[];
  setActiveCategory: (catId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedServiceId: (id: string | null) => void;
  setCurrentPage: (page: 1 | 2 | 3 | 4 | 5) => void;
}

export default function PageThreeSearch({
  address,
  coordinates,
  searchInputValue,
  setSearchInputValue,
  handleSearchSubmit,
  categoriesList,
  servicesWithDistance,
  setActiveCategory,
  setSearchQuery,
  setSelectedServiceId,
  setCurrentPage,
}: PageThreeSearchProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in" id="service-search-root">
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
          onClick={() => {
            setCurrentPage(2);
            setSearchQuery('');
            setSelectedServiceId(null);
          }}
          className="rounded-full border border-brand/20 hover:bg-brand-light font-black text-[11px] text-brand py-2 px-4 shadow-sm cursor-pointer transition flex items-center gap-1.5"
        >
          Change Address ➜
        </button>
      </div>

      <div className="max-w-2xl mx-auto py-16 md:py-24 flex flex-col items-center justify-center text-center animate-fade-in" id="centered-search-container">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display mb-8 text-center w-full">
          What service do you need?
        </h1>

        {/* Centered prominent search input box */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mb-8 shadow-xl rounded-2xl border border-slate-200/80 bg-white p-1.5 focus-within:ring-4 focus-within:ring-brand/10 transition-all duration-300">
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="hospital, bank, supermarket, xerox..."
            className="w-full rounded-xl bg-slate-50/20 py-4 pl-12 pr-32 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            id="smart-service-search-box-centered"
          />
          <Search className="absolute left-5 top-5.5 h-5 w-5 text-brand" />
          <button
            type="submit"
            className="absolute right-2.5 top-2.5 bottom-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black px-6 transition active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1"
          >
            <span>Search</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        {/* Standard category quick selection capsules */}
        <div className="w-full mt-4">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-mono">
            Browse standard category shortcuts
          </span>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
            {categoriesList.filter(c => c.id !== 'all').map(cat => {
              const countOfItems = servicesWithDistance.filter(s => s.category === cat.id).length;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                    setSearchInputValue('');
                    setSelectedServiceId(null);
                    setCurrentPage(4);
                  }}
                  className="rounded-2xl bg-white border border-slate-200 hover:border-brand hover:text-brand px-4 py-2.5 text-xs font-black tracking-wide transition-all duration-200 flex items-center gap-2 cursor-pointer hover:shadow-md hover:scale-102 font-sans font-semibold"
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-[9.5px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {countOfItems}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
