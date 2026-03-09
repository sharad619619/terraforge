import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PlatformMapProps {
  center: [number, number];
  zoom: number;
  geojsonData: any | null;
  onZoneClick: (properties: any) => void;
}

function getZoneColor(probability?: number): string {
  if (typeof probability !== "number") return "#ef4444";
  if (probability >= 0.75) return "#22c55e";
  if (probability >= 0.4) return "#f97316";
  return "#ef4444";
}

function getProbabilityLabel(probability?: number): string {
  if (typeof probability !== "number") return "Low";
  if (probability >= 0.75) return "High";
  if (probability >= 0.4) return "Medium";
  return "Low";
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || geojsonData) return;
    mapRef.current.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, geojsonData]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!geojsonData) return;

    const layer = L.geoJSON(geojsonData, {
      style: (feature) => {
        const p = Number(feature?.properties?.probability);
        const color = getZoneColor(Number.isFinite(p) ? p : undefined);
        return {
          fillColor: color,
          fillOpacity: 0.35,
          color,
          weight: 2,
          opacity: 0.9,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const p = feature.properties || {};
        const probability = Number(p.probability);
        const normalizedProbability = Number.isFinite(probability) ? probability : 0;
        const classification = p.classification || getProbabilityLabel(normalizedProbability);

        featureLayer.bindTooltip(
          `<strong>${p.zone_id || "Zone"}</strong><br/>${p.mineral || p.target_mineral || "Mineral"}: ${(normalizedProbability * 100).toFixed(1)}%<br/>${classification} Probability`,
          { sticky: true }
        );

        featureLayer.on("click", () => {
          onZoneClick({
            ...p,
            probability: normalizedProbability,
            classification,
          });
        });
      },
    });

    layer.addTo(mapRef.current);
    layerRef.current = layer;

    try {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [24, 24] });
      }
    } catch {
      // no-op
    }
  }, [geojsonData, onZoneClick]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 z-[500] rounded-md border border-border/70 bg-card/90 backdrop-blur px-3 py-2 text-[11px] space-y-1">
        <p className="font-semibold text-foreground">Probability Legend</p>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e" }} /> High (&gt;=75%)</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#f97316" }} /> Medium (40–74%)</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} /> Low (&lt;40%)</div>
      </div>
    </div>
  );
}

