export type DrillLevel = 'india' | 'city' | 'society' | 'property';

export interface PointOfInterest {
  name: string;
  type: 'school' | 'park' | 'hospital' | 'transit' | 'commercial' | 'society' | 'restaurant' | 'tech_park' | 'other';
  lat: number;
  lng: number;
  description: string;
  rating: number; // 0.0 to 5.0
  aqi?: number; // Optional AQI data
}

export interface NeighborhoodData {
  locationName: string;
  coordinates?: { lat: number; lng: number };
  pointsOfInterest?: PointOfInterest[];
  overallScore: number; // 0-100
  summary: string;
  dataSources: {
    aqi: { source: string; lastUpdated: string };
    schools: { source: string; lastUpdated: string };
    power: { source: string; lastUpdated: string };
    water: { source: string; lastUpdated: string };
    crime: { source: string; lastUpdated: string };
    hospitals: { source: string; lastUpdated: string };
    traffic: { source: string; lastUpdated: string };
    noise: { source: string; lastUpdated: string };
    flood: { source: string; lastUpdated: string };
  };
  metrics: {
    schools: {
      score: number; // 0-100
      details: string;
      topInstitutions: string[];
    };
    crimeAndSafety: {
      score: number; // 0-100, higher = safer
      safetyLevel: "Low" | "Moderate" | "High"; // "High" = very safe area
      details: string;
      trend: "Improving" | "Stable" | "Worsening";
      historicalData: { year: string; score: number }[];
    };
    airQuality: {
      aqi: number;
      category: "Good" | "Satisfactory" | "Moderate" | "Poor" | "Very Poor" | "Severe";
      primaryPollutants: string;
      historicalTrend: { year: string; avgAqi: number }[];
    };
    utilities: {
      waterReliabilityScore: number; // 0-100
      powerReliabilityScore: number; // 0-100
      avgPowerCutsPerMonth: number;
      waterSources: string[];
      details: string;
      powerOutageHistory: { month: string; outages: number }[]; // 12 months history
    };
    floodRisk: {
      score: number; // 0-100
      level: "Low" | "Moderate" | "High";
      details: string;
    };
    noiseLevel: {
      score: number; // 0-100
      level: "Quiet" | "Moderate" | "Loud";
      details: string;
    };
    traffic: {
      score: number; // 0-100
      level?: "Low" | "Moderate" | "High";
      peakHourDelayMins: number;
      details: string;
    };
    hospitals: {
      score: number; // 0-100
      details: string;
      topHospitals: string[];
    };
  };
  infrastructure: {
    futureProjects: {
      name: string;
      expectedCompletion: string;
      impact: "Positive" | "Negative" | "Neutral";
      description: string;
    }[];
    transitScore: number; // 0-100
    closestHubs: string[];
  };
  propertyValueTrend: {
    historicalData: { year: string; avgPricePerSqft: number; predictedGrowthPercent: number }[];
    predictedGrowthPercent: number;
  };
  demographics: {
    vibe: string;
    primaryAgeGroups: string;
    familyFriendlyScore: number;
    walkabilityScore: number;
  };
  commuteList: {
    destination: string;
    distanceKm: number;
    timeMins: number;
    transportMode: string;
  }[];
  investmentDetails: {
    avgRentalYieldPercent: number;
    priceToRentRatio: number;
    marketDemand: "Low" | "Medium" | "High";
  };
}
