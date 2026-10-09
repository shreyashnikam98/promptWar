import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldAlert, Star, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

// Custom Pin Icon generators using standard HTML/SVG divIcon so Leaflet doesn't fail on missing static assets
const createCustomIcon = (bgColor, iconChar, ringColor = '#ffffff') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid ${ringColor};
      ">
        <span style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">${iconChar}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      background: #0284c7;
      border: 3px solid white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      box-shadow: 0 0 15px #38bdf8;
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map Viewport controller
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

export const CityMap = ({
  center = [18.5204, 73.8567],
  zoom = 13,
  places = [],
  reports = [],
  userCoords = null,
  routeCoordinates = null,
  selectedItem = null,
  onMarkerClick = null,
  height = '500px'
}) => {
  const getPlaceIcon = (cat) => {
    switch (cat) {
      case 'Historical landmarks':
      case 'Cultural locations':
        return createCustomIcon('#8b5cf6', '🏛️');
      case 'Restaurants':
      case 'Street food':
      case 'Cafes':
        return createCustomIcon('#f97316', '🍽️');
      case 'Hotels':
      case 'Budget stays':
        return createCustomIcon('#0ea5e9', '🏨');
      case 'Hospitals':
        return createCustomIcon('#ef4444', '🏥');
      case 'Police stations':
        return createCustomIcon('#3b82f6', '👮');
      case 'Parks':
        return createCustomIcon('#10b981', '🌳');
      default:
        return createCustomIcon('#2563eb', '📍');
    }
  };

  const getReportIcon = (category, severity) => {
    if (severity === 'critical') return createCustomIcon('#ef4444', '⚠️', '#fee2e2');
    if (severity === 'high') return createCustomIcon('#f97316', '⚠️');
    return createCustomIcon('#f59e0b', '⚠️');
  };

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* OpenStreetMap Standard Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* User GPS location marker */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-sky-600">Your Current Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline if present */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates.map(c => [c[1], c[0]])} // convert GeoJSON [lng, lat] to Leaflet [lat, lng]
            color="#0ea5e9"
            weight={5}
            opacity={0.8}
            dashArray="1, 8"
          />
        )}

        {/* Place Markers */}
        {places.map((place) => {
          if (!place.location?.coordinates || place.location.coordinates.length < 2) return null;
          const [lng, lat] = place.location.coordinates;
          return (
            <Marker
              key={place._id}
              position={[lat, lng]}
              icon={getPlaceIcon(place.category)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(place, 'place')
              }}
            >
              <Popup>
                <div className="p-1 max-w-[220px] text-slate-800">
                  {place.images && place.images[0] && (
                    <img
                      src={place.images[0]}
                      alt={place.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4 className="font-bold text-sm leading-tight text-slate-900">{place.name}</h4>
                  <span className="text-[10px] text-cyan-600 font-semibold block mb-1">{place.category}</span>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">{place.description}</p>
                  
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {place.rating?.average || 'N/A'}
                    </span>
                    <Link
                      to={`/place/${place._id}`}
                      className="text-cyan-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Safety Report Hazard Markers */}
        {reports.map((report) => {
          if (!report.location?.coordinates || report.location.coordinates.length < 2) return null;
          const [lng, lat] = report.location.coordinates;
          return (
            <Marker
              key={report._id}
              position={[lat, lng]}
              icon={getReportIcon(report.category, report.severity)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(report, 'report')
              }}
            >
              <Popup>
                <div className="p-1 max-w-[220px] text-slate-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-rose-600 font-bold text-xs uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {report.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs leading-snug text-slate-900 mb-1">{report.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">{report.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="capitalize font-semibold text-rose-500">Severity: {report.severity}</span>
                    <span className="capitalize font-medium text-emerald-600">{report.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
