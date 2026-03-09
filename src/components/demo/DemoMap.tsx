import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ProbabilityZone, zonesToGeoJSON } from "@/data/demo-regions";

interface DemoMapProps {
  center: [number, number];
  zoom: number;
  zones: ProbabilityZone[];
  onZoneClick: (zone: ProbabilityZone | null) => void;
  selectedZone: ProbabilityZone | null;
}

function getZoneColor(classification: string): string {
  switch (classification) {
    case "High": return "#22c55e";
    case "Medium": return "#f97316";
    case "Low": return "#ef4444";
    default: return "#6b7280";
  }
}

export default function DemoMap({ center, zoom, zones, onZoneClick, selectedZone }: DemoMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
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

  // Update view
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom]);

  // Update zones layer
  useEffect(() => {
    if (!mapRef.current) return;

    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
    }

    if (zones.length === 0) return;

    const geojson = zonesToGeoJSON(zones);

    const layer = L.geoJSON(geojson as any, {
      style: (feature) => {
        const classification = feature?.properties?.classification || "Low";
        const isSelected = selectedZone?.id === feature?.properties?.id;
        return {
          fillColor: getZoneColor(classification),
          fillOpacity: isSelected ? 0.55 : 0.3,
          color: isSelected ? "#ffffff" : getZoneColor(classification),
          weight: isSelected ? 3 : 1.5,
          opacity: 0.8,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const props = feature.properties;
        featureLayer.bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:12px;">
            <strong>${props.name}</strong><br/>
            ${props.mineral}: ${props.probability}%<br/>
            <span style="color:${getZoneColor(props.classification)}">${props.classification} Probability</span>
          </div>`,
          { sticky: true, className: "zone-tooltip" }
        );

        featureLayer.on("click", () => {
          const zone = zones.find((z) => z.id === props.id);
          onZoneClick(zone || null);
        });
      },
    });

    layer.addTo(mapRef.current);
    layerRef.current = layer;
  }, [zones, selectedZone, onZoneClick]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg" style={{ minHeight: 400 }} />
  );
}
