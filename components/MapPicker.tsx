"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icon paths break under bundlers; build one explicitly.
// Image imports resolve to a plain URL string under Turbopack and to an
// `{ src }` object under Webpack — normalize both.
const assetUrl = (mod: unknown): string =>
  typeof mod === "string" ? mod : (mod as { src: string }).src;

const markerIcon = L.icon({
  iconUrl: assetUrl(iconUrl),
  iconRetinaUrl: assetUrl(iconRetinaUrl),
  shadowUrl: assetUrl(shadowUrl),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Malaysia, roughly centered, for the initial view.
const DEFAULT_CENTER: [number, number] = [4.2105, 101.9758];
const DEFAULT_ZOOM = 6;

interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const center: [number, number] = value
    ? [value.lat, value.lng]
    : DEFAULT_CENTER;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={value ? 13 : DEFAULT_ZOOM}
        style={{ height: 320, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {value && (
          <Marker position={[value.lat, value.lng]} icon={markerIcon} />
        )}
      </MapContainer>
    </div>
  );
}
