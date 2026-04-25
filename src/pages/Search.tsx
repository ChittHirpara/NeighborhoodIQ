import React, { useState } from 'react';
import { Search as SearchIcon, Map as MapIcon, Loader2, ChevronRight, X, LayoutDashboard, LogOut } from 'lucide-react';
import { fetchNeighborhoodReport } from '../services/aiService';
import ReportDashboard from '../components/ReportDashboard';
import { InteractiveMap } from '../components/InteractiveMap';
import { DrillLevel, NeighborhoodData } from '../types';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function Search() {
  const [level, setLevel] = useState<DrillLevel>('india');
  const [city, setCity] = useState('');
  const [society, setSociety] = useState('');
  const [property, setProperty] = useState('');
  
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<NeighborhoodData | null>(null);
  const [error, setError] = useState("");
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const navigate = useNavigate();

  const executeDrillDown = async (targetLevel: DrillLevel, fetchCity: string, fetchSociety?: string, fetchProperty?: string) => {
    setLoading(true);
    setError("");
    setDashboardOpen(false); // Close dashboard during drill down to focus on map
    
    try {
      const data = await fetchNeighborhoodReport(fetchCity, fetchSociety, fetchProperty);
      setReportData(data);
      setLevel(targetLevel);
      setInputValue("");
      setDashboardOpen(true); // Open when ready
    } catch (err) {
      setError("Failed to aggregate data. Please verify location details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (level === 'india') {
      setCity(inputValue.trim());
      executeDrillDown('city', inputValue.trim());
    } else if (level === 'city') {
      setSociety(inputValue.trim());
      executeDrillDown('society', city, inputValue.trim());
    } else if (level === 'society') {
      setProperty(inputValue.trim());
      executeDrillDown('property', city, society, inputValue.trim());
    }
  };

  const resetTo = (target: DrillLevel) => {
    if (loading) return;
    setLevel(target);
    if (target === 'india') {
      setCity('');
      setSociety('');
      setProperty('');
      setReportData(null);
      setDashboardOpen(false);
    } else if (target === 'city') {
      setSociety('');
      setProperty('');
      executeDrillDown('city', city);
    } else if (target === 'society') {
      setProperty('');
      executeDrillDown('society', city, society);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
      
      {/* Dynamic Interactive Map as Background */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <InteractiveMap level={level} loading={loading} data={reportData} societyName={society} />
        
        {/* Animated scanline overlay during loading */}
        {loading && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <div className="w-full h-2 bg-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        )}
      </div>

      {/* Header / Breadcrumbs */}
      <header className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between gap-4 pointer-events-none">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 cursor-pointer pointer-events-auto w-fit" onClick={() => resetTo('india')}>
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <MapIcon className="h-5 w-5" />
            </div>
            <span className="text-sm font-light tracking-[0.2em] uppercase text-zinc-100 drop-shadow-md">
              Locus <span className="text-amber-500 font-medium">Premium</span>
            </span>
          </div>

          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-zinc-400 overflow-x-auto whitespace-nowrap pb-2 pointer-events-auto w-fit bg-black/40 px-3 py-2 rounded-sm backdrop-blur-sm border border-white/5">
            <button onClick={() => resetTo('india')} className={cn("hover:text-amber-500 transition-colors drop-shadow-sm", level === 'india' && "text-amber-500")}>India</button>
            {city && (
              <>
                <ChevronRight className="h-3 w-3" />
                <button onClick={() => resetTo('city')} className={cn("hover:text-amber-500 transition-colors drop-shadow-sm", level === 'city' && "text-amber-500")}>{city}</button>
              </>
            )}
            {society && (
              <>
                <ChevronRight className="h-3 w-3" />
                <button onClick={() => resetTo('society')} className={cn("hover:text-amber-500 transition-colors drop-shadow-sm", level === 'society' && "text-amber-500")}>{society}</button>
              </>
            )}
            {property && (
              <>
                <ChevronRight className="h-3 w-3" />
                <button className="text-amber-500 disabled drop-shadow-sm">{property}</button>
              </>
            )}
          </nav>
        </div>

        {/* Global Navigation Controls */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link to="/dashboard" className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-zinc-400 hover:text-amber-500 transition-colors bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded border border-zinc-800">
            <LayoutDashboard className="h-4 w-4" /> Main Dashboard
          </Link>
          <Link to="/login" className="flex items-center text-[10px] uppercase font-mono tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900/60 backdrop-blur-md p-2 rounded border border-zinc-800">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </header>
      
      {/* Map Action Overlay */}
      {reportData && !dashboardOpen && !loading && (
        <div className="absolute top-24 right-6 z-20 pointer-events-auto hidden md:block">
          <button 
            onClick={() => setDashboardOpen(true)}
            className="px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-amber-500 border border-zinc-700 hover:border-amber-500/50 text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm transition-all backdrop-blur-md flex items-center gap-2 shadow-xl"
          >
            Open Data Matrix <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Overlay Search Input */}
      <div className={cn("absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-30 transition-transform duration-700", dashboardOpen ? "md:translate-x-[calc(-50%-250px)]" : "")}>
        {level !== 'property' ? (
          <form onSubmit={handleSearch} className="relative shadow-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-500/0 rounded-sm opacity-50 blur"></div>
            <div className="flex items-center rounded-sm bg-zinc-900/90 backdrop-blur-md border border-zinc-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all relative">
              <div className="pl-4 text-zinc-500">
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <SearchIcon className="h-4 w-4" />}
              </div>
              <input 
                disabled={loading}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={
                  level === 'india' ? "Target City, Pin Code, or Landmark..." :
                  level === 'city' ? "Society, Area Name, or Street..." :
                  "Specific Property/House..."
                }
                className="w-full py-4 px-4 text-xs tracking-widest uppercase font-mono text-zinc-100 bg-transparent outline-none placeholder-zinc-500"
              />
              <button 
                disabled={!inputValue.trim() || loading}
                type="submit"
                className="px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black text-[10px] uppercase tracking-[0.2em] font-bold rounded-r-sm transition-colors disabled:opacity-30 disabled:hover:bg-amber-500"
              >
                Scan
              </button>
            </div>
            {error && (
              <div className="absolute top-full mt-4 left-0 w-full text-center text-rose-400 border border-rose-900/50 bg-rose-950/80 px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest backdrop-blur-sm">
                {error}
              </div>
            )}
          </form>
        ) : (
          <div className="text-center">
            <button onClick={() => resetTo('india')} className="px-8 py-4 border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-amber-500 text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm transition-all backdrop-blur-md shadow-2xl">
              Initiate New Global Scan
            </button>
          </div>
        )}
      </div>

      {/* Right Panel Overlay: AI Dashboard */}
      <div 
        className={cn(
          "absolute top-0 right-0 h-full w-full md:w-[500px] xl:w-[600px] z-40 bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col",
          dashboardOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-zinc-950/80 backdrop-blur-md z-50">
          <span className="text-[10px] uppercase tracking-widest font-mono text-amber-500">Telemetry Feed</span>
          <button 
            onClick={() => setDashboardOpen(false)}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {reportData ? (
            <ReportDashboard data={reportData} />
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: #18181b !important; /* zinc-900 roughly */
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .custom-poi-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
