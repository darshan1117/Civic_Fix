import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { SLABadge } from './SLABadge';
import { MapPin, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function LeafletMap({ issues = [], height = '500px', center = [12.9716, 77.5946], zoom = 12 }) {
  const { isDark } = useTheme();

  const createPinIcon = (catName = '', status = '') => {
    let pinColor = '#2563eb';
    const lower = (catName || '').toLowerCase();
    if (lower.includes('pothole')) pinColor = '#ea580c';
    else if (lower.includes('garbage')) pinColor = '#16a34a';
    else if (lower.includes('street')) pinColor = '#ca8a04';
    else if (lower.includes('water')) pinColor = '#0284c7';
    else if (lower.includes('drain')) pinColor = '#7c3aed';

    if (status === 'Resolved' || status === 'Closed') pinColor = '#10b981';
    else if (status === 'Rejected') pinColor = '#ef4444';

    const html = `
      <div style="
        background-color: ${pinColor};
        width: 26px;
        height: 26px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-map-pin',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });
  };

  return (
    <div style={{ height }} className={`w-full rounded-2xl overflow-hidden border shadow-sm relative z-0 ${
      isDark ? 'border-slate-800' : 'border-slate-200'
    }`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isDark
              ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

        {issues.map((issue) => (
          <Marker
            key={issue._id || issue.id}
            position={[issue.lat, issue.lng]}
            icon={createPinIcon(issue.category?.name || issue.category_name, issue.status)}
          >
            <Popup>
              <div className="p-1 max-w-xs space-y-2">
                {issue.photos?.[0] && (
                  <img
                    src={issue.photos[0].url}
                    alt={issue.title}
                    className="w-full h-28 object-cover rounded-lg"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{issue.public_id}</span>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                  <h4 className={`font-semibold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{issue.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {issue.address_text}
                  </p>
                </div>
                <div className={`pt-2 border-t flex items-center justify-between gap-2 ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <SLABadge
                    createdAt={issue.createdAt || issue.created_at}
                    slaDeadline={issue.sla_deadline}
                    isCompleted={issue.status === 'Resolved' || issue.status === 'Closed'}
                  />
                  <Link
                    to={`/issues/${issue._id || issue.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline"
                  >
                    Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
