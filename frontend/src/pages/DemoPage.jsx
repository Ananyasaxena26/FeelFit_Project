import { useState, useEffect } from "react";

function DemoPage() {
  const [mood, setMood] = useState("happy");
  const [podcasts, setPodcasts] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/smart-podcasts?mood=${mood}`)
      .then(res => res.json())
      .then(d => setPodcasts(d.podcasts));

    fetch(`http://127.0.0.1:5000/smart-recommendations?mood=${mood}`)
      .then(res => res.json())
      .then(setData);
  }, [mood]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #0f172a, #020617)",
      color: "white",
      padding: "30px"
    }}>
      <h1>🎭 Demo Mode</h1>
      <p style={{ color: "#64748b" }}>
        Simulate different moods
      </p>

      {/* Mood Buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {["happy", "sad", "stress", "normal"].map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: mood === m ? "#4ade80" : "#111",
              color: "white",
              cursor: "pointer"
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {data && (
        <div style={{ marginTop: "30px" }}>
          <h2>🧠 Recommendations</h2>
          <p>{data.activity}</p>
          <p>{data.quote}</p>
        </div>
      )}

      {/* Podcasts */}
      <div style={{ marginTop: "30px" }}>
        <h2>🎧 Podcasts</h2>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          {podcasts.map((p, i) => (
            <div key={i} style={{
              width: "200px",
              background: "#111",
              padding: "10px",
              borderRadius: "10px"
            }}>
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", borderRadius: "10px" }}
              />
              <h4>{p.name}</h4>
              <a href={p.url} target="_blank" rel="noreferrer">
                Listen 🎧
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DemoPage;