import { useEffect, useState } from "react";

function SmartRecommendations() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/smart-recommendations")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p>Loading recommendations...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🌟 Smart Recommendations</h2>

      <div style={{
        background: "#111",
        padding: "20px",
        borderRadius: "12px",
        color: "white",
        maxWidth: "500px"
      }}>

        <img
          src={data.image}
          alt="mood"
          style={{ width: "100%", borderRadius: "10px" }}
        />

        <h3 style={{ marginTop: "15px" }}>
          Mood: {data.mood}
        </h3>

        <p>🎯 Activity: {data.activity}</p>

        <p style={{ marginTop: "10px", fontStyle: "italic" }}>
          “{data.quote}”
        </p>

        <p style={{ textAlign: "right" }}>
          - {data.author}
        </p>
      </div>
    </div>
  );
}

export default SmartRecommendations;