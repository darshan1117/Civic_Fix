import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Navigation, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import 'leaflet/dist/leaflet.css';

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ lat, lng, onChange, addressText = '' }) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { isDark } = useTheme();

  const fetchAddress = async (targetLat, targetLng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'CivicFix-MERN/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          onChange(targetLat, targetLng, data.display_name);
          return;
        }
      }
      onChange(targetLat, targetLng);
    } catch {
      onChange(targetLat, targetLng);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (newLat, newLng) => {
    setGeoError(null);
    fetchAddress(newLat, newLng);
  };

  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        fetchAddress(userLat, userLng);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Could not access GPS. Please tap anywhere on the map to drop a pin.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Tap anywhere on the map to drop a pin.';
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Pinpoint Hazard Location
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            isDark
              ? 'bg-blue-950/60 text-blue-300 border-blue-800 hover:bg-blue-900/60'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-blue-500" />}
          <span>{isLocating ? 'Locating...' : 'Use my current location'}</span>
        </button>
      </div>

      {geoError && (
        <div className={`p-3 rounded-xl flex items-start gap-2 text-xs border ${
          isDark
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      <div className={`relative w-full h-80 rounded-xl overflow-hidden border shadow-xs z-0 ${
        isDark ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
          <ClickHandler onMapClick={handleMapClick} />
        </MapContainer>

        <div className={`absolute bottom-3 left-3 right-3 z-[1000] backdrop-blur-xs p-2.5 rounded-lg border shadow-md text-xs flex items-center justify-between gap-2 transition-colors ${
          isDark
            ? 'bg-[#131B2B]/95 border-slate-700 text-slate-200'
            : 'bg-white/95 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">
              {isGeocoding ? 'Resolving address...' : addressText || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
            </span>
          </div>
          <span className={`text-[10px] shrink-0 hidden sm:inline ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}>Tap map to reposition</span>
        </div>
      </div>
    </div>
  );
}
