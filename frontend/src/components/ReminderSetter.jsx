import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rm-root {
    min-height: 100vh;
    background: #06060a;
    background-image:
      radial-gradient(ellipse 55% 30% at 50% 0%, rgba(139,92,246,0.09) 0%, transparent 65%),
      radial-gradient(ellipse 30% 20% at 90% 90%, rgba(236,72,153,0.05) 0%, transparent 60%);
    padding: 40px 28px 72px;
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
  }

  .rm-header { margin-bottom: 36px; }

  .rm-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #a78bfa;
    margin-bottom: 10px;
  }

  .rm-eyebrow-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #a78bfa;
    animation: rm-blink 2.5s ease-in-out infinite;
  }

  @keyframes rm-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.25; }
  }

  .rm-title {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #f8fafc;
    line-height: 1.15;
  }

  .rm-subtitle { font-size: 14px; color: #334155; margin-top: 6px; }

  .rm-form-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 32px;
    animation: rm-fadeUp 0.4s ease forwards;
    opacity: 0;
  }

  @keyframes rm-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rm-field { margin-bottom: 14px; }

  .rm-field-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 7px;
    display: block;
  }

  .rm-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
  }

  .rm-input::placeholder { color: #334155; }
  .rm-input:focus { border-color: rgba(167,139,250,0.4); background: rgba(255,255,255,0.06); }
  .rm-input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }

  .rm-btn-row { display: flex; gap: 10px; margin-top: 18px; }

  .rm-btn-primary {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    gap: 8px;
    background: #7c3aed;
    border: none;
    border-radius: 12px;
    padding: 13px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease;
  }

  .rm-btn-primary:hover  { background: #6d28d9; transform: translateY(-1px); }
  .rm-btn-primary:active { transform: scale(0.98); }

  .rm-btn-secondary {
    display: flex; align-items: center; justify-content: center;
    gap: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 13px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .rm-btn-secondary:hover { background: rgba(255,255,255,0.07); color: #94a3b8; border-color: rgba(255,255,255,0.13); }

  .rm-toast {
    display: flex; align-items: center; gap: 10px;
    margin-top: 14px; padding: 10px 14px;
    border-radius: 10px; font-size: 13px; font-weight: 500;
    animation: rm-fadeUp 0.3s ease forwards;
  }

  .rm-toast-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; }
  .rm-toast-error   { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); color: #f87171; }

  .rm-list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .rm-list-title  { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #94a3b8; }

  .rm-count-badge {
    font-size: 11px; font-weight: 600;
    background: rgba(167,139,250,0.12);
    color: #a78bfa;
    border: 1px solid rgba(167,139,250,0.2);
    padding: 3px 10px; border-radius: 100px;
  }

  .rm-list { display: flex; flex-direction: column; gap: 10px; }

  .rm-item {
    display: flex; align-items: center; gap: 14px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 14px 16px;
    animation: rm-fadeUp 0.4s ease forwards;
    opacity: 0;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .rm-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }

  .rm-item:nth-child(1) { animation-delay: 0.05s; }
  .rm-item:nth-child(2) { animation-delay: 0.10s; }
  .rm-item:nth-child(3) { animation-delay: 0.15s; }
  .rm-item:nth-child(4) { animation-delay: 0.20s; }
  .rm-item:nth-child(5) { animation-delay: 0.25s; }

  .rm-time-block {
    display: flex; flex-direction: column; align-items: center;
    background: rgba(167,139,250,0.08);
    border: 1px solid rgba(167,139,250,0.15);
    border-radius: 10px;
    padding: 8px 12px;
    min-width: 62px; flex-shrink: 0;
  }

  .rm-time-val   { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #a78bfa; line-height: 1; letter-spacing: -0.01em; }
  .rm-time-label { font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #4c1d95; margin-top: 3px; font-weight: 500; }

  .rm-item-body { flex: 1; min-width: 0; }
  .rm-item-msg  { font-size: 14px; font-weight: 500; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rm-item-sub  { font-size: 12px; color: #334155; margin-top: 2px; }

  .rm-delete-btn {
    background: rgba(248,113,113,0.07);
    border: 1px solid rgba(248,113,113,0.12);
    border-radius: 8px;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    color: #f87171;
    font-size: 13px; line-height: 1;
  }

  .rm-delete-btn:hover { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.25); transform: scale(1.08); }

  .rm-empty {
    text-align: center; padding: 40px 20px;
    color: #1e293b; font-size: 14px;
    border: 1px dashed rgba(255,255,255,0.05);
    border-radius: 14px;
  }

  .rm-empty-icon { font-size: 28px; margin-bottom: 10px; display: block; opacity: 0.4; }

  .rm-alarm-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 20px;
    animation: rm-fadeUp 0.3s ease forwards;
  }

  .rm-alarm-info  { flex: 1; }
  .rm-alarm-title { font-size: 13px; font-weight: 600; color: #fbbf24; margin-bottom: 2px; }
  .rm-alarm-msg   { font-size: 12px; color: #78350f; }

  .rm-stop-btn {
    background: #fbbf24; border: none;
    border-radius: 8px; padding: 8px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    color: #000; cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;
  }

  .rm-stop-btn:hover { background: #f59e0b; }
`;

const formatAmPm = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

export default function ReminderSetter() {
  const [time, setTime]       = useState("08:00");
  const [message, setMessage] = useState("Take Thyroid Tablet 💊");
  const [reminders, setReminders] = useState([]);
  const [toast, setToast]     = useState(null);
  const [ringing, setRinging] = useState(null);

  const alarmRef     = useRef(new Audio("/alarm.mp3"));
  const triggeredRef = useRef({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get-reminders")
      .then(res => res.json())
      .then(setReminders)
      .catch(() => showToast("Could not load reminders", "error"));
  }, []);

  const handleSubmit = async () => {
    unlockAudio();
    try {
      const response = await fetch("http://127.0.0.1:5000/set-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, time }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        showToast(result.error || "Connect Google Calendar first", "error");
        return;
      }

      const updated = await fetch("http://127.0.0.1:5000/get-reminders");
      setReminders(await updated.json());
      showToast("Reminder added to Google Calendar");
    } catch {
      showToast("Backend not reachable", "error");
    }
  };

  const deleteReminder = async (t) => {
    try {
      await fetch("http://127.0.0.1:5000/delete-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: t }),
      });
      const updated = await fetch("http://127.0.0.1:5000/get-reminders");
      setReminders(await updated.json());
      showToast("Reminder removed");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  useEffect(() => {
    const tick = () => {
      const cur = new Date().toTimeString().slice(0, 5);
      reminders.forEach((r, i) => {
        const key = r.time + i;
        if (r.time === cur && !triggeredRef.current[key]) {
          triggeredRef.current[key] = true;
          setRinging(r);
          alarmRef.current.loop = true;
          alarmRef.current.play().catch(() => {});
        }
      });
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [reminders]);

  const unlockAudio = () => {
    const a = alarmRef.current;
    a.volume = 0;
    a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = 1; }).catch(() => {});
  };

  const stopAlarm = () => {
    alarmRef.current.pause();
    alarmRef.current.currentTime = 0;
    setRinging(null);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rm-root">

        <div className="rm-header">
          <div className="rm-eyebrow"><span className="rm-eyebrow-dot" /> Smart Reminders</div>
          <h1 className="rm-title">Never miss<br />a moment.</h1>
          <p className="rm-subtitle">Schedule reminders — we'll alert you right on time.</p>
        </div>

        {ringing && (
          <div className="rm-alarm-banner">
            <div className="rm-alarm-info">
              <p className="rm-alarm-title">⏰ Reminder triggered — {formatAmPm(ringing.time)}</p>
              <p className="rm-alarm-msg">{ringing.message}</p>
            </div>
            <button className="rm-stop-btn" onClick={stopAlarm}>Stop alarm</button>
          </div>
        )}

        <div className="rm-form-card">
          <div className="rm-field">
            <label className="rm-field-label">Reminder message</label>
            <input className="rm-input" type="text" value={message} placeholder="e.g. Take Thyroid Tablet 💊" onChange={e => setMessage(e.target.value)} />
          </div>
          <div className="rm-field">
            <label className="rm-field-label">Time</label>
            <input className="rm-input" type="time" value={time} onChange={e => setTime(e.target.value)} onClick={e => e.target.showPicker?.()} />
          </div>
          <div className="rm-btn-row">
            <button className="rm-btn-primary" onClick={handleSubmit}>+ Add Reminder</button>
            <button className="rm-btn-secondary" onClick={stopAlarm}>◼ Stop Alarm</button>
          </div>
          {toast && (
            <div className={`rm-toast ${toast.type === "error" ? "rm-toast-error" : "rm-toast-success"}`}>
              {toast.type === "error" ? "✕" : "✓"} {toast.msg}
            </div>
          )}
        </div>

        <div className="rm-list-header">
          <span className="rm-list-title">Scheduled</span>
          {reminders.length > 0 && <span className="rm-count-badge">{reminders.length} active</span>}
        </div>

        <div className="rm-list">
          {reminders.length === 0 ? (
            <div className="rm-empty">
              <span className="rm-empty-icon">🔔</span>
              No reminders yet — add one above.
            </div>
          ) : (
            reminders.map((r, i) => (
              <div className="rm-item" key={i}>
                <div className="rm-time-block">
                  <span className="rm-time-val">{formatAmPm(r.time).split(" ")[0]}</span>
                  <span className="rm-time-label">{formatAmPm(r.time).split(" ")[1]}</span>
                </div>
                <div className="rm-item-body">
                  <p className="rm-item-msg">{r.message}</p>
                  <p className="rm-item-sub">Fires at {formatAmPm(r.time)} daily</p>
                </div>
                <button className="rm-delete-btn" onClick={() => deleteReminder(r.time)}>✕</button>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}
