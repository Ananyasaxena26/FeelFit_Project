import { useEffect, useState } from "react";

function GamePage() {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);

  // 🎯 create bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 90,
          y: Math.random() * 80
        }
      ]);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  // ⏱ timer
  useEffect(() => {
    if (time <= 0) return;

    const timer = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(timer);
  }, [time]);

  // 💥 pop bubble
  const popBubble = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((prev) => prev + 1);

    // 🔊 sound
    const sound = new Audio("/pop.mp3");
    sound.play().catch(() => {});
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0f172a, #020617)",
        color: "white",
        padding: "30px",
        fontFamily: "sans-serif"
      }}
    >
      {/* 🎮 Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>
          🎮 Bubble Pop
        </h1>
        <p style={{ color: "#64748b" }}>
          Relax and pop the bubbles ✨
        </p>
      </div>

      {/* 🧊 Glass Card */}
      <div
        style={{
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 0 40px rgba(0,0,0,0.5)"
        }}
      >
        {/* 📊 Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px"
          }}
        >
          <h3>
            Score: <span style={{ color: "#4ade80" }}>{score}</span>
          </h3>
          <h3>
            Time: <span style={{ color: "#38bdf8" }}>{time}s</span>
          </h3>
        </div>

        {/* 🎯 Game Area */}
        <div
          style={{
            position: "relative",
            height: "400px",
            borderRadius: "12px",
            overflow: "hidden",
            background:
              "radial-gradient(circle at center, #020617, #000)"
          }}
        >
          {bubbles.map((b) => {
            const colors = ["#4ade80", "#38bdf8", "#f472b6"];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)];

            return (
              <div
                key={b.id}
                onClick={() => popBubble(b.id)}
                style={{
                  position: "absolute",
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  cursor: "pointer",

                  // 🎨 dynamic color
                  background: `radial-gradient(circle, ${randomColor}, #000)`,

                  // ✨ glow
                  boxShadow: `0 0 20px ${randomColor}`,

                  transition: "transform 0.15s ease",
                  animation: "float 3s infinite ease-in-out"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />
            );
          })}
        </div>

        {/* ⏱ Game Over */}
        {time === 0 && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "center"
            }}
          >
            <h2 style={{ color: "#f87171" }}>⏱ Game Over!</h2>
            <p style={{ color: "#94a3b8" }}>
              Final Score: {score}
            </p>
          </div>
        )}
      </div>

      {/* ✨ Animation */}
      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        `}
      </style>
    </div>
  );
}

export default GamePage;