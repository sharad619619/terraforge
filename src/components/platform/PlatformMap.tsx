import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PlatformMapProps {
  center: [number, number];
  zoom: number;
  geojsonData: any | null;
  onZoneClick: (properties: any) => void;
}

function getZoneColor(classification: string): string {
  switch (classification) {
    case "High": return "#22c55e";
    case "Medium": return "#f97316";
    case "Low": return "#ef4444";
    default: return "#6b7280";
  }
}

export default function PlatformMap({ center, zoom, geojsonData, onZoneClick }: PlatformMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OSM &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!geojsonData) return;

    const layer = L.geoJSON(geojsonData, {
      style: (feature) => ({
        fillColor: getZoneColor(feature?.properties?.classification || "Low"),
        fillOpacity: 0.35,
        color: getZoneColor(feature?.properties?.classification || "Low"),
        weight: 2,
        opacity: 0.8,
      }),
      onEachFeature: (feature, featureLayer) => {
        const p = feature.properties;
        featureLayer.bindTooltip(
          `<strong>${p.zone_id}</strong><br/>${p.target_mineral}: ${(p.probability * 100).toFixed(1)}%`,
          { sticky: true }
        );
        featureLayer.on("click", () => onZoneClick(p));
      },
    });

    layer.addTo(mapRef.current);
    layerRef.current = layer;

    try { mapRef.current.fitBounds(layer.getBounds(), { padding: [30, 30] }); } catch {}
  }, [geojsonData, onZoneClick]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: 400 }} />;
}
