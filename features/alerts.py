import pandas as pd
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def get_alerts():

    try:
        df = pd.read_csv(os.path.join(BASE_DIR, "data", "daily_data.csv"))
        row = df.tail(1).iloc[0]
    except Exception:
        return ["No data available"]

    alerts = []

    # --- SAFE VALUE EXTRACTION ---
    resting = row.get("resting_hr", 60)
    avg_hr = row.get("avg_hr_day", 0)
    hr_std = row.get("hr_std_day", 0)
    steps = row.get("total_steps", 0)
    sleep = row.get("sleep_hours", 0)

    # ------------------------------------------------
    # HEART RATE ALERTS
    # ------------------------------------------------
    if avg_hr > resting + 20:
        alerts.append("Heart rate significantly elevated")

    elif avg_hr > resting + 10:
        alerts.append("Slightly elevated heart rate")

    if hr_std > 15:
        alerts.append("Irregular heart rate pattern detected")

    # ------------------------------------------------
    # ACTIVITY ALERT
    # ------------------------------------------------
    if steps < 1500:
        alerts.append("Very low activity detected today")

    elif steps < 3000:
        alerts.append("Low activity level today")

    # ------------------------------------------------
    # SLEEP ALERT
    # ------------------------------------------------
    if sleep < 4:
        alerts.append("Very low sleep detected")

    elif sleep < 5:
        alerts.append("Sleep slightly below recommended")

    # ------------------------------------------------
    # DEFAULT STATE
    # ------------------------------------------------
    if not alerts:
        alerts.append("All health indicators normal")

    return alerts[:3]