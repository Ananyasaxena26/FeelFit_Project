import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2, 11, 24, 0.95)",
      border: "1px solid rgba(249, 115, 22, 0.25)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ color: "#64748b", fontSize: 10, marginBottom: 4 }}>t={label}</p>
      <p style={{ color: "#f97316", fontWeight: 500 }}>{payload[0].value} BPM</p>
    </div>
  );
};

function HeartChartDetailed({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="hrGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />

        <XAxis
          dataKey="x"
          tick={{ fill: "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
          axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
          tickLine={false}
        />

        <YAxis
          domain={[40, 160]}
          tick={{ fill: "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Resting HR reference line */}
        <ReferenceLine
          y={70}
          stroke="rgba(99, 102, 241, 0.3)"
          strokeDasharray="4 4"
          label={{ value: "Resting", fill: "#6366f1", fontSize: 9, fontFamily: "'DM Mono', monospace" }}
        />

        <Line
          type="monotone"
          dataKey="hr"
          stroke="url(#hrGrad)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#f97316", stroke: "rgba(249,115,22,0.3)", strokeWidth: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default HeartChartDetailed;