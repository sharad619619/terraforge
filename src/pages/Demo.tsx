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
        <div
          className="w-full lg:w-72 xl:w-80 shrink-0 border-r overflow-y-auto"
          style={{
            background: "rgba(11,15,26,0.95)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255,255,255,0.05)",
            scrollbarColor: "#374151 #111827",
          }}
        >
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <FlaskConical size={16} className="text-forge-orange" />
              <span className="text-sm font-semibold text-[#F9FAFB]">Demo Explorer</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,122,26,0.15)", color: "#FF7A1A" }}>DEMO</span>
            </div>

            {/* Info card */}
            <div className="rounded-xl p-3 text-xs text-[#9CA3AF] flex items-start gap-2" style={{ background: "rgba(31,79,255,0.07)", border: "1px solid rgba(31,79,255,0.15)" }}>
              <Info size={12} className="shrink-0 mt-0.5 text-geo-blue" />
              <span>This is a simulated demonstration using pre-generated probability layers. Select a region to explore AI predictions.</span>
            </div>

            {/* Region Selector */}
            <div>
              <label className="text-xs font-semibold text-[#D1D5DB] mb-1.5 flex items-center gap-1">
                <MapPin size={11} /> Select State / Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full h-9 rounded-md px-3 text-xs text-[#F9FAFB] focus:outline-none transition-colors"
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", color: "#F9FAFB" }}
              >
                {DEMO_REGIONS.map((r) => (
                  <option key={r.id} value={r.id} style={{ background: "#111827" }}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div>
              <label className="text-xs font-semibold text-[#D1D5DB] mb-1.5 block">
                Select District / City
              </label>
              <select
                value={selectedDistrict || ""}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full h-9 rounded-md px-3 text-xs text-[#F9FAFB] focus:outline-none transition-colors"
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", color: "#F9FAFB" }}
              >
                <option value="" style={{ background: "#111827" }}>All Districts</option>
                {region.districts.map((d) => (
                  <option key={d.id} value={d.id} style={{ background: "#111827" }}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Mineral Selector */}
            <div>
              <label className="text-xs font-semibold text-[#D1D5DB] mb-1.5 flex items-center gap-1">
                <Layers size={11} /> Target Mineral
              </label>
              <select
                value={selectedMineral}
                onChange={(e) => { setSelectedMineral(e.target.value as Mineral); setSelectedZone(null); }}
                className="w-full h-9 rounded-md px-3 text-xs text-[#F9FAFB] focus:outline-none transition-colors"
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", color: "#F9FAFB" }}
              >
                {MINERALS.map((m) => (
                  <option key={m} value={m} style={{ background: "#111827" }}>{m}</option>
                ))}
              </select>
            </div>

            {/* Zone Rankings */}
            <div>
              <p className="text-xs font-semibold text-[#D1D5DB] mb-2">Ranked Zones</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {zones.slice(0, 8).map((z) => {
                  const color = z.classification === "High" ? "text-green-400" : z.classification === "Medium" ? "text-forge-orange" : "text-red-400";
                  const isActive = selectedZone?.id === z.id;
                  return (
                    <button
                      key={z.id}
                      onClick={() => setSelectedZone(z)}
                      className={`w-full text-left rounded-[10px] px-3 py-2 text-xs transition-all duration-150`}
                      style={{
                        background: isActive ? "rgba(31,79,255,0.15)" : "rgba(255,255,255,0.04)",
                        border: isActive ? "1px solid rgba(31,79,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#F9FAFB]">{z.name}</span>
                        <span className={`font-bold ${color}`}>{z.probability}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-semibold text-[#9CA3AF] mb-2">Probability Legend</p>
              <div className="space-y-1.5">
                {[
                  { label: "High (≥75%)", color: "bg-green-500" },
                  { label: "Medium (40–75%)", color: "bg-orange-500" },
                  { label: "Low (<40%)", color: "bg-red-500" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2 text-[10px]">
                    <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                    <span className="text-[#9CA3AF]">{l.label}</span>
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
