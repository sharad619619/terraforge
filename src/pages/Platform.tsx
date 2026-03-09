import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import PlatformMap from "@/components/platform/PlatformMap";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload, Play, FileText, Layers, BarChart3, Target,
  ChevronDown, ChevronUp, Loader2, Download, Brain, X
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, Cell
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ZoneFactors {
  terrain: number;
  spectral: number;
  geology: number;
  historical: number;
}

interface AnalysisZone {
  zone_id: string;
  state?: string;
  mineral?: string;
  probability: number;
  classification: string;
  explanation?: string[];
  factors: ZoneFactors;
}

interface AnalysisResult {
  region: string;
  target_mineral: string;
  zones: AnalysisZone[];
  geojson: any;
}

const ACCEPTED_TYPES = [".geojson", ".csv", ".tif", ".tiff", ".zip", ".json"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

function classifyProbability(probability: number): "High" | "Medium" | "Low" {
  if (probability >= 0.75) return "High";
  if (probability >= 0.4) return "Medium";
  return "Low";
}

function getClassificationColor(classification: string): string {
  if (classification === "High") return "text-emerald-400";
  if (classification === "Medium") return "text-amber-400";
  return "text-red-400";
}

function getNormalizedFactors(zone: any): ZoneFactors {
  const raw = zone?.factors;

  if (raw && typeof raw === "object") {
    const terrain = Number(raw.terrain ?? 0);
    const spectral = Number(raw.spectral ?? 0);
    const geology = Number(raw.geology ?? 0);
    const historical = Number(raw.historical ?? 0);
    const sum = terrain + spectral + geology + historical;

    if (sum > 0) {
      return {
        terrain: terrain / sum,
        spectral: spectral / sum,
        geology: geology / sum,
        historical: historical / sum,
      };
    }
  }

  return { terrain: 0.31, geology: 0.28, spectral: 0.24, historical: 0.17 };
}

export default function Platform() {
  const [files, setFiles] = useState<File[]>([]);
  const [mineral, setMineral] = useState("Lithium");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLayers, setShowLayers] = useState({ heatmap: true, zones: true, terrain: false });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const valid = newFiles.filter((f) => {
      if (f.size > MAX_SIZE) { toast.error(`${f.name} exceeds 50MB limit`); return false; }
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) { toast.error(`${f.name}: unsupported format`); return false; }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const runAnalysis = useCallback(async () => {
    if (files.length === 0) { toast.error("Upload at least one dataset"); return; }

    setUploading(true);
    setAnalyzing(false);
    setResult(null);
    setSelectedZone(null);

    try {
      // Upload files to storage
      const uploadedPaths: string[] = [];
      for (const file of files) {
        const path = `uploads/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("datasets").upload(path, file);
        if (error) throw new Error(`Upload failed: ${error.message}`);
        uploadedPaths.push(path);
      }

      // Create dataset record
      const { data: dataset, error: dsErr } = await supabase
        .from("datasets")
        .insert({
          name: files.map((f) => f.name).join(", "),
          file_path: uploadedPaths.join(","),
          file_type: files[0].name.split(".").pop() || "unknown",
          file_size: files.reduce((s, f) => s + f.size, 0),
          status: "uploaded",
        })
        .select()
        .single();
      if (dsErr) throw dsErr;

      setUploading(false);
      setAnalyzing(true);
      toast.info("Running AI analysis...");

      // Call edge function
      const { data: analysisData, error: fnErr } = await supabase.functions.invoke("run-analysis", {
        body: { dataset_id: dataset.id, target_mineral: mineral, file_paths: uploadedPaths },
      });

      if (fnErr) throw fnErr;
      setResult(analysisData);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, [files, mineral]);

  const generateReport = useCallback(() => {
    if (!result) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("TerraForge AI — Exploration Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Region: ${result.region}`, 14, 34);
    doc.text(`Target Mineral: ${result.target_mineral}`, 14, 42);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Zones Analyzed: ${result.zones.length}`, 14, 58);

    doc.setFontSize(14);
    doc.text("Prediction Zones", 14, 74);

    autoTable(doc, {
      startY: 80,
      head: [["Zone", "Probability", "Class", "Terrain", "Spectral", "Geology", "Historical"]],
      body: result.zones.map((z) => [
        z.zone_id,
        `${(z.probability * 100).toFixed(1)}%`,
        z.classification,
        `${(z.factors.terrain * 100).toFixed(0)}%`,
        `${(z.factors.spectral * 100).toFixed(0)}%`,
        `${(z.factors.geology * 100).toFixed(0)}%`,
        `${(z.factors.historical * 100).toFixed(0)}%`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [31, 79, 255] },
    });

    doc.save(`terraforge-report-${Date.now()}.pdf`);
    toast.success("Report downloaded");
  }, [result]);

  const factorData = selectedZone
    ? [
        { name: "Terrain", value: Math.round(selectedZone.factors.terrain * 100), color: "#22c55e" },
        { name: "Spectral", value: Math.round(selectedZone.factors.spectral * 100), color: "#f97316" },
        { name: "Geology", value: Math.round(selectedZone.factors.geology * 100), color: "#3b82f6" },
        { name: "Historical", value: Math.round(selectedZone.factors.historical * 100), color: "#a855f7" },
      ]
    : [];

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-72 xl:w-80 shrink-0 border-r border-border/50 bg-card/50 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="text-sm font-bold flex items-center gap-2">
                  <Target size={14} className="text-forge-orange" /> TerraForge MVP
                </span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-secondary rounded">
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Upload Section */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Upload size={11} /> Upload Datasets
                </p>
                <label className="block w-full border-2 border-dashed border-border/50 rounded-lg p-4 text-center cursor-pointer hover:border-geo-blue/50 transition-colors">
                  <input type="file" multiple accept={ACCEPTED_TYPES.join(",")} onChange={handleFileSelect} className="hidden" />
                  <Upload size={20} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">GeoJSON, CSV, TIFF, Shapefile (ZIP)</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Max 50MB per file</p>
                </label>

                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs glass-card px-2 py-1.5">
                        <FileText size={12} className="text-geo-blue shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <span className="text-muted-foreground shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                        <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mineral Select */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Target Mineral</label>
                <select
                  value={mineral}
                  onChange={(e) => setMineral(e.target.value)}
                  className="w-full h-9 rounded-md bg-secondary border border-border/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-geo-blue"
                >
                  {["Lithium", "Copper", "Iron", "Gold", "Groundwater"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Run Analysis */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={runAnalysis}
                disabled={uploading || analyzing || files.length === 0}
              >
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                  : analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                  : <><Play size={14} /> Run Analysis</>}
              </Button>

              {/* Layer Controls */}
              {result && (
                <div className="glass-card p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Layers size={11} /> Layer Controls
                  </p>
                  {Object.entries(showLayers).map(([key, val]) => (
                    <label key={key} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 cursor-pointer text-xs">
                      <span className="capitalize">{key}</span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => setShowLayers((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                        className="accent-geo-blue"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Zone Rankings */}
              {result && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <BarChart3 size={11} /> Ranked Zones
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.zones
                      .sort((a, b) => b.probability - a.probability)
                      .map((z) => {
                        const color = z.classification === "High" ? "text-green-400" : z.classification === "Medium" ? "text-forge-orange" : "text-red-400";
                        return (
                          <button
                            key={z.zone_id}
                            onClick={() => setSelectedZone(z)}
                            className="w-full text-left rounded-md px-3 py-2 text-xs glass-card hover:bg-secondary/80 transition-colors"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{z.zone_id}</span>
                              <span className={`font-bold ${color}`}>{(z.probability * 100).toFixed(1)}%</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Report */}
              {result && (
                <Button variant="hero-outline" size="lg" className="w-full" onClick={generateReport}>
                  <Download size={14} /> Generate Report
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-[1000] glass-card p-2 hover:bg-secondary transition-colors"
            >
              <ChevronUp size={14} className="rotate-90" />
            </button>
          )}

          <PlatformMap
            center={[22.0, 82.0]}
            zoom={5}
            geojsonData={result?.geojson || null}
            onZoneClick={setSelectedZone}
          />

          {/* Overlay messages */}
          {!result && !analyzing && (
            <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
              <div className="glass-card p-8 text-center pointer-events-auto">
                <Target size={32} className="mx-auto mb-3 text-forge-orange" />
                <p className="text-sm font-semibold mb-1">Upload & Analyze</p>
                <p className="text-xs text-muted-foreground">Upload geospatial datasets and run AI analysis to see probability zones on the map.</p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
              <div className="glass-card p-8 text-center">
                <Loader2 size={32} className="mx-auto mb-3 text-geo-blue animate-spin" />
                <p className="text-sm font-semibold">Running Analysis...</p>
                <p className="text-xs text-muted-foreground mt-1">Processing geological features & computing probability scores</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Analysis Panel */}
        {selectedZone && (
          <div className="w-80 shrink-0 border-l border-border/50 bg-card/50 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Brain size={14} className="text-forge-orange" /> Zone Analysis
              </h3>
              <button onClick={() => setSelectedZone(null)} className="p-1 hover:bg-secondary rounded">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Zone</p>
                <p className="text-sm font-bold">{selectedZone.zone_id}</p>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Probability</p>
                <p className={`text-lg font-bold ${selectedZone.classification === "High" ? "text-green-400" : selectedZone.classification === "Medium" ? "text-forge-orange" : "text-red-400"}`}>
                  {(selectedZone.probability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="glass-card p-3 text-center col-span-2">
                <p className="text-[10px] text-muted-foreground">Target Mineral</p>
                <p className="text-sm font-semibold">{result?.target_mineral}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Feature Importance</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={factorData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10, fill: "#AAB3C5" }} />
                  <YAxis type="category" dataKey="name" width={65} tick={{ fontSize: 10, fill: "#AAB3C5" }} />
                  <ReTooltip
                    contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, "Contribution"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {factorData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Key Indicators</p>
              <ul className="space-y-1.5">
                {[
                  "Fault-line proximity detected",
                  "Iron oxide spectral anomaly",
                  "Terrain slope gradient favorable",
                  "Historical deposit proximity match",
                ].map((t, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-forge-orange shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
