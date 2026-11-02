"use client";

import { Navigation, Loader2 } from "lucide-react";

interface LocationButtonProps {
  onLocate: () => void;
  isLoading: boolean;
  hasLocation: boolean;
  errorMessage?: string;
}

export default function LocationButton({
  onLocate,
  isLoading,
  hasLocation,
  errorMessage
}: LocationButtonProps) {
  return (
    <div className="location-btn-wrapper">
      <button
        type="button"
        className={`locate-me-btn ${hasLocation ? "is-located" : ""}`}
        onClick={onLocate}
        disabled={isLoading}
        aria-label={
          isLoading
            ? "Mencari lokasi perangkat..."
            : hasLocation
            ? "Pusatkan peta ke lokasi Anda"
            : "Gunakan lokasi saya saat ini"
        }
        title={hasLocation ? "Pusatkan ke lokasi Anda" : "Gunakan lokasi saya"}
      >
        {isLoading ? (
          <Loader2 size={18} className="spin-icon" />
        ) : (
          <Navigation size={18} className={hasLocation ? "located-icon" : ""} />
        )}
        <span className="locate-me-text">
          {isLoading
            ? "Mencari Lokasi..."
            : hasLocation
            ? "Lokasi Aktif"
            : "Lokasi Saya"}
        </span>
      </button>

      {errorMessage && (
        <div className="location-error-tooltip" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

