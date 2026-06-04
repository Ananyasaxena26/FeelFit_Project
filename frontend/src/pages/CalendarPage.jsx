import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

  :root {
    --bg:       #080c10;
    --card:     #0d1520;
    --border:   #1a2840;
    --teal:     #00d4b4;
    --teal-dim: rgba(0,212,180,0.10);
    --red:      #ff4d6d;
    --red-dim:  rgba(255,77,109,0.10);
    --amber:    #f0a500;
    --muted:    #3d4f63;
    --text:     #c9d1d9;
    --text-dim: #5a6a7e;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cal-wrap {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Syne', sans-serif;
    color: var(--text);
    padding: 40px 32px;
    max-width: 960px;
    margin: 0 auto;
  }

  .cal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  .cal-title {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #fff;
  }
  .cal-title span { color: var(--teal); }

  .streak-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #160f00, #221800);
    border: 1px solid var(--amber);
    border-radius: 14px;
    padding: 12px 20px;
  }
  .streak-count {
    font-size: 28px;
    font-weight: 800;
    color: var(--amber);
    line-height: 1;
  }
  .streak-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--amber);
    opacity: 0.7;
    letter-spacing: 1px;
    text-transform: uppercase;
    line-height: 1.4;
  }

  .legend {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }
  .legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .cal-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }

  /* ── CALENDAR ── */
  .react-calendar {
    background: var(--card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    font-family: 'DM Mono', monospace !important;
    color: var(--text) !important;
    width: 100% !important;
  }
  .react-calendar__navigation {
    margin-bottom: 16px !important;
  }
  .react-calendar__navigation button {
    background: transparent !important;
    color: var(--text) !important;
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 8px !important;
    min-width: 36px !important;
    height: 36px !important;
  }
  .react-calendar__navigation button:hover {
    background: var(--teal-dim) !important;
    color: var(--teal) !important;
  }
  .react-calendar__month-view__weekdays {
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    color: var(--muted) !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none !important;
  }
  .react-calendar__tile {
    background: transparent !important;
    color: var(--text-dim) !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 12px !important;
    border-radius: 8px !important;
    height: 40px !important;
    transition: all 0.15s ease !important;
    position: relative !important;
  }
  .react-calendar__tile:hover {
    background: var(--teal-dim) !important;
    color: var(--teal) !important;
  }
  .react-calendar__tile--now {
    background: rgba(0,212,180,0.08) !important;
    color: var(--teal) !important;
    font-weight: 700 !important;
  }
  .react-calendar__tile--active {
    background: var(--teal) !important;
    color: #000 !important;
    font-weight: 700 !important;
  }
  .react-calendar__tile--active:hover {
    background: var(--teal) !important;
    color: #000 !important;
  }
  .react-calendar__month-view__days__day--neighboringMonth {
    opacity: 0.25 !important;
  }
  .high-stress {
    background: var(--red-dim) !important;
    color: var(--red) !important;
  }
  .high-stress::after {
    content: '';
    position: absolute;
    bottom: 4px; left: 50%;
    transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--red);
  }
  .good-day {
    background: var(--teal-dim) !important;
    color: var(--teal) !important;
  }
  .good-day::after {
    content: '';
    position: absolute;
    bottom: 4px; left: 50%;
    transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--teal);
  }

  /* ── DATA CARD ── */
  .data-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    animation: fadeUp 0.25s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .data-date {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--teal);
    letter-spacing: 2px;
    text-transform: uppercase;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 20px;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }
  .metric-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
  }
  .metric-box-icon { font-size: 16px; margin-bottom: 6px; }
  .metric-box-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .metric-box-value {
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 20px 0;
  }

  .insight-list { display: flex; flex-direction: column; gap: 8px; }
  .insight-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: rgba(255,255,255,0.02);
    border-radius: 10px;
  }
  .insight-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .insight-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  /* ── EMPTY / ERROR ── */
  .empty-state {
    background: var(--card);
    border: 1px dashed var(--border);
    border-radius: 16px;
    padding: 56px 24px;
    text-align: center;
  }
  .empty-icon { font-size: 40px; opacity: 0.25; margin-bottom: 14px; }
  .empty-text {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-dim);
    line-height: 1.8;
  }
  .error-state {
    background: var(--red-dim);
    border: 1px solid var(--red);
    border-radius: 12px;
    padding: 20px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--red);
    text-align: center;
  }
`;

export default function CalendarPage() {
  const [date, setDate]     = useState(new Date());
  const [data, setData]     = useState(null);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/health-trends")
      .then(r => r.json())
      .then(setTrends)
      .catch(() => {});
  }, []);

  const handleDateClick = async (selectedDate) => {
    setDate(selectedDate);
    setData(null);
    const formatted = selectedDate.toLocaleDateString("en-CA");
    try {
      const res    = await fetch(`http://127.0.0.1:5000/dashboard-by-date?date=${formatted}`);
      const result = await res.json();
      setData(result);
    } catch {
      setData({ error: true });
    }
  };

  const getTileClass = ({ date }) => {
    const fmt = date.toLocaleDateString("en-CA");
    const day = trends.find(t => t.date === fmt);
    if (!day) return null;
    if (day.stress > 0.6) return "high-stress";
    if (day.stress < 0.2) return "good-day";
    return null;
  };

  const streak = (() => {
    let s = 0;
    for (let i = trends.length - 1; i >= 0; i--) {
      if (trends[i].sleep >= 7) s++;
      else break;
    }
    return s;
  })();

  return (
    <>
      <style>{styles}</style>
      <div className="cal-wrap">

        {/* Header */}
        <div className="cal-header">
          <h1 className="cal-title">Health <span>Calendar</span></h1>
          <div className="streak-badge">
            <span style={{ fontSize: 24 }}>🔥</span>
            <div>
              <div className="streak-count">{streak}</div>
              <div className="streak-label">Day Sleep<br/>Streak</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          {[
            { color: "var(--teal)", label: "Good day"   },
            { color: "var(--red)",  label: "High stress" },
            { color: "var(--muted)",label: "No data"     },
          ].map(l => (
            <div className="legend-item" key={l.label}>
              <div className="legend-dot" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="cal-body">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={getTileClass}
            value={date}
          />

          {data ? (
            data.error ? (
              <div className="error-state">❌ No data for this date</div>
            ) : (
              <div className="data-card">
                <div className="data-date">📅 {data.date}</div>

                <div className="metric-grid">
                  {[
                    { icon: "😴", label: "Sleep",  value: data.sleep  },
                    { icon: "🚶", label: "Steps",  value: data.steps  },
                    { icon: "❤️", label: "HR",     value: data.hr     },
                    { icon: "😵", label: "Stress", value: data.stress },
                  ].map(m => (
                    <div className="metric-box" key={m.label}>
                      <div className="metric-box-icon">{m.icon}</div>
                      <div className="metric-box-label">{m.label}</div>
                      <div className="metric-box-value">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <div className="insight-list">
                  {[
                    
                    
                    { label: "Activity",     value: data.activity     },
                  ].map(i => (
                    <div className="insight-row" key={i.label}>
                      <span className="insight-label">{i.label}</span>
                      <span className="insight-value">{i.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-text">Select a date<br/>to view insights</div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}