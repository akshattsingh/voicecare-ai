import { motion } from "framer-motion";
import { FileText, Activity, Clock, BarChart3 } from "lucide-react";
import { getRecords, getSymptomFrequency, getRiskDistribution } from "@/lib/analyticsStore";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const riskColors: Record<string, string> = {
  HIGH: "hsl(0, 72%, 55%)",
  MEDIUM: "hsl(38, 92%, 50%)",
  LOW: "hsl(142, 60%, 42%)",
};

export function DoctorDashboard() {
  const records = getRecords();
  const symptomFreq = getSymptomFrequency().slice(0, 8);
  const riskDist = getRiskDistribution();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Doctor Dashboard</h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Cases", value: records.length, icon: FileText },
          { label: "High Risk", value: riskDist.find((r) => r.level === "HIGH")?.count || 0, icon: Activity },
          { label: "Today", value: records.filter((r) => new Date(r.timestamp).toDateString() === new Date().toDateString()).length, icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-4 border border-border shadow-sm text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Symptom Frequency */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Top Symptoms</h3>
          {symptomFreq.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={symptomFreq} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="symptom" width={80} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} cases`]} />
                <Bar dataKey="count" fill="hsl(174, 62%, 38%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">No data yet. Process some cases first.</p>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
          {records.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskDist}>
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDist.map((entry) => (
                    <Cell key={entry.level} fill={riskColors[entry.level] || "#999"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          )}
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Cases</h3>
        </div>
        {records.length > 0 ? (
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {records.slice(0, 10).map((record) => (
              <div key={record.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">"{record.transcript}"</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {record.symptoms.map((s, i) => (
                        <span key={i} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full shrink-0", {
                    "risk-badge-high": record.riskLevel === "HIGH",
                    "risk-badge-medium": record.riskLevel === "MEDIUM",
                    "risk-badge-low": record.riskLevel === "LOW",
                  })}>
                    {record.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(record.timestamp).toLocaleString()} · {record.category}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No cases recorded yet. Use the triage system to start processing.
          </div>
        )}
      </div>
    </motion.div>
  );
}
