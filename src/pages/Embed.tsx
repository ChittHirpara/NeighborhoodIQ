import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Embed() {
  const [searchParams] = useSearchParams();
  const embedScore = searchParams.get('score');
  const embedName = searchParams.get('name');
  const [standalone, setStandalone] = useState(false);
  const score = Math.max(0, Math.min(100, Number(embedScore) || 0));

  useEffect(() => {
    setStandalone(window.self === window.top);
  }, []);

  return (
    <div
      className={cn(
        "w-full min-h-screen flex items-center justify-center p-4 font-sans text-zinc-100",
        standalone ? "bg-[#050505]" : "bg-transparent",
      )}
    >
      {standalone && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_35%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]" />
      )}

      <div className="relative z-10 w-full max-w-md">
        {standalone && (
          <div className="mb-4 text-center">
            <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-amber-500 mb-2">
              Embed Preview
            </div>
            <p className="text-xs text-zinc-500">
              This compact score card is designed to sit inside property listing pages.
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border border-zinc-700/50 p-6 rounded-2xl w-full shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-mono tracking-widest rounded-full mb-4">
            NeighborhoodIQ Widget
          </div>
          <h2 className="text-2xl font-serif italic text-white mb-6 drop-shadow-md">
            {embedName || 'Neighborhood'}
          </h2>
          <div className="flex justify-between items-end mb-4 w-full">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium">Neighborhood Score</span>
            <div className="flex items-end">
              <span className={cn("text-5xl font-light tracking-tighter", score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400")}>
                {embedScore ? score : 'N/A'}
              </span>
              <span className="text-sm text-zinc-500 font-light mb-1 ml-1 font-mono">/100</span>
            </div>
          </div>
          <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
