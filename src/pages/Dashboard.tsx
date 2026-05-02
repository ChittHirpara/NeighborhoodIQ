import React from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { MapPin, TrendingUp, Activity, Plus, ShieldCheck, Zap, Server, Globe2, FileText, Search as SearchIcon, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useSEO } from '../lib/useSEO';

const GLOBAL_STATS = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 4500 },
  { name: 'Apr', value: 5000 },
  { name: 'May', value: 8000 },
  { name: 'Jun', value: 7500 },
  { name: 'Jul', value: 9800 },
];

export default function Dashboard() {
  useSEO({
    title: 'Command Center',
    description: 'Your NeighborhoodIQ dashboard — view recent scans, system status, and launch new neighborhood due diligence reports across India.',
    canonicalPath: '/dashboard',
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10 border-b border-zinc-800/50 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Globe2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-serif italic text-white">Command Center</h1>
          </div>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest pl-13">Welcome back, Analyst.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/compare" className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white px-6 py-3 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold transition-all flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Compare
          </Link>
          <Link to="/search" className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Scan
          </Link>
          <div className="flex items-center gap-2 text-zinc-500 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-full">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] uppercase font-mono tracking-widest">Network Secure</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
              <Activity className="h-5 w-5 text-blue-500 mb-4" />
              <div className="text-3xl text-white font-light tracking-tight">124.5k</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-1">Data Points Crawled</div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
              <Zap className="h-5 w-5 text-emerald-500 mb-4" />
              <div className="text-3xl text-white font-light tracking-tight">99.9%</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-1">API Node Uptime</div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full group-hover:bg-amber-500/20 transition-all"></div>
              <MapPin className="h-5 w-5 text-amber-500 mb-4" />
              <div className="text-3xl text-white font-light tracking-tight">84</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-1">Stored Matrices</div>
            </div>
          </div>

          {/* Activity Chart */}
          <Card className="h-80">
            <CardHeader title="Network Activity" subtitle="Real-time scan frequency" />
            <div className="h-48 w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GLOBAL_STATS}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', borderColor: '#3f3f46', fontSize: '12px' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Saved Reports / Scans */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <CardHeader title="Recent Telemetry" subtitle="Archived neighborhood scans" className="mb-0" />
              <button className="text-[10px] text-amber-500 hover:text-amber-400 uppercase font-mono tracking-widest flex items-center gap-1">
                View Archive <TrendingUp className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Sindhu Bhavan Road', city: 'Ahmedabad', score: 96, date: '2 Mins Ago', status: 'Sync Complete' },
                { name: 'Whitefield Cluster', city: 'Bengaluru', score: 82, date: '1 Hour Ago', status: 'Archive' },
                { name: 'Bandra West Matrix', city: 'Mumbai', score: 91, date: 'Yesterday', status: 'Archive' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/80 rounded hover:border-amber-500/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-zinc-200 font-serif italic">{item.name}</h4>
                      <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">{item.city} / {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-xl font-light text-amber-500">{item.score}</div>
                      <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-600">Neighborhood Score</div>
                    </div>
                    <Link to="/search" className="p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                      <SearchIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          <Card>
            <CardHeader title="System Status" subtitle="Live API ingest nodes" />
            <div className="space-y-4">
              {[
                { name: 'CPCB AQI Nodes', status: 'Operational', ping: '12ms', color: 'bg-emerald-500' },
                { name: 'Satellite Imagery', status: 'Operational', ping: '45ms', color: 'bg-emerald-500' },
                { name: 'Police Open Data', status: 'Degraded', ping: '120ms', color: 'bg-amber-500' },
                { name: 'RERA Registry', status: 'Operational', ping: '20ms', color: 'bg-emerald-500' },
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-2 w-2">
                      {node.color === 'bg-emerald-500' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${node.color}`}></span>
                    </div>
                    <span className="text-xs font-mono text-zinc-300">{node.name}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono tracking-widest">{node.ping}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-zinc-800">
              <div className="bg-amber-950/20 border border-amber-900/50 rounded p-4 flex gap-3 text-amber-500">
                <Server className="h-5 w-5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold block mb-1">Scale Event Cluster</span>
                  Automated scraping algorithms scheduled for routine refresh at 00:00 UTC.
                </div>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
