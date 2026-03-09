import { useState, useCallback, useMemo } from "react";
import Layout from "@/components/Layout";
import PlatformMap from "@/components/platform/PlatformMap";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload, Play, FileText, Layers, BarChart3, Target,
  ChevronDown, ChevronUp, Loader2, Download, Brain, X,
  TrendingUp, Zap, MapPin, Database, Activity, Award
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
  faultProximity?: number;
}

interface AnalysisZone {
  zone_id: string;
  state?: string;
  mineral?: string;
  probability: number;
  classification: string;
  explanation?: string[];
  factors: ZoneFactors;
  coordinates?: [number, number];
}

interface AnalysisResult {
  region: string;
  target_mineral: string;
  zones: AnalysisZone[];
  geojson: any;
}

const ACCEPTED_TYPES = [".geojson", ".csv", ".tif", ".tiff", ".zip", ".json"];
const MAX_SIZE = 20 * 1024 * 1024;

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

function getScoreColor(score: number): string {
  if (score >= 7) return "#22c55e";
  if (score >= 4) return "#f97316";
  return "#ef4444";
}

function calculateExplorationScore(zone: AnalysisZone): number {
  const prob = zone.probability;
  const factors = zone.factors;
  const factorAvg = (factors.terrain + factors.spectral + factors.geology + factors.historical) / 4;
  const score = (prob * 0.7 + factorAvg * 0.3) * 10;
  return Math.min(10, Math.max(0, score));
}

function getConfidenceLevel(score: number): string {
  if (score >= 8) return "Very High";
  if (score >= 6) return "High";
  if (score >= 4) return "Moderate";
  return "Low";
}

function getNormalizedFactors(zone: any): ZoneFactors {
  const raw = zone?.factors;
  if (raw && typeof raw === "object") {
    const terrain = Number(raw.terrain ?? 0);
    const spectral = Number(raw.spectral ?? 0);
    const geology = Number(raw.geology ?? 0);
    const historical = Number(raw.historical ?? 0);
    const faultProximity = Number(raw.faultProximity ?? 0);
    const sum = terrain + spectral + geology + historical + faultProximity || 1;
    return {
      terrain: terrain / sum,
      spectral: spectral / sum,
      geology: geology / sum,
      historical: historical / sum,
      faultProximity: faultProximity / sum,
    };
  }
  return { terrain: 0.28, geology: 0.25, spectral: 0.22, historical: 0.15, faultProximity: 0.10 };
}

export default function Platform() {
  const [files, setFiles] = useState<File[]>([]);
  const [mineral, setMineral] = useState("Lithium");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedZone, setSelectedZone] = useState<AnalysisZone | null>(null);
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLayers, setShowLayers] = useState({ heatmap: false, zones: true, clustering: false });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const valid = newFiles.filter((f) => {
      if (f.size > MAX_SIZE) { toast.error(`${f.name} exceeds 20MB limit`); return false; }
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) { toast.error(`${f.name}: unsupported format`); return false; }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const runAnalysis = useCallback(async () => {
    if (files.length === 0) { toast.error("Upload at least one dataset"); return; }

    const geojsonFile = files.find((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return ext === ".geojson" || ext === ".json";
    });

    if (!geojsonFile) {
      toast.error("Please include at least one GeoJSON/JSON file for map analysis");
      return;
    }

    setUploading(true);
    setAnalyzing(false);
    setResult(null);
    setSelectedZone(null);

    try {
      const uploadedPaths: string[] = [];
      for (const file of files) {
        const path = `uploads/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("datasets").upload(path, file);
        if (error) throw new Error(`Upload failed: ${error.message}`);
        uploadedPaths.push(path);
      }

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
      head: [["Rank", "Zone", "Probability", "Score", "Class"]],
      body: rankedZones.slice(0, 20).map((z, i) => [
        `#${i + 1}`,
        z.zone_id,
        `${(z.probability * 100).toFixed(1)}%`,
        `${calculateExplorationScore(z).toFixed(1)}/10`,
        z.classification,
      ]),
      theme: "grid",
      headStyles: { fillColor: [31, 79, 255] },
    });

    doc.save(`terraforge-report-${Date.now()}.pdf`);
    toast.success("Report downloaded");
  }, [result]);

  const rankedZones = useMemo(() => 
    [...(result?.zones || [])].sort((a, b) => b.probability - a.probability),
    [result]
  );

  const datasetStats = useMemo(() => {
    if (!result) return null;
    const zones = result.zones;
    const high = zones.filter(z => z.classification === "High" || z.probability >= 0.75).length;
    const medium = zones.filter(z => (z.classification === "Medium") || (z.probability >= 0.4 && z.probability < 0.75)).length;
    const low = zones.length - high - medium;
    return { total: zones.length, high, medium, low };
  }, [result]);

  const aiInsights = useMemo(() => {
    if (!rankedZones.length) return null;
    const topZone = rankedZones[0];
    return {
      topRegion: topZone.state || result?.region || "Analysis Region",
      topMineral: result?.target_mineral || "Lithium",
      bestZone: topZone.zone_id,
      successProb: (topZone.probability * 100).toFixed(1),
    };
  }, [rankedZones, result]);

  const selectedFactors = getNormalizedFactors(selectedZone);
  const factorData = [
    { name: "Terrain Indicators", value: Math.round(selectedFactors.terrain * 100), color: "#22c55e" },
    { name: "Geological Structures", value: Math.round(selectedFactors.geology * 100), color: "#3b82f6" },
    { name: "Spectral Signals", value: Math.round(selectedFactors.spectral * 100), color: "#f97316" },
    { name: "Historical Deposits", value: Math.round(selectedFactors.historical * 100), color: "#a855f7" },
    { name: "Fault Proximity", value: Math.round((selectedFactors.faultProximity || 0.1) * 100), color: "#ec4899" },
  ];

  const handleZoneSelect = useCallback((zone: AnalysisZone) => {
    setSelectedZone(zone);
    setHighlightedZoneId(zone.zone_id);
  }, []);

  const explorationScore = selectedZone ? calculateExplorationScore(selectedZone) : 0;

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* AI Insights Summary Bar */}
        {result && aiInsights && (
          <div 
            className="shrink-0 border-b px-4 py-3"
            style={{ 
              background: "rgba(11,15,26,0.95)", 
              borderColor: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-forge-orange" />
                <span className="text-sm font-semibold text-[#F9FAFB]">AI Exploration Insights</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-geo-blue" />
                  <span className="text-[#9CA3AF]">Top Region:</span>
                  <span className="text-[#F9FAFB] font-medium">{aiInsights.topRegion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-forge-orange" />
                  <span className="text-[#9CA3AF]">Target Mineral:</span>
                  <span className="text-[#F9FAFB] font-medium">{aiInsights.topMineral}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={12} className="text-emerald-400" />
                  <span className="text-[#9CA3AF]">Best Zone:</span>
                  <span className="text-emerald-400 font-bold">{aiInsights.bestZone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-geo-blue" />
                  <span className="text-[#9CA3AF]">Success Probability:</span>
                  <span className="text-emerald-400 font-bold">{aiInsights.successProb}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          {sidebarOpen && (
            <div 
              className="w-72 xl:w-80 shrink-0 border-r overflow-y-auto"
              style={{ 
                background: "rgba(11,15,26,0.95)", 
                borderColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-sm font-bold flex items-center gap-2 text-[#F9FAFB]">
                    <Target size={14} className="text-forge-orange" /> TerraForge AI
                  </span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/5 rounded text-[#9CA3AF]">
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Upload Section */}
                <div>
                  <p className="text-xs font-semibold text-[#D1D5DB] mb-2 flex items-center gap-1">
                    <Upload size={11} /> Upload Datasets
                  </p>
                  <label 
                    className="block w-full rounded-lg p-4 text-center cursor-pointer transition-all duration-200 hover:border-geo-blue/50"
                    style={{ 
                      border: "2px dashed rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.02)"
                    }}
                  >
                    <input type="file" multiple accept={ACCEPTED_TYPES.join(",")} onChange={handleFileSelect} className="hidden" />
                    <Upload size={20} className="mx-auto mb-1 text-[#9CA3AF]" />
                    <p className="text-xs text-[#9CA3AF]">GeoJSON, CSV, TIFF, Shapefile (ZIP)</p>
                    <p className="text-[10px] text-[#6B7280] mt-1">Max 20MB per file</p>
                  </label>

                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((f, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <FileText size={12} className="text-geo-blue shrink-0" />
                          <span className="truncate flex-1 text-[#F9FAFB]">{f.name}</span>
                          <span className="text-[#6B7280] shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
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
                  <label className="text-xs font-semibold text-[#D1D5DB] mb-1.5 block">Target Mineral</label>
                  <select
                    value={mineral}
                    onChange={(e) => setMineral(e.target.value)}
                    className="w-full h-9 rounded-md px-3 text-xs focus:outline-none transition-colors text-[#F9FAFB]"
                    style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {["Lithium", "Copper", "Iron", "Gold", "Groundwater"].map((m) => (
                      <option key={m} value={m} style={{ background: "#111827" }}>{m}</option>
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
                    : <><Play size={14} /> Run AI Analysis</>}
                </Button>

                {/* Dataset Stats */}
                {result && datasetStats && (
                  <div 
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-xs font-semibold text-[#D1D5DB] mb-3 flex items-center gap-1">
                      <Database size={11} /> Dataset Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-lg font-bold text-[#F9FAFB]">{datasetStats.total}</p>
                        <p className="text-[10px] text-[#9CA3AF]">Total Zones</p>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: "rgba(34,197,94,0.1)" }}>
                        <p className="text-lg font-bold text-emerald-400">{datasetStats.high}</p>
                        <p className="text-[10px] text-[#9CA3AF]">High Prob.</p>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: "rgba(249,115,22,0.1)" }}>
                        <p className="text-lg font-bold text-amber-400">{datasetStats.medium}</p>
                        <p className="text-[10px] text-[#9CA3AF]">Medium Prob.</p>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: "rgba(239,68,68,0.1)" }}>
                        <p className="text-lg font-bold text-red-400">{datasetStats.low}</p>
                        <p className="text-[10px] text-[#9CA3AF]">Low Prob.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Layer Controls */}
                {result && (
                  <div 
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-xs font-semibold text-[#D1D5DB] mb-2 flex items-center gap-1">
                      <Layers size={11} /> Layer Controls
                    </p>
                    {[
                      { key: "zones", label: "Probability Zones" },
                      { key: "heatmap", label: "Probability Heatmap" },
                      { key: "clustering", label: "Zone Clustering" },
                    ].map(({ key, label }) => (
                      <label 
                        key={key} 
                        className="flex items-center justify-between py-2 cursor-pointer text-xs"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <span className="text-[#D1D5DB]">{label}</span>
                        <input
                          type="checkbox"
                          checked={showLayers[key as keyof typeof showLayers]}
                          onChange={() => setShowLayers((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                          className="accent-geo-blue"
                        />
                      </label>
                    ))}
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

          {/* Map Area */}
          <div className="flex-1 relative">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-4 left-4 z-[1000] p-2 rounded-lg transition-colors"
                style={{ background: "rgba(11,15,26,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <ChevronUp size={14} className="rotate-90 text-[#F9FAFB]" />
              </button>
            )}

            <PlatformMap
              center={[22.0, 82.0]}
              zoom={5}
              geojsonData={result?.geojson || null}
              onZoneClick={handleZoneSelect}
              highlightedZoneId={highlightedZoneId}
              showHeatmap={showLayers.heatmap}
              showZones={showLayers.zones}
              showClustering={showLayers.clustering}
            />

            {/* Overlay messages */}
            {!result && !analyzing && (
              <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
                <div 
                  className="p-8 text-center pointer-events-auto rounded-2xl"
                  style={{ 
                    background: "rgba(11,15,26,0.93)", 
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                  }}
                >
                  <Target size={32} className="mx-auto mb-3 text-forge-orange" />
                  <p className="text-sm font-semibold mb-1 text-[#F9FAFB]">Upload & Analyze</p>
                  <p className="text-xs text-[#9CA3AF] max-w-xs">Upload geospatial datasets and run AI analysis to see probability zones on the map.</p>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
                <div 
                  className="p-8 text-center rounded-2xl"
                  style={{ 
                    background: "rgba(11,15,26,0.93)", 
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                  }}
                >
                  <Loader2 size={32} className="mx-auto mb-3 text-geo-blue animate-spin" />
                  <p className="text-sm font-semibold text-[#F9FAFB]">Running AI Analysis...</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Processing geological features & computing probability scores</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Top Targets & Zone Details */}
          {result && (
            <div 
              className="w-80 xl:w-96 shrink-0 border-l overflow-y-auto"
              style={{ 
                background: "rgba(11,15,26,0.95)", 
                borderColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="p-4 space-y-4">
                {/* Top Exploration Targets */}
                <div>
                  <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <Award size={14} className="text-forge-orange" />
                    <span className="text-sm font-bold text-[#F9FAFB]">Top Exploration Targets</span>
                  </div>
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {rankedZones.slice(0, 10).map((z, i) => {
                      const score = calculateExplorationScore(z);
                      const isSelected = selectedZone?.zone_id === z.zone_id;
                      return (
                        <button
                          key={z.zone_id}
                          onClick={() => handleZoneSelect(z)}
                          className="w-full text-left rounded-xl p-3 transition-all duration-200"
                          style={{
                            background: isSelected ? "rgba(31,79,255,0.15)" : "rgba(255,255,255,0.03)",
                            border: isSelected ? "1px solid rgba(31,79,255,0.4)" : "1px solid rgba(255,255,255,0.05)",
                            boxShadow: isSelected ? "0 0 20px rgba(31,79,255,0.15)" : "none",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                  style={{ background: "rgba(255,122,26,0.2)", color: "#FF7A1A" }}
                                >
                                  #{i + 1}
                                </span>
                                <span className="text-sm font-semibold text-[#F9FAFB]">{z.zone_id}</span>
                              </div>
                              <p className="text-[10px] text-[#9CA3AF] mt-1">{z.mineral || result.target_mineral}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${getClassificationColor(z.classification || classifyProbability(z.probability))}`}>
                                {(z.probability * 100).toFixed(1)}%
                              </p>
                              <p className="text-[10px] text-[#6B7280]">Score: {score.toFixed(1)}</p>
                            </div>
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${z.probability * 100}%`,
                                background: getScoreColor(score)
                              }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Zone Details */}
                {selectedZone && (
                  <>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "16px" }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-[#F9FAFB]">
                          <Brain size={14} className="text-geo-blue" /> Zone Analysis
                        </h3>
                        <button 
                          onClick={() => { setSelectedZone(null); setHighlightedZoneId(null); }} 
                          className="p-1 hover:bg-white/5 rounded text-[#9CA3AF]"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Zone Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <p className="text-[10px] text-[#9CA3AF]">Zone ID</p>
                          <p className="text-sm font-bold text-[#F9FAFB]">{selectedZone.zone_id}</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <p className="text-[10px] text-[#9CA3AF]">Target Mineral</p>
                          <p className="text-sm font-semibold text-[#F9FAFB]">{selectedZone.mineral || result?.target_mineral}</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <p className="text-[10px] text-[#9CA3AF]">Probability</p>
                          <p className={`text-lg font-bold ${getClassificationColor(selectedZone.classification || classifyProbability(selectedZone.probability))}`}>
                            {(selectedZone.probability * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <p className="text-[10px] text-[#9CA3AF]">Confidence</p>
                          <p className="text-sm font-semibold text-geo-blue">{getConfidenceLevel(explorationScore)}</p>
                        </div>
                      </div>

                      {/* Exploration Score */}
                      <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-1">
                            <Activity size={11} /> Exploration Score
                          </p>
                          <span className="text-lg font-bold" style={{ color: getScoreColor(explorationScore) }}>
                            {explorationScore.toFixed(1)} / 10
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                          <div 
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ 
                              width: `${explorationScore * 10}%`,
                              background: `linear-gradient(90deg, ${getScoreColor(explorationScore)}, ${getScoreColor(explorationScore)}dd)`,
                              boxShadow: `0 0 12px ${getScoreColor(explorationScore)}66`
                            }}
                          />
                        </div>
                      </div>

                      {/* AI Feature Importance */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-[#D1D5DB] mb-2 flex items-center gap-1">
                          <BarChart3 size={11} /> AI Prediction Explanation
                        </p>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={factorData} layout="vertical" margin={{ left: 0, right: 10 }}>
                            <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10, fill: "#6B7280" }} />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: "#D1D5DB" }} />
                            <ReTooltip
                              contentStyle={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                              formatter={(v: number) => [`${v}%`, "Contribution"]}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {factorData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Contributing Indicators */}
                      <div>
                        <p className="text-xs font-semibold text-[#D1D5DB] mb-2 flex items-center gap-1">
                          <TrendingUp size={11} /> Top Contributing Indicators
                        </p>
                        <ul className="space-y-1.5">
                          {(Array.isArray(selectedZone.explanation) && selectedZone.explanation.length > 0
                            ? selectedZone.explanation
                            : [
                                "Fault-line proximity detected",
                                "Iron oxide spectral anomaly",
                                "Elevated terrain gradient",
                                "Historical mineralization signals"
                              ]
                          ).map((t: string, i: number) => (
                            <li key={i} className="text-xs text-[#9CA3AF] flex items-start gap-2">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-forge-orange shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
