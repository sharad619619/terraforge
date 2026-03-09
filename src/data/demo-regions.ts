import type { FeatureCollection } from "geojson";

export interface DemoRegion {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  districts: { id: string; name: string; center: [number, number]; zoom: number }[];
}

export const DEMO_REGIONS: DemoRegion[] = [
  {
    id: "rajasthan",
    name: "Rajasthan",
    center: [26.9, 73.7],
    zoom: 7,
    districts: [
      { id: "jaipur", name: "Jaipur", center: [26.92, 75.78], zoom: 10 },
      { id: "jodhpur", name: "Jodhpur", center: [26.28, 73.02], zoom: 10 },
      { id: "udaipur", name: "Udaipur", center: [24.58, 73.68], zoom: 10 },
    ],
  },
  {
    id: "odisha",
    name: "Odisha",
    center: [20.5, 84.0],
    zoom: 7,
    districts: [
      { id: "keonjhar", name: "Keonjhar", center: [21.63, 85.58], zoom: 10 },
      { id: "sundargarh", name: "Sundargarh", center: [22.12, 84.04], zoom: 10 },
      { id: "koraput", name: "Koraput", center: [18.81, 82.71], zoom: 10 },
    ],
  },
  {
    id: "jharkhand",
    name: "Jharkhand",
    center: [23.6, 85.3],
    zoom: 7,
    districts: [
      { id: "ranchi", name: "Ranchi", center: [23.35, 85.33], zoom: 10 },
      { id: "dhanbad", name: "Dhanbad", center: [23.8, 86.45], zoom: 10 },
      { id: "singhbhum", name: "East Singhbhum", center: [22.8, 86.2], zoom: 10 },
    ],
  },
  {
    id: "western-australia",
    name: "Western Australia",
    center: [-25.0, 122.0],
    zoom: 5,
    districts: [
      { id: "pilbara", name: "Pilbara", center: [-22.0, 118.5], zoom: 8 },
      { id: "goldfields", name: "Goldfields-Esperance", center: [-31.0, 121.5], zoom: 8 },
      { id: "kimberley", name: "Kimberley", center: [-17.0, 125.5], zoom: 8 },
    ],
  },
];

export const MINERALS = ["Lithium", "Copper", "Iron", "Gold", "Groundwater"] as const;
export type Mineral = (typeof MINERALS)[number];

export interface ProbabilityZone {
  id: string;
  name: string;
  probability: number;
  classification: "High" | "Medium" | "Low";
  mineral: string;
  factors: {
    terrain: number;
    geological: number;
    spectral: number;
    historical: number;
  };
  explanation: string[];
  confidenceScore: number;
  coordinates: [number, number][];
}

// Seeded random number generator for consistent results
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateZonesForRegion(
  regionId: string,
  districtId: string | null,
  mineral: Mineral
): ProbabilityZone[] {
  const region = DEMO_REGIONS.find((r) => r.id === regionId);
  if (!region) return [];

  const target = districtId
    ? region.districts.find((d) => d.id === districtId)
    : region;
  if (!target) return [];

  const [lat, lng] = target.center;
  const spread = districtId ? 0.15 : 0.8;
  const seed = hashCode(`${regionId}-${districtId}-${mineral}`);
  const rand = seededRandom(seed);

  const zoneCount = districtId ? 6 : 10;
  const zones: ProbabilityZone[] = [];

  const explanationPool: Record<string, string[]> = {
    Lithium: [
      "High iron oxide spectral signatures detected",
      "Structural fault proximity within 2km",
      "Elevated terrain slope patterns",
      "Historical mineralization indicators in adjacent regions",
      "Pegmatite geological formations identified",
      "Anomalous magnetic field readings",
    ],
    Copper: [
      "Porphyry deposit indicators present",
      "Hydrothermal alteration zones detected",
      "Favorable host rock lithology",
      "Geochemical anomaly in soil samples",
      "Structural intersection zone identified",
      "Historical copper mining activity nearby",
    ],
    Iron: [
      "Banded iron formation signatures",
      "High magnetic susceptibility readings",
      "Laterite cap rock indicators",
      "Favorable stratigraphic position",
      "Gravity anomaly correlation",
      "Proximity to known iron ore deposits",
    ],
    Gold: [
      "Greenstone belt geological setting",
      "Quartz vein indicators detected",
      "Shear zone proximity identified",
      "Arsenic-gold geochemical association",
      "Favorable structural trap geometry",
      "Historical alluvial gold indicators",
    ],
    Groundwater: [
      "High porosity aquifer indicators",
      "Fracture zone intersection detected",
      "Favorable recharge zone proximity",
      "Low terrain slope for water accumulation",
      "Favorable geological permeability",
      "Proximity to existing water sources",
    ],
  };

  for (let i = 0; i < zoneCount; i++) {
    const prob = Math.round((rand() * 80 + 15) * 10) / 10;
    const classification: "High" | "Medium" | "Low" =
      prob >= 75 ? "High" : prob >= 40 ? "Medium" : "Low";

    const terrain = Math.round(rand() * 35 + 10);
    const geological = Math.round(rand() * 35 + 10);
    const spectral = Math.round(rand() * 30 + 5);
    const historical = 100 - terrain - geological - spectral;

    const polySize = spread * 0.12 + rand() * spread * 0.08;
    const cLat = lat + (rand() - 0.5) * spread * 2;
    const cLng = lng + (rand() - 0.5) * spread * 2;
    const sides = 5 + Math.floor(rand() * 3);
    const coords: [number, number][] = [];
    for (let j = 0; j <= sides; j++) {
      const angle = (j / sides) * Math.PI * 2;
      const r = polySize * (0.7 + rand() * 0.3);
      coords.push([cLat + Math.sin(angle) * r, cLng + Math.cos(angle) * r]);
    }

    const expls = explanationPool[mineral] || explanationPool["Lithium"];
    const selectedExpls = expls
      .sort(() => rand() - 0.5)
      .slice(0, 3 + Math.floor(rand() * 2));

    zones.push({
      id: `zone-${regionId}-${i + 1}`,
      name: `Zone ${String.fromCharCode(65 + i)}-${Math.floor(rand() * 90 + 10)}`,
      probability: prob,
      classification,
      mineral,
      factors: {
        terrain,
        geological,
        spectral,
        historical: Math.max(historical, 5),
      },
      explanation: selectedExpls,
      confidenceScore: Math.round((rand() * 20 + 75) * 10) / 10,
      coordinates: coords,
    });
  }

  return zones.sort((a, b) => b.probability - a.probability);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function zonesToGeoJSON(zones: ProbabilityZone[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: zones.map((zone) => ({
      type: "Feature",
      properties: {
        id: zone.id,
        name: zone.name,
        probability: zone.probability,
        classification: zone.classification,
        mineral: zone.mineral,
        confidenceScore: zone.confidenceScore,
        factors: zone.factors,
        explanation: zone.explanation,
      },
      geometry: {
        type: "Polygon",
        coordinates: [zone.coordinates.map(([lat, lng]) => [lng, lat])],
      },
    })),
  };
}
