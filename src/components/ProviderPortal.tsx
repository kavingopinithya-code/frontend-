import React, { useState } from 'react';
import { 
  Building, User, Phone, Mail, Lock, MapPin, Compass, 
  Clock, Shield, Check, CheckCircle, RefreshCw, Play, 
  ArrowLeft, Sliders, ChevronRight, Sparkles, Activity, AlertCircle, ToggleLeft, ToggleRight, LogOut
} from 'lucide-react';
import { ServiceProvider, CrowdLevel, ServiceCategory } from '../types';

interface ProviderPortalProps {
  services: ServiceProvider[];
  setServices: React.Dispatch<React.SetStateAction<ServiceProvider[]>>;
  onBackToCustomer: () => void;
}

export default function ProviderPortal({
  services,
  setServices,
  onBackToCustomer
}: ProviderPortalProps) {
  // Navigation states
  // 'welcome' | 'details' | 'location' | 'features' | 'status' | 'success' | 'dashboard'
  const [step, setStep] = useState<'welcome' | 'details' | 'location' | 'features' | 'status' | 'success' | 'dashboard'>('welcome');
  
  // Registration Form States
  const [category, setCategory] = useState<string>('');
  
  // Details
  const [businessName, setBusinessName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Location
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState({ latitude: 43.6532, longitude: -79.3832 });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Features
  const [hasHomeService, setHasHomeService] = useState(false);
  const [hasDelivery, setHasDelivery] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');

  // Status
  const [isOpen, setIsOpen] = useState(true);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('low');
  const [acceptingCustomers, setAcceptingCustomers] = useState(true);

  // Error States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Active Provider ID (for Dashboard authentication simulation)
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  
  // Quick Switch for registered account login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Activity Logs
  const [logs, setLogs] = useState<Array<{ time: string, message: string }>>([
    { time: 'System', message: 'Registered node initialization.' }
  ]);

  const addLog = (message: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time: timeStr, message }, ...prev]);
  };

  // Pre-configured coordinate offsets for autocomplete simulations in Toronto
  const mockAddresses = [
    { name: "33 Yonge St, Toronto", lat: 43.6475, lon: -79.3770 },
    { name: "207 Queens Quay W, Toronto", lat: 43.6385, lon: -79.3824 },
    { name: "180 Dundas St W, Toronto", lat: 43.6558, lon: -79.3872 },
    { name: "80 Spadina Ave, Toronto", lat: 43.6455, lon: -79.3961 }
  ];

  // GPS geolocation click
  const handleGpsDetect = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setTimeout(() => {
        const fall = mockAddresses[1];
        setAddress(fall.name);
        setCoordinates({ latitude: fall.lat, longitude: fall.lon });
        setGpsLoading(false);
        setGpsError("GPS Geolocation is not supported. Mock coordinates loaded instead.");
      }, 700);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoordinates({ latitude: lat, longitude: lon });
        setAddress(`Live Coordinate Center (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        setGpsLoading(false);
      },
      (err) => {
        setTimeout(() => {
          const fall = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
          setAddress(fall.name);
          setCoordinates({ latitude: fall.lat, longitude: fall.lon });
          setGpsLoading(false);
          setGpsError("Browser GPS denied/restricted in sandbox. Mock Toronto location selected.");
        }, 800);
      },
      { timeout: 4000 }
    );
  };

  // Manual Step Validations
  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (!businessName.trim()) errors.businessName = "Business Name is required";
    if (!ownerName.trim()) errors.ownerName = "Owner Name is required";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email address";
    if (!password || password.length < 5) errors.password = "Password must be at least 5 characters";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLocation = () => {
    const errors: Record<string, string> = {};
    if (!address.trim()) {
      errors.address = "Please enter or select your business address";
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  // Submit and Append to Live Parent State Array
  const handleFinalSubmit = () => {
    // Determine category mapping compatibility
    let parentCategory: ServiceCategory = 'general';
    if (category === 'Hospital') parentCategory = 'hospital';
    else if (category === 'Bank') parentCategory = 'bank';
    else if (category === 'Hotel') parentCategory = 'hotel';
    else if (category === 'Shop') parentCategory = 'shop';
    else if (category === 'Park') parentCategory = 'general';

    // Map features to tags array
    const features: string[] = [];
    if (hasHomeService) features.push("In-Person Standard Support");
    if (hasDelivery) features.push("Physical Delivery Options");
    if (isEmergency && category === 'Hospital') features.push("Level 1 Trauma Triage");
    features.push(`Hours: ${openingTime} - ${closingTime}`);

    const waitTimes = { low: 8, medium: 24, high: 65 };

    const newProvider: ServiceProvider = {
      id: `prov-${Date.now()}`,
      name: businessName,
      category: parentCategory,
      crowdLevel: crowdLevel,
      isOpen: isOpen,
      rating: 5.0,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: address,
      phone: phone,
      hasDelivery: hasDelivery,
      hasHomeService: hasHomeService,
      estimatedWaitTime: waitTimes[crowdLevel],
      ownerId: email.toLowerCase(), // Store owner identifier to link simulated authentication
      description: `${businessName} registered under local community directories. Dedicated services for consumer accessibility and queue minimization.`,
      servicesOffered: features
    };

    // Push back to App state context
    setServices(prev => [newProvider, ...prev]);

    // Track active registered email
    setActiveProviderId(newProvider.id);
    addLog(`Initialized ${businessName} with ${crowdLevel.toUpperCase()} crowd level.`);
    setStep('success');
  };

  // Dashboard Control updates
  const handleDashboardCrowdUpdate = (level: CrowdLevel) => {
    const waitTimes = { low: 8, medium: 24, high: 65 };
    setServices(prev => prev.map(s => {
      if (s.id === activeProviderId) {
        return {
          ...s,
          crowdLevel: level,
          estimatedWaitTime: waitTimes[level]
        };
      }
      return s;
    }));
    setCrowdLevel(level);
    addLog(`Changed real-time crowd index to ${level.toUpperCase()}`);
  };

  const handleDashboardOpenToggle = () => {
    const nextVal = !isOpen;
    setServices(prev => prev.map(s => {
      if (s.id === activeProviderId) {
        return {
          ...s,
          isOpen: nextVal
        };
      }
      return s;
    }));
    setIsOpen(nextVal);
    addLog(`Updated operational state to ${nextVal ? 'OPEN' : 'CLOSED'}`);
  };

  const handleDashboardDeliverToggle = () => {
    const nextVal = !hasDelivery;
    setServices(prev => prev.map(s => {
      if (s.id === activeProviderId) {
        return {
          ...s,
          hasDelivery: nextVal
        };
      }
      return s;
    }));
    setHasDelivery(nextVal);
    addLog(`Delivery flag status toggled to: ${nextVal ? 'AVAILABLE' : 'DISABLED'}`);
  };

  const handleDashboardHomeToggle = () => {
    const nextVal = !hasHomeService;
    setServices(prev => prev.map(s => {
      if (s.id === activeProviderId) {
        return {
          ...s,
          hasHomeService: nextVal
        };
      }
      return s;
    }));
    setHasHomeService(nextVal);
    addLog(`Home Services flag toggled to: ${nextVal ? 'AVAILABLE' : 'DISABLED'}`);
  };

  // Demo direct login simulated handler for instant access or logging in
  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Email and Password fields are required");
      return;
    }

    // Try finding registered or demo providers
    // Match password simple simulation
    const match = services.find(s => s.ownerId === loginEmail.toLowerCase());
    if (match) {
      setActiveProviderId(match.id);
      setBusinessName(match.name);
      setCategory(match.category);
      setAddress(match.address);
      setCoordinates({ latitude: match.latitude, longitude: match.longitude });
      setIsOpen(match.isOpen);
      setCrowdLevel(match.crowdLevel);
      setHasDelivery(match.hasDelivery);
      setHasHomeService(match.hasHomeService);
      setStep('dashboard');
      addLog(`Authenticated securely with session email: ${loginEmail}`);
    } else {
      // Create a simulated setup on-the-fly or throw error
      setLoginError("Account not found. Try registering first or use demo accounts!");
    }
  };

  // Load a demo pre-loaded account
  const handleLoadDemoAccount = (demoId: 'hosp-2' | 'shop-2') => {
    const match = services.find(s => s.id === demoId);
    if (match) {
      setActiveProviderId(match.id);
      setBusinessName(match.name);
      setCategory(match.category);
      setAddress(match.address);
      setCoordinates({ latitude: match.latitude, longitude: match.longitude });
      setIsOpen(match.isOpen);
      setCrowdLevel(match.crowdLevel);
      setHasDelivery(match.hasDelivery);
      setHasHomeService(match.hasHomeService);
      setStep('dashboard');
      addLog(`Loaded Demo Account: ${match.name}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in" id="provider-portal-workspace">
      
      {/* Top Banner with back button to customer */}
      <div className="mb-8 rounded-3xl border border-slate-200/65 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-600 tracking-widest font-mono block">Service Provider Hub</span>
            <h3 className="text-sm font-black text-slate-900 mt-0.5">Control Real-Time Congestion Index</h3>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBackToCustomer}
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 px-5 shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            ← Back to Customer Search
          </button>
        </div>
      </div>

      {/* LOGIN OR LOGOUT VIEWS BUTTON */}
      {step !== 'dashboard' && step !== 'success' && (
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setLoginError(null);
            }}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-sans bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs"
          >
            <Lock className="h-3.5 w-3.5" />
            {isLoginView ? 'Need to register? Sign up' : 'Already have a provider account? Login here'}
          </button>
        </div>
      )}

      {/* RENDER LOGIN IF PREFERRED */}
      {isLoginView && step !== 'dashboard' && step !== 'success' ? (
        <div className="max-w-md mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-8 sm:p-10 text-center animate-fade-in" id="login-container">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display mb-1">Provider Sign In</h2>
          <p className="text-xs text-slate-500 mb-6">Manage wait times and operational slots for your workspace list node</p>
          
          <form onSubmit={handleSimulatedLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  id="login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="pharmacy-demo@gmail.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono" htmlFor="login-pwd">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  id="login-pwd"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-[11px] font-semibold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 cursor-pointer transition active:scale-95 text-center shadow-md shadow-brand/10"
            >
              Sign In to Your Dashboard
            </button>
          </form>

          <div className="my-6 border-t border-slate-100 pt-5 text-center">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">
              Or Try Instantly with Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleLoadDemoAccount('hosp-2')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 text-[10.5px] font-extrabold text-slate-700 flex flex-col justify-center items-center gap-0.5 cursor-pointer hover:bg-indigo-50/10 transition"
              >
                <strong>🏥 ER / Urgent Clinic</strong>
                <span className="text-[9px] text-slate-400 font-mono">Bloor West Urgent Care</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleLoadDemoAccount('shop-2')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 text-[10.5px] font-extrabold text-slate-700 flex flex-col justify-center items-center gap-0.5 cursor-pointer hover:bg-indigo-50/10 transition"
              >
                <strong>🛍️ Retail Pharmacy</strong>
                <span className="text-[9px] text-slate-400 font-mono">Spadina Health & Wellness</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* STEP PROGRESS INDICATORS FOR REGISTRATION */}
          {step !== 'success' && step !== 'dashboard' && (
            <div className="mb-8 max-w-4xl mx-auto block">
              <div className="flex items-center justify-between w-full relative">
                {/* Horizontal line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-10 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-300"
                  style={{ 
                    width: 
                      step === 'welcome' ? '0%' : 
                      step === 'details' ? '25%' : 
                      step === 'location' ? '50%' : 
                      step === 'features' ? '75%' : '100%' 
                  }}
                ></div>

                {/* Individual Steps */}
                {[
                  { key: 'welcome', index: 1, label: 'Category' },
                  { key: 'details', index: 2, label: 'Business Profile' },
                  { key: 'location', index: 3, label: 'Location Map' },
                  { key: 'features', index: 4, label: 'Features' },
                  { key: 'status', index: 5, label: 'Crowd Default' }
                ].map((item) => {
                  const stepOrder = ['welcome', 'details', 'location', 'features', 'status'];
                  const currentIndex = stepOrder.indexOf(step);
                  const itemIndex = stepOrder.indexOf(item.key);
                  const isCompleted = itemIndex < currentIndex;
                  const isActive = step === item.key;

                  return (
                    <div key={item.key} className="flex flex-col items-center">
                      <div 
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all ${
                          isCompleted 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                            : isActive 
                            ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50/50 scale-102' 
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : item.index}
                      </div>
                      <span className="hidden sm:block text-[10px] font-mono uppercase tracking-wider font-extrabold mt-2 text-slate-500">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE 1: PROVIDER WELCOME & CATEGORY SELECTION */}
          {step === 'welcome' && (
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-6 sm:p-10 animate-fade-in" id="provider-welcome-root">
              <div className="text-center mb-8">
                <span className="text-[10px] font-mono tracking-widest font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  STEP 1 OF 5 • RECRUITING SECTOR
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-905 tracking-tight font-display mt-3.5">
                  Register Your Service
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  Reach more users by showing your real-time crowd status
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { tag: 'Hospital', desc: 'Emergency centers, clinics, medical checkups', icon: '🏥' },
                  { tag: 'Bank', desc: 'Tellers, loan support, retail accounting counters', icon: '🏦' },
                  { tag: 'Hotel', desc: 'Lodge rooms, hostels, baggage screening queues', icon: '🏨' },
                  { tag: 'Shop', desc: 'Supermarkets, grocers, pharmacies, xerox copy places', icon: '🛒' },
                  { tag: 'Park', desc: 'Public green sectors, reserves, recreation lawns', icon: '🏞️' },
                  { tag: 'Other', desc: 'Municipal offices, admin desks, community services', icon: '📍' }
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => {
                      setCategory(item.tag);
                      setFormErrors({});
                    }}
                    className={`rounded-3xl border p-5 text-left transition-all flex flex-col justify-between h-40 cursor-pointer ${
                      category === item.tag
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-1 ring-indigo-500/20 scale-[1.01]'
                        : 'border-slate-150 hover:border-indigo-300 hover:shadow bg-slate-50/35 hover:scale-[1.01]'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow">{item.icon}</span>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 leading-snug mt-2">{item.tag}</span>
                      <p className="block text-[10px] text-slate-450 mt-1 leading-normal font-sans tracking-wide">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {formErrors.category && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-600">{formErrors.category}</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (!category) {
                      setFormErrors({ category: "Please select a category card to proceed" });
                      return;
                    }
                    setStep('details');
                  }}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-8 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  id="welcome-step-next-btn"
                >
                  <span>Next Step: Business Details</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PAGE 2: BUSINESS DETAILS FORM */}
          {step === 'details' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-6 sm:p-10 animate-fade-in" id="provider-details-root">
              <div className="text-center mb-8">
                <span className="text-[10px] font-mono tracking-widest font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  STEP 2 OF 5 • MANAGEMENT ENROLLMENT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-3">
                  Business Profiles
                </h1>
                <p className="text-xs text-slate-500 mt-1">Specify authorized credentials and communication coordinates</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="bus-name">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        id="bus-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Toronto Central Pharmacy"
                        className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          formErrors.businessName ? 'border-rose-450 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                        }`}
                      />
                    </div>
                    {formErrors.businessName && <span className="text-[10px] text-rose-550 mt-1 block">{formErrors.businessName}</span>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="own-name">
                      Owner Active Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        id="own-name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Dr. Arthur Pendelton"
                        className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          formErrors.ownerName ? 'border-rose-450 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                        }`}
                      />
                    </div>
                    {formErrors.ownerName && <span className="text-[10px] text-rose-550 mt-1 block">{formErrors.ownerName}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="own-phone">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        id="own-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 456-7890"
                        className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          formErrors.phone ? 'border-rose-450 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                        }`}
                      />
                    </div>
                    {formErrors.phone && <span className="text-[10px] text-rose-550 mt-1 block">{formErrors.phone}</span>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="own-email">
                      Operational Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        id="own-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. business@gmail.com"
                        className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          formErrors.email ? 'border-rose-450 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                        }`}
                      />
                    </div>
                    {formErrors.email && <span className="text-[10px] text-rose-550 mt-1 block">{formErrors.email}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="own-password">
                    Dashboard Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      id="own-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 5 characters secures access keys"
                      className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                        formErrors.password ? 'border-rose-450 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    />
                  </div>
                  {formErrors.password && <span className="text-[10px] text-rose-550 mt-1 block">{formErrors.password}</span>}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('welcome')}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateDetails()) {
                        setStep('location');
                      }
                    }}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-8 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Next: Location setup</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PAGE 3: LOCATION SETUP */}
          {step === 'location' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-6 sm:p-10 animate-fade-in" id="provider-location-root">
              <div className="text-center mb-8">
                <span className="text-[10px] font-mono tracking-widest font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  STEP 3 OF 5 • GEOGRAPHICAL POSITIONING
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-905 tracking-tight font-display mt-3">
                  Map Location Setup
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pin your site coordinates so client routing maps calculate exact wait vs travel metrics
                </p>
              </div>

              <div className="space-y-5">
                <div className="text-left">
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2 font-mono" htmlFor="addr-setup-input">
                    Business Address
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      id="addr-setup-input"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setGpsError(null);
                      }}
                      placeholder="Search or enter physical business address..."
                      className={`w-full rounded-2xl border py-4 pl-12 pr-6 text-sm font-semibold text-slate-800 placeholder-slate-450 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition ${
                        formErrors.address ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    />
                    <MapPin className="absolute left-4.5 top-4.5 h-5 w-5 text-indigo-600" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={gpsLoading}
                  className={`w-full rounded-2xl py-4 px-6 font-black text-xs uppercase flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer ${
                    gpsLoading
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-850 text-white shadow-md'
                  }`}
                >
                  {gpsLoading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 text-indigo-500 animate-spin" />
                      Synchronizing Coordinates...
                    </>
                  ) : (
                    <>
                      <Compass className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                      Use Current Location (GPS)
                    </>
                  )}
                </button>

                {gpsError && (
                  <div className="p-3 bg-amber-50 border border-amber-150 rounded-2xl flex gap-2.5 items-start text-left animate-fade-in">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[10px] font-semibold text-amber-700 leading-normal">{gpsError}</span>
                  </div>
                )}

                {/* Predefined Quick coordinates pins as fallback shortcuts */}
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono text-center">
                    Simulate Quick Toronto Area Pins
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {mockAddresses.map((m, ix) => (
                      <button
                        key={ix}
                        type="button"
                        onClick={() => {
                          setAddress(m.name);
                          setCoordinates({ latitude: m.lat, longitude: m.lon });
                          setGpsError(null);
                        }}
                        className={`text-[10px] p-2.5 rounded-2xl text-left border cursor-pointer transition ${
                          address === m.name
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700'
                            : 'border-slate-150 bg-slate-50 hover:bg-white text-slate-650'
                        }`}
                      >
                        <strong className="block font-sans">{m.name}</strong>
                        <span className="text-[8.5px] font-mono font-bold text-slate-450">Lat {m.lat} / Lon {m.lon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map Preview Mock Wrapper */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-[1.8rem] space-y-3.5 relative overflow-hidden text-center justify-center items-center flex flex-col">
                  {/* Decorative background grid elements */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:25px_22px]"></div>
                  
                  <div className="relative z-10 w-full flex flex-col items-center justify-center py-6">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shadow animate-bounce-slow">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <span className="block text-xs font-black text-slate-900 mt-2">Interactive Position Active Pin</span>
                    <span className="block text-[10px] text-slate-450 font-mono mt-0.5">
                      Grid Index: lat {coordinates.latitude.toFixed(5)} / lng {coordinates.longitude.toFixed(5)}
                    </span>
                    <p className="text-[9.5px] text-indigo-650 font-mono tracking-widest font-bold uppercase uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full mt-3">
                      📍 Secured in Toronto Map Area
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateLocation()) {
                        setStep('features');
                      }
                    }}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-8 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Next: Features Setup</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 4: SERVICES & FEATURES */}
          {step === 'features' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-6 sm:p-10 animate-fade-in" id="provider-features-root">
              <div className="text-center mb-8">
                <span className="text-[10px] font-mono tracking-widest font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  STEP 4 OF 5 • SERVICE CAPABILITY FLAGS
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-905 tracking-tight font-display mt-3">
                  Services & Features
                </h1>
                <p className="text-xs text-slate-500 mt-1">Specify dispatch limits, hours and specialization attributes</p>
              </div>

              <div className="space-y-6">
                
                {/* Toggles */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    Select Service Availability States
                  </span>

                  {/* Home Service */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                    <div>
                      <strong className="text-xs font-black text-slate-800 block">Home Services Available</strong>
                      <span className="text-[10px] text-slate-500 leading-normal block">Provide staff dispatch, mobile medicine or home advisor visitation</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasHomeService(!hasHomeService)}
                      className="cursor-pointer transition-all text-indigo-600 hover:text-indigo-800"
                    >
                      {hasHomeService ? (
                        <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-750 font-black text-[10px] px-3 py-1.5 rounded-full">
                          <span>Active</span>
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-3 py-1.5 rounded-full">
                          <span>Off</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                    <div>
                      <strong className="text-xs font-black text-slate-800 block">Delivery Available</strong>
                      <span className="text-[10px] text-slate-500 leading-normal block">Allow users to place online shopping orders or express pharmaceutical drops</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasDelivery(!hasDelivery)}
                      className="cursor-pointer transition-all text-indigo-600 hover:text-indigo-800"
                    >
                      {hasDelivery ? (
                        <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-750 font-black text-[10px] px-3 py-1.5 rounded-full">
                          <span>Active</span>
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-3 py-1.5 rounded-full">
                          <span>Off</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Emergency Only for Hospitals */}
                  {category === 'Hospital' && (
                    <div className="flex items-center justify-between p-4 bg-indigo-50/20 border border-indigo-150 rounded-2xl animate-fade-in">
                      <div>
                        <strong className="text-xs font-black text-indigo-600 block flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 animate-pulse" />
                          Emergency Service (Trauma ICU Level)
                        </strong>
                        <span className="text-[10px] text-indigo-700/60 leading-normal block font-sans">
                          Classifies branch as general critical care with high prioritized ambulance check-in capabilities.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEmergency(!isEmergency)}
                        className="cursor-pointer transition-all"
                      >
                        {isEmergency ? (
                          <div className="flex items-center gap-1 bg-indigo-600 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-full">
                            <span>Yes</span>
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-3 py-1.5 rounded-full">
                            <span>No</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Operations Sliders */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    Time Table Scheduling Setup
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="open-time">
                        Opening Clock
                      </label>
                      <input
                        type="time"
                        id="open-time"
                        value={openingTime}
                        onChange={(e) => setOpeningTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 font-mono" htmlFor="close-time">
                        Closing Clock
                      </label>
                      <input
                        type="time"
                        id="close-time"
                        value={closingTime}
                        onChange={(e) => setClosingTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('location')}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('status')}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-8 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Next: Initialize Status</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: INITIAL STATUS SETUP */}
          {step === 'status' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-6 sm:p-10 animate-fade-in" id="provider-status-root">
              <div className="text-center mb-8">
                <span className="text-[10px] font-mono tracking-widest font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  STEP 5 OF 5 • REAL-TIME DEFAULTS
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-905 tracking-tight font-display mt-3">
                  Set Your Current Status
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Configure initial queue thresholds shown immediately on active map nodes
                </p>
              </div>

              <div className="space-y-6">
                
                {/* Clean Cards Switcher */}
                <div className="space-y-3 text-left">
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
                    Operational Open/Closed Indicator
                  </label>
                  
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsOpen(true)}
                      className={`flex-1 rounded-2xl py-4.5 px-4 text-center border font-extrabold text-xs cursor-pointer transition ${
                        isOpen 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-black' 
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      🟢 Available (Open Now)
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 rounded-2xl py-4.5 px-4 text-center border font-extrabold text-xs cursor-pointer transition ${
                        !isOpen 
                          ? 'border-slate-800 bg-slate-900 text-white font-black' 
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      ⚪ Indisposed (Closed)
                    </button>
                  </div>
                </div>

                {/* Real-time Crowd Selection Layout */}
                <div className="space-y-3 text-left">
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
                    Direct Live Crowd Level Selection
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: 'low', label: '🟢 Low Crowd', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20' },
                      { l: 'medium', label: '🟡 Medium', color: 'border-amber-500 bg-amber-50/50 text-amber-900 text-amber-505 shadow-sm ring-1 ring-amber-500/20' },
                      { l: 'high', label: '🔴 High Crowd', color: 'border-rose-500 bg-rose-50/50 text-rose-900 text-rose-600 shadow-sm ring-1 ring-rose-500/20' }
                    ].map((btn) => (
                      <button
                        key={btn.l}
                        type="button"
                        onClick={() => setCrowdLevel(btn.l as CrowdLevel)}
                        className={`rounded-2xl py-4 px-3 border text-[11px] text-center font-extrabold cursor-pointer transition ${
                          crowdLevel === btn.l
                            ? btn.color + ' font-black'
                            : 'border-slate-200 bg-slate-50/30 text-slate-505 hover:bg-slate-50'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <span className="block text-[9.5px] font-medium text-slate-500 leading-normal mt-2.5 font-sans">
                    * Low levels are prioritize-listed for patients. Keep values authentic to assist optimal sorting.
                  </span>
                </div>

                {/* Accepting customers flag */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div>
                    <strong className="text-xs font-black text-slate-800 block">Accepting Customers Now</strong>
                    <span className="text-[10px] text-slate-500 leading-normal block">Let customers know if you are actively taking appointments or entries</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAcceptingCustomers(!acceptingCustomers)}
                    className="cursor-pointer transition-all"
                  >
                    {acceptingCustomers ? (
                      <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-750 font-black text-[10px] px-3 py-1.5 rounded-full">
                        <span>Yes</span>
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-3 py-1.5 rounded-full">
                        <span>No</span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('features')}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-10 shadow-lg shadow-emerald-600/15 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all animate-pulse"
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>Compile & Register Service</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE: SUCCESS PAGE */}
          {step === 'success' && (
            <div className="max-w-md mx-auto bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-8 sm:p-10 text-center animate-fade-in" id="success-registered">
              <div className="mb-6 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center text-4xl shadow animate-bounce">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mb-2">Registered! 🎉</h2>
              <span className="block text-[10.5px] font-mono tracking-wider font-extrabold text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full w-fit mx-auto mb-4">
                Node ID: {activeProviderId}
              </span>

              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold mb-6 max-w-sm mx-auto">
                Your service has been registered successfully! Your live operational and congestion indices are now accessible on the public map tracker in real time.
              </p>

              <button
                type="button"
                onClick={() => setStep('dashboard')}
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-4 flex items-center justify-center gap-1.5 shadow-md shadow-brand/10 transition active:scale-95 cursor-pointer"
                id="view-dashboard-success-btn"
              >
                <span>Go to Dashboard</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

          {/* PROVIDER DASHBOARD (After Registration or Login) */}
          {step === 'dashboard' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" id="node-dashboard-root">
              
              {/* Dashboard Jumbotron Banner */}
              <div className="bg-white border border-slate-200 shadow-md rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/5 rounded-full pointer-events-none filter blur-2xl"></div>
                
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-md">
                    🏬
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase block bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit font-mono">
                        Live Admin Dashboard
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[8.5px] font-semibold text-emerald-800 uppercase font-mono">Synced</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-2 leading-tight">
                      {businessName}
                    </h1>
                    <span className="block text-xs text-slate-500 font-semibold mt-0.5">
                      📍 {address} • Contact: <strong className="font-mono">{phone}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1 shrink-0 font-sans font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProviderId(null);
                      setStep('welcome');
                      setIsLoginView(false);
                      setLoginPassword('');
                    }}
                    className="rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-black text-[10.5px] py-1.5 px-3.5 transition flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Dynamic Status Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Status open badge */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-2 flex flex-col justify-between">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">OPERATIONAL STATUS</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-black ${isOpen ? 'text-emerald-700' : 'text-slate-550'}`}>
                      {isOpen ? '🟢 Open Now' : '🔴 Closed'}
                    </span>
                    <span className="text-[10px] text-slate-450 font-medium">Auto toggled</span>
                  </div>
                </div>

                {/* Status crowd level badge */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-2 flex flex-col justify-between">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">CONGESTION LEVEL</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-black capitalize ${
                      crowdLevel === 'low' ? 'text-emerald-700' : crowdLevel === 'medium' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {crowdLevel === 'low' ? '🟢 Low Crowd' : crowdLevel === 'medium' ? '🟡 Medium' : '🔴 High Crowd'}
                    </span>
                    <span className="text-[10px] text-slate-450 font-mono">Est: {crowdLevel === 'low' ? '~8 min' : crowdLevel === 'medium' ? '~24 min' : '~65 min'}</span>
                  </div>
                </div>

                {/* Dispatch Service states */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-2 flex flex-col justify-between">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">ACTIVE ENTRIES</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-indigo-750">
                      {acceptingCustomers ? '⚡ Accepting Entries' : '🛑 Full Stop'}
                    </span>
                    <span className="text-[10px] text-slate-450 font-medium">Bypass pass live</span>
                  </div>
                </div>

              </div>

              {/* TWO COLUMN GRID FOR CONTROLS & EVENT LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Fast Live Toggles & Crowd Controls */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Real-time Crowd levels selector */}
                  <div className="bg-white border border-slate-200 rounded-[2.2rem] p-6 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-base font-display mb-2 flex items-center gap-1.5">
                      <Sliders className="h-5 w-5 text-indigo-600 animate-pulse" />
                      Dynamic Triage Control
                    </h3>
                    <p className="text-xs text-slate-500 mb-5 leading-normal">
                      Update your exact crowd level in real-time. This is instantly dispatched to nearby customers navigating via the live finder map.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { level: 'low', label: '🟢 Low Crowd', subtitle: 'Wait ~8 min', css: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                        { level: 'medium', label: '🟡 Medium', subtitle: 'Wait ~24 min', css: 'border-amber-500 bg-amber-50 text-amber-900' },
                        { level: 'high', label: '🔴 High / Busy', subtitle: 'Wait ~65 min', css: 'border-rose-500 bg-rose-50/80 text-rose-800' }
                      ].map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => handleDashboardCrowdUpdate(item.level as CrowdLevel)}
                          className={`rounded-2xl p-4.5 border-2 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                            crowdLevel === item.level
                              ? item.css + ' scale-[1.01] shadow-xs'
                              : 'border-slate-150 bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="text-xs font-black tracking-wide">{item.label}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-450 block mt-1">{item.subtitle}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operational Feature toggles */}
                  <div className="bg-white border border-slate-200 rounded-[2.2rem] p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base font-display">
                      Configure Operating Flags
                    </h3>

                    <div className="space-y-3">
                      {/* Open/Closed Toggle */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                        <div>
                          <strong className="text-xs font-black text-slate-800 block">Workspace Open/Closed status</strong>
                          <span className="text-[10px] text-slate-500 leading-normal block">Indicate if you are active on the community directory listings</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDashboardOpenToggle}
                          className="text-xs font-black px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 uppercase cursor-pointer"
                        >
                          {isOpen ? '🟢 Open Now' : '🔴 Closed'}
                        </button>
                      </div>

                      {/* Delivery Toggle */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                        <div>
                          <strong className="text-xs font-black text-slate-800 block">Delivery Dispatch Status</strong>
                          <span className="text-[10px] text-slate-500 leading-normal block">Enable or disable grocery/medicine packaging courier dispatch services</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDashboardDeliverToggle}
                          className="text-xs font-black px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 uppercase cursor-pointer"
                        >
                          {hasDelivery ? '🟢 Available' : '⚪ Disabled'}
                        </button>
                      </div>

                      {/* Home Service Toggle */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                        <div>
                          <strong className="text-xs font-black text-slate-800 block">Mobile In-Person Home Services</strong>
                          <span className="text-[10px] text-slate-500 leading-normal block">Enable if you have active staff units traveling to customer properties</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDashboardHomeToggle}
                          className="text-xs font-black px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 uppercase cursor-pointer"
                        >
                          {hasHomeService ? '🟢 Available' : '⚪ Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Live Event Logs / Feed updates */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Live sync activity panel */}
                  <div className="bg-slate-900 text-slate-100 rounded-[2.2rem] p-6 shadow-md border border-slate-800">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5 font-mono">
                        <Activity className="text-brand animate-pulse h-4 w-4" />
                        Live Status Sync Logs
                      </h4>
                      <span className="text-[8px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        SECURE WEB-SOCKET
                      </span>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-thin text-left">
                      {logs.map((log, index) => (
                        <div key={index} className="text-[11px] leading-relaxed border-l-2 border-indigo-500/40 pl-3.5 py-0.5">
                          <span className="font-mono text-[9px] text-indigo-400 font-extrabold mr-1.5">[{log.time}]</span>
                          <span className="text-slate-300 font-medium">{log.message}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>Sync Engine v12.1</span>
                      <span className="text-emerald-500">🟢 100% LIVE REFLECTED</span>
                    </div>
                  </div>

                  {/* Informational helpful tips */}
                  <div className="p-6 bg-indigo-55/15 border border-indigo-100/40 rounded-[2.2rem] space-y-2">
                    <h4 className="text-xs font-semibold text-slate-900 tracking-tight font-display">💡 Pro-Tip for Triage Optimization</h4>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                      Our app's customer sorting favors <strong>Low-Crowd nodes first</strong>. Keeping your crowd level accurate not only drives less-busy customers to your facility but balances municipal loading across our entire Toronto hub!
                    </p>
                  </div>

                </div>

              </div>
              
              {/* Back to main Customer View wrapper button */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={onBackToCustomer}
                  className="rounded-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs py-3.5 px-8 shadow-md transition-all duration-200 cursor-pointer"
                >
                  ← Test this live: View updated stats on Customer search list
                </button>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
