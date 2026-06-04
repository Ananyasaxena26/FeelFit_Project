import { useEffect, useState } from "react";
import HeartChartDetailed from "./HeartChartDetailed";
import styles from "./Dashboard.module.css";
import { getLiveSteps } from "../api/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

import {
  getPredictions,
  getHRMinute,
  getHealthInsights,
  getActivityPattern,
  getHealthTrends,
  getProductivityPattern
} from "../api/api";

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2, 11, 24, 0.92)",
      border: "1px solid rgba(0,210,190,0.2)",
      borderRadius: "10px",
      padding: "12px 16px",
      fontFamily: "'DM Mono', monospace",
      fontSize: "12px",
      color: "#e2eaf4",
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ color: "#64748b", marginBottom: 8, fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "3px 0" }}>
          {p.name}: <span style={{ color: "#e2eaf4", fontWeight: 500 }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [hrMinute, setHrMinute] = useState([]);
  const [insights, setInsights] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [trends, setTrends] = useState([]);
  const [prodPattern, setProdPattern] = useState(null);
  const [liveSteps, setLiveSteps] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const res = await getPredictions();
    setData(res);

    const minute = await getHRMinute();
    setHrMinute(minute);

    const insightData = await getHealthInsights();
    setInsights(insightData);

    const patternData = await getActivityPattern();
    setPattern(patternData);

    const trendData = await getHealthTrends();
    setTrends(trendData);

    const prod = await getProductivityPattern();
    setProdPattern(prod);

    const stepsData = await getLiveSteps();
    setLiveSteps(stepsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>Syncing biometrics…</p>
    </div>
  );

  if (!data) return (
    <p style={{ padding: "30px", color: "#64748b" }}>
      Failed to load data
    </p>
  );

  const prodScore = prodPattern?.true_productivity_score ?? 0;

  const now = new Date();
  const timeStr = now.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const computedHR =
    hrMinute?.length > 0
      ? Math.round(
          hrMinute.reduce((sum, item) => sum + (item.hr || 0), 0) /
          hrMinute.length
        )
      : null;

  /* ── Metrics (NO STRESS) ── */
  const METRICS = [
    {
      icon: "☽",
      label: "Sleep",
      value: data.sleep,
      unit: "hrs",
      trend: "Last night",
    },
    {
      icon: "👟",
      label: "Steps",
      value: liveSteps?.steps ?? "--",
      unit: "",
      trend: liveSteps ? `Hour: ${liveSteps.hour}:00` : "Loading",
    },
    {
      icon: "◎",
      label: "Productivity",
      value: data.productivity,
      unit: "",
     
    },
    {
      icon: "◐",
      label: "Mood",
      value: data.mood,
      unit: "",
      trend: "Current state",
    },
  ];

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>Health Overview</p>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.timestamp}>{timeStr}</p>
        </div>

        <button className={styles.button} onClick={fetchData}>
          ↻ Refresh
        </button>
      </div>

      {/* ── Metrics ── */}
      <div className={styles.grid}>
        {METRICS.map((m) => (
          <div key={m.label} className={styles.card}>
            <span className={styles.cardIcon}>{m.icon}</span>
            <p className={styles.cardLabel}>{m.label}</p>
            <div className={styles.value}>
              {m.value}
              {m.unit && <span className={styles.valueUnit}>{m.unit}</span>}
            </div>
            <div className={styles.cardTrend}>{m.trend}</div>
          </div>
        ))}
      </div>

      {/* ── Heart Rate Summary ── */}
     

      {/* ── Health Insights ── */}
      {insights && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Health Insights</h2>
            <span className={styles.sectionBadge}>Recovery</span>
          </div>

          <div className={styles.insightGrid}>
            {[
              
              { label: "Hydration", value: insights.hydration },
              { label: "Fatigue Index", value: insights.fatigue },
              { label: "Sleep Advice", value: insights.sleep_advice },
            ].map((item) => (
              <div key={item.label} className={styles.insightItem}>
                <p className={styles.insightLabel}>{item.label}</p>
                <p className={styles.insightValue}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Activity + Productivity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {pattern && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Activity Pattern</h2>
              <span className={styles.sectionBadge}>Daily</span>
            </div>

            <div className={styles.patternRow}>
              <div className={styles.patternStat}>
                <p className={styles.patternStatLabel}>Most Active</p>
                <div className={styles.patternStatValue}>{pattern.most_active_hour}:00</div>
              </div>

              <div className={styles.patternStat}>
                <p className={styles.patternStatLabel}>Least Active</p>
                <div className={styles.patternStatValue}>{pattern.least_active_hour}:00</div>
              </div>
            </div>
          </div>
        )}

        {prodPattern && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Productivity</h2>
              <span className={styles.sectionBadge}>Focus</span>
            </div>

            <div className={styles.patternRow}>
              <div className={styles.patternStat}>
                <p className={styles.patternStatLabel}>Peak Focus</p>
                <div className={styles.patternStatValue}>{prodPattern.most_productive_hour}:00</div>
              </div>

              <div className={styles.patternStat}>
                <p className={styles.patternStatLabel}>Low Focus</p>
                <div className={styles.patternStatValue}>{prodPattern.least_productive_hour}:00</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Heart Rate Graph ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Heart Rate — Minute View</h2>
          <span className={styles.sectionBadge}>Live</span>
        </div>

        <HeartChartDetailed data={hrMinute} />
      </div>

      {/* ── Trends (NO STRESS LINE) ── */}
      {trends.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>30-Day Trends</h2>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Line type="monotone" dataKey="steps" stroke="#00d2be" />
              <Line type="monotone" dataKey="sleep" stroke="#6366f1" />
              <Line type="monotone" dataKey="hr" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

export default Dashboard;