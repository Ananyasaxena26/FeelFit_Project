import { useState, useRef, useEffect, useCallback } from "react";

const PATTERNS = {
  Box:    { phases: ["Inhale","Hold","Exhale","Hold"], durations: [4,4,4,4],  colors: ["#38bdf8","#818cf8","#34d399","#818cf8"] },
  "4-7-8":{ phases: ["Inhale","Hold","Exhale"],       durations: [4,7,8],    colors: ["#38bdf8","#818cf8","#34d399"] },
  Simple: { phases: ["Inhale","Exhale"],              durations: [4,6],      colors: ["#38bdf8","#34d399"] },
};

const AFFIRMATIONS = [
  "This feeling is temporary. It will pass.",
  "You are safe right now, in this moment.",
  "Your breath is your anchor to the present.",
  "You have survived difficult moments before.",
  "It's okay to feel this way.",
  "You are stronger than this moment.",
  "One breath at a time — that is enough.",
  "You deserve gentleness, especially from yourself.",
];

const GROUND = [
  { n: 5, sense: "things you can see",   emoji: "👁️",  color: "#38bdf8" },
  { n: 4, sense: "things you can touch", emoji: "✋",  color: "#a78bfa" },
  { n: 3, sense: "things you can hear",  emoji: "👂",  color: "#34d399" },
  { n: 2, sense: "things you can smell", emoji: "🌿",  color: "#fbbf24" },
  { n: 1, sense: "thing you can taste",  emoji: "💧",  color: "#f472b6" },
];

const TIPS = [
  "Try breathing from your belly, not your chest. Let your shoulders drop.",
  "Relax your jaw. Unclench your teeth. Soften your brow.",
  "Feel the weight of your body — you are held right now.",
  "Each exhale releases tension. Let it go completely.",
];

const CIRC = 2 * Math.PI * 88;

export default function SOSPage() {
  const [active, setActive]         = useState(false);
  const [selPat, setSelPat]         = useState("Box");
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [progress, setProgress]     = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionSec, setSessionSec] = useState(0);
  const [tab, setTab]               = useState("breath");
  const [affirmIdx, setAffirmIdx]   = useState(0);
  const [groundChecks, setGroundChecks] = useState({});
  const [tip]                       = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  const audioRef       = useRef(new Audio("/calm.mp3"));
  const phaseRef       = useRef(null); // setTimeout
  const progressRef    = useRef(null); // setInterval
  const sessionRef     = useRef(null); // setInterval
  const affirmRef      = useRef(null); // setInterval
  const phaseIdxRef    = useRef(0);
  const progressValRef = useRef(0);

  // Derived
  const pat      = PATTERNS[selPat];
  const phaseName = pat.phases[phaseIdx];
  const phaseColor = pat.colors[phaseIdx];

  const getOrbScale = () => {
    if (phaseName === "Inhale") return 1 + progress * 0.7;
    if (phaseName === "Exhale") return 1.7 - progress * 0.7;
    if (phaseName === "Hold") {
      const prev = pat.phases[(phaseIdx - 1 + pat.phases.length) % pat.phases.length];
      return prev === "Inhale" ? 1.7 : 1.0;
    }
    return 1;
  };
  const orbScale = getOrbScale();
  const strokeOffset = CIRC * (1 - progress);

  const runPhase = useCallback((idx, patKey) => {
    const p = PATTERNS[patKey];
    phaseIdxRef.current = idx;
    progressValRef.current = 0;
    setPhaseIdx(idx);
    setProgress(0);

    const dur = p.durations[idx] * 1000;
    const start = Date.now();

    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      const val = Math.min((Date.now() - start) / dur, 1);
      progressValRef.current = val;
      setProgress(val);
      if (val >= 1) clearInterval(progressRef.current);
    }, 33);

    clearTimeout(phaseRef.current);
    phaseRef.current = setTimeout(() => {
      clearInterval(progressRef.current);
      const next = (idx + 1) % p.phases.length;
      if (next === 0) setCycleCount(c => c + 1);
      runPhase(next, patKey);
    }, dur);
  }, []);

  const startSOS = () => {
    setActive(true);
    setTab("breath");
    setGroundChecks({});
    setCycleCount(0);
    setSessionSec(0);
    setAffirmIdx(0);
    setPhaseIdx(0);
    setProgress(0);

    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.35;
    audio.play().catch(() => {});

    runPhase(0, selPat);

    sessionRef.current = setInterval(() => setSessionSec(s => s + 1), 1000);
    affirmRef.current  = setInterval(() => setAffirmIdx(i => (i + 1) % AFFIRMATIONS.length), 9000);
  };

  const stopSOS = () => {
    setActive(false);
    clearTimeout(phaseRef.current);
    clearInterval(progressRef.current);
    clearInterval(sessionRef.current);
    clearInterval(affirmRef.current);
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
  };

  useEffect(() => () => {
    clearTimeout(phaseRef.current);
    clearInterval(progressRef.current);
    clearInterval(sessionRef.current);
    clearInterval(affirmRef.current);
  }, []);

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  const toggleCheck = (step, item) => {
    setGroundChecks(prev => {
      const stepChecks = { ...(prev[step] || {}) };
      stepChecks[item] = !stepChecks[item];
      return { ...prev, [step]: stepChecks };
    });
  };

  const groundComplete = step => {
    const checks = groundChecks[step] || {};
    return Object.values(checks).filter(Boolean).length >= GROUND[step].n;
  };

  const firstIncomplete = GROUND.findIndex((_, i) => !groundComplete(i));

  // ─── LANDING ─────────────────────────────────────────────────────────────────
  if (!active) return (
    <div style={styles.root}>
      <Aurora />
      <div style={styles.land}>
        <div style={{ textAlign: "center" }}>
          <div style={styles.heading}>SOS Calm Mode</div>
          <div style={styles.sub}>A safe space to breathe, ground yourself,<br />and find stillness.</div>
        </div>

        <div>
          <div style={styles.patLabel}>Choose a breathing pattern</div>
          <div style={styles.patRow}>
            {Object.entries(PATTERNS).map(([key, p]) => (
              <button key={key} onClick={() => setSelPat(key)}
                style={{ ...styles.patBtn, ...(selPat === key ? styles.patBtnActive : {}) }}>
                {key}&nbsp;<span style={{ color: selPat === key ? "#2dd4bf" : "#334155", fontSize: 11 }}>
                  ({p.durations.join("-")}s)
                </span>
              </button>
            ))}
          </div>
        </div>

        <button style={styles.sosBtn} onClick={startSOS}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          🆘 Begin Calm Mode
        </button>
      </div>
    </div>
  );


  // ─── ACTIVE ───────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <Aurora />
      <div style={styles.activeWrap}>

        {/* Session bar */}
        <div style={styles.sessionBar}>
          {[["session", fmtTime(sessionSec)], ["cycles", cycleCount], ["pattern", selPat]].map(([label, val]) => (
            <div key={label} style={styles.sessionItem}>
              <span style={styles.sessionVal}>{val}</span>
              <span style={styles.sessionLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Orb */}
        <div style={styles.orbWrap}>
          <svg width="200" height="200" style={styles.orbRing}>
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <circle cx="100" cy="100" r="88" fill="none" stroke={phaseColor} strokeWidth="2"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={strokeOffset}
              transform="rotate(-90 100 100)" opacity="0.75" style={{ transition: "stroke 0.4s" }} />
          </svg>
          <div style={{
            ...styles.orb,
            transform: `scale(${orbScale})`,
            background: `radial-gradient(circle at 35% 35%, ${phaseColor}, ${phaseColor}88)`,
            boxShadow: `0 0 ${Math.round(30 + orbScale * 18)}px ${phaseColor}55`,
          }} />
        </div>
        <div style={{ ...styles.phaseLabel, color: phaseColor }}>{phaseName}</div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[["breath","🫁 Breathe"], ["ground","🌿 Ground"], ["affirm","✨ Affirm"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ ...styles.tab, ...(tab === key ? styles.tabActive : {}) }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Breathe panel ── */}
        {tab === "breath" && (
          <div style={styles.panel}>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {pat.phases.map((p, i) => (
                <div key={i} style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 12,
                  background: i === phaseIdx ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${i === phaseIdx ? pat.colors[i] + "66" : "rgba(255,255,255,0.06)"}`,
                  color: i === phaseIdx ? "#e2e8f0" : "#64748b",
                  transition: "all 0.3s",
                }}>
                  {p} <span style={{ color: pat.colors[i], fontSize: 10 }}>{pat.durations[i]}s</span>
                </div>
              ))}
            </div>
            <div style={styles.tipBox}>
              <div style={styles.tipLabel}>Tip</div>
              <div style={styles.tipText}>{tip}</div>
            </div>
          </div>
        )}

        {/* ── Ground panel ── */}
        {tab === "ground" && (
          <div style={styles.panel}>
            {GROUND.map((g, i) => {
              const done = groundComplete(i);
              const isCurrent = firstIncomplete === i;
              return (
                <div key={i} style={{
                  ...styles.groundStep,
                  ...(done ? styles.groundDone : {}),
                  ...(isCurrent ? { borderColor: g.color + "44", background: g.color + "08" } : {}),
                }}>
                  <div style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{g.emoji}</div>
                  <div>
                    <div style={{ fontSize: 12, color: g.color, fontWeight: 500, marginBottom: 3, letterSpacing: "0.3px" }}>
                      {g.n} {g.sense}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                      Name {g.n} {g.sense} around you right now.
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                      {Array.from({ length: g.n }).map((_, k) => {
                        const checked = !!(groundChecks[i]?.[k]);
                        return (
                          <div key={k} onClick={() => toggleCheck(i, k)} style={{
                            width: 24, height: 24, borderRadius: 6, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, transition: "all 0.2s",
                            background: checked ? g.color + "22" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${checked ? g.color + "88" : "rgba(255,255,255,0.1)"}`,
                            color: checked ? g.color : "transparent",
                          }}>✓</div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Affirm panel ── */}
        {tab === "affirm" && (
          <div style={styles.panel}>
            <div style={styles.affirmCard}>
              <div style={styles.affirmText}>"{AFFIRMATIONS[affirmIdx]}"</div>
              <div style={{ display: "flex", gap: 5, justifyContent: "center", margin: "16px 0 10px" }}>
                {AFFIRMATIONS.map((_, i) => (
                  <div key={i} onClick={() => setAffirmIdx(i)} style={{
                    height: 5, borderRadius: 999, cursor: "pointer", transition: "all 0.3s",
                    width: i === affirmIdx ? 14 : 5,
                    background: i === affirmIdx ? "#2dd4bf" : "rgba(255,255,255,0.15)",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[["← Prev", () => setAffirmIdx(i => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length)],
                  ["Next →", () => setAffirmIdx(i => (i + 1) % AFFIRMATIONS.length)]].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={styles.affirmNav}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button style={styles.stopBtn} onClick={stopSOS}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}>
          ✕ End Session
        </button>
      </div>
    </div>
  );
  
}

// ─── Aurora background ────────────────────────────────────────────────────────
function Aurora() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes adrift1 { to { transform: translate(40px, 30px) } }
        @keyframes adrift2 { to { transform: translate(-30px,-20px) } }
        @keyframes adrift3 { to { transform: translate(-20px, 40px) } }
      `}</style>
      {[
        { bg:"#2dd4bf", style:{ top:-100,left:-100,width:400,height:400,animation:"adrift1 12s ease-in-out infinite alternate" } },
        { bg:"#7c3aed", style:{ bottom:-80,right:-80,width:300,height:300,animation:"adrift2 10s ease-in-out infinite alternate" } },
        { bg:"#1d4ed8", style:{ top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:250,height:250,animation:"adrift3 8s ease-in-out infinite alternate" } },
      ].map((a, i) => (
        <div key={i} style={{ position:"absolute", borderRadius:"50%", filter:"blur(80px)", opacity:0.12, background:a.bg, ...a.style }} />
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0a1628, #030a1a)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
  },
  land: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center",
  },
  heading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 30, fontWeight: 400, color: "#e2e8f0", letterSpacing: "-0.5px",
  },
  sub: { fontSize: 14, color: "#475569", fontWeight: 300, lineHeight: 1.7, marginTop: 8 },
  patLabel: { fontSize: 11, color: "#334155", textAlign: "center", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" },
  patRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  patBtn: {
    padding: "7px 16px", borderRadius: 999, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer", transition: "all 0.2s", border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)", color: "#94a3b8", letterSpacing: "0.3px",
  },
  patBtnActive: {
    background: "rgba(45,212,191,0.15)", borderColor: "rgba(45,212,191,0.4)", color: "#2dd4bf",
  },
  sosBtn: {
    background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "white",
    padding: "14px 36px", borderRadius: 14, fontSize: 16,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500, border: "none",
    cursor: "pointer", letterSpacing: "0.5px", transition: "all 0.2s",
    boxShadow: "0 0 30px rgba(239,68,68,0.3)",
  },
  activeWrap: {
    position: "relative", zIndex: 1, width: 380,
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "30px 20px", minHeight: "100vh",
  },
  sessionBar: { display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 24 },
  sessionItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  sessionVal: { fontSize: 18, color: "#94a3b8", fontWeight: 500, fontVariantNumeric: "tabular-nums" },
  sessionLabel: { fontSize: 11, color: "#334155" },
  orbWrap: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 200, height: 200 },
  orbRing: { position: "absolute", top: 0, left: 0 },
  orb: { width: 100, height: 100, borderRadius: "50%", transition: "transform 0.05s linear, background 0.4s, box-shadow 0.4s" },
  phaseLabel: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 15, marginTop: 12, letterSpacing: 2, fontStyle: "italic", height: 24, transition: "color 0.4s",
  },
  tabs: {
    display: "flex", gap: 4, background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 4,
    marginTop: 22, width: "100%",
  },
  tab: {
    flex: 1, padding: "8px 4px", borderRadius: 7, fontSize: 12,
    fontFamily: "'DM Sans', sans-serif", border: "none",
    background: "transparent", color: "#475569", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.3px",
  },
  tabActive: { background: "rgba(255,255,255,0.07)", color: "#e2e8f0" },
  panel: { width: "100%", marginTop: 16, minHeight: 180 },
  tipBox: {
    marginTop: 16, padding: 14, borderRadius: 12,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
  },
  tipLabel: { fontSize: 10, color: "#334155", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
  tipText: { fontSize: 13, color: "#64748b", lineHeight: 1.6 },
  groundStep: {
    display: "flex", alignItems: "flex-start", gap: 12, padding: 12,
    borderRadius: 10, background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8,
    transition: "all 0.3s",
  },
  groundDone: { opacity: 0.45 },
  affirmCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "24px 20px", textAlign: "center",
  },
  affirmText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 17, color: "#e2e8f0", lineHeight: 1.7, fontWeight: 400, fontStyle: "italic",
  },
  affirmNav: {
    padding: "5px 16px", fontSize: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#64748b", cursor: "pointer", transition: "all 0.2s",
  },
  stopBtn: {
    marginTop: 20, padding: "9px 24px", borderRadius: 10,
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171", cursor: "pointer", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  },
};