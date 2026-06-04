import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2, 11, 24, 0.95)",
      border: "1px solid rgba(239, 68, 68, 0.25)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ color: "#64748b", fontSize: 10, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#ef4444", fontWeight: 500 }}>{payload[0].value} BPM</p>
    </div>
  );
};

function HeartChart({ data }) {
  const formatted = data.map((d) => ({
    hour: `${d.hour}:00`,
    hr: d.hr,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />

        <XAxis
          dataKey="hour"
          tick={{ fill: "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
          axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
          tickLine={false}
        />

        <YAxis
          domain={[40, 160]}
          tick={{ fill: "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Line
          type="monotone"
          dataKey="hr"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: "#ef4444", stroke: "rgba(239,68,68,0.3)", strokeWidth: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default HeartChart;