'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, MapPin, Loader2, AlertCircle } from 'lucide-react';

const DynamicLocationPickerInner = dynamic(
  () => import('./LocationPickerInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center animate-pulse text-slate-400 text-xs">
        Loading map picker...
      </div>
    ),
  }
);

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, addressText?: string) => void;
  addressText?: string;
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  addressText = '',
}: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('leaflet').then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  // Reverse geocode lat/lng to human readable address
  const fetchAddress = async (targetLat: number, targetLng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicFix-CivicApp/1.0',
          },
        }
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

  const handleMapClick = (newLat: number, newLng: number) => {
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
        let msg = 'Could not access your location. Please drop a pin manually on the map.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still tap anywhere on the map to drop a pin.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable. Please pin manually on the map.';
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  if (!isClient) {
    return (
      <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center animate-pulse text-slate-400 text-xs">
        Loading map location picker...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Pinpoint Hazard Location
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shadow-2xs cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{isLocating ? 'Locating...' : 'Use my current location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map view */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs z-0">
        <DynamicLocationPickerInner
          lat={lat}
          lng={lng}
          onMapClick={handleMapClick}
        />

        <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate text-slate-700 dark:text-slate-300">
              {isGeocoding
                ? 'Resolving address...'
                : addressText || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 font-medium hidden sm:inline">
            Tap map to reposition
          </span>
        </div>
      </div>
    </div>
  );
}
