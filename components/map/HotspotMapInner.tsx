'use client';

import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { Issue } from '@/lib/types';
import { Flame } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface HotspotMapInnerProps {
  issues: Issue[];
}

export default function HotspotMapInner({ issues }: HotspotMapInnerProps) {
  // Group issues into geographical clusters within 1.5km
  const clusters: Array<{
    lat: number;
    lng: number;
    count: number;
    openCount: number;
    areaName: string;
    categories: Record<string, number>;
  }> = [];

  issues.forEach((issue) => {
    const existing = clusters.find(
      (c) => Math.abs(c.lat - issue.lat) < 0.015 && Math.abs(c.lng - issue.lng) < 0.015
    );

    const isOpen =
      issue.status !== 'Resolved' && issue.status !== 'Closed' && issue.status !== 'Rejected';

    if (existing) {
      existing.count += 1;
      if (isOpen) existing.openCount += 1;
      existing.categories[issue.category_name || 'Other'] =
        (existing.categories[issue.category_name || 'Other'] || 0) + 1;
    } else {
      clusters.push({
        lat: issue.lat,
        lng: issue.lng,
        count: 1,
        openCount: isOpen ? 1 : 0,
        areaName: issue.address_text.split(',')[0],
        categories: { [issue.category_name || 'Other']: 1 },
      });
    }
  });

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {clusters.map((cluster, idx) => {
        const radius = Math.min(1800, Math.max(600, cluster.count * 250));
        let fillColor = '#3b82f6';
        let fillOpacity = 0.35;

        if (cluster.openCount >= 4) {
          fillColor = '#ef4444'; // Red high-density hotspot
          fillOpacity = 0.55;
        } else if (cluster.openCount >= 2) {
          fillColor = '#f59e0b'; // Amber moderate hotspot
          fillOpacity = 0.45;
        }

        return (
          <Circle
            key={idx}
            center={[cluster.lat, cluster.lng]}
            radius={radius}
            pathOptions={{
              color: fillColor,
              fillColor,
              fillOpacity,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-2 space-y-2 min-w-[200px]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>{cluster.areaName} Cluster</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Reports:</span>
                    <strong className="text-slate-900">{cluster.count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Unresolved:</span>
                    <strong className="text-rose-600">{cluster.openCount}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  Top categories:{' '}
                  {Object.entries(cluster.categories)
                    .slice(0, 2)
                    .map(([k, v]) => `${k} (${v})`)
                    .join(', ')}
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
}
