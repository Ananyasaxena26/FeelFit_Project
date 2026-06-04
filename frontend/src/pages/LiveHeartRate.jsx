import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function LiveHeartRate() {
  const [hrData, setHrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyCountdown, setEmergencyCountdown] = useState(null);
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);
  const sosPromptShownRef = useRef(false);
  const emergencyActiveRef = useRef(false);
  const emergencyTimerRef = useRef(null);
  const latestReadingRef = useRef(null);

  const navigate = useNavigate();

  const stopEmergencyCountdown = useCallback(() => {
    if (emergencyTimerRef.current) {
      clearInterval(emergencyTimerRef.current);
      emergencyTimerRef.current = null;
    }

    emergencyActiveRef.current = false;
    setEmergencyCountdown(null);
  }, []);

  const acknowledgeEmergency = useCallback(() => {
    stopEmergencyCountdown();
    setEmergencyAcknowledged(true);
  }, [stopEmergencyCountdown]);

  const startEmergencyCountdown = useCallback(() => {
    if (emergencyActiveRef.current) return;

    emergencyActiveRef.current = true;
    setEmergencyCountdown(45);

    emergencyTimerRef.current = setInterval(() => {
      setEmergencyCountdown((secondsLeft) => {
        if (secondsLeft <= 1) {
          clearInterval(emergencyTimerRef.current);
          emergencyTimerRef.current = null;
          emergencyActiveRef.current = false;
          navigate("/emergency", { state: latestReadingRef.current });
          return null;
        }

        return secondsLeft - 1;
      });
    }, 1000);
  }, [navigate]);

  const fetchHR = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/live-hr", { cache: "no-store" });
      const data = await res.json();
      console.log("LIVE HR", data);

      setHrData(data);
      latestReadingRef.current = {
        heart_rate: data?.heart_rate,
        status: data?.status
      };

      const currentHeartRate = Number(data?.heart_rate);

      if (currentHeartRate > 100) {
        if (!emergencyAcknowledged) {
          startEmergencyCountdown();
        }
        return;
      }

      stopEmergencyCountdown();
      setEmergencyAcknowledged(false);

      const shouldOfferSOS = currentHeartRate >= 95 && currentHeartRate <= 100;

      if (shouldOfferSOS && !sosPromptShownRef.current) {
        sosPromptShownRef.current = true;
        const wantsSOS = window.confirm(
          `Your current heart rate is ${currentHeartRate} BPM. Do you want to try SOS mode?`
        );

        if (wantsSOS) {
          navigate("/sos");
        }
      }

      if (!shouldOfferSOS) {
        sosPromptShownRef.current = false;
      }
    } catch (err) {
      console.error("Error fetching HR:", err);
    } finally {
      setLoading(false);
    }
  }, [emergencyAcknowledged, navigate, startEmergencyCountdown, stopEmergencyCountdown]);

  useEffect(() => {
    fetchHR();
  }, [fetchHR]);

  useEffect(() => {
    const interval = setInterval(fetchHR, 60000);
    return () => clearInterval(interval);
  }, [fetchHR]);

  useEffect(() => {
    return () => {
      if (emergencyTimerRef.current) {
        clearInterval(emergencyTimerRef.current);
      }
    };
  }, []);

  const getColor = () => {
    if (!hrData) return "#64748b";

    if (hrData.status === "critical") return "#ef4444";
    if (hrData.status === "high") return "#f59e0b";
    return "#4ade80";
  };

  const isEmergencyHeartRate = Number(hrData?.heart_rate) > 100;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "25px",
        color: "white",
        maxWidth: "400px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 40px rgba(0,0,0,0.6)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
          Live Heart Rate
        </h2>

        <button
          onClick={fetchHR}
          style={{
            padding: "6px 10px",
            fontSize: "12px",
            borderRadius: "8px",
            border: "none",
            background: "#0ea5e9",
            color: "white",
            cursor: "pointer"
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ marginTop: "20px", color: "#94a3b8" }}>
          Loading heart rate...
        </p>
      ) : (
        <>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              marginTop: "15px",
              color: getColor()
            }}
          >
            {hrData?.heart_rate ?? "--"} BPM
          </h1>

          <p style={{ color: "#64748b", marginTop: "5px" }}>
            Latest sample: {hrData?.time ?? "--"}
          </p>

          <p style={{ marginTop: "10px", color: getColor() }}>
            {hrData?.message || "Normal heart rate"}
          </p>

          {isEmergencyHeartRate && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.18)",
                border: "1px solid rgba(239,68,68,0.45)"
              }}
            >
              <p style={{ margin: "0 0 10px", color: "#fecaca", fontWeight: "600" }}>
                Heart rate is above 100 BPM. Please confirm you are okay.
              </p>

              {emergencyCountdown !== null ? (
                <>
                  <p style={{ margin: "0 0 12px", color: "#fee2e2" }}>
                    Emergency redirect in {emergencyCountdown}s.
                  </p>

                  <button
                    onClick={acknowledgeEmergency}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#22c55e",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    I am OK - stop emergency
                  </button>
                </>
              ) : (
                <p style={{ margin: 0, color: "#fee2e2" }}>
                  Emergency redirect stopped. Heart rate warning is still active.
                </p>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "10px",
              background:
                hrData?.status === "critical"
                  ? "rgba(239,68,68,0.15)"
                  : hrData?.status === "high"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(74,222,128,0.15)"
            }}
          >
            Status: <b>{hrData?.status || "normal"}</b>
          </div>
        </>
      )}
    </div>
  );
}

export default LiveHeartRate;
