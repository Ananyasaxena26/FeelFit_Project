import numpy as np


# --------------------------------------------------
# HEART RATE METRICS
# --------------------------------------------------

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