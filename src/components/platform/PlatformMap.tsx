import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet.heat";

interface PlatformMapProps {
  center: [number, number];
  zoom: number;
  geojsonData: any | null;
  onZoneClick: (properties: any) => void;
  highlightedZoneId?: string | null;
  showHeatmap?: boolean;
  showZones?: boolean;
  showClustering?: boolean;
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

function getGlowIntensity(probability: number): string {
  if (probability >= 0.75) return "0 0 20px rgba(34, 197, 94, 0.6)";
  if (probability >= 0.4) return "0 0 15px rgba(249, 115, 22, 0.5)";
  return "0 0 10px rgba(239, 68, 68, 0.4)";
}

export default function PlatformMap({ 
  center, 
  zoom, 
  geojsonData, 
  onZoneClick, 
  highlightedZoneId,
  showHeatmap = false,
  showZones = true,
  showClustering = false
}: PlatformMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const heatLayerRef = useRef<any>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

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

  // Handle heatmap layer
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing heatmap
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!showHeatmap || !geojsonData) return;

    const heatData: [number, number, number][] = [];
    
    if (geojsonData.features) {
      geojsonData.features.forEach((feature: any) => {
        const coords = feature.geometry?.coordinates;
        const prob = Number(feature.properties?.probability) || 0;
        
        if (feature.geometry?.type === "Polygon" && coords?.[0]) {
          // Get centroid of polygon
          const ring = coords[0];
          let sumLat = 0, sumLng = 0;
          ring.forEach((coord: number[]) => {
            sumLng += coord[0];
            sumLat += coord[1];
          });
          const centroid: [number, number, number] = [sumLat / ring.length, sumLng / ring.length, prob];
          heatData.push(centroid);
        } else if (feature.geometry?.type === "Point" && coords) {
          heatData.push([coords[1], coords[0], prob]);
        }
      });
    }

    if (heatData.length > 0) {
      // @ts-ignore - leaflet.heat types
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 35,
        blur: 25,
        maxZoom: 12,
        gradient: {
          0.0: '#ef4444',
          0.4: '#f97316',
          0.6: '#eab308',
          0.8: '#84cc16',
          1.0: '#22c55e'
        }
      }).addTo(mapRef.current);
    }
  }, [geojsonData, showHeatmap]);

  // Handle clustering
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing cluster group
    if (clusterGroupRef.current) {
      mapRef.current.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    if (!showClustering || !geojsonData?.features) return;

    const markers = L.markerClusterGroup({
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers();
        const avgProb = childMarkers.reduce((sum, m) => sum + (m.options as any).probability, 0) / childMarkers.length;
        const color = getZoneColor(avgProb);
        const size = Math.min(60, 30 + childMarkers.length * 3);
        
        return L.divIcon({
          html: `
            <div style="
              background: ${color}dd;
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 0 15px ${color}88;
              border: 2px solid white;
            ">
              <span>${childMarkers.length}</span>
              <span style="font-size: 9px">${(avgProb * 100).toFixed(0)}%</span>
            </div>
          `,
          className: 'cluster-icon',
          iconSize: L.point(size, size),
        });
      }
    });

    geojsonData.features.forEach((feature: any) => {
      const coords = feature.geometry?.coordinates;
      const props = feature.properties || {};
      const prob = Number(props.probability) || 0;
      
      let lat: number, lng: number;
      
      if (feature.geometry?.type === "Polygon" && coords?.[0]) {
        const ring = coords[0];
        let sumLat = 0, sumLng = 0;
        ring.forEach((coord: number[]) => {
          sumLng += coord[0];
          sumLat += coord[1];
        });
        lat = sumLat / ring.length;
        lng = sumLng / ring.length;
      } else if (feature.geometry?.type === "Point" && coords) {
        lat = coords[1];
        lng = coords[0];
      } else {
        return;
      }

      const color = getZoneColor(prob);
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `
            <div style="
              background: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 9px;
              font-weight: bold;
              box-shadow: 0 0 10px ${color}88;
              border: 2px solid white;
            ">${(prob * 100).toFixed(0)}</div>
          `,
          className: 'zone-marker',
          iconSize: L.point(24, 24),
        }),
        // @ts-ignore
        probability: prob
      });

      marker.bindTooltip(
        `<strong>${props.zone_id || "Zone"}</strong><br/>${(prob * 100).toFixed(1)}% Probability`,
        { sticky: true }
      );

      marker.on("click", () => {
        onZoneClick({
          ...props,
          probability: prob,
          classification: props.classification || getProbabilityLabel(prob),
        });
      });

      markers.addLayer(marker);
    });

    markers.addTo(mapRef.current);
    clusterGroupRef.current = markers;
  }, [geojsonData, showClustering, onZoneClick]);

  // Handle GeoJSON zones layer
  useEffect(() => {
    if (!mapRef.current) return;

    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!geojsonData || !showZones) return;

    const layer = L.geoJSON(geojsonData, {
      style: (feature) => {
        const p = Number(feature?.properties?.probability);
        const zoneId = feature?.properties?.zone_id;
        const isHighlighted = zoneId === highlightedZoneId;
        const color = getZoneColor(Number.isFinite(p) ? p : undefined);
        
        return {
          fillColor: color,
          fillOpacity: isHighlighted ? 0.6 : 0.35,
          color: isHighlighted ? "#ffffff" : color,
          weight: isHighlighted ? 3 : 2,
          opacity: 0.9,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const p = feature.properties || {};
        const probability = Number(p.probability);
        const normalizedProbability = Number.isFinite(probability) ? probability : 0;
        const classification = p.classification || getProbabilityLabel(normalizedProbability);

        featureLayer.bindTooltip(
          `<div style="font-family: Inter, sans-serif;">
            <strong style="font-size: 12px;">${p.zone_id || "Zone"}</strong><br/>
            <span style="color: ${getZoneColor(normalizedProbability)}; font-weight: bold;">
              ${(normalizedProbability * 100).toFixed(1)}% Probability
            </span><br/>
            <span style="font-size: 11px; color: #666;">
              ${p.mineral || p.target_mineral || "Mineral"} • ${classification}
            </span>
          </div>`,
          { sticky: true, className: "custom-tooltip" }
        );

        featureLayer.on("click", () => {
          onZoneClick({
            ...p,
            probability: normalizedProbability,
            classification,
          });
        });

        // Add hover effects
        featureLayer.on("mouseover", (e) => {
          const layer = e.target;
          layer.setStyle({
            fillOpacity: 0.55,
            weight: 3,
          });
        });

        featureLayer.on("mouseout", (e) => {
          const layer = e.target;
          const isHighlighted = p.zone_id === highlightedZoneId;
          layer.setStyle({
            fillOpacity: isHighlighted ? 0.6 : 0.35,
            weight: isHighlighted ? 3 : 2,
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
  }, [geojsonData, onZoneClick, highlightedZoneId, showZones]);

  // Fly to highlighted zone
  useEffect(() => {
    if (!mapRef.current || !highlightedZoneId || !geojsonData?.features) return;

    const feature = geojsonData.features.find((f: any) => f.properties?.zone_id === highlightedZoneId);
    if (!feature) return;

    const coords = feature.geometry?.coordinates;
    if (feature.geometry?.type === "Polygon" && coords?.[0]) {
      const ring = coords[0];
      let sumLat = 0, sumLng = 0;
      ring.forEach((coord: number[]) => {
        sumLng += coord[0];
        sumLat += coord[1];
      });
      mapRef.current.flyTo([sumLat / ring.length, sumLng / ring.length], 10, { duration: 1 });
    }
  }, [highlightedZoneId, geojsonData]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Legend */}
      <div 
        className="absolute bottom-4 right-4 z-[500] rounded-xl px-4 py-3 text-[11px] space-y-1.5"
        style={{ 
          background: "rgba(11,15,26,0.93)", 
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <p className="font-semibold text-[#F9FAFB] mb-2">Probability Legend</p>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e", boxShadow: "0 0 8px #22c55e66" }} />
          <span className="text-[#D1D5DB]">High (&gt;=75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#f97316", boxShadow: "0 0 8px #f9731666" }} />
          <span className="text-[#D1D5DB]">Medium (40–74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444", boxShadow: "0 0 8px #ef444466" }} />
          <span className="text-[#D1D5DB]">Low (&lt;40%)</span>
        </div>
      </div>

      {/* Custom tooltip styles */}
      <style>{`
        .custom-tooltip {
          background: rgba(11,15,26,0.95) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
          color: #F9FAFB !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(11,15,26,0.95) !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(11,15,26,0.95) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          color: #F9FAFB !important;
        }
        .leaflet-popup-tip {
          background: rgba(11,15,26,0.95) !important;
        }
        .cluster-icon {
          background: transparent !important;
        }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
          background: transparent !important;
        }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
