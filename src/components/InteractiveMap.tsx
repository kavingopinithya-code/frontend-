/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ServiceProvider, LocationCoordinates, CrowdLevel } from '../types';
import { MapPin, Navigation, Eye, Check, RefreshCw } from 'lucide-react';

interface InteractiveMapProps {
  services: ServiceProvider[];
  userLocation: LocationCoordinates;
  onSetUserLocation: (location: LocationCoordinates) => void;
  selectedServiceId: string | null;
  onSelectService: (serviceId: string | null) => void;
}

export default function InteractiveMap({
  services,
  userLocation,
  onSetUserLocation,
  selectedServiceId,
  onSelectService
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Handle container resizing gracefully
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height || 360, 320)
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute map boundaries based on current locations to scale SVG appropriately
  const bounds = useMemo(() => {
    const latValues = [...services.map(s => s.latitude), userLocation.latitude];
    const lngValues = [...services.map(s => s.longitude), userLocation.longitude];
    
    const minLat = Math.min(...latValues) - 0.015;
    const maxLat = Math.max(...latValues) + 0.015;
    const minLng = Math.min(...lngValues) - 0.015;
    const maxLng = Math.max(...lngValues) + 0.015;

    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
      latSpan: maxLat - minLat || 0.01,
      lngSpan: maxLng - minLng || 0.01
    };
  }, [services, userLocation]);

  // Convert latitude & longitude coordinate offsets to SVG Viewport percentages
  const getCoordinates = (lat: number, lng: number) => {
    // Latitude decreases as you go down on an SVG (Y goes down)
    const y = ((bounds.maxLat - lat) / bounds.latSpan) * 100;
    // Longitude increases as you go right (X goes right)
    const x = ((lng - bounds.minLng) / bounds.lngSpan) * 100;
    
    // Clamp values to keep icons visible inside map padding bounds
    return {
      x: Math.min(Math.max(x, 6), 94),
      y: Math.min(Math.max(y, 6), 94)
    };
  };

  const userPoint = useMemo(() => {
    return getCoordinates(userLocation.latitude, userLocation.longitude);
  }, [userLocation, bounds]);

  // Handle map canvas clicks to reposition the user
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert back from percentages to Lat/Lng coordinates
    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;
    
    const targetLng = bounds.minLng + (pctX / 100) * bounds.lngSpan;
    const targetLat = bounds.maxLat - (pctY / 100) * bounds.latSpan;

    onSetUserLocation({
      latitude: targetLat,
      longitude: targetLng,
      name: "Custom Marker Point"
    });
  };

  const getCrowdColor = (level: CrowdLevel) => {
    switch (level) {
      case 'low': return 'text-emerald-500 fill-emerald-500 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-amber-500 fill-amber-500 bg-amber-50 border-amber-200';
      case 'high': return 'text-rose-500 fill-rose-500 bg-rose-50 border-rose-200';
      default: return 'text-slate-400 fill-slate-400 bg-slate-50 border-slate-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hospital': return 'stroke-indigo-600 fill-indigo-50';
      case 'bank': return 'stroke-teal-600 fill-teal-50';
      case 'shop': return 'stroke-amber-600 fill-amber-50';
      default: return 'stroke-slate-600 fill-slate-50';
    }
  };

  return (
    <div className="relative w-full rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md" id="map-widget-container">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2" id="map-header-title">
            <Navigation className="h-5 w-5 text-brand animate-pulse" />
            Interactive Crowd Visualizer
          </h3>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Click map to adjust GPS anchor point • Pins represent branches color-coded by crowd indexes
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1 border border-emerald-100 bg-emerald-50 font-bold text-emerald-700 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Low Crowd
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1 border border-amber-100 bg-amber-50 font-bold text-amber-700 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Moderate
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1 border border-rose-100 bg-rose-50 font-bold text-rose-700 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Crowded
          </span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div 
        ref={containerRef} 
        className="relative w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-inner"
        style={{ minHeight: '360px' }}
      >
        {/* Gridded Background representation representing streets */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_36px]"></div>
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_center,#ffffff,transparent_80%)]"></div>

        {/* Dynamic Map Lines to represent "Roads" between the User and Services */}
        <svg 
          className="absolute inset-0 h-full w-full cursor-crosshair" 
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Grid lines connecting user location to services */}
          {services.map((svc) => {
            const svcPoint = getCoordinates(svc.latitude, svc.longitude);
            const isSelected = svc.id === selectedServiceId;
            return (
              <g key={`path-${svc.id}`}>
                <line
                  x1={`${userPoint.x}%`}
                  y1={`${userPoint.y}%`}
                  x2={`${svcPoint.x}%`}
                  y2={`${svcPoint.y}%`}
                  stroke={isSelected ? "#4a3aff" : "#e2e8f0"}
                  strokeWidth={isSelected ? "2" : "1"}
                  strokeDasharray={isSelected ? "none" : "4 4"}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Render Service Points on Interactive SVG */}
          {services.map((svc) => {
            const point = getCoordinates(svc.latitude, svc.longitude);
            const isSelected = svc.id === selectedServiceId;
            const level = svc.crowdLevel;
            
            // Marker dynamic colors
            let mainColor = "rgb(16, 185, 129)"; // Green-500
            if (level === 'medium') mainColor = "rgb(245, 158, 11)"; // Amber-500
            if (level === 'high') mainColor = "rgb(244, 63, 94)"; // Rose-500

            return (
              <g 
                key={svc.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering relocation on marker click
                  onSelectService(svc.id === selectedServiceId ? null : svc.id);
                }}
              >
                {/* Selected pulsing aura effect */}
                {isSelected && (
                  <circle
                    cx={`${point.x}%`}
                    cy={`${point.y}%`}
                    r="22"
                    fill={mainColor}
                    opacity="0.15"
                    className="animate-ping"
                  />
                )}

                {/* Outer interactive ring */}
                <circle
                  cx={`${point.x}%`}
                  cy={`${point.y}%`}
                  r={isSelected ? "14" : "11"}
                  fill={isSelected ? mainColor : "white"}
                  stroke={mainColor}
                  strokeWidth="2.5"
                  className="transition-all duration-300 drop-shadow-md group-hover:scale-125"
                />

                {/* Internal Glyph corresponding to service type */}
                <circle
                  cx={`${point.x}%`}
                  cy={`${point.y}%`}
                  r={isSelected ? "5" : "4"}
                  fill={isSelected ? "white" : mainColor}
                  className="transition-all duration-300"
                />

                {/* SVG Marker Tooltip overlay */}
                <foreignObject
                  x={`calc(${point.x}% - 60px)`}
                  y={`calc(${point.y}% - 48px)`}
                  width="120px"
                  height="36px"
                  className="pointer-events-none overflow-visible opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-md border border-slate-200 bg-white/95 px-1.5 py-0.5 text-center shadow-md backdrop-blur-sm">
                      <p className="truncate text-[8px] font-semibold text-slate-800" style={{ maxWidth: '105px' }}>
                        {svc.name}
                      </p>
                      <p className="text-[7px] font-mono text-slate-500">
                        {level.toUpperCase()} crowd
                      </p>
                    </div>
                    {/* Tiny arrow pointing down */}
                    <div className="h-1.5 w-1.5 rotate-45 border-r border-b border-slate-200 bg-white/95 -mt-1 shadow-sm"></div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Pulse dot representation of User */}
          <g>
            {/* Pulsative locator rings */}
            <circle
              cx={`${userPoint.x}%`}
              cy={`${userPoint.y}%`}
              r="24"
              fill="rgba(74, 58, 255, 0.12)"
              className="animate-pulse"
            />
            <circle
              cx={`${userPoint.x}%`}
              cy={`${userPoint.y}%`}
              r="12"
              fill="rgba(74, 58, 255, 0.2)"
              className="animate-ping"
            />
            {/* User Point core ring */}
            <circle
              cx={`${userPoint.x}%`}
              cy={`${userPoint.y}%`}
              r="8"
              fill="#4a3aff"
              stroke="white"
              strokeWidth="2.5"
              className="drop-shadow-lg"
            />
            
            <foreignObject
              x={`calc(${userPoint.x}% - 50px)`}
              y={`calc(${userPoint.y}% + 12px)`}
              width="100px"
              height="28px"
              className="pointer-events-none"
            >
              <div className="rounded-full bg-slate-900/90 text-white text-[8px] tracking-wide font-extrabold py-0.5 px-2 text-center backdrop-blur-sm shadow-sm truncate">
                ✨ You are here
              </div>
            </foreignObject>
          </g>
        </svg>

        {/* Map UI Control indicators Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3.5 py-2 text-[9.5px] font-semibold text-slate-700 shadow-md backdrop-blur-sm">
          <strong className="text-brand font-mono">My Coord:</strong>
          <span className="font-mono text-slate-600">{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</span>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => {
              // Trigger slight randomized repositioning of user within local boundary for test purposes
              const offsetLat = (Math.random() - 0.5) * 0.02;
              const offsetLng = (Math.random() - 0.5) * 0.02;
              onSetUserLocation({
                latitude: 43.6487 + offsetLat,
                longitude: -79.3817 + offsetLng,
                name: "Relocated GPS Signal"
              });
            }}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3.5 py-2 text-[10px] font-extrabold text-slate-700 hover:text-brand hover:bg-brand-light shadow-md backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
            title="Simulate active GPS ping"
          >
            <RefreshCw className="h-3 w-3 text-brand inline animate-spin-slow" />
            Simulate GPS Shift
          </button>
        </div>
      </div>
    </div>
  );
}
