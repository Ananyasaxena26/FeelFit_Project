import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   STYLES — Cyberpunk Biometric HUD, matching Layout + Dashboard
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow:wght@300;400;500;600;700;800&display=swap');

  :root {
    --void:        #030508;
    --surface:     #080c12;
    --elevated:    #0c1420;
    --hover:       #101a28;
    --cyan:        #00e5ff;
    --cyan-dim:    #00b4cc;
    --cyan-glow:   rgba(0,229,255,0.12);
    --green:       #00ff88;
    --green-dim:   rgba(0,255,136,0.12);
    --sky:         #38bdf8;
    --sky-dim:     rgba(56,189,248,0.12);
    --amber:       #fbbf24;
    --red:         #ff3d5a;
    --indigo:      #818cf8;
    --text-hi:     #eaf2ff;
    --text-mid:    #94a3b8;
    --text-lo:     #3d5470;
    --border:      rgba(0,229,255,0.08);
    --border-md:   rgba(0,229,255,0.16);
    --border-hi:   rgba(0,229,255,0.30);
    --font-mono:   'Space Mono', monospace;
    --font-ui:     'Barlow', sans-serif;
    --r:           12px;
    --r-sm:        7px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── ROOT ── */
  .si-root {
    padding: 36px 40px 60px;
    max-width: 860px;
    font-family: var(--font-ui);
    color: var(--text-hi);
    animation: siFadeUp 0.55s ease both;
  }
  @keyframes siFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── CENTER (loading/error) ── */
  .si-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    gap: 20px;
  }

  /* ── SPINNER ── */
  .si-spinner {
    position: relative;
    width: 44px; height: 44px;
  }
  .si-spinner::before, .si-spinner::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }
  .si-spinner::before {
    inset: 0;
    border: 2px solid rgba(0,229,255,0.1);
  }
  .si-spinner::after {
    inset: 0;
    border: 2px solid transparent;
    border-top-color: var(--cyan);
    animation: siSpin 0.75s linear infinite;
    box-shadow: 0 0 12px rgba(0,229,255,0.25);
  }
  @keyframes siSpin { to { transform: rotate(360deg); } }

  .si-hint {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-lo);
    animation: siPulse 1.6s ease-in-out infinite;
  }
  @keyframes siPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

  .si-err {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--red);
  }

  /* ── HEADER ── */
  .si-header {
    margin-bottom: 36px;
    position: relative;
  }

  .si-eyebrow {
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--cyan);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .si-eyebrow::after {
    content: '';
    flex: 1;
    max-width: 120px;
    height: 1px;
    background: linear-gradient(90deg, var(--border-hi), transparent);
  }

  .si-title {
    font-family: var(--font-ui);
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-hi);
    line-height: 1;
    text-shadow: 0 0 40px rgba(0,229,255,0.12);
    margin-bottom: 10px;
  }

  .si-subtitle {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-lo);
    letter-spacing: 0.1em;
  }

  /* ── GRID ── */
  .si-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }

  /* ── CARD ── */
  .si-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 22px 22px 20px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    animation: siFadeUp 0.5s ease both;
  }
  .si-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-hi), transparent);
  }
  /* corner accent */
  .si-card::after {
    content: '';
    position: absolute;
    top: 10px; right: 10px;
    width: 9px; height: 9px;
    border-top: 1px solid var(--border-md);
    border-right: 1px solid var(--border-md);
  }
  .si-card:hover {
    border-color: var(--border-md);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.05);
  }
  .si-card-full { grid-column: 1 / -1; }

  /* ── LABEL ── */
  .si-label {
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--text-lo);
    margin-bottom: 12px;
  }

  /* ── SUMMARY TEXT ── */
  .si-summary-text {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-mid);
    line-height: 1.8;
    font-family: var(--font-mono);
  }

  /* ── STAT VALUE ── */
  .si-stat-value {
    font-family: var(--font-ui);
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 16px;
  }
  .si-stat-sub {
    font-size: 14px;
    color: var(--text-lo);
    font-weight: 400;
    margin-left: 3px;
    letter-spacing: 0;
  }

  /* ── BAR ── */
  .si-bar-track {
    height: 4px;
    background: rgba(255,255,255,0.05);
    border-radius: 99px;
    overflow: hidden;
    position: relative;
  }
  .si-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1.1s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  .si-bar-fill::after {
    content: '';
    position: absolute;
    top: 0; left: -60%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: siBarShimmer 2.2s ease infinite;
  }
  @keyframes siBarShimmer {
    0%   { left: -60%; }
    100% { left: 110%; }
  }

  /* ── PERFORMANCE CHIP ── */
  .si-perf-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }
  .si-perf-num {
    font-family: var(--font-ui);
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .si-perf-chip {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 99px;
    font-weight: 700;
    border: 1px solid;
  }
  .si-perf-up   { color: var(--green); background: var(--green-dim); border-color: rgba(0,255,136,0.25); }
  .si-perf-down { color: var(--red);   background: rgba(255,61,90,0.1); border-color: rgba(255,61,90,0.25); }

  /* ── PLAN ITEMS ── */
  .si-plan-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .si-plan-item:last-child { border-bottom: none; padding-bottom: 0; }
  .si-plan-item:first-of-type { padding-top: 0; }

  .si-time-tag {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    color: var(--cyan-dim);
    background: var(--cyan-glow);
    border: 1px solid var(--border-md);
    border-radius: 4px;
    padding: 3px 8px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .si-plan-task {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-hi);
    margin-bottom: 3px;
    letter-spacing: -0.01em;
  }

  .si-plan-reason {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-lo);
    line-height: 1.6;
    letter-spacing: 0.04em;
  }

  /* ── TASKS ── */
  .si-task-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-mid);
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .si-task-item:last-child { border-bottom: none; padding-bottom: 0; }

  .si-task-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
    flex-shrink: 0;
    animation: siDotBlink 2.4s ease-in-out infinite;
  }
  @keyframes siDotBlink {
    0%,100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .si-empty {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--green);
    letter-spacing: 0.1em;
  }

  /* ── ACTIVITY GRID ── */
  .si-activity-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .si-activity-stat {
    background: var(--elevated);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 14px 16px;
    transition: border-color 0.2s;
  }
  .si-activity-stat:hover { border-color: var(--border-md); }

  .si-activity-icon {
    font-size: 16px;
    margin-bottom: 8px;
    display: block;
    filter: drop-shadow(0 0 4px rgba(0,229,255,0.3));
  }

  .si-activity-label {
    font-family: var(--font-mono);
    font-size: 7px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-lo);
    margin-bottom: 4px;
  }

  .si-activity-value {
    font-family: var(--font-ui);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-hi);
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .si-activity-sub {
    font-family: var(--font-mono);
    font-size: 8px;
    color: var(--text-lo);
    margin-top: 2px;
    letter-spacing: 0.08em;
  }

  .si-divider {
    height: 1px;
    background: var(--border);
    margin: 16px 0;
  }

  .si-message-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: var(--elevated);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
  }
  .si-message-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
    flex-shrink: 0;
    margin-top: 4px;
    animation: siDotBlink 2s ease-in-out infinite;
  }
  .si-message-text {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--green);
    line-height: 1.7;
    letter-spacing: 0.06em;
  }
  .si-prod-level {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cyan-dim);
    margin-bottom: 12px;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .si-root { padding: 22px 18px 40px; }
    .si-title { font-size: 28px; }
    .si-grid { grid-template-columns: 1fr; }
    .si-activity-grid { grid-template-columns: 1fr 1fr; }
  }
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function SmartInsights() {
  const [data, setData]       = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError]     = useState(false);
  const [bars, setBars]       = useState(false);

  /* ── fetch main insights ── */
  useEffect(() => {
    fetch("http://127.0.0.1:5000/smart-insights")
      .then(res => res.json())
      .then(d => { setData(d); setTimeout(() => setBars(true), 200); })
      .catch(() => setError(true));
  }, []);

  /* ── fetch activity ── */
  useEffect(() => {
    fetch("http://127.0.0.1:5000/activity-pattern")
      .then(res => res.json())
      .then(d => { console.log("Activity:", d); setActivity(d); })
      .catch(() => console.log("Activity fetch failed"));
  }, []);

  /* ── error ── */
  if (error) return (
    <>
      <style>{STYLES}</style>
      <div className="si-root">
        <div className="si-center">
          <p className="si-err">⚠ Could not reach backend</p>
        </div>
      </div>
    </>
  );

  /* ── loading ── */
  if (!data) return (
    <>
      <style>{STYLES}</style>
      <div className="si-root">
        <div className="si-center">
          <div className="si-spinner" />
          <p className="si-hint">Loading AI insights…</p>
        </div>
      </div>
    </>
  );

  const perfUp = data.performance_change > 0;

  return (
    <>
      <style>{STYLES}</style>
      <div className="si-root">

        {/* ── HEADER ── */}
        <div className="si-header">
          <p className="si-eyebrow">AI Insights</p>
          <h1 className="si-title">Your day, analysed.</h1>
          <p className="si-subtitle">Personalised analysis based on your recent activity</p>
        </div>

        {/* ── SUMMARY ── */}
        <div className="si-grid" style={{ marginBottom: 14 }}>
          <div className="si-card si-card-full" style={{ animationDelay: "0.06s" }}>
            <p className="si-label">Summary</p>
            <p className="si-summary-text">{data.summary}</p>
          </div>
        </div>

        {/* ── PRODUCTIVITY + CONFIDENCE ── */}
        

         
        {/* ── PERFORMANCE ── */}
        <div className="si-grid" style={{ marginBottom: 14 }}>
          <div className="si-card si-card-full" style={{ animationDelay: "0.18s" }}>
            <p className="si-label">Performance</p>
            <div className="si-perf-row">
              <div className="si-perf-num" style={{ color: perfUp ? "#00ff88" : "#ff3d5a" }}>
                {perfUp ? "+" : ""}{data.performance_change}
              </div>
              <div className={`si-perf-chip ${perfUp ? "si-perf-up" : "si-perf-down"}`}>
                {perfUp ? "↑ Improved" : "↓ Declined"} vs yesterday
              </div>
            </div>
          </div>
        </div>

        {/* ── DAILY PLAN ── */}
        <div className="si-grid" style={{ marginBottom: 14 }}>
          <div className="si-card si-card-full" style={{ animationDelay: "0.22s" }}>
            <p className="si-label">Daily Plan</p>
            {data.plan.map((item, i) => (
              <div className="si-plan-item" key={i}>
                <span className="si-time-tag">{item.time}</span>
                <div>
                  <p className="si-plan-task">{item.task}</p>
                  <p className="si-plan-reason">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTION TASKS ── */}
        <div className="si-grid" style={{ marginBottom: 14 }}>
          <div className="si-card si-card-full" style={{ animationDelay: "0.26s" }}>
            <p className="si-label">Action Tasks</p>
            {data.tasks.length === 0 ? (
              <p className="si-empty">✓ All clear</p>
            ) : (
              data.tasks.map((t, i) => (
                <div className="si-task-item" key={i}>
                  <span className="si-task-dot" />
                  {t}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── FOCUS & ACTIVITY INSIGHTS ── */}
        <div className="si-grid">
          <div className="si-card si-card-full" style={{ animationDelay: "0.30s" }}>
            <p className="si-label">Focus & Activity Insights</p>

            {!activity ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="si-spinner" style={{ width: 24, height: 24 }} />
                <p className="si-hint" style={{ animation: "none", opacity: 0.5 }}>Loading…</p>
              </div>
            ) : activity.error ? (
              <p className="si-err">No data available</p>
            ) : (
              <>
                <div className="si-activity-grid">
                  <div className="si-activity-stat">
                    <span className="si-activity-icon">🔥</span>
                    <p className="si-activity-label">Peak Focus</p>
                    <div className="si-activity-value">{activity.peak_focus_hour}:00</div>
                    <div className="si-activity-sub">best focus hour</div>
                  </div>
                  <div className="si-activity-stat">
                    <span className="si-activity-icon">⚡</span>
                    <p className="si-activity-label">Most Active</p>
                    <div className="si-activity-value">{activity.most_active_hour}:00</div>
                    <div className="si-activity-sub">peak steps hour</div>
                  </div>
                  <div className="si-activity-stat">
                    <span className="si-activity-icon">😴</span>
                    <p className="si-activity-label">Least Active</p>
                    <div className="si-activity-value">{activity.least_active_hour}:00</div>
                    <div className="si-activity-sub">lowest steps hour</div>
                  </div>
                  <div className="si-activity-stat">
                    <span className="si-activity-icon">📉</span>
                    <p className="si-activity-label">Low Focus</p>
                    <div className="si-activity-value">{activity.low_focus_hour}:00</div>
                    <div className="si-activity-sub">slowest focus hour</div>
                  </div>
                </div>

                <div className="si-divider" />

                <p className="si-prod-level">Productivity Level — {activity.productivity_level}</p>

                <div className="si-message-row">
                  <div className="si-message-dot" />
                  <p className="si-message-text">{activity.message}</p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}