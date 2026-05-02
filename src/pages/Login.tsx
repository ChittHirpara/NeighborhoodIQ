import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapIcon, ArrowRight, ShieldCheck, Database, LayoutDashboard } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

export default function Login() {
  const navigate = useNavigate();

  useSEO({
    title: 'Login',
    description: 'Sign in to NeighborhoodIQ — your AI-powered real estate due diligence platform for neighborhoods across India.',
    canonicalPath: '/login',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login action
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-[#110800] z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-black mb-6 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <MapIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-zinc-100 flex gap-2">
            Neighborhood<span className="text-amber-500 font-medium">IQ</span>
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Secure Authentication Gateway
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl relative">
          {/* Top Edge Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-2">Access Grid ID / Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  defaultValue="demo@neighborhoodiq.ai"
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-zinc-700" 
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">Security Key</label>
                <a href="#" className="text-[10px] text-amber-500/80 hover:text-amber-400 font-mono tracking-widest transition-colors">Recover?</a>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-zinc-700" 
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button type="submit" className="w-full group bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold py-4 rounded-lg text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3">
              Initialize Session <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-zinc-600 border-t border-zinc-800 pt-6">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest">
              <Database className="h-3 w-3" /> Live Data Streams
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest">
              <LayoutDashboard className="h-3 w-3" /> Spatial Analytics
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
