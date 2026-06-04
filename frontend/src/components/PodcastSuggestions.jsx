import { useEffect, useState } from "react";

const MOOD_CONFIG = {
  sad:    { label: "Sad",     color: "#818cf8", glow: "rgba(129,140,248,0.15)", emoji: "🌧️" },
  low:    { label: "Low",     color: "#60a5fa", glow: "rgba(96,165,250,0.15)",  emoji: "🌤️" },
  normal: { label: "Neutral", color: "#10b981", glow: "rgba(16,185,129,0.15)", emoji: "⚡" },
  happy:  { label: "Happy",   color: "#f59e0b", glow: "rgba(245,158,11,0.15)", emoji: "✨" },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ps-root {
    min-height: 100vh;
    background: #070709;
    background-image: radial-gradient(ellipse 70% 35% at 50% -5%, var(--mood-glow, rgba(16,185,129,0.12)) 0%, transparent 70%);
    padding: 36px 28px 60px;
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
  }

  .ps-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px;
  }

  .ps-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--mood-color, #10b981);
    margin-bottom: 10px;
  }

  .ps-eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--mood-color, #10b981);
    animation: blink 2.2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .ps-title {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #f8fafc;
    line-height: 1.15;
  }

  .ps-title span { color: var(--mood-color, #10b981); }

  .ps-refresh {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #64748b;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin-top: 6px;
  }

  .ps-refresh:hover { background: rgba(255,255,255,0.07); color: #94a3b8; border-color: rgba(255,255,255,0.13); }
  .ps-refresh-icon { display: inline-block; transition: transform 0.4s ease; }
  .ps-refresh:hover .ps-refresh-icon { transform: rotate(180deg); }

  .ps-mood-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 32px;
  }

  .ps-mood-emoji { font-size: 22px; line-height: 1; }
  .ps-mood-info  { flex: 1; }

  .ps-mood-label {
    font-size: 12px;
    color: #475569;
    margin-bottom: 6px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .ps-mood-track {
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 100px;
    overflow: hidden;
  }

  .ps-mood-fill {
    height: 100%;
    border-radius: 100px;
    background: var(--mood-color, #10b981);
    transition: width 1.2s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 0 0 8px var(--mood-color, #10b981);
  }

  .ps-mood-score {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--mood-color, #10b981);
  }

  .ps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }

  .ps-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    animation: cardIn 0.5s ease forwards;
    opacity: 0;
    text-decoration: none;
    display: block;
  }

  .ps-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ps-card:nth-child(1) { animation-delay: 0.05s; }
  .ps-card:nth-child(2) { animation-delay: 0.10s; }
  .ps-card:nth-child(3) { animation-delay: 0.15s; }
  .ps-card:nth-child(4) { animation-delay: 0.20s; }
  .ps-card:nth-child(5) { animation-delay: 0.25s; }

  .ps-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
  .ps-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
  .ps-card:hover .ps-img-wrap img { transform: scale(1.06); }

  .ps-img-placeholder {
    width: 100%; aspect-ratio: 1;
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px;
  }

  .ps-cat-badge {
    position: absolute; top: 8px; left: 8px;
    font-size: 10px; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase;
    background: rgba(0,0,0,0.7);
    color: var(--mood-color, #10b981);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 3px 8px; border-radius: 100px;
    backdrop-filter: blur(6px);
  }

  .ps-play-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.25s ease;
  }

  .ps-card:hover .ps-play-overlay { opacity: 1; }

  .ps-play-btn {
    width: 44px; height: 44px;
    background: var(--mood-color, #10b981);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  .ps-play-icon {
    width: 0; height: 0;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-left: 15px solid #fff;
    margin-left: 3px;
  }

  .ps-card-body { padding: 12px 14px 14px; }
  .ps-card-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #f1f5f9; line-height: 1.3; margin-bottom: 4px; }
  .ps-card-host { font-size: 12px; color: #475569; margin-bottom: 10px; }

  .ps-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .ps-duration    { font-size: 11px; color: #334155; font-weight: 500; }
  .ps-listen-link { font-size: 11px; font-weight: 600; color: var(--mood-color, #10b981); text-decoration: none; letter-spacing: 0.04em; text-transform: uppercase; }

  .ps-empty { grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #334155; font-size: 14px; }

  .ps-center {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100vh; gap: 14px;
  }

  .ps-spinner {
    width: 28px; height: 28px;
    border: 2px solid rgba(16,185,129,0.15);
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .ps-hint { font-size: 13px; color: #334155; }
  .ps-err  { font-size: 14px; color: #f87171; }
`;

export default function PodcastSuggestions() {
  const [podcasts, setPodcasts]   = useState(null);
  const [mood, setMood]           = useState("");
  const [moodScore, setMoodScore] = useState(0);
  const [fillWidth, setFillWidth] = useState(0);
  const [error, setError]         = useState(false);

  const getMoodLabel = (score) => {
    if (score < 4) return "sad";
    if (score < 6) return "low";
    if (score < 8) return "normal";
    return "happy";
  };

  useEffect(() => {
    fetch("http://127.0.0.1:5000/predict")
      .then(r => r.json())
      .then(d => { setMoodScore(d.mood); setMood(getMoodLabel(d.mood)); })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!mood) return;
    fetch(`http://127.0.0.1:5000/smart-podcasts?mood=${mood}&t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { setPodcasts(d.podcasts || []); setTimeout(() => setFillWidth((moodScore / 10) * 100), 80); })
      .catch(() => setError(true));
  }, [mood]);

  const handleRefresh = () => {
    setPodcasts(null);
    setMood("");
    fetch("http://127.0.0.1:5000/predict")
      .then(r => r.json())
      .then(d => { setMoodScore(d.mood); setMood(getMoodLabel(d.mood)); })
      .catch(() => setError(true));
  };

  const cfg     = MOOD_CONFIG[mood] || MOOD_CONFIG.normal;
  const cssVars = { "--mood-color": cfg.color, "--mood-glow": cfg.glow };

  if (error)
    return (
      <>
        <style>{styles}</style>
        <div className="ps-root" style={cssVars}>
          <div className="ps-center"><p className="ps-err">⚠ Could not reach backend</p></div>
        </div>
      </>
    );

  if (!podcasts)
    return (
      <>
        <style>{styles}</style>
        <div className="ps-root" style={cssVars}>
          <div className="ps-center">
            <div className="ps-spinner" />
            <p className="ps-hint">Reading your vibe...</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <style>{styles}</style>
      <div className="ps-root" style={cssVars}>

        <div className="ps-header">
          <div>
            <div className="ps-eyebrow">
              <span className="ps-eyebrow-dot" />
              Mood-matched picks
            </div>
            <h1 className="ps-title">
              Listening for a<br />
              <span>{cfg.label}</span> day.
            </h1>
          </div>
          <button className="ps-refresh" onClick={handleRefresh}>
            <span className="ps-refresh-icon">↻</span> Refresh
          </button>
        </div>

        <div className="ps-mood-bar">
          <span className="ps-mood-emoji">{cfg.emoji}</span>
          <div className="ps-mood-info">
            <p className="ps-mood-label">Mood score</p>
            <div className="ps-mood-track">
              <div className="ps-mood-fill" style={{ width: `${fillWidth}%` }} />
            </div>
          </div>
          <span className="ps-mood-score">{moodScore.toFixed(1)}</span>
        </div>

        <div className="ps-grid">
          {podcasts.length === 0 ? (
            <div className="ps-empty">No podcasts found for this mood.</div>
          ) : (
            podcasts.map((p, i) => (
              <a key={i} className="ps-card" href={p.url} target="_blank" rel="noreferrer">
                <div className="ps-img-wrap">
                  {p.image
                    ? <img src={p.image} alt={p.name} />
                    : <div className="ps-img-placeholder">🎙️</div>
                  }
                  {p.category && <span className="ps-cat-badge">{p.category}</span>}
                  <div className="ps-play-overlay">
                    <div className="ps-play-btn"><div className="ps-play-icon" /></div>
                  </div>
                </div>
                <div className="ps-card-body">
                  <p className="ps-card-name">{p.name}</p>
                  {p.host && <p className="ps-card-host">{p.host}</p>}
                  <div className="ps-card-footer">
                    {p.duration && <span className="ps-duration">{p.duration}</span>}
                    <span className="ps-listen-link">Listen →</span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

      </div>
    </>
  );
}