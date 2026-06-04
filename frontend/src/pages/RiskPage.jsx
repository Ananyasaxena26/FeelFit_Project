import { useEffect, useState } from "react";

function RiskPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/risk-alerts")
      .then(res => res.json())
      .then(data => setAlerts(data.alerts));
  }, []);

  return (
    <div style={{
      marginTop: "20px",
      background: "#1a1a1a",
      padding: "20px",
      borderRadius: "10px"
    }}>
      <h2>🚨 Risk Detection</h2>

      {alerts.map((alert, i) => (
        <p key={i} style={{ margin: "8px 0" }}>
          {alert}
        </p>
      ))}
    </div>
  );
}

export default RiskPage;