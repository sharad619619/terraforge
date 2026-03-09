import { useState, useCallback, useMemo } from "react";
import Layout from "@/components/Layout";
import DemoMap from "@/components/demo/DemoMap";
import ZoneDetailPanel from "@/components/demo/ZoneDetailPanel";
import { DEMO_REGIONS, MINERALS, generateZonesForRegion, type Mineral, type ProbabilityZone } from "@/data/demo-regions";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, MapPin, FlaskConical, Info } from "lucide-react";

export default function Demo() {
  const [selectedRegion, setSelectedRegion] = useState(DEMO_REGIONS[0].id);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedMineral, setSelectedMineral] = useState<Mineral>("Lithium");
  const [selectedZone, setSelectedZone] = useState<ProbabilityZone | null>(null);

  const region = DEMO_REGIONS.find((r) => r.id === selectedRegion)!;
  const district = selectedDistrict ? region.districts.find((d) => d.id === selectedDistrict) : null;

  const center: [number, number] = district ? district.center : region.center;
  const zoom = district ? district.zoom : region.zoom;

  const zones = useMemo(
    () => generateZonesForRegion(selectedRegion, selectedDistrict, selectedMineral),
    [selectedRegion, selectedDistrict, selectedMineral]
  );

  const handleRegionChange = useCallback((id: string) => {
    setSelectedRegion(id);
    setSelectedDistrict(null);
    setSelectedZone(null);
  }, []);

  const handleDistrictChange = useCallback((id: string) => {
    setSelectedDistrict(id || null);
    setSelectedZone(null);
  }, []);

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
        {/* Left Controls */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 border-r border-border/50 bg-card/50 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <FlaskConical size={16} className="text-forge-orange" />
              <span className="text-sm font-bold">Demo Explorer</span>
              <span className="ml-auto text-[10px] bg-forge-orange/20 text-forge-orange px-2 py-0.5 rounded-full font-medium">DEMO</span>
            </div>

            <div className="glass-card p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info size={12} className="shrink-0 mt-0.5 text-geo-blue" />
              <span>This is a simulated demonstration using pre-generated probability layers. Select a region to explore AI predictions.</span>
            </div>

            {/* Region Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block flex items-center gap-1">
                <MapPin size={11} /> Select State / Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full h-9 rounded-md bg-secondary border border-border/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-geo-blue"
              >
                {DEMO_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Select District / City
              </label>
              <select
                value={selectedDistrict || ""}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full h-9 rounded-md bg-secondary border border-border/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-geo-blue"
              >
                <option value="">All Districts</option>
                {region.districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Mineral Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block flex items-center gap-1">
                <Layers size={11} /> Target Mineral
              </label>
              <select
                value={selectedMineral}
                onChange={(e) => { setSelectedMineral(e.target.value as Mineral); setSelectedZone(null); }}
                className="w-full h-9 rounded-md bg-secondary border border-border/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-geo-blue"
              >
                {MINERALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Zone Rankings */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Ranked Zones</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {zones.slice(0, 8).map((z) => {
                  const color = z.classification === "High" ? "text-green-400" : z.classification === "Medium" ? "text-forge-orange" : "text-red-400";
                  const isActive = selectedZone?.id === z.id;
                  return (
                    <button
                      key={z.id}
                      onClick={() => setSelectedZone(z)}
                      className={`w-full text-left rounded-md px-3 py-2 text-xs transition-colors ${isActive ? "bg-geo-blue/20 border border-geo-blue/30" : "glass-card hover:bg-secondary/80"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{z.name}</span>
                        <span className={`font-bold ${color}`}>{z.probability}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">Probability Legend</p>
              <div className="space-y-1">
                {[
                  { label: "High (≥75%)", color: "bg-green-500" },
                  { label: "Medium (40–75%)", color: "bg-orange-500" },
                  { label: "Low (<40%)", color: "bg-red-500" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2 text-[10px]">
                    <span className={`w-3 h-3 rounded-sm ${l.color} opacity-60`} />
                    <span className="text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button variant="hero" size="lg" className="w-full" asChild>
              <Link to="/platform">Run Your Own Analysis <ArrowRight size={14} /></Link>
            </Button>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <DemoMap
            center={center}
            zoom={zoom}
            zones={zones}
            onZoneClick={setSelectedZone}
            selectedZone={selectedZone}
          />

          {/* Zone detail overlay */}
          {selectedZone && (
            <div className="absolute top-4 right-4 w-80 z-[1000]">
              <ZoneDetailPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
