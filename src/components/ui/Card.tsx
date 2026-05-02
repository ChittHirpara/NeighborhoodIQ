// Card Component
import React, { CSSProperties } from 'react';
import { cn } from "../../lib/utils";

export function Card({ className, style, children }: { className?: string; style?: CSSProperties; children: React.ReactNode }) {
  return (
    <div className={cn(
      "relative border border-zinc-800/80 bg-zinc-900/60 p-6 rounded-xl flex flex-col backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-zinc-700/80 hover:bg-zinc-900/80", 
      className
    )} style={style}>
      {/* Subtle top glare */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/10 to-transparent"></div>
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-amber-500/80 mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
        {title}
      </h3>
      {subtitle && <p className="text-[13px] text-zinc-400 font-serif italic text-white/50">{subtitle}</p>}
    </div>
  );
}
