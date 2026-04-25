import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NeighborhoodData, DrillLevel, PointOfInterest } from '../types';
import { MapPin, GraduationCap, TreePine, Hospital, Train, ShoppingBag, Info, Star, Building, Utensils, Coffee, Laptop } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix generic Leaflet icon missing issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Locus Premium Map Icon
const primaryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component to auto-fly to location when coordinates change
function MapCenterer({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const createPoiIcon = (type: PointOfInterest['type'], name: string) => {
  let IconCmp = Info;
  let colorClass = 'bg-zinc-800 text-zinc-300 border-zinc-500';

  switch (type) {
    case 'school':
      IconCmp = GraduationCap;
      colorClass = 'bg-blue-950 text-blue-400 border-blue-500';
      break;
    case 'park':
      IconCmp = TreePine;
      colorClass = 'bg-green-950 text-green-400 border-green-500';
      break;
    case 'hospital':
      IconCmp = Hospital;
      colorClass = 'bg-rose-950 text-rose-400 border-rose-500';
      break;
    case 'transit':
      IconCmp = Train;
      colorClass = 'bg-purple-950 text-purple-400 border-purple-500';
      break;
    case 'commercial':
      IconCmp = ShoppingBag;
      colorClass = 'bg-amber-950 text-amber-400 border-amber-500';
      break;
    case 'society':
      IconCmp = Building;
      colorClass = 'bg-cyan-950 text-cyan-400 border-cyan-500';
      break;
    case 'restaurant':
      IconCmp = Utensils;
      colorClass = 'bg-orange-950 text-orange-400 border-orange-500';
      break;
    case 'tech_park':
      IconCmp = Laptop;
      colorClass = 'bg-indigo-950 text-indigo-400 border-indigo-500';
      break;
  }

  const html = renderToStaticMarkup(
    <div className="flex items-center gap-1.5" style={{ marginLeft: '-12px', marginTop: '-12px' }}>
      <div className={`p-1.5 rounded-full border shadow-xl flex items-center justify-center shrink-0 ${colorClass}`} style={{ width: 24, height: 24 }}>
        <IconCmp size={14} />
      </div>
      <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/50 text-zinc-300 font-sans text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded shadow-xl">
        {name}
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-poi-marker !bg-transparent !border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export function InteractiveMap({ level, loading, data, societyName }: { level: DrillLevel, loading: boolean, data: NeighborhoodData | null, societyName?: string }) {
  // Default to somewhere in central India initially
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  let center = defaultCenter;
  let zoom = 5; // India level

  if (level === 'city') zoom = 12;
  if (level === 'society') zoom = 15;
  if (level === 'property') zoom = 17;

  if (data?.coordinates) {
    center = [data.coordinates.lat, data.coordinates.lng];
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', background: '#050505' }}
      zoomControl={false}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <MapCenterer center={center} zoom={zoom} />
      
      {data?.coordinates && (
        <Marker position={[data.coordinates.lat, data.coordinates.lng]} icon={primaryIcon} zIndexOffset={1000}>
          <Popup className="locus-popup">
            <div className="bg-zinc-950 text-zinc-100 p-3 rounded-sm border border-amber-500/50 w-56 shadow-2xl backdrop-blur-xl">
              <h3 className="text-amber-500 font-mono text-[11px] uppercase tracking-widest mb-2 font-bold border-b border-amber-500/20 pb-1">{data.locationName}</h3>
              <p className="text-xs text-zinc-300 font-sans line-clamp-3 leading-relaxed mb-3">{data.summary.substring(0, 150)}...</p>
              <div className="flex justify-between items-center bg-black/40 p-2 rounded-sm border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Locus Score</span>
                <span className="text-amber-500 font-mono font-bold">{data.overallScore}/100</span>
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {data?.pointsOfInterest && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          spiderfyOnMaxZoom={true}
        >
          {data.pointsOfInterest.map((poi, idx) => (
            <Marker key={idx} position={[poi.lat, poi.lng]} icon={createPoiIcon(poi.type, poi.name)}>
               <Popup className="locus-popup min-w-[200px]">
                 <div className="bg-zinc-900 border border-zinc-700 p-3 text-zinc-100 rounded-sm w-56 shadow-2xl backdrop-blur-xl">
                    <div className="flex justify-between items-start mb-2 border-b border-zinc-800 pb-2">
                      <h4 className="font-sans font-medium text-sm text-zinc-100 truncate pr-2">{poi.name}</h4>
                      {poi.rating && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-sm border border-amber-400/20 shrink-0">
                          <Star size={10} className="fill-amber-400" />
                          <span>{poi.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded-sm line-clamp-1 border border-zinc-700">
                         {poi.type.replace('_', ' ')}
                       </span>
                       {poi.aqi && (
                         <div className={`text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-sm flex items-center border ${poi.aqi <= 50 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900' : poi.aqi <= 100 ? 'bg-amber-950/50 text-amber-400 border-amber-900' : 'bg-rose-950/50 text-rose-400 border-rose-900'}`}>
                           AQI: {poi.aqi}
                         </div>
                       )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-light">{poi.description || "No specific details available."}</p>
                 </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {/* Decorative center reticle if loading or at India level */}
      {!data && level === 'india' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="w-64 h-64 border border-zinc-800/50 rounded-full animate-[spin_60s_linear_infinite] shrink-0" />
          <div className="absolute w-40 h-40 border border-zinc-700/50 rounded-full animate-[spin_40s_linear_infinite_reverse] shrink-0" />
          <div className="absolute w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse shrink-0" />
        </div>
      )}
    </MapContainer>
  );
}
