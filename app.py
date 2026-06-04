import sys
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
import pandas as pd
from datetime import datetime
from flask import Flask, jsonify, request, redirect

from flask import session
import numpy as np
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import google.oauth2.credentials
from datetime import datetime
import json
import requests
import base64
import requests
from features.predict_day import predict_day
import csv
from collections import defaultdict
from datetime import datetime
from uuid import uuid4
import threading
import smtplib
from email.message import EmailMessage
import pandas as pd
import os
from flask import request, redirect, jsonify
import requests
import base64
import json
from config import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPES, FITBIT_TOKEN_FILE, LISTEN_API_KEY
from urllib.parse import urlencode
from features.predict_day import predict_day
from features.alerts import get_alerts





# --------------------------------------------------
# HEART RATE METRICS
# --------------------------------------------------

from flask_cors import CORS

app = Flask(__name__)


CORS(app, origins=["http://localhost:3000"])


# ✅ MOVE HERE (VERY IMPORTANT)

def calculate_hrv(row):
    """
    Estimate HRV using daily HR standard deviation
    """
    hr_std = row.get("hr_std_day", 0)

    # simple wearable approximation
    hrv = hr_std * 10

    return round(hrv, 2)


def heart_rate_deviation(row):
    """
    Difference between average heart rate and resting HR
    """
    avg_hr = row.get("avg_hr_day", 0)
    resting_hr = row.get("resting_hr", 60)

    return round(avg_hr - resting_hr, 2)


def heart_rate_trend(df):
    """
    Compute average HR trend across dataset
    """
    if "avg_hr_day" not in df.columns:
        return None

    return df["avg_hr_day"].rolling(7).mean()



# --------------------------------------------------
# CARDIO FITNESS
# --------------------------------------------------

def estimate_vo2_max(row):
    """
    VO2 max estimation using resting HR
    """
    resting_hr = row.get("resting_hr", 60)

    vo2 = 15 * (220 / resting_hr)

    return round(vo2, 2)


# --------------------------------------------------
# ACTIVITY METRICS
# --------------------------------------------------

def estimate_distance(row):
    """
    Distance estimation using step count
    average stride ≈ 0.78 meters
    """
    steps = row.get("total_steps", 0)

    distance_km = steps * 0.78 / 1000

    return round(distance_km, 2)


def estimate_calories(row):
    """
    Basic calorie estimation using steps and HR
    """
    steps = row.get("total_steps", 0)
    avg_hr = row.get("avg_hr_day", 70)

    calories = (steps * 0.04) + (avg_hr * 0.1)

    return round(calories, 2)


def activity_level(row):
    """
    Classify daily activity level
    """
    steps = row.get("total_steps", 0)

    if steps < 2000:
        return "Very Low"

    elif steps < 5000:
        return "Low"

    elif steps < 8000:
        return "Moderate"

    elif steps < 12000:
        return "Active"

    else:
        return "Very Active"


# --------------------------------------------------
# SLEEP METRICS
# --------------------------------------------------

def sleep_efficiency(row):
    """
    Sleep efficiency based on sleep deficit
    """
    sleep_hours = row.get("sleep_hours", 0)
    deficit = row.get("sleep_deficit", 0)

    sleep_minutes = sleep_hours * 60

    if sleep_minutes == 0:
        return 0

    efficiency = (sleep_minutes - deficit) / sleep_minutes

    return round(efficiency, 2)



def hydration_reminder(row):
    steps = row["total_steps"]
    hr = row["avg_hr_day"]

    if steps > 8000 or hr > 90:
        return "High activity detected. Drink water to stay hydrated."
    elif steps > 4000:
        return "Moderate activity today. Keep drinking water regularly."
    else:
        return "Low activity, but hydration is still important."

def sleep_quality(row):
    """
    Sleep quality score based on deep + REM sleep
    """
    sleep = row.get("sleep_hours", 0)
    deep = row.get("deep_ratio", 0)
    rem = row.get("rem_ratio", 0)

    score = (sleep * 10) + (deep * 40) + (rem * 40)

    return round(score, 2)

def sleep_advice(row):
    sleep = row["sleep_hours"]
    deficit = row["sleep_deficit"]

    if sleep < 5:
        return "Sleep is very low. Prioritize recovery tonight."
    elif deficit > 90:
        return "Sleep debt detected. Try going to bed earlier."
    elif sleep >= 7:
        return "Good sleep duration. Maintain this schedule."
    else:
        return "Sleep is moderate. Aim for 7–8 hours."


# --------------------------------------------------
# STRESS METRIC
# --------------------------------------------------

def stress_indicator(row):
    """
    Estimate stress using HR deviation and variability
    """
    deviation = row.get("hr_deviation", 0)
    hr_std = row.get("hr_std_day", 1)

    stress = deviation / (hr_std + 1)

    return round(stress, 3)


def recovery_score(row):
    sleep = row["sleep_hours"]
    stress = row["stress_index"]
    hr = row["avg_hr_day"]
    resting = row["resting_hr"]

    score = 100

    score -= max(0, (7 - sleep) * 10)
    score -= stress * 100 * 0.3
    score -= max(0, hr - resting) * 0.5

    score = max(0, min(100, score))

    return round(score, 1)


# --------------------------------------------------
# ACTIVITY LOAD
# --------------------------------------------------

def activity_load_score(row):
    """
    Activity load normalization
    """
    load = row.get("activity_load", 0)

    return round(load, 2)

def hr_fatigue(row):
    avg_hr = row["avg_hr_day"]
    resting = row["resting_hr"]

    if avg_hr > resting + 20:
        return "Heart rate elevated. Your body may be fatigued."
    elif avg_hr > resting + 10:
        return "Mild fatigue detected."
    else:
        return "Heart rate levels normal."

# ---------------- PATH SETUP ----------------
# ---------------- PATH SETUP ----------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FEATURES_DIR = os.path.join(BASE_DIR, "features")

sys.path.append(FEATURES_DIR)

# feature imports


# ---------------- FLASK INIT ----------------
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "fitbit-dev-secret")
CORS(app, resources={r"/*": {"origins": "*"}})


def load_local_env():
    env_path = os.path.join(BASE_DIR, ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


load_local_env()


# -------- GOOGLE CONFIG --------
SCOPES = ['https://www.googleapis.com/auth/calendar']

flow = Flow.from_client_secrets_file(
    'client_secret.json',
    scopes=SCOPES,
    redirect_uri='http://localhost:5000/auth/google/callback'

)

google_tokens = {}

# ---------------- DATA ----------------
DATA_DIR = os.path.join(BASE_DIR, "data")

# ---------------- FITBIT CONFIG ----------------

FITBIT_TOKEN_FILE = os.path.join(BASE_DIR, "fitbit_token.json")

FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token"

# ✅ FIXED (DO NOT USE os.environ here)
REDIRECT_URI = "http://localhost:5000/callback"

FITBIT_SCOPES = "activity heartrate sleep profile"
LIVE_HR_CACHE_SECONDS = 60
LIVE_HR_CACHE = {"payload": None, "fetched_at": 0}


def fitbit_token_exists():
    return os.path.exists(FITBIT_TOKEN_FILE)


def save_fitbit_token(token_data):
    with open(FITBIT_TOKEN_FILE, "w") as f:
        json.dump(token_data, f, indent=4)

    return True


def load_fitbit_token():
    if not fitbit_token_exists():
        return None

    with open(FITBIT_TOKEN_FILE, "r") as f:
        return json.load(f)


def write_fitbit_token(token_data):
    with open(FITBIT_TOKEN_FILE, "w") as f:
        json.dump(token_data, f, indent=4)


def refresh_fitbit_token(token_data):
    refresh_token = token_data.get("refresh_token")

    if not refresh_token:
        return None

    basic_token = base64.b64encode(
        f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
    ).decode("utf-8")

    response = requests.post(
        FITBIT_TOKEN_URL,
        headers={
            "Authorization": f"Basic {basic_token}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        },
        timeout=15
    )

    if response.status_code != 200:
        return None

    refreshed = response.json()
    refreshed["created_at"] = datetime.now().isoformat()
    write_fitbit_token(refreshed)
    return refreshed


def fitbit_get(url, token_data):
    headers = {"Authorization": f"Bearer {token_data.get('access_token')}"}
    response = requests.get(url, headers=headers, timeout=20)

    if response.status_code != 401:
        return response

    refreshed = refresh_fitbit_token(token_data)
    if not refreshed:
        return response

    headers = {"Authorization": f"Bearer {refreshed.get('access_token')}"}
    return requests.get(url, headers=headers, timeout=20)


def fetch_data(url, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers, timeout=20)

    if response.status_code != 200:
        return {}

    return response.json()


def upsert_csv_row(file_path, header, date, row):
    rows = []

    if os.path.exists(file_path):
        with open(file_path, "r", newline="") as f:
            reader = csv.reader(f)
            existing_header = next(reader, None)
            if existing_header == header:
                rows = [r for r in reader if r and r[0] != date]

    with open(file_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
        writer.writerow(row)


def upsert_csv_rows(file_path, header, date, new_rows):
    rows = []

    if os.path.exists(file_path):
        with open(file_path, "r", newline="") as f:
            reader = csv.reader(f)
            existing_header = next(reader, None)
            if existing_header == header:
                rows = [r for r in reader if r and r[0] != date]

    with open(file_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
        writer.writerows(new_rows)


def fitbit_response_details(response):
    if not response.text:
        return {}

    try:
        return response.json()
    except ValueError:
        return {"raw": response.text}


def get_existing_sync_snapshot(date):
    snapshot = {}

    hourly_path = os.path.join(DATA_DIR, "hourly_data.csv")
    if os.path.exists(hourly_path):
        hourly = pd.read_csv(hourly_path)
        if "date" in hourly.columns:
            hourly_rows = hourly[hourly["date"].astype(str) == date]
            if not hourly_rows.empty:
                snapshot["hourly_rows"] = int(len(hourly_rows))

                if "steps" in hourly_rows.columns:
                    snapshot["total_steps"] = int(
                        pd.to_numeric(hourly_rows["steps"], errors="coerce").fillna(0).sum()
                    )

                if "avg_hr" in hourly_rows.columns:
                    avg_hr = pd.to_numeric(hourly_rows["avg_hr"], errors="coerce").dropna()
                    if not avg_hr.empty:
                        snapshot["avg_hr_day"] = round(float(avg_hr.mean()), 2)

    daily_path = os.path.join(DATA_DIR, "daily_data.csv")
    if os.path.exists(daily_path):
        daily = pd.read_csv(daily_path)
        if "date" in daily.columns:
            daily_rows = daily[daily["date"].astype(str) == date]
            if not daily_rows.empty:
                row = daily_rows.iloc[-1]
                snapshot["daily_row_found"] = True

                for key in ("resting_hr", "total_steps", "total_sleep"):
                    if key in daily_rows.columns and not pd.isna(row.get(key)):
                        snapshot[key] = int(row.get(key))

                for key in ("sleep_hours", "avg_hr_day", "hr_std_day", "stress_index", "activity_load"):
                    if key in daily_rows.columns and not pd.isna(row.get(key)):
                        snapshot[key] = float(row.get(key))

    return snapshot or None


def fitbit_fetch_error_response(name, response, date):
    payload = {
        "error": f"Fitbit {name} fetch failed",
        "status_code": response.status_code,
        "details": fitbit_response_details(response)
    }

    if response.status_code == 429:
        local_snapshot = get_existing_sync_snapshot(date)
        payload.update({
            "status": "rate_limited",
            "message": (
                "Fitbit API quota is exhausted right now. "
                "Try again later; using local CSV data if available."
            )
        })

        retry_after = response.headers.get("Retry-After")
        if retry_after:
            payload["retry_after_seconds"] = retry_after

        if local_snapshot:
            payload["source"] = "local_csv"
            payload["local_data"] = local_snapshot
            return jsonify(payload), 200

    return jsonify(payload), response.status_code


# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Backend running"


def get_emergency_email_config():
    recipients = [
        email.strip()
        for email in os.environ.get("EMERGENCY_CONTACT_EMAILS", "").split(",")
        if email.strip()
    ]

    return {
        "host": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.environ.get("SMTP_PORT", "587")),
        "username": os.environ.get("SMTP_USERNAME"),
        "password": os.environ.get("SMTP_PASSWORD"),
        "from_email": os.environ.get("SMTP_FROM_EMAIL") or os.environ.get("SMTP_USERNAME"),
        "recipients": recipients,
    }


def send_emergency_email(alert_data=None):
    alert_data = alert_data or {}
    config = get_emergency_email_config()

    missing = [
        key
        for key in ("username", "password", "from_email")
        if not config.get(key)
    ]

    if missing or not config["recipients"]:
        raise ValueError(
            "Emergency email is not configured. Set SMTP_USERNAME, SMTP_PASSWORD, "
            "SMTP_FROM_EMAIL, and EMERGENCY_CONTACT_EMAILS."
        )

    heart_rate = alert_data.get("heart_rate", "unknown")
    stress = alert_data.get("stress", "unknown")
    triggered_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    message = EmailMessage()
    message["Subject"] = "Emergency Health Alert"
    message["From"] = config["from_email"]
    message["To"] = ", ".join(config["recipients"])
    message.set_content(
        "Emergency alert from the health monitoring app.\n\n"
        f"Triggered at: {triggered_at}\n"
        f"Heart rate: {heart_rate}\n"
        f"Stress level: {stress}\n\n"
        "The user was redirected to the Emergency page after elevated heart rate detection. "
        "Please check on them as soon as possible."
    )

    smtp_class = smtplib.SMTP_SSL if config["port"] == 465 else smtplib.SMTP

    with smtp_class(config["host"], config["port"], timeout=20) as smtp:
        if config["port"] != 465:
            smtp.starttls()
        smtp.login(config["username"], config["password"])
        smtp.send_message(message)

    return config["recipients"]


@app.route("/send-emergency-email", methods=["GET", "POST"])
def send_emergency_email_route():
    if request.method == "GET":
        config = get_emergency_email_config()

        return jsonify({
            "status": "ready",
            "message": "Emergency email route is working. Use POST to send an email.",
            "configured": bool(
                config.get("username")
                and config.get("password")
                and config.get("from_email")
                and config.get("recipients")
            ),
            "recipients": config["recipients"],
        })

    try:
        data = request.get_json(silent=True) or {}
        recipients = send_emergency_email(data)

        return jsonify({
            "status": "sent",
            "message": "Email sent to friends/family",
            "recipients": recipients,
        })

    except ValueError as e:
        return jsonify({
            "status": "not_configured",
            "message": str(e),
        }), 400

    except Exception as e:
        print("EMERGENCY EMAIL ERROR:", e)
        response = {
            "status": "error",
            "message": "Could not send emergency email",
        }

        if app.debug:
            response["error_type"] = type(e).__name__
            response["error_detail"] = str(e)

        return jsonify(response), 500


# ---------------- PREDICT ----------------
@app.route("/predict")
def predict():
    df = pd.read_csv("data/daily_data.csv")
    row = df.tail(1).iloc[0]

    result = predict_day(row)

    return jsonify(result)
#-------------graph explain----------------

@app.route("/hr-analysis")
def hr_analysis():

    df = pd.read_csv("data/daily_data.csv")
    row = df.tail(1).iloc[0]

    avg_hr = row["avg_hr_day"]
    resting = row["resting_hr"]
    hr_std = row["hr_std_day"]

    
    if avg_hr > resting + 10:
        status = "Heart rate slightly elevated compared to baseline."
    else:
        status = "Heart rate levels appear normal for today."

    variability = "stable"
    if hr_std > 15:
        variability = "high variability detected"

    return jsonify({
        "avg_hr": round(avg_hr,1),
        "resting_hr": resting,
        "hr_variability": round(hr_std,1),
        "analysis": status,
        "variability_comment": variability
    })

# ---------------- ACTIVITY ----------------
@app.route("/activity")
def activity():
    df = pd.read_csv("data/daily_data.csv")
    row = df.tail(1).iloc[0]

    result = predict_day(row)

    return jsonify({
        "suggestions": result["suggestions"]
    })
#-----------------NEW FEATURES ADDED--------------

@app.route("/activity-pattern")
def activity_pattern():
    

    df = pd.read_csv("data/hourly_data.csv")

    # clean columns
    df.columns = df.columns.str.strip()

    # ensure numeric
    df["steps"] = pd.to_numeric(df["steps"], errors="coerce").fillna(0)
    df["hour"] = pd.to_numeric(df["hour"], errors="coerce").fillna(0)

    # latest day
    df["date"] = pd.to_datetime(df["date"])
    latest = df["date"].max()
    df_day = df[df["date"] == latest].copy()

    if df_day.empty:
        return jsonify({})

    # ---------------- ACTIVITY ----------------
    most_active = df_day.loc[df_day["steps"].idxmax()]
    least_active = df_day.loc[df_day["steps"].idxmin()]

    # ---------------- SMART FOCUS LOGIC ----------------
    # Normalize steps (0–1)
    max_steps = df_day["steps"].max() or 1
    df_day["steps_norm"] = df_day["steps"] / max_steps

    # Time-based cognitive score
    def time_score(hour):
        if 9 <= hour <= 12:
            return 1.0   # best focus
        elif 13 <= hour <= 17:
            return 0.7   # moderate
        elif 18 <= hour <= 22:
            return 0.5   # evening drop
        else:
            return 0.3   # low focus (night/early morning)

    df_day["time_score"] = df_day["hour"].apply(time_score)

    # Final focus score (weighted)
    df_day["focus_score"] = (
        df_day["steps_norm"] * 0.4 +
        df_day["time_score"] * 0.6
    )

    # ---------------- RESULTS ----------------
    peak_focus = df_day.loc[df_day["focus_score"].idxmax()]
    low_focus = df_day.loc[df_day["focus_score"].idxmin()]

    return jsonify({
        "most_active_hour": int(most_active["hour"]),
        "least_active_hour": int(least_active["hour"]),
        "peak_focus_hour": int(peak_focus["hour"]),
        "low_focus_hour": int(low_focus["hour"])
    })


@app.route("/health-trends")
def health_trends():

    df = pd.read_csv("data/daily_data.csv")

    df["date"] = pd.to_datetime(df["date"])

    last_30 = df.sort_values("date").tail(30)

    trends = []

    for _, r in last_30.iterrows():
        trends.append({
            "date": r["date"].strftime("%Y-%m-%d"),
            "steps": int(r["total_steps"]),
            "sleep": round(r["sleep_hours"], 2),
            "stress": round(r["stress_index"], 3),
            "hr": round(r["avg_hr_day"], 1)
        })

    return jsonify(trends)


@app.route("/health-insights")
def health_insights():

    df = pd.read_csv("data/daily_data.csv")
    row = df.tail(1).iloc[0]

    reminders = []
    if not already_created_today("thyroid"):
     create_google_event("Take Thyroid Tablet 💊", "08:00")
     mark_created("thyroid")
     reminders.append("Event created")
    else:
      reminders.append("Already exists")

    # 🧘 Stress-based
    if row["stress_index"] > 0.8:
        reminders.append(create_google_event("High stress detected. Take a break 🧘", "18:00"))

    # 😴 Sleep-based
    if row["sleep_hours"] < 5:
        reminders.append(create_google_event("Sleep early tonight 😴", "22:00"))

    # ❤️ Fatigue
    if row["avg_hr_day"] > row["resting_hr"] + 20:
        reminders.append(create_google_event("Body fatigue detected. Rest well ❤️", "20:00"))

    return jsonify({
        "hydration": hydration_reminder(row),
        "recovery_score": recovery_score(row),
        "sleep_advice": sleep_advice(row),
        "fatigue": hr_fatigue(row),
        "reminder_status": reminders
    })


# ---------------- ALERTS ----------------
@app.route("/alerts")
def alerts_route():
    return jsonify({
        "alerts": get_alerts()
    })

# ---------------- HOURLY HR GRAPH ----------------
@app.route("/hr-data")
def hr_data():

    df = pd.read_csv(os.path.join(DATA_DIR, "hourly_data.csv"))

    latest_date = df["date"].max()

    df = df[df["date"] == latest_date]

    df = df.dropna(subset=["avg_hr"])

    result = []

    for _, row in df.iterrows():

        result.append({
            "hour": int(row["hour"]),
            "hr": round(row["avg_hr"], 1)
        })

    result = sorted(result, key=lambda x: x["hour"])

    return jsonify(result)


# ---------------- MINUTE HR GRAPH ----------------
@app.route("/hr-minute")
def hr_minute():

    path = os.path.join(DATA_DIR, "hr_minute_data.csv")

    if not os.path.exists(path):
        return jsonify([])

    df = pd.read_csv(path)

    result = []

    for _, row in df.iterrows():
        result.append({
            "x": int(row["time"]),
            "hr": int(row["hr"])
        })

    return jsonify(result)

@app.route("/productivity-pattern")
def productivity_pattern():

    

    DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
    df = pd.read_csv(os.path.join(DATA_DIR, "hourly_data.csv"))

    steps_norm = df["steps"] / df["steps"].max()
    if "stress_index" in df.columns:
       stress_norm = df["stress_index"] / df["stress_index"].max()
    else:
      stress_norm = 0

    df["true_productivity"] = (
        0.6 * steps_norm +
        0.4 * (1 - stress_norm)
    )

    hourly_avg = df.groupby("hour")["true_productivity"].mean()

    most_productive_hour = int(hourly_avg.idxmax())
    least_productive_hour = int(hourly_avg.idxmin())

    avg_score = round(df["true_productivity"].mean() * 10, 2)

    return jsonify({
        "most_productive_hour": most_productive_hour,
        "least_productive_hour": least_productive_hour,
        "true_productivity_score": avg_score
    })
# -------- GOOGLE AUTH --------
def create_google_event(summary, time_str):
    import os, json
    from datetime import datetime, timedelta
    from googleapiclient.discovery import build
    import google.oauth2.credentials

    token_path = os.path.join(BASE_DIR, "token.json")

    if not os.path.exists(token_path):
        return {"status": "Google not connected"}

    with open(token_path, "r") as f:
        tokens = json.load(f)

    credentials = google.oauth2.credentials.Credentials(**tokens)
    service = build('calendar', 'v3', credentials=credentials)

    now = datetime.now()
    hour, minute = map(int, time_str.split(":"))
    start_dt = now.replace(hour=hour, minute=minute, second=0, microsecond=0)

    if start_dt <= now:
        start_dt += timedelta(days=1)

    end_dt = start_dt + timedelta(minutes=10)

    event = {
        'summary': summary,
        'start': {
            'dateTime': f'{start_dt.strftime("%Y-%m-%dT%H:%M:%S")}+05:30',
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': f'{end_dt.strftime("%Y-%m-%dT%H:%M:%S")}+05:30',
            'timeZone': 'Asia/Kolkata',
        },
        'recurrence': ['RRULE:FREQ=DAILY'],
        'reminders': {   # ✅ IMPORTANT
            'useDefault': False,
            'overrides': [
                {'method': 'popup', 'minutes': 0},
            ],
        },
    }

    created_event = service.events().insert(
        calendarId='primary',
        body=event
    ).execute()

    save_reminder(summary, time_str)

    return {
        "status": "Event created",
        "link": created_event.get("htmlLink"),
        "scheduled_for": start_dt.strftime("%Y-%m-%d %H:%M")
    }


# ✅ THIS MUST BE OUTSIDE (no indentation)
def save_reminder(summary, time_str):
    import json, os

    file = os.path.join(BASE_DIR, "reminders.json")

    data = []
    if os.path.exists(file):
        with open(file, "r") as f:
            data = json.load(f)

    data.append({
        "message": summary,
        "time": time_str
    })

    with open(file, "w") as f:
        json.dump(data, f)

@app.route("/auth/google")
def auth_google():
    auth_url, _ = flow.authorization_url(prompt='consent')
    return redirect(auth_url)




FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token"



@app.route("/login")
def login():
    from urllib.parse import urlencode

    force_login = request.args.get("force") in ("1", "true", "yes")

    if load_fitbit_token() and not force_login:
        return sync_day()

    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "activity heartrate sleep profile", # Use the string, not the list
        "expires_in": "604800"
    }

    url = FITBIT_AUTH_URL + "?" + urlencode(params)
    return redirect(url)

# ---------------- CALLBACK ----------------


@app.route("/callback")
def fitbit_callback():
    # 1. Capture the authorization code from Fitbit's redirect
    print(f"Full Request Args: {request.args}")
    oauth_error = request.args.get("error")
    if oauth_error:
        return jsonify({
            "error": "Fitbit authorization failed",
            "fitbit_error": oauth_error,
            "message": request.args.get("error_description", "Fitbit did not authorize the app."),
            "login_url": "/login?force=1"
        }), 400

    code = request.args.get("code")

    if not code:
        return jsonify({
            "error": "No authorization code provided",
            "message": "Open /login?force=1 to start a fresh Fitbit authorization flow.",
            "login_url": "/login?force=1"
        }), 400

    # 2. Encode credentials for the Token Exchange
    basic_token = base64.b64encode(
        f"{CLIENT_ID}:{CLIENT_SECRET}".encode()
    ).decode()

    # 3. Exchange Authorization Code for Access Token
    response = requests.post(
        FITBIT_TOKEN_URL,
        headers={
            "Authorization": f"Basic {basic_token}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={
            "client_id": CLIENT_ID,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
            "code": code
        },
        timeout=15
    )

    if response.status_code != 200:
        details = fitbit_response_details(response)
        fitbit_errors = details.get("errors", []) if isinstance(details, dict) else []
        is_invalid_grant = any(
            error.get("errorType") == "invalid_grant"
            for error in fitbit_errors
            if isinstance(error, dict)
        )

        print("❌ TOKEN ERROR:", response.text)
        payload = {
            "error": "Token exchange failed",
            "details": details
        }

        if is_invalid_grant:
            payload.update({
                "status": "authorization_code_expired",
                "message": (
                    "This Fitbit authorization code is invalid, expired, or already used. "
                    "Start a fresh Fitbit login instead of refreshing this callback URL."
                ),
                "login_url": "/login?force=1"
            })

        return jsonify(payload), 400

    token_data = response.json()

    # 4. Save the Token locally for future API calls
    with open(FITBIT_TOKEN_FILE, "w") as f:
        json.dump(token_data, f, indent=4)
    print("✅ TOKEN SAVED")

    # 5. TRIGGER AUTOMATIC DATA SYNC FOR CSV FILES
    # This ensures daily_data.csv and hourly_data.csv are updated immediately
    try:
        return sync_day()

        date = datetime.now().strftime("%Y-%m-%d")
        
        # Endpoints
        urls = {
            "heart_intraday": f"https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d/1min.json",
            "steps_intraday": f"https://api.fitbit.com/1/user/-/activities/steps/date/{date}/1d/1min.json",
            "heart_daily": f"https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d.json"
        }

        responses = {}
        for name, url in urls.items():
            res = fitbit_get(url, token_data)
            responses[name] = res.json() if res.status_code == 200 else {}

        # --- DATA EXTRACTION ---
        heart_data = responses.get("heart_intraday", {}).get("activities-heart-intraday", {}).get("dataset", [])
        steps_data = responses.get("steps_intraday", {}).get("activities-steps-intraday", {}).get("dataset", [])
        
        # Get Resting HR safely for hr_relative calculation
        resting_hr_list = responses.get("heart_daily", {}).get("activities-heart", [])
        resting_hr = resting_hr_list[0].get("value", {}).get("restingHeartRate", 70) if resting_hr_list else 70

        # Organize into dictionaries by hour
        hourly_hr = defaultdict(list)
        hourly_steps = defaultdict(int)

        for entry in heart_data:
            hour = int(entry["time"].split(":")[0])
            hourly_hr[hour].append(entry["value"])
        for entry in steps_data:
            hour = int(entry["time"].split(":")[0])
            hourly_steps[hour] += entry["value"]

        day_of_week = datetime.now().weekday()
        hourly_rows = []

        # --- GENERATE ALL 24 HOURS ---
        for hr_idx in range(24):
            vals = hourly_hr.get(hr_idx, [])
            steps = hourly_steps.get(hr_idx, 0)
            
            if vals:
                avg_hr = round(float(np.mean(vals)), 2)
                max_hr = int(np.max(vals))
                min_hr = int(np.min(vals))
                hr_std = round(float(np.std(vals)), 2)
                hr_relative = round(avg_hr - resting_hr, 2)
            else:
                # If no data for this hour yet, use empty strings or 0
                avg_hr = max_hr = min_hr = hr_std = hr_relative = ""

            hourly_rows.append([
                date, hr_idx, day_of_week, 
                avg_hr, max_hr, min_hr, hr_std, 
                steps, hr_relative
            ])

        # Save to CSV
        hourly_header = ["date", "hour", "day_of_week", "avg_hr", "max_hr", "min_hr", "hr_std", "steps", "hr_relative"]
        upsert_csv_rows(os.path.join(DATA_DIR, "hourly_data.csv"), hourly_header, date, hourly_rows)
        
        print(f"✅ Sync complete for {date}. Rows: {len(hourly_rows)}")

    except Exception as e:
        print(f"⚠️ Sync failed: {e}")

    return jsonify({"message": "Connected and synced 🎉"})

@app.route("/fitbit/status")
def fitbit_status():
    token_data = load_fitbit_token()

    if not token_data:
        return jsonify({
            "connected": False,
            "login_url": "/login"
        })

    profile_url = "https://api.fitbit.com/1/user/-/profile.json"
    response = fitbit_get(profile_url, token_data)

    if response.status_code != 200:
        return jsonify({
            "connected": False,
            "error": response.json() if response.text else {}
        }), response.status_code

    user = response.json().get("user", {})

    return jsonify({
        "connected": True,
        "display_name": user.get("displayName"),
        "encoded_id": user.get("encodedId")
    })





@app.route("/sync-day")
def sync_day():
    token_data = load_fitbit_token()
    if not token_data:
        return redirect("/login")

    date = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")

    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Date must use YYYY-MM-DD format"}), 400

    urls = {
        "heart_intraday": f"https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d/1min.json",
        "steps_intraday": f"https://api.fitbit.com/1/user/-/activities/steps/date/{date}/1d/1min.json",
        "heart_daily": f"https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d.json",
        "sleep": f"https://api.fitbit.com/1.2/user/-/sleep/date/{date}.json"
    }

    responses = {}
    for name, url in urls.items():
        response = fitbit_get(url, token_data)
        if response.status_code != 200:
            return fitbit_fetch_error_response(name, response, date)
        responses[name] = response.json()

    heart_intraday = responses["heart_intraday"].get(
        "activities-heart-intraday",
        {}
    ).get("dataset", [])
    steps_intraday = responses["steps_intraday"].get(
        "activities-steps-intraday",
        {}
    ).get("dataset", [])

    hourly_hr = defaultdict(list)
    hourly_steps = defaultdict(int)

    for entry in heart_intraday:
        hour = int(entry["time"].split(":")[0])
        hourly_hr[hour].append(entry["value"])

    for entry in steps_intraday:
        hour = int(entry["time"].split(":")[0])
        hourly_steps[hour] += entry["value"]

    resting_hr = responses["heart_daily"].get(
        "activities-heart",
        [{}]
    )[0].get("value", {}).get("restingHeartRate", 0)

    day_of_week = datetime.strptime(date, "%Y-%m-%d").weekday()

    hourly_header = [
        "date", "hour", "day_of_week",
        "avg_hr", "max_hr", "min_hr",
        "hr_std", "steps", "hr_relative"
    ]

    hourly_rows = []
    for hour in range(24):
        hr_values = hourly_hr.get(hour, [])
        steps = hourly_steps.get(hour, 0)

        if hr_values:
            avg_hr = float(np.mean(hr_values))
            max_hr = int(np.max(hr_values))
            min_hr = int(np.min(hr_values))
            hr_std = float(np.std(hr_values))
        else:
            avg_hr = ""
            max_hr = ""
            min_hr = ""
            hr_std = ""

        hr_relative = round(avg_hr - resting_hr, 2) if avg_hr != "" else ""

        hourly_rows.append([
            date,
            hour,
            day_of_week,
            avg_hr if avg_hr == "" else round(avg_hr, 2),
            max_hr,
            min_hr,
            hr_std if hr_std == "" else round(hr_std, 2),
            steps,
            hr_relative
        ])

    sleep_sessions = responses["sleep"].get("sleep", [])
    total_sleep = 0
    deep_minutes = 0
    rem_minutes = 0
    sleep_start_time = ""
    wake_time = ""

    if sleep_sessions:
        start_times = []
        end_times = []

        for sleep_entry in sleep_sessions:
            total_sleep += sleep_entry.get("minutesAsleep", 0)

            start = sleep_entry.get("startTime", "")
            end = sleep_entry.get("endTime", "")

            if start:
                start_times.append(start)
            if end:
                end_times.append(end)

            levels = sleep_entry.get("levels", {}).get("summary", {})
            deep_minutes += levels.get("deep", {}).get("minutes", 0)
            rem_minutes += levels.get("rem", {}).get("minutes", 0)

        if start_times:
            sleep_start_time = min(start_times)
        if end_times:
            wake_time = max(end_times)

    deep_ratio = deep_minutes / total_sleep if total_sleep else 0
    rem_ratio = rem_minutes / total_sleep if total_sleep else 0
    sleep_deficit = max(0, 480 - total_sleep)
    sleep_hours = round(total_sleep / 60, 2) if total_sleep else 0

    sleep_midpoint = ""
    sleep_start_hour = ""
    wake_hour = ""

    if sleep_start_time and wake_time:
        try:
            start_dt = datetime.fromisoformat(sleep_start_time.replace("Z", ""))
            end_dt = datetime.fromisoformat(wake_time.replace("Z", ""))
            midpoint = start_dt + (end_dt - start_dt) / 2
            sleep_midpoint = midpoint.time()
            sleep_start_hour = start_dt.hour
            wake_hour = end_dt.hour
        except ValueError:
            pass

    all_hr_values = [value for values in hourly_hr.values() for value in values]

    if all_hr_values:
        avg_hr_day = float(np.mean(all_hr_values))
        hr_std_day = float(np.std(all_hr_values))
    else:
        avg_hr_day = 0
        hr_std_day = 0

    total_steps = sum(hourly_steps.values())
    hr_deviation = round(avg_hr_day - resting_hr, 2)
    stress_index = round(hr_std_day / avg_hr_day, 4) if avg_hr_day else 0
    activity_load = min(1, total_steps / 10000)
    is_weekend = 1 if day_of_week >= 5 else 0

    daily_header = [
        "date", "day_of_week", "resting_hr", "total_steps",
        "total_sleep", "sleep_hours",
        "deep_ratio", "rem_ratio", "sleep_deficit",
        "sleep_start_time", "wake_time", "sleep_midpoint",
        "sleep_start_hour", "wake_hour",
        "avg_hr_day", "hr_std_day", "hr_deviation",
        "stress_index",
        "activity_load", "is_weekend",
        "mood_score", "productivity_score"
    ]

    daily_row = [
        date,
        day_of_week,
        resting_hr,
        total_steps,
        total_sleep,
        sleep_hours,
        round(deep_ratio, 3),
        round(rem_ratio, 3),
        sleep_deficit,
        sleep_start_time,
        wake_time,
        sleep_midpoint,
        sleep_start_hour,
        wake_hour,
        round(avg_hr_day, 2),
        round(hr_std_day, 2),
        hr_deviation,
        stress_index,
        round(activity_load, 2),
        is_weekend,
        "",
        ""
    ]

    os.makedirs(DATA_DIR, exist_ok=True)
    upsert_csv_rows(
        os.path.join(DATA_DIR, "hourly_data.csv"),
        hourly_header,
        date,
        hourly_rows
    )
    upsert_csv_row(
        os.path.join(DATA_DIR, "daily_data.csv"),
        daily_header,
        date,
        daily_row
    )

    return jsonify({
        "status": "synced",
        "date": date,
        "hourly_rows": len(hourly_rows),
        "total_steps": total_steps,
        "sleep_hours": sleep_hours,
        "avg_hr_day": round(avg_hr_day, 2),
        "resting_hr": resting_hr
    })
# Helper function to be called from multiple places
def perform_sync(token_data, date=None):
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    # ... [Insert ALL the fetching and processing logic you have in sync_day] ...
    # (The part that calls urls, processes hourly_rows, and calls upsert_csv_row)
    
    # After processing, return the summary data
    return {
        "status": "synced",
        "date": date,
        "total_steps": total_steps,
        "avg_hr_day": round(avg_hr_day, 2)
    }

@app.route("/get-reminders")
def get_reminders():
   

    reminders_path = os.path.join(BASE_DIR, "reminders.json")

    if not os.path.exists(reminders_path):
        return jsonify([])

    with open(reminders_path, "r") as f:
        data = json.load(f)

    return jsonify(data)

@app.route("/auth/google/callback")
def auth_callback():
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials

    token_data = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }

    # ✅ SAVE TOKEN FILE
    with open(os.path.join(BASE_DIR, "token.json"), "w") as f:
        json.dump(token_data, f)

    return "Google connected successfully ✅"
def already_created_today(tag):
    import json, os
    today = str(datetime.now().date())

    if not os.path.exists("reminder_log.json"):
        return False

    with open("reminder_log.json", "r") as f:
        data = json.load(f)

    return data.get(tag) == today
def mark_created(tag):
    import json
    today = str(datetime.now().date())

    data = {}
    if os.path.exists("reminder_log.json"):
        with open("reminder_log.json", "r") as f:
            data = json.load(f)

    data[tag] = today

    with open("reminder_log.json", "w") as f:
        json.dump(data, f)


@app.route("/create-reminder")
def create_reminder():

    if not google_tokens:
        return jsonify({"error": "Connect Google first"})

    credentials = google.oauth2.credentials.Credentials(**google_tokens)
    service = build('calendar', 'v3', credentials=credentials)

    event = {
        'summary': 'Take Thyroid Tablet 💊',
        'start': {
            'dateTime': '2026-05-02T08:00:00+05:30',
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': '2026-05-02T08:10:00+05:30',
            'timeZone': 'Asia/Kolkata',
        },
        'recurrence': ['RRULE:FREQ=DAILY'],
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'popup', 'minutes': 0},
            ],
        },
    }

    service.events().insert(calendarId='primary', body=event).execute()

    return jsonify({"message": "Reminder created 🎉"})
@app.route("/set-reminder", methods=["POST"])
def set_reminder():
    data = request.json

    message = data.get("message", "Health Reminder 💊")
    time = data.get("time", "08:00")

    try:
        result = create_google_event(message, time)
    except Exception as e:
        print("GOOGLE REMINDER ERROR:", e)
        return jsonify({
            "ok": False,
            "status": "Google Calendar error",
            "error": str(e),
            "time": time,
            "message": message
        }), 500

    google_connected = result.get("status") != "Google not connected"

    return jsonify({
        "ok": google_connected,
        "status": result,
        "time": time,
        "message": message
    }), 200 if google_connected else 400

import random

def get_podcasts_by_mood(mood):
    

    mood_map = {
        "happy": ["motivation", "success", "growth"],
        "low": ["uplifting", "confidence", "self help"],
        "sad": ["healing", "positivity", "mental health"],
        "stress": ["meditation", "relaxation", "calm"],
        "normal": ["wellness", "lifestyle", "productivity"]
    }

    # 🔥 RANDOM QUERY (main fix)
    query = random.choice(mood_map.get(mood, ["wellness"]))

    print("🔥 Selected query:", query)  # DEBUG

    url = "https://listen-api.listennotes.com/api/v2/search"

    headers = {
        "X-ListenAPI-Key": LISTEN_API_KEY
    }

    params = {
        "q": query,
        "type": "podcast",
        "len_min": 10,
        "sort_by_date": 0
    }

    res = requests.get(url, headers=headers, params=params)

    if res.status_code != 200:
        print("❌ API failed:", res.text)
        return []

    data = res.json()

    podcasts = []

    for item in data.get("results", [])[:10]:
        podcasts.append({
            "name": item.get("title_original"),
            "image": item.get("image"),
            "url": item.get("listennotes_url")
        })

    # 🔥 SHUFFLE (important)
    random.shuffle(podcasts)

    return podcasts[:5]

def get_mood_label(data):
    if data["stress"] > 0.8:
        return "stress"
    elif data["mood"] < 0.4:
        return "sad"
    elif data["productivity"] < 0.5:
        return "low"
    else:
        return "happy"
@app.route("/podcasts/<mood>")
def podcasts(mood):
    return jsonify(get_podcasts_by_mood(mood))

@app.route("/smart-podcasts")
def smart_podcasts():
   
    from flask import request, jsonify

    mood = request.args.get("mood")
    if not mood:
        mood_score, _ = predict_day()

        if mood_score > 7:
            mood = "happy"
        elif mood_score > 5:
            mood = "normal"
        elif mood_score > 3:
            mood = "low"
        else:
            mood = "stress"

    print("👉 Mood used:", mood)

    # 🔥 MULTIPLE QUERIES (NOT SINGLE STRING)
    mood_map = {
        "happy": ["motivation", "success", "growth"],
        "normal": ["wellness", "lifestyle", "productivity"],
        "low": ["confidence", "mental health", "uplifting"],
        "stress": ["meditation", "relaxation", "calm"],
        "sad": ["healing", "positivity", "self love"]
    }

    # 🔥 RANDOM QUERY
    query = random.choice(mood_map.get(mood, ["health"]))

    print("🔥 Query selected:", query)

    url = "https://listen-api.listennotes.com/api/v2/search"

    headers = {
        "X-ListenAPI-Key": LISTEN_API_KEY
    }

    params = {
        "q": query,
        "type": "podcast",
        "offset": random.randint(0, 20)  # 🔥 KEY CHANGE
    }

    res = requests.get(url, headers=headers, params=params)

    if res.status_code != 200:
        print("❌ API error:", res.text)
        return jsonify({"mood": mood, "podcasts": []})

    data = res.json()

    podcasts = []

    for item in data.get("results", []):
        podcasts.append({
            "name": item.get("title_original"),
            "image": item.get("image"),
            "url": item.get("listennotes_url")
        })

    # 🔥 SHUFFLE
    random.shuffle(podcasts)

    return jsonify({
        "mood": mood,
        "podcasts": podcasts[:5]
    })
@app.route("/smart-recommendations")
def smart_recommendations():
    import requests
    from flask import request, jsonify

    # 🎯 check if demo mood is passed
    mood = request.args.get("mood")

    # 👉 if NOT passed → use ML model
    if not mood:
        mood_score, _ = predict_day()

        if mood_score < 4:
            mood = "sad"
        elif mood_score < 6:
            mood = "low"
        elif mood_score < 8:
            mood = "normal"
        else:
            mood = "happy"

    print("👉 Mood used:", mood)

    # ---------------- ACTIVITY ----------------
    try:
        activity_res = requests.get("https://www.boredapi.com/api/activity")
        activity_data = activity_res.json()
        activity = activity_data.get("activity", "Take a short walk")
    except:
        activity = "Do a light stretch or breathing exercise"

    # ---------------- QUOTE ----------------
    try:
        quote_res = requests.get("https://zenquotes.io/api/random")
        quote_data = quote_res.json()[0]
        quote = quote_data["q"]
        author = quote_data["a"]
    except:
        quote = "Stay positive and keep going!"
        author = "System"

    # ---------------- IMAGE ----------------
    mood_image_map = {
        "sad": "rain",
        "low": "sunset",
        "normal": "nature",
        "happy": "mountains"
    }

    image_url = f"https://source.unsplash.com/400x300/?{mood_image_map.get(mood, 'nature')}"

    return jsonify({
        "mood": mood,
        "activity": activity,
        "quote": quote,
        "author": author,
        "image": image_url
    })
@app.route("/dashboard-by-date")
def dashboard_by_date():
    import pandas as pd
    from flask import request, jsonify

    date = request.args.get("date")

    df = pd.read_csv("data/daily_data.csv")

    # 🔥 normalize date format
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

    row = df[df["date"] == date]

    if row.empty:
        return jsonify({"error": "No data for this date"})

    r = row.iloc[0]

    # ---------------- EXISTING DATA ----------------
    sleep = float(r["sleep_hours"])
    stress = float(r["stress_index"])
    steps = int(r["total_steps"])
    hr = float(r["avg_hr_day"])

    # ---------------- NEW SMART FEATURES ----------------

    # 🎯 mood score (simple formula OR reuse model if possible)
    mood_score = round((sleep * 0.6) + ((1 - stress) * 5), 2)

    if mood_score > 7:
        mood_label = "happy"
    elif mood_score > 5:
        mood_label = "normal"
    elif mood_score > 3:
        mood_label = "low"
    else:
        mood_label = "stress"

    # 📊 productivity (simple heuristic)
    productivity = round((steps / 2000) + (sleep / 2) - (stress * 5), 2)

    # 🚶 activity level
    if steps < 2000:
        activity = "Very Low"
    elif steps < 5000:
        activity = "Low"
    elif steps < 8000:
        activity = "Moderate"
    elif steps < 12000:
        activity = "Active"
    else:
        activity = "Very Active"

    # ---------------- RESPONSE ----------------
    return jsonify({
        "date": date,
        "sleep": sleep,
        "stress": stress,
        "steps": steps,
        "hr": hr,
        "mood_score": mood_score,
        "mood_label": mood_label,
        "productivity": productivity,
        "activity": activity
    })
def detect_risks(df):
    alerts = []

    last_3 = df.tail(3)

    # 🔥 Burnout Risk
    if all(last_3["stress_index"] > 0.6):
        alerts.append("⚠️ Burnout risk increasing over last 3 days")

    # 😴 Low Sleep Pattern
    if all(last_3["sleep_hours"] < 6):
        alerts.append("⚠️ Consistent low sleep detected")

    # ❤️ High HR fatigue
    if all(last_3["avg_hr_day"] > last_3["resting_hr"] + 15):
        alerts.append("⚠️ Heart rate consistently elevated — possible fatigue")

    # 🚶 Low activity
    if all(last_3["total_steps"] < 3000):
        alerts.append("⚠️ Low activity detected for multiple days")

    return alerts
@app.route("/risk-alerts")
def risk_alerts():
    df = pd.read_csv("data/daily_data.csv")

    alerts = detect_risks(df)

    return jsonify({
        "alerts": alerts if alerts else ["✅ No major risks detected"]
    })
@app.route("/smart-insights")
def smart_insights():
    import pandas as pd
    import os

    df = pd.read_csv("data/daily_data.csv")
    mood = request.args.get("mood")

    df["date"] = pd.to_datetime(df["date"])

    latest = df.sort_values("date").tail(1).iloc[0]

    # ---------------- PRODUCTIVITY ----------------
    steps_norm = latest["total_steps"] / df["total_steps"].max()
    stress_norm = latest["stress_index"] / df["stress_index"].max()

    productivity = (0.6 * steps_norm + 0.4 * (1 - stress_norm)) * 10

    avg_productivity = (
        (df["total_steps"] / df["total_steps"].max()) * 0.6 +
        (1 - df["stress_index"] / df["stress_index"].max()) * 0.4
    ).mean() * 10

    performance_change = round(productivity - avg_productivity, 2)

    # ---------------- PATTERNS ----------------
    hourly = pd.read_csv("data/hourly_data.csv")

    most_active_hour = int(hourly.loc[hourly["steps"].idxmax()]["hour"])
    peak_focus_hour = int(hourly.groupby("hour")["steps"].mean().idxmax())
    low_focus_hour = int(hourly.groupby("hour")["steps"].mean().idxmin())

    # ---------------- DAILY PLAN ----------------
    plan = [
        {
            "time": f"{peak_focus_hour}:00",
            "task": "Deep work / coding",
            "reason": "Highest focus window"
        },
        {
            "time": f"{most_active_hour}:00",
            "task": "Workout / movement",
            "reason": "Peak physical activity"
        },
        {
            "time": f"{low_focus_hour}:00",
            "task": "Light tasks / planning",
            "reason": "Low focus period"
        }
    ]

    # ---------------- ACTION TASKS ----------------
    tasks = []

    if productivity < 5:
        tasks.append("Do a 25-min focused session tonight")

    if latest["total_steps"] < 4000:
        tasks.append("Take a 10-min walk today")

    if latest["stress_index"] > 0.5:
        tasks.append("Try a 3-min breathing exercise")

    # ---------------- CONFIDENCE ----------------
    confidence = round((productivity / 10) * 100, 1)

    # ---------------- SUMMARY ----------------
    summary = f"""
Your productivity is {'below' if productivity < avg_productivity else 'above'} average.
Your focus peaks at {peak_focus_hour}:00 — schedule deep work then.
Your physical energy peaks at {most_active_hour}:00.
"""

    return jsonify({
        "productivity": round(productivity, 2),
        "performance_change": performance_change,
        "confidence": confidence,
        "plan": plan,
        "tasks": tasks,
        "summary": summary.strip()
    })
   

from flask import request, jsonify

@app.route("/delete-reminder", methods=["POST"])
def delete_reminder():
    import json

    data = request.json or {}
    time = data.get("time")

    reminders_path = os.path.join(BASE_DIR, "reminders.json")

    with open(reminders_path, "r") as f:
        reminders = json.load(f)

    reminders = [r for r in reminders if r["time"] != time]

    with open(reminders_path, "w") as f:
        json.dump(reminders, f)

    return jsonify({"status": "deleted"})
    

def get_motivation_quote(mood):
    try:
        res = requests.get("https://zenquotes.io/api/random")
        data = res.json()[0]

        quote = data.get("q", "")
        author = data.get("a", "")

        return f"\"{quote}\" — {author}"

    except Exception as e:
        print("Quote API Error:", e)
        return "Keep pushing forward. You’ve got this 💪"



@app.route("/live-hr")
def get_live_hr():
    try:
        import requests
        import numpy as np
        global LIVE_HR_CACHE

        # 1. Get the token
        token_data = load_fitbit_token()
        if not token_data:
            return jsonify({"error": "Not authorized with Fitbit"}), 401

        now_ts = datetime.now().timestamp()
        cached_payload = LIVE_HR_CACHE.get("payload")
        cached_at = LIVE_HR_CACHE.get("fetched_at", 0)

        if cached_payload and now_ts - cached_at < LIVE_HR_CACHE_SECONDS:
            response = jsonify({
                **cached_payload,
                "cached": True,
                "cache_age_seconds": int(now_ts - cached_at)
            })
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            return response

        # 2. Fetch LIVE data from Fitbit API
        url = "https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1min.json"
        response = fitbit_get(url, token_data)

        if response.status_code != 200:
            if response.status_code == 429 and cached_payload:
                fallback = jsonify({
                    **cached_payload,
                    "cached": True,
                    "warning": "Fitbit rate limit reached; showing last live reading"
                })
                fallback.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
                return fallback

            return jsonify({
                "error": "Failed to fetch data from Fitbit",
                "details": response.text
            }), response.status_code

        data = response.json()
        dataset = data.get('activities-heart-intraday', {}).get('dataset', [])

        if not dataset:
            return jsonify({"error": "No heart rate data recorded for today yet"})

        # 3. Process the live data
        # Extract heart rate values into a list
        hr_values = [item['value'] for item in dataset]

        # Get the very latest HR value and its timestamp
        latest_entry = dataset[-1]
        avg_hr = latest_entry["value"]
        latest_time = latest_entry.get("time", "")
        latest_hour = int(latest_time.split(":")[0]) if latest_time else None
        
        # Calculate standard deviation using numpy for the stress formula
        hr_std = np.std(hr_values) if len(hr_values) > 1 else 5

        # 4. Your existing Stress & Status Logic (remains same)
        stress = (hr_std / avg_hr) * 10 if avg_hr > 0 else 0

        if stress < 0.18:
            status, message = "normal", "Normal heart rate"
        elif stress > 0.19:
            status, message = "high", "Elevated stress detected"
        else:
            status, message = "critical", "⚠️ High stress! Take immediate rest"

        # 5. Return the response
        payload = {
            "heart_rate": int(avg_hr),
            "time": latest_time,
            "hour": latest_hour,
            "stress": round(stress, 2),
            "status": status,
            "message": message,
            "danger": bool(stress > 1.5),
            "source": "Live Fitbit API",
            "cached": False
        }
        LIVE_HR_CACHE = {"payload": payload, "fetched_at": now_ts}

        response = jsonify(payload)
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        return response

    except Exception as e:
        print("LIVE HR ERROR:", e)
        return jsonify({"error": str(e)}), 500

    
@app.route("/motivation")
def motivation():
    df = pd.read_csv("data/daily_data.csv")
    row = df.tail(1).iloc[0]

    result = predict_day(row)

    quote = get_motivation_quote(result["mood"])

    return jsonify({
        "mood": result["mood"],
        "quote": quote
    })
@app.route("/live-steps")
def get_live_steps():
    import pandas as pd

    token_data = load_fitbit_token()
    if token_data:
        try:
            url = "https://api.fitbit.com/1/user/-/activities/steps/date/today/1d/1min.json"
            response = fitbit_get(url, token_data)

            if response.status_code == 200:
                data = response.json()
                dataset = data.get("activities-steps-intraday", {}).get("dataset", [])

                if dataset:
                    total_steps = sum(int(item.get("value", 0)) for item in dataset)
                    latest_entry = dataset[-1]
                    latest_hour = int(latest_entry.get("time", "0:00").split(":")[0])
                    current_hour_steps = sum(
                        int(item.get("value", 0))
                        for item in dataset
                        if int(item.get("time", "0:00").split(":")[0]) == latest_hour
                    )

                    return jsonify({
                        "steps": total_steps,
                        "hour_steps": current_hour_steps,
                        "hour": latest_hour,
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "source": "fitbit"
                    })
        except Exception as e:
            print("LIVE STEPS API ERROR:", e)

    df = pd.read_csv(os.path.join(DATA_DIR, "hourly_data.csv"))

    # clean columns
    df.columns = df.columns.str.strip()
    df["hour"] = pd.to_numeric(df["hour"], errors="coerce")
    df["steps"] = pd.to_numeric(df["steps"], errors="coerce").fillna(0)

    df["date"] = pd.to_datetime(df["date"])
    latest_date = df["date"].max()

    df_day = df[df["date"] == latest_date]

    if df_day.empty:
        return jsonify({"error": "No data found"})

    # 🔥 latest hour row
    non_empty_rows = df_day[df_day["steps"] > 0].sort_values("hour")
    if non_empty_rows.empty:
        latest_row = df_day.sort_values("hour").iloc[-1]
    else:
        latest_row = non_empty_rows.iloc[-1]
    
    return jsonify({
        "steps": int(df_day["steps"].sum()),
        "hour_steps": int(latest_row["steps"]),
        "hour": int(latest_row["hour"]),
        "date": latest_date.strftime("%Y-%m-%d"),
        "source": "csv"
    })


if __name__ == "__main__":
    app.run(debug=True)
