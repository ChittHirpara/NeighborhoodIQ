# NeighborhoodIQ

> Solving the information asymmetry in India's real estate market via AI-aggregated, data-driven neighborhood reports.

NeighborhoodIQ provides homebuyers making multi-crore investment decisions with comprehensive, data-driven information about neighborhood characteristics. We evaluate school quality, crime statistics, air quality indices, water availability, power outage frequency, and future infrastructure plans to inform purchasing choices beyond individual property inspection.

## Features

- **Hierarchical Search**: Drill down from India → City → Society → Property.
- **Interactive Map**: Visualize 30+ Points of Interest (POIs) with real-world coordinates.
- **AI-Powered Standardized Reports**: Powered by Gemini 2.5 Flash with strict JSON schema enforcement.
- **Buyer Persona Weighting**: Dynamic scoring based on 5 buyer personas (Family, Investor, Senior, Commuter, Luxury).
- **Deal Breaker Match**: Toggle non-negotiables for quick Go/No-Go decisions.
- **Neighborhood Comparison Matrix**: Compare multiple vectors side-by-side with radar charts and historical trendlines.
- **Export & Embed**: Export to PDF or use the embed widget for real estate listings.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4
- **Maps**: React-Leaflet, Leaflet
- **Charts**: Recharts
- **AI Generation**: `@google/genai` (Gemini 2.5 Flash)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Rename `.env.example` to `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Hackathon Demo Mode
If the `GEMINI_API_KEY` is missing or hits a quota limit, the app automatically falls back to an ultra-realistic mock dataset (e.g., Sindhu Bhavan Road, Ahmedabad) to ensure your demo never breaks.
