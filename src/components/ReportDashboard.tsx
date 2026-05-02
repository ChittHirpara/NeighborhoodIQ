import { useMemo, useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building,
  CheckCircle2,
  Copy,
  Download,
  Droplets,
  GraduationCap,
  HeartPulse,
  Info,
  Loader2,
  MapPinned,
  MessageCircle,
  Navigation,
  ShieldAlert,
  Sparkles,
  Target,
  Train,
  Users,
  Wallet,
  Wind,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NeighborhoodData } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/utils";
import { askNeighborhoodQuestion } from "../services/aiService";

interface Props {
  data: NeighborhoodData;
}

type BuyerPersona = "family" | "investor" | "senior" | "commuter" | "luxury";
type Confidence = "High" | "Medium" | "Low";
type SourceMode = "Live" | "Estimated" | "AI inferred";

const BUYER_PERSONAS: Record<
  BuyerPersona,
  {
    label: string;
    description: string;
    weights: Record<string, number>;
  }
> = {
  family: {
    label: "Family Buyer",
    description: "Schools, safety, health, air, and daily livability carry the most weight.",
    weights: {
      education: 0.2,
      safety: 0.2,
      air: 0.12,
      utilities: 0.14,
      healthcare: 0.12,
      traffic: 0.08,
      climate: 0.08,
      lifestyle: 0.06,
    },
  },
  investor: {
    label: "Investor",
    description: "Growth, demand, future infrastructure, liquidity, and downside risks are prioritized.",
    weights: {
      market: 0.26,
      infrastructure: 0.2,
      demand: 0.16,
      safety: 0.1,
      traffic: 0.08,
      utilities: 0.08,
      climate: 0.07,
      education: 0.05,
    },
  },
  senior: {
    label: "Senior Citizen",
    description: "Healthcare, safety, low noise, air quality, and utility reliability are prioritized.",
    weights: {
      healthcare: 0.22,
      safety: 0.18,
      air: 0.14,
      utilities: 0.14,
      noise: 0.12,
      traffic: 0.08,
      climate: 0.08,
      lifestyle: 0.04,
    },
  },
  commuter: {
    label: "Daily Commuter",
    description: "Traffic, transit, commute predictability, and road access matter most.",
    weights: {
      traffic: 0.24,
      transit: 0.2,
      utilities: 0.12,
      air: 0.1,
      safety: 0.1,
      market: 0.08,
      education: 0.08,
      healthcare: 0.08,
    },
  },
  luxury: {
    label: "Luxury Buyer",
    description: "Premium lifestyle, safety, services, future upside, and low nuisance risks are emphasized.",
    weights: {
      lifestyle: 0.18,
      safety: 0.16,
      healthcare: 0.12,
      infrastructure: 0.12,
      utilities: 0.12,
      market: 0.1,
      noise: 0.1,
      air: 0.1,
    },
  },
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
};

const badgeTone = (score: number) => {
  if (score >= 80) return "border-emerald-900/60 bg-emerald-950/30 text-emerald-400";
  if (score >= 60) return "border-amber-900/60 bg-amber-950/30 text-amber-400";
  return "border-rose-900/60 bg-rose-950/30 text-rose-400";
};

const confidenceTone = (confidence: Confidence) => {
  if (confidence === "High") return "border-emerald-900/60 bg-emerald-950/30 text-emerald-400";
  if (confidence === "Medium") return "border-amber-900/60 bg-amber-950/30 text-amber-400";
  return "border-rose-900/60 bg-rose-950/30 text-rose-400";
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const sourceQuality = (source?: string): { confidence: Confidence; mode: SourceMode } => {
  const value = source?.toLowerCase() ?? "";
  if (value.includes("live") || value.includes("api") || value.includes("cpcb") || value.includes("registry")) {
    return { confidence: "High", mode: "Live" };
  }
  if (value.includes("satellite") || value.includes("scraper") || value.includes("bulletin") || value.includes("ward")) {
    return { confidence: "Medium", mode: "Estimated" };
  }
  return { confidence: "Low", mode: "AI inferred" };
};

const benchmarkLabel = (score: number) => {
  if (score >= 80) return "Better than city average";
  if (score >= 62) return "Near city average";
  return "Below city average";
};

const airScore = (aqi: number) => clampScore(100 - aqi / 3);
const utilityScore = (data: NeighborhoodData) =>
  clampScore((data.metrics.utilities.waterReliabilityScore + data.metrics.utilities.powerReliabilityScore) / 2);
const marketScore = (data: NeighborhoodData) =>
  clampScore(60 + data.propertyValueTrend.predictedGrowthPercent * 2 + data.investmentDetails.avgRentalYieldPercent);
const demandScore = (data: NeighborhoodData) =>
  data.investmentDetails.marketDemand === "High" ? 88 : data.investmentDetails.marketDemand === "Medium" ? 68 : 45;
const lifestyleScore = (data: NeighborhoodData) =>
  clampScore((data.demographics.familyFriendlyScore + data.demographics.walkabilityScore) / 2);
const noiseScore = (data: NeighborhoodData) => data.metrics.noiseLevel.score;
const transitScore = (data: NeighborhoodData) => data.infrastructure.transitScore;

export default function ReportDashboard({ data }: Props) {
  const [persona, setPersona] = useState<BuyerPersona>("family");
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [askQuery, setAskQuery] = useState("Is this neighborhood good for families?");
  const [askAnswer, setAskAnswer] = useState("Type a question or select one below to ask NeighborhoodIQ.");
  const [isAsking, setIsAsking] = useState(false);
  const [selectedDealBreakers, setSelectedDealBreakers] = useState<string[]>(["schools", "safety", "flood"]);

  const scoreMap = useMemo(
    () => ({
      education: data.metrics.schools.score,
      safety: data.metrics.crimeAndSafety.score,
      air: airScore(data.metrics.airQuality.aqi),
      utilities: utilityScore(data),
      healthcare: data.metrics.hospitals.score,
      traffic: data.metrics.traffic.score,
      climate: data.metrics.floodRisk.score,
      lifestyle: lifestyleScore(data),
      market: marketScore(data),
      infrastructure: data.infrastructure.transitScore,
      demand: demandScore(data),
      noise: noiseScore(data),
      transit: transitScore(data),
    }),
    [data],
  );

  const personaScore = useMemo(() => {
    const weights = BUYER_PERSONAS[persona].weights;
    return clampScore(
      Object.entries(weights).reduce((total, [key, weight]) => total + (scoreMap[key as keyof typeof scoreMap] ?? 0) * weight, 0),
    );
  }, [persona, scoreMap]);

  const reportRows = [
    {
      id: "education",
      label: "Education Index",
      icon: GraduationCap,
      score: data.metrics.schools.score,
      source: data.dataSources.schools,
      benchmark: benchmarkLabel(data.metrics.schools.score),
    },
    {
      id: "safety",
      label: "Safety Index",
      icon: ShieldAlert,
      score: data.metrics.crimeAndSafety.score,
      source: data.dataSources.crime,
      benchmark: benchmarkLabel(data.metrics.crimeAndSafety.score),
    },
    {
      id: "air",
      label: "Air Quality Index",
      icon: Wind,
      score: airScore(data.metrics.airQuality.aqi),
      source: data.dataSources.aqi,
      benchmark: data.metrics.airQuality.aqi <= 100 ? "Better than city average" : "Needs seasonal review",
    },
    {
      id: "utilities",
      label: "Utilities Reliability",
      icon: Zap,
      score: utilityScore(data),
      source: data.dataSources.power,
      benchmark: benchmarkLabel(utilityScore(data)),
    },
    {
      id: "healthcare",
      label: "Healthcare Access",
      icon: HeartPulse,
      score: data.metrics.hospitals.score,
      source: data.dataSources.hospitals,
      benchmark: benchmarkLabel(data.metrics.hospitals.score),
    },
    {
      id: "traffic",
      label: "Traffic & Commute",
      icon: Navigation,
      score: data.metrics.traffic.score,
      source: data.dataSources.traffic,
      benchmark: data.metrics.traffic.peakHourDelayMins <= 20 ? "Near city average" : "Below city average",
    },
    {
      id: "climate",
      label: "Climate/Flood Risk",
      icon: Droplets,
      score: data.metrics.floodRisk.score,
      source: data.dataSources.flood,
      benchmark: benchmarkLabel(data.metrics.floodRisk.score),
    },
    {
      id: "infra",
      label: "Future Infrastructure",
      icon: Train,
      score: data.infrastructure.transitScore,
      source: data.dataSources.traffic,
      benchmark: benchmarkLabel(data.infrastructure.transitScore),
    },
    {
      id: "livability",
      label: "Livability Score",
      icon: Users,
      score: lifestyleScore(data),
      source: data.dataSources.noise,
      benchmark: benchmarkLabel(lifestyleScore(data)),
    },
    {
      id: "investment",
      label: "Investment Outlook",
      icon: Wallet,
      score: marketScore(data),
      source: data.dataSources.schools,
      benchmark: data.investmentDetails.marketDemand === "High" ? "Better than city average" : "Near city average",
    },
  ];

  const positives = [
    data.metrics.schools.score >= 80 && `Strong education ecosystem with ${data.metrics.schools.topInstitutions.slice(0, 2).join(", ")} nearby.`,
    data.metrics.crimeAndSafety.score >= 80 && `Safety score is high and trend is ${data.metrics.crimeAndSafety.trend.toLowerCase()}.`,
    data.metrics.hospitals.score >= 80 && `Healthcare access is strong with ${data.metrics.hospitals.topHospitals.slice(0, 2).join(", ")} nearby.`,
    data.infrastructure.transitScore >= 80 && "Future infrastructure and transit access are strong.",
    data.propertyValueTrend.predictedGrowthPercent >= 8 && `Projected growth is healthy at ${data.propertyValueTrend.predictedGrowthPercent}%.`,
    utilityScore(data) >= 85 && "Water and power reliability are both strong for day-to-day living.",
  ].filter(Boolean) as string[];

  const redFlags = [
    data.metrics.airQuality.aqi > 100 && `AQI is ${data.metrics.airQuality.aqi}, so seasonal pollution should be reviewed before purchase.`,
    data.metrics.traffic.peakHourDelayMins > 20 && `Peak-hour delay is about ${data.metrics.traffic.peakHourDelayMins} minutes.`,
    data.metrics.utilities.avgPowerCutsPerMonth > 3 && `Power outage frequency is elevated at ${data.metrics.utilities.avgPowerCutsPerMonth} cuts/month.`,
    data.metrics.floodRisk.level !== "Low" && `Flood risk is marked ${data.metrics.floodRisk.level}.`,
    data.metrics.noiseLevel.level === "Loud" && "Noise level is marked loud and may affect resale/livability.",
    data.investmentDetails.priceToRentRatio > 30 && `Price-to-rent ratio is high at ${data.investmentDetails.priceToRentRatio}.`,
  ].filter(Boolean) as string[];

  const riskScore = clampScore(
    (100 - airScore(data.metrics.airQuality.aqi)) * 0.2 +
      (100 - data.metrics.floodRisk.score) * 0.2 +
      (100 - data.metrics.traffic.score) * 0.18 +
      Math.min(data.metrics.utilities.avgPowerCutsPerMonth * 12, 100) * 0.15 +
      (100 - data.metrics.crimeAndSafety.score) * 0.17 +
      (100 - data.metrics.noiseLevel.score) * 0.1,
  );

  const riskLabel = riskScore < 30 ? "Low Risk" : riskScore < 58 ? "Moderate Risk" : "High Risk";
  const riskTone = riskScore < 30 ? "text-emerald-400" : riskScore < 58 ? "text-amber-400" : "text-rose-400";

  const personaScores = (Object.keys(BUYER_PERSONAS) as BuyerPersona[]).map((key) => {
    const weights = BUYER_PERSONAS[key].weights;
    return {
      key,
      label: BUYER_PERSONAS[key].label,
      score: clampScore(
        Object.entries(weights).reduce((total, [scoreKey, weight]) => total + (scoreMap[scoreKey as keyof typeof scoreMap] ?? 0) * weight, 0),
      ),
    };
  });

  const recommendedPersonas = personaScores.filter((item) => item.score >= 78).slice(0, 3);
  const cautionPersonas = personaScores.filter((item) => item.score < 68).slice(0, 2);
  const bestPersona = [...personaScores].sort((a, b) => b.score - a.score)[0];
  const weakestPersona = [...personaScores].sort((a, b) => a.score - b.score)[0];

  const dealBreakers = [
    { id: "schools", label: "Good schools", passed: data.metrics.schools.score >= 75 },
    { id: "safety", label: "Strong safety", passed: data.metrics.crimeAndSafety.score >= 75 },
    { id: "aqi", label: "Low AQI", passed: data.metrics.airQuality.aqi <= 100 },
    { id: "traffic", label: "Low traffic", passed: data.metrics.traffic.peakHourDelayMins <= 20 },
    { id: "flood", label: "Low flood risk", passed: data.metrics.floodRisk.level === "Low" },
    { id: "yield", label: "Strong rental yield", passed: data.investmentDetails.avgRentalYieldPercent >= 4.5 },
  ];

  const activeDealBreakers = dealBreakers.filter((item) => selectedDealBreakers.includes(item.id));
  const matchedDealBreakers = activeDealBreakers.filter((item) => item.passed);
  const failedDealBreakers = activeDealBreakers.filter((item) => !item.passed);

  const citySeeds = ["Bodakdev", "Thaltej", "Prahlad Nagar", "Satellite", "Bopal", "Vastrapur", "Whitefield", "Indiranagar", "Bandra West"];
  const nearbyAlternatives = citySeeds
    .filter((name) => !data.locationName.toLowerCase().includes(name.toLowerCase()))
    .slice(0, 4)
    .map((name, index) => ({
      name,
      reason: ["Similar premium profile", "Lower commute risk", "Family-friendly benchmark", "Investment comparison"][index],
    }));

  useEffect(() => {
    const fetchAnswer = async () => {
      if (!askQuery.trim()) {
        setAskAnswer("Type a question or select one below to ask NeighborhoodIQ.");
        return;
      }
      setIsAsking(true);
      
      // Fallback answer calculation (same as before)
      const query = askQuery.toLowerCase();
      let fallback = `${data.locationName} is best suited for ${bestPersona.label.toLowerCase()} buyers, with ${weakestPersona.label.toLowerCase()} needing the most caution.`;
      
      if (query.includes("family") || query.includes("school")) {
        fallback = data.metrics.schools.score >= 75 && data.metrics.crimeAndSafety.score >= 70
          ? `Yes. For families, ${data.locationName} looks strong because education is ${data.metrics.schools.score}/100 and safety is ${data.metrics.crimeAndSafety.score}/100.`
          : `Use caution for families. The main constraints are education or safety scores below the ideal threshold.`;
      } else if (query.includes("invest") || query.includes("roi") || query.includes("rental")) {
        fallback = `Investment outlook is ${data.investmentDetails.marketDemand.toLowerCase()} with ${data.propertyValueTrend.predictedGrowthPercent}% projected growth and ${data.investmentDetails.avgRentalYieldPercent}% estimated rental yield.`;
      } else if (query.includes("risk") || query.includes("avoid") || query.includes("red flag")) {
        fallback = redFlags.length ? `Top risks: ${redFlags.slice(0, 2).join(" ")}` : "No major red flags are visible in the current report, but source confidence should still be checked.";
      } else if (query.includes("commute") || query.includes("traffic")) {
        fallback = `Commute fit is ${data.metrics.traffic.score}/100 with about ${data.metrics.traffic.peakHourDelayMins} minutes of peak-hour delay.`;
      }

      const answer = await askNeighborhoodQuestion(askQuery, data, fallback);
      setAskAnswer(answer);
      setIsAsking(false);
    };

    // Use a small debounce to avoid spamming the API on every keystroke
    const timeoutId = setTimeout(fetchAnswer, 800);
    return () => clearTimeout(timeoutId);
  }, [askQuery, data, bestPersona.label, weakestPersona.label, redFlags]);

  const weightedContributors = Object.entries(BUYER_PERSONAS[persona].weights)
    .map(([key, weight]) => ({
      key,
      label: key.replace(/^\w/, (char) => char.toUpperCase()),
      value: scoreMap[key as keyof typeof scoreMap] ?? 0,
      weight,
    }))
    .sort((a, b) => b.weight - a.weight);

  const handleExport = () => {
    document.body.classList.add("printing-report");
    window.onafterprint = () => {
      document.body.classList.remove("printing-report");
    };
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("printing-report");
    }, 1000);
  };

  const embedUrl = `${window.location.origin}/embed?score=${data.overallScore}&name=${encodeURIComponent(data.locationName)}`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="250" style="border:none;border-radius:12px;"></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      window.setTimeout(() => setEmbedCopied(false), 1600);
    } catch {
      setEmbedCopied(false);
    }
  };

  const toggleDealBreaker = (id: string) => {
    setSelectedDealBreakers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div className="report-print-root w-full pb-10 pt-2 px-2 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-l-[3px] border-amber-500 pl-6 lg:pl-8 relative">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-amber-500/50 to-transparent" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-mono tracking-widest rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Standardized Due Diligence Report
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] uppercase font-mono tracking-widest rounded-full border border-zinc-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
            <button
              onClick={() => setEmbedOpen((value) => !value)}
              className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] uppercase font-mono tracking-widest rounded-full border border-zinc-700 transition"
            >
              <Building className="h-3.5 w-3.5" />
              Embed Widget
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4 tracking-tight leading-tight">
            {data.locationName}
          </h1>
          <p className="text-base font-light text-zinc-300 max-w-3xl leading-relaxed tracking-wide">{data.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full xl:w-[330px] shrink-0">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded p-4">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Base Score</span>
            <div className="flex items-end gap-1 mt-2">
              <span className={cn("text-5xl font-light", scoreColor(data.overallScore))}>{data.overallScore}</span>
              <span className="text-zinc-500 mb-1 font-mono">/100</span>
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-amber-900/40 rounded p-4">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Persona Score</span>
            <div className="flex items-end gap-1 mt-2">
              <span className={cn("text-5xl font-light", scoreColor(personaScore))}>{personaScore}</span>
              <span className="text-zinc-500 mb-1 font-mono">/100</span>
            </div>
          </div>
        </div>
      </div>

      {embedOpen && (
        <Card className="mb-6 border-blue-900/50">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <CardHeader
                title="Embed Widget"
                subtitle="Use this compact NeighborhoodIQ score on property listings, broker pages, or builder websites"
              />
              <div className="bg-zinc-950/80 border border-zinc-800 rounded p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                {embedCode}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleCopyEmbed}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-mono tracking-widest rounded border border-blue-500 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {embedCopied ? "Copied" : "Copy Code"}
                </button>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] uppercase font-mono tracking-widest rounded border border-zinc-700 transition-colors"
                >
                  Open Widget
                </a>
              </div>
            </div>
            <div className="w-full lg:w-[300px] shrink-0 bg-black/40 border border-zinc-800 rounded p-3">
              <iframe
                title={`${data.locationName} embed preview`}
                src={embedUrl}
                className="w-full h-[250px] rounded border-0"
              />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2 border-emerald-900/40">
          <div className="flex items-start justify-between gap-4 mb-6">
            <CardHeader title="AI Buyer Verdict" subtitle="Fast final guidance for high-value purchase decisions" className="mb-0" />
            <span className={cn("px-3 py-1 border rounded-full text-[10px] uppercase tracking-widest font-mono", badgeTone(personaScore))}>
              {BUYER_PERSONAS[persona].label}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-800 rounded p-5">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase tracking-widest font-mono mb-3">
                <Sparkles className="h-4 w-4" />
                Final Verdict
              </div>
              <p className="text-zinc-200 leading-relaxed text-sm">
                {data.locationName} is strongest for {recommendedPersonas.length ? recommendedPersonas.map((item) => item.label).join(", ") : bestPersona.label}
                {cautionPersonas.length ? `, while ${cautionPersonas.map((item) => item.label).join(", ")} should review risks carefully.` : "."}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-3">
                The decision is mainly shaped by {weightedContributors.slice(0, 3).map((item) => `${item.label.toLowerCase()} (${item.value}/100)`).join(", ")}.
              </p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Risk Heat Meter</span>
                <span className={cn("text-sm font-mono", riskTone)}>{riskLabel}</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full relative">
                <div
                  className="absolute -top-1 h-4 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  style={{ left: `calc(${riskScore}% - 3px)` }}
                />
              </div>
              <div className="flex justify-between text-[9px] uppercase tracking-widest font-mono text-zinc-600 mt-2">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Neighborhood Passport" subtitle="Compact demo-ready summary" />
          <div className="space-y-3">
            {[
              ["Best For", bestPersona.label],
              ["Risk Level", riskLabel],
              ["Growth Outlook", data.propertyValueTrend.predictedGrowthPercent >= 8 ? "Strong" : "Steady"],
              ["Family Fit", scoreMap.education >= 75 && scoreMap.safety >= 70 ? "Excellent" : "Review"],
              ["Commute Fit", scoreMap.traffic >= 70 ? "Good" : "Average"],
              ["Data Confidence", reportRows.filter((row) => sourceQuality(row.source?.source).confidence === "High").length >= 5 ? "High" : "Medium"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-zinc-800/70 pb-2 last:border-0 last:pb-0">
                <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">{label}</span>
                <span className="text-sm text-zinc-200 text-right">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader title="Deal Breaker Match" subtitle="Toggle non-negotiables for the buyer" />
          <div className="flex items-end gap-2 mb-4">
            <span className={cn("text-5xl font-light", failedDealBreakers.length ? "text-amber-400" : "text-emerald-400")}>
              {matchedDealBreakers.length}
            </span>
            <span className="text-zinc-500 font-mono mb-2">/ {activeDealBreakers.length || 0} matched</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {dealBreakers.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleDealBreaker(item.id)}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded border text-left transition-colors",
                  selectedDealBreakers.includes(item.id) ? "bg-zinc-950 border-zinc-700" : "bg-zinc-900/40 border-zinc-800 opacity-60",
                )}
              >
                <span className="text-xs text-zinc-300">{item.label}</span>
                <span className={cn("text-[10px] uppercase tracking-widest font-mono", item.passed ? "text-emerald-400" : "text-rose-400")}>
                  {item.passed ? "Pass" : "Concern"}
                </span>
              </button>
            ))}
          </div>
          {failedDealBreakers.length > 0 && (
            <p className="text-xs text-amber-400 mt-4 leading-relaxed">
              Concern: {failedDealBreakers.map((item) => item.label).join(", ")} not fully met.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader title="Ask NeighborhoodIQ" subtitle="Quick buyer questions answered from this report" />
          <div className="space-y-3">
            <input
              value={askQuery}
              onChange={(event) => setAskQuery(event.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              placeholder="Ask about family fit, investment, risks, commute..."
            />
            <div className="flex flex-wrap gap-2">
              {["Is it good for families?", "Top risks?", "Good investment?", "Commute fit?"].map((question) => (
                <button
                  key={question}
                  onClick={() => setAskQuery(question)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded text-[10px] uppercase tracking-widest font-mono transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
            <div className="bg-blue-950/20 border border-blue-900/40 rounded p-4">
              <div className="flex items-center justify-between gap-2 text-blue-400 text-[10px] uppercase tracking-widest font-mono mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Answer
                </div>
                {isAsking && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed min-h-[3rem]">{askAnswer}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Nearby Alternatives" subtitle="Useful for buyer discovery and comparison" />
          <div className="space-y-3">
            {nearbyAlternatives.map((area) => (
              <div key={area.name} className="flex items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800 rounded p-3">
                <div>
                  <div className="flex items-center gap-2 text-zinc-200 text-sm">
                    <MapPinned className="h-4 w-4 text-amber-500" />
                    {area.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 mt-1">{area.reason}</div>
                </div>
                <Target className="h-4 w-4 text-zinc-600" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-6 border-amber-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
          <CardHeader title="01. Buyer Persona Weighting" subtitle={BUYER_PERSONAS[persona].description} className="mb-0" />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BUYER_PERSONAS) as BuyerPersona[]).map((key) => (
              <button
                key={key}
                onClick={() => setPersona(key)}
                className={cn(
                  "px-3 py-2 text-[10px] uppercase tracking-widest font-mono border rounded transition-colors",
                  persona === key
                    ? "bg-amber-500 text-black border-amber-500"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600",
                )}
              >
                {BUYER_PERSONAS[key].label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {weightedContributors.slice(0, 8).map((item) => (
            <div key={item.key} className="bg-zinc-950/60 border border-zinc-800 rounded p-3">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono text-zinc-500 mb-2">
                <span>{item.label}</span>
                <span>{Math.round(item.weight * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 bg-zinc-800 rounded-full flex-1 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.value}%` }} />
                </div>
                <span className={cn("text-sm font-mono", scoreColor(item.value))}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <CardHeader title="02. Standardized Neighborhood Report Card" subtitle="Same scoring format for every location" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportRows.map((row) => {
              const Icon = row.icon;
              const quality = sourceQuality(row.source?.source);
              return (
                <div key={row.id} className="bg-zinc-950/60 border border-zinc-800 rounded p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn("p-2 rounded border shrink-0", badgeTone(row.score))}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm text-zinc-100 truncate">{row.label}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{row.benchmark}</p>
                      </div>
                    </div>
                    <span className={cn("text-2xl font-light", scoreColor(row.score))}>{row.score}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${row.score}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-widest font-mono">
                    <span className={cn("px-2 py-1 border rounded", confidenceTone(quality.confidence))}>{quality.confidence} confidence</span>
                    <span className="px-2 py-1 border rounded border-zinc-800 bg-zinc-900 text-zinc-400">{quality.mode}</span>
                    <span className="px-2 py-1 border rounded border-zinc-800 bg-zinc-900 text-zinc-500">
                      {row.source?.lastUpdated ? formatDate(row.source.lastUpdated) : "Review needed"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="03. Decision Intelligence" subtitle="Buyer-ready positives, red flags, and score reasoning" />
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase tracking-widest font-mono mb-3">
                <CheckCircle2 className="h-4 w-4" />
                Key Positives
              </div>
              <div className="space-y-2">
                {(positives.length ? positives : ["No major advantage dominates; compare nearby alternatives before final decision."]).map((item) => (
                  <p key={item} className="text-xs text-zinc-300 leading-relaxed border-l border-emerald-800 pl-3">
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-[10px] uppercase tracking-widest font-mono mb-3">
                <AlertTriangle className="h-4 w-4" />
                Buyer Red Flags
              </div>
              <div className="space-y-2">
                {(redFlags.length ? redFlags : ["No critical red flags detected from the current neighborhood profile."]).map((item) => (
                  <p key={item} className="text-xs text-zinc-300 leading-relaxed border-l border-rose-800 pl-3">
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-blue-950/20 border border-blue-900/40 rounded p-4">
              <div className="flex items-center gap-2 text-blue-400 text-[10px] uppercase tracking-widest font-mono mb-2">
                <Info className="h-4 w-4" />
                Score Explanation
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The base score reflects a balanced civic due-diligence model. The selected {BUYER_PERSONAS[persona].label.toLowerCase()} score adjusts
                that result toward the buyer's actual decision priorities.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="04. Evidence Ledger" subtitle="Source transparency for every critical metric" />
          <div className="space-y-3">
            {reportRows.slice(0, 8).map((row) => {
              const quality = sourceQuality(row.source?.source);
              return (
                <div key={row.id} className="flex items-center justify-between gap-3 border-b border-zinc-800/70 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-200">{row.label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono truncate">{row.source?.source ?? "AI inferred"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("inline-block px-2 py-1 border rounded text-[9px] uppercase tracking-widest font-mono", confidenceTone(quality.confidence))}>
                      {quality.confidence}
                    </span>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono mt-1">{quality.mode}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="05. Market & Utility Trends" subtitle="Price growth and power stability" />
          <div className="h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <ComposedChart data={data.propertyValueTrend.historicalData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#71717a", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", fontSize: "12px" }} />
                <Area type="monotone" dataKey="avgPricePerSqft" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.16} strokeWidth={2} />
                <Line type="monotone" dataKey="predictedGrowthPercent" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[120px] w-full mt-4 border-t border-zinc-800 pt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={data.metrics.utilities.powerOutageHistory} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#71717a", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#71717a", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", fontSize: "12px" }} />
                <Line type="monotone" dataKey="outages" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="06. Commute & Access" subtitle="Common buyer travel routes" />
          <div className="grid grid-cols-1 gap-3">
            {data.commuteList.map((route) => (
              <div key={route.destination} className="bg-zinc-950/60 border border-zinc-800 rounded p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-zinc-200 text-sm font-serif italic mb-1">{route.destination}</h4>
                  <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                    <span className="text-blue-400">{route.transportMode}</span> / {route.distanceKm} km
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-light text-zinc-200">{route.timeMins}</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 block">Mins</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="07. Infrastructure Roadmap" subtitle="Upcoming projects that may change value and livability" />
          <div className="space-y-4">
            {data.infrastructure.futureProjects.map((project) => (
              <div key={project.name} className="relative border-l border-zinc-800 pl-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-serif italic text-zinc-200 text-lg leading-tight">{project.name}</h4>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded-sm border shrink-0",
                      project.impact === "Positive"
                        ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50"
                        : project.impact === "Negative"
                          ? "bg-rose-950/30 text-rose-400 border-rose-900/50"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700",
                    )}
                  >
                    {project.impact}
                  </span>
                </div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-amber-500 mb-2">Est. {project.expectedCompletion}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="08. Buyer Due Diligence Disclaimer" subtitle="Keeps the product trustworthy during demos and real-world use" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          This report combines public datasets, location intelligence, map context, and AI-assisted estimates. It is designed to support homebuyer
          due diligence, not replace legal, municipal, environmental, or property-title verification. Metrics with low confidence should be verified
          with official documents before making a high-value purchase decision.
        </p>
      </Card>

      <footer className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between text-[10px] text-zinc-600 uppercase tracking-widest px-2">
        <div>NeighborhoodIQ Standard Report / Homebuyer Due Diligence Layer</div>
        <div className="font-mono">Exportable / Comparable / Source-Aware</div>
      </footer>
    </div>
  );
}
