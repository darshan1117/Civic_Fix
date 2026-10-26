'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Issue } from '@/lib/types';
import { StatusBadge } from '../issues/StatusBadge';
import { SLACountdownBadge } from '../issues/SLACountdownBadge';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface IssueMapInnerProps {
  issues: Issue[];
  center: [number, number];
  zoom: number;
}

export default function IssueMapInner({
  issues,
  center,
  zoom,
}: IssueMapInnerProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  const createPinIcon = (categoryName: string = '', status: string = '') => {
    if (!L) return undefined;

    let pinColor = '#2563eb';
    if (categoryName.toLowerCase().includes('pothole')) pinColor = '#ea580c';
    else if (categoryName.toLowerCase().includes('garbage')) pinColor = '#16a34a';
    else if (categoryName.toLowerCase().includes('street')) pinColor = '#ca8a04';
    else if (categoryName.toLowerCase().includes('water')) pinColor = '#0284c7';
    else if (categoryName.toLowerCase().includes('drain')) pinColor = '#7c3aed';

    if (status === 'Resolved' || status === 'Closed') {
      pinColor = '#10b981';
    } else if (status === 'Rejected') {
      pinColor = '#ef4444';
    }

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
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
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
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {issues.map((issue) => (
        <Marker
          key={issue.id}
          position={[issue.lat, issue.lng]}
          icon={createPinIcon(issue.category_name, issue.status)}
        >
          <Popup className="civicfix-popup">
            <div className="p-1 max-w-xs space-y-2.5">
              {issue.photos && issue.photos.length > 0 && (
                <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={issue.photos[0].url}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    {issue.public_id}
                  </span>
                  <StatusBadge status={issue.status} size="sm" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 leading-snug">
                  {issue.title}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {issue.address_text}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <SLACountdownBadge
                  createdAt={issue.created_at}
                  slaDeadline={issue.sla_deadline}
                  isCompleted={issue.status === 'Resolved' || issue.status === 'Closed'}
                />
                <Link
                  href={`/issues/${issue.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Details <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
