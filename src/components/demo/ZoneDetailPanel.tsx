import { ProbabilityZone } from "@/data/demo-regions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { X, Target, Brain, TrendingUp } from "lucide-react";

interface Props {
  zone: ProbabilityZone;
  onClose: () => void;
}

export default function ZoneDetailPanel({ zone, onClose }: Props) {
  const factorData = [
    { name: "Terrain", value: zone.factors.terrain, color: "#22c55e" },
    { name: "Geological", value: zone.factors.geological, color: "#3b82f6" },
    { name: "Spectral", value: zone.factors.spectral, color: "#f97316" },
    { name: "Historical", value: zone.factors.historical, color: "#a855f7" },
  ];

  const classColor =
    zone.classification === "High" ? "text-green-400" :
    zone.classification === "Medium" ? "text-forge-orange" : "text-red-400";

  return (
    <div
      className="p-5 space-y-4 animate-fade-in-up rounded-xl"
      style={{
        background: "rgba(11,15,26,0.93)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[#F9FAFB]">
          <Target size={14} className="text-forge-orange" />
          {zone.name}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors text-[#9CA3AF] hover:text-[#F9FAFB]"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Probability", value: `${zone.probability}%`, cls: classColor },
          { label: "Classification", value: zone.classification, cls: classColor },
          { label: "Confidence", value: `${zone.confidenceScore}%`, cls: "text-geo-blue" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-3 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-[10px] text-[#9CA3AF] mb-1">{card.label}</p>
            <p className={`text-sm font-bold ${card.cls}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-[#D1D5DB] mb-2 flex items-center gap-1">
          <Brain size={12} className="text-geo-blue" /> AI Feature Contribution
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={factorData} layout="vertical" margin={{ left: 0, right: 10 }}>
            <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 10, fill: "#6B7280" }} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: "#D1D5DB" }} />
            <Tooltip
              contentStyle={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#F9FAFB" }}
              formatter={(value: number) => [`${value}%`, "Contribution"]}
              labelStyle={{ color: "#D1D5DB" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {factorData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#D1D5DB] mb-2 flex items-center gap-1">
          <TrendingUp size={12} className="text-forge-orange" /> Prediction Explanation
        </p>
        <ul className="space-y-1.5">
          {zone.explanation.map((exp, i) => (
            <li key={i} className="text-xs text-[#9CA3AF] flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-forge-orange shrink-0" />
              {exp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
