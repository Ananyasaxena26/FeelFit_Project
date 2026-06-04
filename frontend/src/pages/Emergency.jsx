import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

function Emergency() {
  const [emailStatus, setEmailStatus] = useState("sending");
  const emailRequestStartedRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (emailRequestStartedRef.current) return;

    emailRequestStartedRef.current = true;

    async function sendEmergencyEmail() {
      try {
        const response = await fetch("http://127.0.0.1:5000/send-emergency-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            source: "live-heart-rate",
            heart_rate: location.state?.heart_rate,
            stress: location.state?.stress,
            status: location.state?.status,
            triggered_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setEmailStatus(errorData.status === "not_configured" ? "not_configured" : "error");
          return;
        }

        setEmailStatus("sent");
      } catch (error) {
        console.error("Emergency email failed:", error);
        setEmailStatus("error");
      }
    }

    sendEmergencyEmail();
  }, [location.state]);

  const emailMessage = {
    sending: "Sending emergency email to friends/family...",
    sent: "Email sent to friends/family.",
    not_configured: "Emergency email is not configured yet.",
    error: "Emergency email could not be sent. Please call for help now."
  }[emailStatus];

  return (
    <div
      style={{
        color: "white",
        maxWidth: "520px",
        padding: "28px",
        borderRadius: "14px",
        background: "rgba(239,68,68,0.14)",
        border: "1px solid rgba(239,68,68,0.45)",
        boxShadow: "0 0 40px rgba(0,0,0,0.5)"
      }}
    >
      <h1 style={{ margin: "0 0 12px", fontSize: "30px" }}>
        Emergency Alert
      </h1>

      <p style={{ color: "#fecaca", lineHeight: "1.6", margin: 0 }}>
        Your heart rate stayed above the emergency threshold. Please sit down,
        breathe slowly, and contact help if you feel chest pain, dizziness, or
        severe discomfort.
      </p>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "10px",
          background: emailStatus === "sent" ? "rgba(34,197,94,0.16)" : "rgba(255,255,255,0.08)",
          border: emailStatus === "sent" ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(255,255,255,0.12)",
          color: emailStatus === "sent" ? "#bbf7d0" : "#fee2e2",
          fontWeight: "700"
        }}
      >
        {emailMessage}
      </div>

      <button
        onClick={() => window.location.href = "tel:112"}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#ef4444",
          color: "white",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        CALL EMERGENCY
      </button>
    </div>
  );
}

export default Emergency;
