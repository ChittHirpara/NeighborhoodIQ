import React, { useState } from 'react';
import { Search, Loader2, Plus, X, ArrowLeft, ArrowRight, Activity, Zap, Droplets, MapPin, BarChart3 } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { fetchNeighborhoodReport } from '../services/aiService';
import { NeighborhoodData } from '../types';
import { cn } from '../lib/utils';

export default function Compare() {
  const [inputs, setInputs] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<NeighborhoodData[]>([]);

  const addInput = () => {
    if (inputs.length < 3) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (idx: number) => {
    const newInputs = [...inputs];
    newInputs.splice(idx, 1);
    setInputs(newInputs);
  };

  const updateInput = (idx: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[idx] = val;
    setInputs(newInputs);
  };

  const handleCompare = async () => {
    const validInputs = inputs.filter(i => i.trim() !== '');
    if (validInputs.length === 0) return;

    setLoading(true);
    try {
      const results = await Promise.all(
        validInputs.map(city => fetchNeighborhoodReport(city))
      );
      setReports(results);
    } catch (e) {
      console.error(e);
      alert("Failed to load compare data");
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#3b82f6', '#f59e0b', '#10b981'];

  // format radar data
  const radarData = [
    { subject: 'Schools' },
    { subject: 'Safety' },
    { subject: 'Air' },
    { subject: 'Water' },
    { subject: 'Power' },
    { subject: 'Noise' },
    { subject: 'Traffic' },
  ];

  reports.forEach((r, idx) => {
    radarData[0][`Report${idx}`] = r.metrics.schools.score;
    radarData[1][`Report${idx}`] = r.metrics.crimeAndSafety.score;
    radarData[2][`Report${idx}`] = 100 - (r.metrics.airQuality.aqi / 3);
    radarData[3][`Report${idx}`] = r.metrics.utilities.waterReliabilityScore;
    radarData[4][`Report${idx}`] = r.metrics.utilities.powerReliabilityScore;
    radarData[5][`Report${idx}`] = r.metrics.noiseLevel.score;
    radarData[6][`Report${idx}`] = r.metrics.traffic.score;
  });

  // power histories
  const mergedPowerHistory = [];
  if (reports.length > 0 && reports[0].metrics.utilities.powerOutageHistory) {
    reports[0].metrics.utilities.powerOutageHistory.forEach((_, monthIdx) => {
      const monthObj: any = { month: reports[0].metrics.utilities.powerOutageHistory[monthIdx].month };
      reports.forEach((r, i) => {
        monthObj[`Report${i}`] = r.metrics.utilities.powerOutageHistory[monthIdx].outages;
      });
      mergedPowerHistory.push(monthObj);
    });
  }

  // merged price histories
  const mergedPriceHistory = [];
  if (reports.length > 0 && reports[0].propertyValueTrend.historicalData) {
    reports[0].propertyValueTrend.historicalData.forEach((_, yrIdx) => {
      const yrObj: any = { year: reports[0].propertyValueTrend.historicalData[yrIdx].year };
      reports.forEach((r, i) => {
        yrObj[`Report${i}`] = r.propertyValueTrend.historicalData[yrIdx].avgPricePerSqft;
      });
      mergedPriceHistory.push(yrObj);
    });
  }


  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans p-6 md:p-10">
      <header className="flex items-center justify-between mb-10 border-b border-zinc-800/50 pb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-serif italic text-white flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Comparison Matrix
          </h1>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="max-w-xl mx-auto bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-xl backdrop-blur-md mt-20">
          <h2 className="text-sm font-mono tracking-widest text-blue-500 uppercase mb-6 text-center">Select Vectors to Compare</h2>
          
          <div className="space-y-4 mb-8">
            {inputs.map((val, idx) => (
              <div key={idx} className="flex items-center gap-3 relative">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 absolute left-4">N.{idx + 1}</span>
                <input 
                  type="text" 
                  value={val}
                  onChange={(e) => updateInput(idx, e.target.value)}
                  placeholder="Enter area or city..."
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded px-12 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-zinc-200"
                />
                {inputs.length > 1 && (
                  <button onClick={() => removeInput(idx)} className="p-3 text-zinc-500 hover:text-rose-500 bg-zinc-950/80 rounded border border-zinc-800 transition-colors shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button 
              onClick={addInput}
              disabled={inputs.length >= 3}
              className="text-[10px] uppercase tracking-widest font-mono text-zinc-400 hover:text-white flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded disabled:opacity-50 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add Vector
            </button>

            <button 
              onClick={handleCompare}
              disabled={loading || inputs.filter(i => i.trim()).length === 0}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded text-[10px] uppercase font-mono tracking-widest font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} 
              Initialize Comparison
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex justify-between mb-4">
            <h2 className="text-sm uppercase tracking-widest font-mono text-zinc-400">Comparing {reports.length} Vectors</h2>
             <button onClick={() => setReports([])} className="text-xs uppercase tracking-widest text-blue-500 hover:text-blue-400 border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 rounded-sm">
                New Comparison
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader title="01. Composite Profile Overview" subtitle="Multi-dimensional aggregate score" />
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', fontSize: '10px', textTransform: 'uppercase' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                      {reports.map((r, i) => (
                        <Radar key={i} name={r.locationName} dataKey={`Report${i}`} stroke={colors[i]} fill={colors[i]} fillOpacity={0.2} />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reports.map((r, i) => (
                <Card key={i} className="flex flex-col relative overflow-hidden" style={{ borderColor: `${colors[i]}30` }}>
                  <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: colors[i] }}></div>
                  <h3 className="text-xl font-serif italic text-white mb-4 pr-4">{r.locationName}</h3>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Locus Score</span>
                      <span className="text-3xl font-light" style={{ color: colors[i] }}>{r.overallScore}</span>
                    </div>
                     <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Flood Risk</span>
                      <span className={cn("text-xs uppercase font-mono tracking-widest", r.metrics.floodRisk.level === 'Low' ? 'text-emerald-500' : 'text-amber-500')}>{r.metrics.floodRisk.level}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Traffic Delay</span>
                      <span className="text-xs uppercase font-mono tracking-widest text-zinc-300">+{r.metrics.traffic.peakHourDelayMins}m</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="02. Market Price Trends" subtitle="Average ₹/sqft over last 5 years" />
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedPriceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="year" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                    {reports.map((r, i) => (
                      <Line key={i} type="monotone" dataKey={`Report${i}`} name={r.locationName} stroke={colors[i]} strokeWidth={2} dot={{ r: 3, fill: colors[i] }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader title="03. Power Outage History" subtitle="Incidents per month over last year" />
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedPowerHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                    {reports.map((r, i) => (
                      <Line key={i} type="monotone" dataKey={`Report${i}`} name={r.locationName} stroke={colors[i]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reports.map((r, i) => (
              <Card key={i}>
                <CardHeader title="Infrastructure Pipeline" subtitle={r.locationName} />
                <div className="space-y-4 mt-4">
                  {r.infrastructure.futureProjects.map((p, pIdx) => (
                    <div key={pIdx} className="border-l-2 pl-3 py-1 relative" style={{ borderColor: p.impact === 'Positive' ? colors[i] : '#f43f5e' }}>
                      <div className="absolute -left-1.5 top-2 w-2.5 h-2.5 rounded-full bg-[#050505] border-2" style={{ borderColor: p.impact === 'Positive' ? colors[i] : '#f43f5e' }}></div>
                      <div className="text-[10px] text-zinc-500 font-mono mb-1">{p.expectedCompletion}</div>
                      <div className="text-sm text-zinc-200">{p.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{p.description}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
