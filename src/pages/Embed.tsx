import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Embed() {
  const [searchParams] = useSearchParams();
  const embedScore = searchParams.get('score');
  const embedName = searchParams.get('name');

  return (
    <div className="w-full h-screen bg-transparent flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-700/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl backdrop-blur-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-mono tracking-widest rounded-full mb-4">
          Locus Premium Widget
        </div>
        <h2 className="text-2xl font-serif italic text-white mb-6 drop-shadow-md">
          {embedName || 'Neighborhood'}
        </h2>
        <div className="flex justify-between items-end mb-4 w-full">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium">Locus Score</span>
          <div className="flex items-end">
            <span className={cn("text-5xl font-light tracking-tighter", Number(embedScore) >= 80 ? "text-emerald-400" : Number(embedScore) >= 60 ? "text-amber-400" : "text-rose-400")}>
              {embedScore || 'N/A'}
            </span>
            <span className="text-sm text-zinc-500 font-light mb-1 ml-1 font-mono">/100</span>
          </div>
        </div>
        <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: `${embedScore || 0}%` }}></div>
        </div>
      </div>
    </div>
  );
}
