import { NeighborhoodData } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/utils";
import { MapPin, Activity, GraduationCap, ShieldAlert, Zap, Droplets, Train, Wind, Building, TrendingUp, Users, Wallet, Navigation } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface Props {
  data: NeighborhoodData;
}

const DataSourceTag = ({ source, maxAgeStr }: { source: string, maxAgeStr: string }) => {
  const formattedDate = new Date(maxAgeStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  return (
    <div className="flex items-center justify-between bg-zinc-950/60 p-2 rounded border border-zinc-800/80 mt-6">
      <div className="flex items-center gap-2 text-[9px] uppercase font-mono tracking-widest text-zinc-500">
        <Activity className="h-3 w-3 text-blue-500/80" />
        <span>{source}</span>
      </div>
      <div className="text-[9px] uppercase font-mono tracking-widest text-emerald-500/80">
        Syncd: {formattedDate}
      </div>
    </div>
  );
};

export default function ReportDashboard({ data }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const aqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-emerald-400 bg-emerald-950/30 border border-emerald-900/50";
    if (aqi <= 100) return "text-amber-400 bg-amber-950/30 border border-amber-900/50";
    if (aqi <= 200) return "text-orange-400 bg-orange-950/30 border border-orange-900/50";
    if (aqi <= 300) return "text-rose-400 bg-rose-950/30 border border-rose-900/50";
    return "text-purple-400 bg-purple-950/30 border border-purple-900/50";
  };

  return (
    <div className="w-full pb-10 pt-2 px-2 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Overall Summary */}
      <div className="mb-12 flex flex-col xl:flex-row xl:items-start justify-between gap-8 border-l-[3px] border-amber-500 pl-6 lg:pl-8 relative">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-amber-500/50 to-transparent"></div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-mono tracking-widest rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Live Intelligence
            </div>
            <button
              onClick={() => alert(`<!-- Embed Code for ${data.locationName} -->\n<iframe src="${window.location.origin}/embed?score=${data.overallScore}&name=${encodeURIComponent(data.locationName)}" width="100%" height="250" style="border:none;border-radius:12px;"></iframe>`)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] uppercase font-mono tracking-widest rounded-full border border-zinc-700 transition"
            >
              Get Embed Widget
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4 tracking-tight leading-tight flex flex-wrap items-center gap-3 drop-shadow-lg">
            {data.locationName}
          </h1>
          <p className="text-base font-light text-zinc-300 max-w-3xl leading-relaxed tracking-wide shadow-black drop-shadow-md">{data.summary}</p>
        </div>
        <div className="flex flex-col sm:flex-row bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-700/50 p-6 rounded-2xl w-full xl:w-auto shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden gap-6">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col justify-center relative z-10 min-w-[200px]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium mb-1">Locus Score</span>
            <span className="text-[9px] text-zinc-500 mb-3 font-mono">Weighted AI Composite</span>
            <div className="flex items-baseline shadow-black drop-shadow-md mb-6">
              <span className={cn("text-6xl font-light tracking-tighter", getScoreColor(data.overallScore))}>
                {data.overallScore}
              </span>
              <span className="text-xl text-zinc-500 font-light mb-1 ml-1 font-mono">/100</span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${data.overallScore}%` }}></div>
            </div>
          </div>
          
          {/* 5-dimension score card radar */}
          <div className="h-[140px] w-[180px] sm:h-[180px] sm:w-[220px] relative z-10 shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                { subject: 'Schools', A: data.metrics.schools.score },
                { subject: 'Safety', A: data.metrics.crimeAndSafety.score },
                { subject: 'Air', A: 100 - (data.metrics.airQuality.aqi / 3) }, // inverted/scaled roughly
                { subject: 'Water', A: data.metrics.utilities.waterReliabilityScore },
                { subject: 'Power', A: data.metrics.utilities.powerReliabilityScore },
              ]}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Radar name="Score" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', borderColor: '#27272a', color: '#f4f4f5', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Demographics & Lifestyle (Feature 2) */}
        {data.demographics && (
          <Card className="md:col-span-2">
            <CardHeader title="01. Demographics & Lifestyle" subtitle="Community profile and local vibe" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 mt-4">
              <div className="bg-zinc-900/40 p-4 border border-zinc-800/60 rounded">
                <div className="flex items-center gap-3 mb-2">
                  <span className="p-2 bg-pink-950/30 text-pink-400 rounded-full border border-pink-900/50">
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Local Vibe</span>
                </div>
                <p className="text-zinc-300 text-sm italic font-serif leading-relaxed line-clamp-3">{data.demographics.vibe}</p>
              </div>
              <div className="bg-zinc-900/40 p-4 border border-zinc-800/60 rounded flex flex-col justify-center">
                <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-2 border-b border-zinc-800 pb-2">Primary Demography</div>
                <div className="text-xl text-zinc-200 mt-1">{data.demographics.primaryAgeGroups}</div>
              </div>
              <div className="bg-zinc-900/40 p-4 border border-zinc-800/60 rounded flex gap-4 items-center justify-around">
                <div className="text-center">
                  <div className="text-3xl text-emerald-400 font-light mb-1">{data.demographics.familyFriendlyScore}</div>
                  <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Family Friendly</div>
                </div>
                <div className="w-px h-12 bg-zinc-800"></div>
                <div className="text-center">
                  <div className="text-3xl text-cyan-400 font-light mb-1">{data.demographics.walkabilityScore}</div>
                  <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Walkability</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        
        {/* Crime & Safety */}
        <Card>
          <CardHeader title="02. Security Index" subtitle="Neighborhood safety variance" />
          <div className="flex items-center gap-4 mb-5">
            <div className={cn("p-3 border rounded-sm", data.metrics.crimeAndSafety.score >= 70 ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" : "bg-orange-950/20 border-orange-900/50 text-orange-400")}>
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-zinc-100">{data.metrics.crimeAndSafety.score}</span>
                <span className="text-[10px] font-mono italic uppercase tracking-widest px-2 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {data.metrics.crimeAndSafety.level}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-mono">Trend: <span className="text-zinc-300">{data.metrics.crimeAndSafety.trend}</span></p>
            </div>
          </div>
          <p className="text-[13px] text-zinc-400 leading-relaxed font-light mb-4">{data.metrics.crimeAndSafety.details}</p>
          <div className="h-32 -mx-2 flex-1 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.metrics.crimeAndSafety.historicalData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', borderColor: '#27272a', color: '#f4f4f5', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  itemStyle={{ color: '#ef4444' }}
                  formatter={(value: number) => [value, 'Score']}
                />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={{ r: 2, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 4, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {data.dataSources && data.dataSources.crime && (
            <DataSourceTag source={data.dataSources.crime.source} maxAgeStr={data.dataSources.crime.lastUpdated} />
          )}
        </Card>

        {/* Education */}
        <Card>
          <CardHeader title="03. Academic Proximity" subtitle="Regional institution rating" />
          <div className="flex items-center gap-4 mb-5">
            <div className={cn("p-3 border rounded-sm", data.metrics.schools.score >= 80 ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-zinc-800 border-zinc-700 text-zinc-400")}>
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-light text-zinc-100">{data.metrics.schools.score}<span className="text-base text-zinc-600 font-light ml-1">/100</span></div>
            </div>
          </div>
          <p className="text-[13px] text-zinc-400 leading-relaxed mb-4 font-light">{data.metrics.schools.details}</p>
          <div className="space-y-2 mt-auto">
            {data.metrics.schools.topInstitutions.map((school, i) => (
              <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300 font-light flex-1 ml-2">{school}</span>
              </div>
            ))}
          </div>
          {data.dataSources && data.dataSources.schools && (
            <DataSourceTag source={data.dataSources.schools.source} maxAgeStr={data.dataSources.schools.lastUpdated} />
          )}
        </Card>

        {/* Health & Environment Extension */}
        {data.metrics.floodRisk && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:col-span-2">
            <Card>
              <CardHeader title="04A. Disaster Resilience" subtitle="Flood Risk & Typography" />
              <div className="flex items-center gap-4 mb-3">
                <div className={cn("p-3 border rounded-sm", data.metrics.floodRisk.level === 'Low' ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" : "bg-amber-950/20 border-amber-900/50 text-amber-400")}>
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-light text-zinc-100">{data.metrics.floodRisk.score}</span>
                    <span className="text-[10px] font-mono italic uppercase tracking-widest px-2 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {data.metrics.floodRisk.level} Risk
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed font-light mb-4">{data.metrics.floodRisk.details}</p>
              {data.dataSources && data.dataSources.flood && (
                <DataSourceTag source={data.dataSources.flood.source} maxAgeStr={data.dataSources.flood.lastUpdated} />
              )}
            </Card>

            <Card>
              <CardHeader title="04B. Acoustic Environment" subtitle="Noise Level Index" />
              <div className="flex items-center gap-4 mb-3">
                 <div className={cn("p-3 border rounded-sm", data.metrics.noiseLevel.level === 'Quiet' ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" : "bg-orange-950/20 border-orange-900/50 text-orange-400")}>
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-light text-zinc-100">{data.metrics.noiseLevel.score}</span>
                    <span className="text-[10px] font-mono italic uppercase tracking-widest px-2 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {data.metrics.noiseLevel.level}
                    </span>
                  </div>
                </div>
              </div>
               <p className="text-[13px] text-zinc-400 leading-relaxed font-light mb-4">{data.metrics.noiseLevel.details}</p>
               {data.dataSources && data.dataSources.noise && (
                <DataSourceTag source={data.dataSources.noise.source} maxAgeStr={data.dataSources.noise.lastUpdated} />
              )}
            </Card>
          </div>
        )}

        {/* Air Quality */}
        <Card>
          <CardHeader title="04. Environmental Quality" subtitle="Sensory AQI metrics" />
          <div className="flex items-center gap-4 mb-2">
            <div className={cn("p-3 border rounded-sm", aqiColor(data.metrics.airQuality.aqi))}>
              <Wind className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-zinc-100">{data.metrics.airQuality.aqi}</span>
                <span className={cn("text-[10px] uppercase font-mono italic tracking-widest px-2 py-0.5 border rounded-sm", aqiColor(data.metrics.airQuality.aqi))}>
                  {data.metrics.airQuality.category}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-mono">Agent: <span className="text-zinc-300">{data.metrics.airQuality.primaryPollutants}</span></p>
            </div>
          </div>
          <div className="h-24 mt-4 -mx-2 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.metrics.airQuality.historicalTrend}>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', borderColor: '#27272a', color: '#f4f4f5', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <XAxis dataKey="year" hide />
                <Line type="monotone" dataKey="avgAqi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 4, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {data.dataSources && data.dataSources.aqi && (
            <DataSourceTag source={data.dataSources.aqi.source} maxAgeStr={data.dataSources.aqi.lastUpdated} />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Utilities */}
        <Card className="md:col-span-1">
          <CardHeader title="05. Utility Resilience" subtitle="System stability profile" />
          
          <div className="space-y-4 font-mono text-xs mb-4">
            <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-800/80 rounded-sm">
              <div className="flex items-center gap-3">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span className="text-zinc-400 uppercase tracking-wide">Water Yield</span>
              </div>
              <span className={cn("font-medium", getScoreColor(data.metrics.utilities.waterReliabilityScore))}>
                {data.metrics.utilities.waterReliabilityScore}/100
              </span>
            </div>

            <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-800/80 rounded-sm">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-zinc-400 uppercase tracking-wide">Grid Integrity</span>
              </div>
              <div className="text-right">
                <span className={cn("font-medium block", getScoreColor(data.metrics.utilities.powerReliabilityScore))}>
                  {data.metrics.utilities.powerReliabilityScore}/100
                </span>
                <span className="text-[10px] text-zinc-600 font-sans tracking-wide block mt-1">{data.metrics.utilities.avgPowerCutsPerMonth} outages/mo</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/50 mt-auto">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-3">Primary Sources</p>
            <div className="flex flex-wrap gap-2">
              {data.metrics.utilities.waterSources.map(s => (
                <span key={s} className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] uppercase tracking-widest rounded-sm">{s}</span>
              ))}
            </div>
            <p className="text-[13px] text-zinc-400 mt-4 leading-relaxed font-light">{data.metrics.utilities.details}</p>
            {data.dataSources && data.dataSources.power && (
              <div className="flex flex-col gap-1 mt-4 border-t border-zinc-800/20 pt-2">
                <DataSourceTag source={data.dataSources.power.source} maxAgeStr={data.dataSources.power.lastUpdated} />
                {data.dataSources.water && <DataSourceTag source={data.dataSources.water.source} maxAgeStr={data.dataSources.water.lastUpdated} />}
              </div>
            )}
          </div>
        </Card>

        {/* Investment & Real Estate Trends */}
        <Card className="md:col-span-1">
          <div className="flex justify-between items-start mb-6">
            <CardHeader 
              title="06. Valuation Matrix" 
              subtitle="Capital appreciation vs. Market median"
              className="mb-0"
            />
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Estimated Growth (YoY)</span>
              <span className="text-emerald-400 font-mono text-lg">{data.propertyValueTrend.predictedGrowthPercent > 0 ? '+' : ''}{data.propertyValueTrend.predictedGrowthPercent}%</span>
            </div>
          </div>
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.propertyValueTrend.historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'JetBrains Mono' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'JetBrains Mono' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'JetBrains Mono' }} tickFormatter={(val) => `${val}%`} dx={10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'avgPricePerSqft') return [`₹${value.toLocaleString()} / sq`, 'Median Rate'];
                    if (name === 'predictedGrowthPercent') return [`${value}%`, 'Growth Percent'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', borderColor: '#27272a', color: '#f4f4f5', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="avgPricePerSqft" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="predictedGrowthPercent" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#34d399' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* YoY Growth Projection LineChart */}
          <div className="mt-6 pt-4 border-t border-zinc-800/50">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-4">Growth Projection Trend (YoY %)</span>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.propertyValueTrend.historicalData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} dy={10} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Growth']}
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '4px', borderColor: '#27272a', color: '#f4f4f5', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Line type="monotone" dataKey="predictedGrowthPercent" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#18181b', strokeWidth: 2, stroke: '#34d399' }} activeDot={{ r: 6, fill: '#34d399' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Investment Details (Feature 5) */}
          {data.investmentDetails && (
            <div className="mt-6 pt-4 border-t border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-4 flex items-center gap-2">
                <Wallet className="h-3 w-3" />
                Investment ROI Baseline
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-900/60 p-2 sm:p-3 rounded text-center border border-zinc-800/50">
                  <div className="text-emerald-400 text-lg md:text-xl font-light">{data.investmentDetails.avgRentalYieldPercent}%</div>
                  <div className="text-[9px] uppercase text-zinc-500 mt-1 tracking-wider">Avg Yield</div>
                </div>
                <div className="bg-zinc-900/60 p-2 sm:p-3 rounded text-center border border-zinc-800/50">
                  <div className="text-amber-400 text-lg md:text-xl font-light">{data.investmentDetails.priceToRentRatio}</div>
                  <div className="text-[9px] uppercase text-zinc-500 mt-1 tracking-wider">P/R Ratio</div>
                </div>
                <div className="bg-zinc-900/60 p-2 sm:p-3 rounded text-center border border-zinc-800/50 flex flex-col items-center justify-center">
                  <div className={cn(
                    "text-[10px] px-2 py-0.5 rounded uppercase tracking-widest border font-mono",
                    data.investmentDetails.marketDemand === 'High' ? "text-emerald-400 border-emerald-900/50 bg-emerald-950/20" :
                    data.investmentDetails.marketDemand === 'Low' ? "text-rose-400 border-rose-900/50 bg-rose-950/20" :
                    "text-amber-400 border-amber-900/50 bg-amber-950/20"
                  )}>
                    {data.investmentDetails.marketDemand}
                  </div>
                  <div className="text-[9px] uppercase text-zinc-500 mt-2 tracking-wider">Demand</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {data.metrics.traffic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader title="06B. Healthcare Proximity" subtitle="Hospital availability" />
            <div className="flex items-center gap-4 mb-5">
              <div className={cn("p-3 border rounded-sm", data.metrics.hospitals.score >= 80 ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-zinc-800 border-zinc-700 text-zinc-400")}>
                <Activity className="h-6 w-6" /> {/* Replace icon if needed */}
              </div>
              <div>
                <div className="text-3xl font-light text-zinc-100">{data.metrics.hospitals.score}<span className="text-base text-zinc-600 font-light ml-1">/100</span></div>
              </div>
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed mb-4 font-light">{data.metrics.hospitals.details}</p>
            <div className="space-y-2 mt-auto">
              {data.metrics.hospitals.topHospitals.map((hosp, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300 font-light flex-1 ml-2">{hosp}</span>
                </div>
              ))}
            </div>
            {data.dataSources && data.dataSources.hospitals && (
              <DataSourceTag source={data.dataSources.hospitals.source} maxAgeStr={data.dataSources.hospitals.lastUpdated} />
            )}
          </Card>

          <Card>
            <CardHeader title="06C. Traffic Congestion" subtitle="Peak Hour Data" />
            <div className="flex items-center gap-4 mb-3">
               <div className={cn("p-3 border rounded-sm", data.metrics.traffic.score >= 70 ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" : "bg-orange-950/20 border-orange-900/50 text-orange-400")}>
                <Navigation className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-light text-zinc-100">{data.metrics.traffic.score}</span>
                  <span className="text-[10px] font-mono italic uppercase tracking-widest px-2 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300">
                    +{data.metrics.traffic.peakHourDelayMins}m Delay
                  </span>
                </div>
              </div>
            </div>
             <p className="text-[13px] text-zinc-400 leading-relaxed font-light mb-4">{data.metrics.traffic.details}</p>
             {data.dataSources && data.dataSources.traffic && (
              <DataSourceTag source={data.dataSources.traffic.source} maxAgeStr={data.dataSources.traffic.lastUpdated} />
            )}
          </Card>
        </div>
      )}

      {/* Commute Analyzer (Feature 3) */}
      {data.commuteList && data.commuteList.length > 0 && (
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <CardHeader title="07. Accessibility & Commute Vector" subtitle="Distance to regional epicenters" className="mb-0" />
            <div className="flex items-center gap-3 mt-4 md:mt-0 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-sm text-blue-500">
              <Navigation className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-widest">Routing Data Active</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.commuteList.map((route, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-4 flex items-center justify-between group hover:border-blue-500/50 transition-colors rounded">
                <div>
                  <h4 className="text-zinc-200 text-sm font-serif italic mb-1">{route.destination}</h4>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                    <span className="text-blue-400">{route.transportMode}</span> • <span>{route.distanceKm} km</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-light text-zinc-300">{route.timeMins}</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 block">Mins</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Future Infrastructure */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <CardHeader title="08. Infrastructure Roadmap" subtitle="Planned systemic expansions" className="mb-0" />
          <div className="flex items-center gap-3 mt-4 md:mt-0 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-sm text-amber-500">
            <Train className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Transit Integrity: {data.infrastructure.transitScore}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.infrastructure.futureProjects.map((project, idx) => (
            <div key={idx} className="relative group border-l border-zinc-800 pl-4 hover:border-amber-500 transition-colors">
              <div className="mb-3 flex justify-between items-start">
                <Building className="h-5 w-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                <span className={cn(
                  "px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded-sm border",
                  project.impact === 'Positive' ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50" :
                  project.impact === 'Negative' ? "bg-rose-950/30 text-rose-400 border-rose-900/50" :
                  "bg-zinc-800 text-zinc-400 border-zinc-700"
                )}>
                  {project.impact}
                </span>
              </div>
              <h4 className="font-serif italic text-zinc-200 mb-1 text-lg leading-tight">{project.name}</h4>
              <p className="text-[10px] uppercase font-mono tracking-widest text-amber-500 mb-3 block">Est. {project.expectedCompletion}</p>
              <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-3">{project.description}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Footer Info */}
      <footer className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between text-[10px] text-zinc-600 uppercase tracking-widest px-2">
        <div>Proprietary Data Model • Locus Premium Tier</div>
        <div className="font-mono">Reference: Live Correlation Feed</div>
      </footer>
    </div>
  );
}
