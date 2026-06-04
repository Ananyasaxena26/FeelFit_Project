import { useEffect, useState } from "react";

function MotivationBox() {
  const [quote, setQuote] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/motivation")
      .then(res => res.json())
      .then(data => setQuote(data.quote))
      .catch(() => setQuote("Stay strong 💪"));
  }, []);

  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      background: "linear-gradient(135deg, #0f172a, #1e293b)",  // 🔥 gradient
      color: "#e2e8f0",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
      maxWidth: "500px"
    }}>
      <h3 style={{
        marginBottom: "10px",
        color: "#38bdf8",
        letterSpacing: "1px"
      }}>
        🌙 Daily Motivation
      </h3>

      <p style={{
        fontStyle: "italic",
        fontSize: "16px",
        lineHeight: "1.6",
        color: "#cbd5f5"
      }}>
        {quote}
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "15px",
          padding: "8px 14px",
          background: "#38bdf8",
          border: "none",
          borderRadius: "8px",
          color: "#0f172a",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        🔄 New Quote
      </button>
    </div>
  );
}

export default MotivationBox;