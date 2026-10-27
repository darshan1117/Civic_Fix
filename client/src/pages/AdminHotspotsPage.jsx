import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SLABadge } from '../components/SLABadge';
import {
  MapPin,
  Flame,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Filter,
  Layers,
  Loader2,
  Building,
} from 'lucide-react';

// Custom colored map markers based on category
const createMarkerIcon = (color) =>
  new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

export default function AdminHotspotsPage() {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/issues'), api.get('/categories')])
      .then(([issuesRes, catRes]) => {
        setIssues(issuesRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openIssues = issues.filter(
    (i) => !['Resolved', 'Closed', 'Rejected'].includes(i.status)
  );

  const filteredIssues = openIssues.filter((i) => {
    if (selectedCat !== 'all') {
      const catId = i.category?._id || i.category;
      return String(catId) === String(selectedCat);
    }
    return true;
  });

  // Calculate cluster zones for hotspot circles (Bengaluru key hubs)
  const hotspotClusters = [
    { name: 'Koramangala Commercial Hub', lat: 12.9352, lng: 77.6245, radius: 900 },
    { name: 'Indiranagar 100ft Road Corridor', lat: 12.9716, lng: 77.6412, radius: 800 },
    { name: 'Whitefield Tech Corridor', lat: 12.9698, lng: 77.75, radius: 1000 },
    { name: 'HSR Layout Sector 1 & 2', lat: 12.9121, lng: 77.6446, radius: 750 },
  ];

  // Annotate each cluster with issue counts
  const annotatedClusters = hotspotClusters.map((cluster) => {
    const count = filteredIssues.filter((i) => {
      const dLat = (i.lat - cluster.lat) * 111000;
      const dLng = (i.lng - cluster.lng) * 111000 * Math.cos((cluster.lat * Math.PI) / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng) <= cluster.radius;
    }).length;
    return { ...cluster, count };
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
              <Flame className="w-3.5 h-3.5" /> High-Density Civic Hotspots
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Geographic Defect Concentration Map
            </h1>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCat === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({openIssues.length})
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCat(c._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCat === c._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Map */}
        <div className="flex-1 min-h-[500px] lg:min-h-full relative z-0">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <MapContainer
              center={[12.955, 77.65]}
              zoom={12}
              scrollWheelZoom={true}
              className="w-full h-full min-h-[500px]"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Hotspot Density Rings */}
              {annotatedClusters.map((cluster, i) => (
                <Circle
                  key={i}
                  center={[cluster.lat, cluster.lng]}
                  radius={cluster.radius}
                  pathOptions={{
                    color: cluster.count >= 3 ? '#e11d48' : '#f59e0b',
                    fillColor: cluster.count >= 3 ? '#f43f5e' : '#fbbf24',
                    fillOpacity: 0.18,
                    weight: 2,
                    dashArray: '4, 4',
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1">
                      <p className="font-bold text-xs text-slate-900">{cluster.name}</p>
                      <p className="text-xs text-rose-600 font-semibold">
                        {cluster.count} Active Reports in this zone
                      </p>
                    </div>
                  </Popup>
                </Circle>
              ))}

              {/* Individual Issue Markers */}
              {filteredIssues.map((issue) => {
                const color =
                  issue.category?.name?.toLowerCase().includes('pothole')
                    ? '#ef4444'
                    : issue.category?.name?.toLowerCase().includes('garbage')
                    ? '#10b981'
                    : issue.category?.name?.toLowerCase().includes('street')
                    ? '#f59e0b'
                    : '#3b82f6';

                return (
                  <Marker
                    key={issue._id}
                    position={[issue.lat, issue.lng]}
                    icon={createMarkerIcon(color)}
                  >
                    <Popup>
                      <div className="p-2 space-y-2 max-w-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded">
                            {issue.public_id}
                          </span>
                          <StatusBadge status={issue.status} size="sm" />
                        </div>
                        <p className="font-bold text-xs text-slate-900">{issue.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {issue.address_text}
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            P: {issue.priority_score?.toFixed(1)}
                          </span>
                          <Link
                            to={`/issues/${issue.public_id || issue._id}`}
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            Inspect &rarr;
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Right Sidebar: Identified Hotspots & Priority List */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 space-y-6 overflow-y-auto max-h-[85vh]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600" /> High Density Wards
            </h3>
            <p className="text-xs text-slate-500">
              Zones exceeding safety density threshold based on spatial clustering.
            </p>
          </div>

          {/* Zones */}
          <div className="space-y-3">
            {annotatedClusters.map((cluster, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{cluster.name}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      cluster.count >= 3
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cluster.count} issues
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cluster.count >= 3 ? 'bg-rose-600' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, cluster.count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Hotspot Issue Quick Feed */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Pin List ({filteredIssues.length})
            </h4>
            <div className="space-y-2">
              {filteredIssues.slice(0, 5).map((issue) => (
                <Link
                  key={issue._id}
                  to={`/issues/${issue.public_id || issue._id}`}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 block transition group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-600">
                      {issue.public_id}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">
                      Priority: {issue.priority_score?.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                    {issue.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {issue.address_text}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
