import joblib
import pandas as pd
import numpy as np
import os


from .activity_suggestion import get_activity_suggestions

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


# ------------------ MOOD LABEL ------------------
def mood_label(score):

    score = round(score)

    mapping = {
        1:"Extremely bad mood",
        2:"Very low mood",
        3:"Low mood",
        4:"Slightly low",
        5:"Neutral",
        6:"Okay / decent",
        7:"Good",
        8:"Very good",
        9:"Great mood",
        10:"Excellent"
    }

    return mapping.get(score,"Unknown")


# ------------------ PRODUCTIVITY LABEL ------------------
def prod_label(score):

    score = round(score)

    mapping = {
        1:"Extremely low productivity",
        2:"Very low productivity",
        3:"Low productivity",
        4:"Below average",
        5:"Average",
        6:"Above average",
        7:"Good productivity",
        8:"Very productive",
        9:"Highly productive",
        10:"Extremely productive"
    }

    return mapping.get(score,"Unknown")


# ------------------ FEATURE ENGINEERING ------------------
def prepare_features(df):

    df = df.copy()

    # Sleep efficiency approximation
    df["sleep_efficiency"] = (
        df["sleep_hours"] * (df["deep_ratio"] + df["rem_ratio"])
    )

    # HR stress ratio
    df["hr_stress_ratio"] = df["avg_hr_day"] / (df["resting_hr"] + 1)

    # Log stress
    df["stress_index_log"] = np.log1p(df["stress_index"])

    # Step normalization
    df["steps_scaled"] = df["total_steps"] / 10000

    # Combined fatigue signal
    df["stress_sleep_interaction"] = df["stress_index_log"] * df["sleep_deficit"]

    selected_features = [
        "sleep_efficiency",
        "stress_index_log",
        "activity_load",
        "hr_stress_ratio",
        "sleep_deficit",
        "steps_scaled",
        "stress_sleep_interaction"
    ]

    return df, selected_features


# ------------------ RULE ENGINE ------------------
def apply_rules(row, mood, prod, raw_stress):

    if row["sleep_hours"] < 3:
        mood -= 0.5
        prod -= 0.5

    elif row["sleep_hours"] > 8:
        mood += 0.2

    if raw_stress > 0.20:
        mood -= 0.3
        prod -= 0.3

    if row["total_steps"] > 7000:
        prod += 0.3

    if row["total_steps"] < 1500:
        prod -= 0.4

    if row["total_steps"] < 100:
        mood -= 0.7
        prod -= 1.0

    mood = max(1, min(10, mood))
    prod = max(1, min(10, prod))

    return round(mood,2), round(prod,2)


# ------------------ SUMMARY GENERATION ------------------
def generate_summary(row, mood, prod, raw_stress):

    sleep = row["sleep_hours"]
    stress = raw_stress
    steps = row["total_steps"]

    if sleep >= 6 and steps >= 5000 and stress < 0.17:
        return "You're in a stable and balanced state today."

    if stress > 0.18:
        return "Stress is the main factor affecting your day."

    if sleep < 5:
        return "Low sleep is slightly impacting your performance."

    if steps < 4000:
        return "Low activity might be reducing your energy levels."

    return "Overall performance is moderate with no major concerns."


# ------------------ MAIN PREDICTION ------------------
def predict_day():

    mood_model = joblib.load(os.path.join(BASE_DIR,"saved_models","lightgbm_mood.pkl"))
    prod_model = joblib.load(os.path.join(BASE_DIR,"saved_models","lightgbm_productivity.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR,"saved_models","scaler.pkl"))

    df = pd.read_csv(os.path.join(BASE_DIR,"data","daily_data.csv"))

    latest = df.tail(1).copy()
    row = latest.iloc[0]

    raw_stress = row["stress_index"]

    latest, selected_features = prepare_features(latest)

    X = scaler.transform(latest[selected_features])
    X = pd.DataFrame(X, columns=selected_features)

    mood = mood_model.predict(X)[0]
    prod = prod_model.predict(X)[0]

    mood, prod = apply_rules(row, mood, prod, raw_stress)

    suggestions = get_activity_suggestions(row, mood, prod, raw_stress)

    print("\n===== DAILY HEALTH INSIGHT =====\n")

    print("Mood Score:", mood, "|", mood_label(mood))
    print("Productivity Score:", prod, "|", prod_label(prod))

    print("\nKey Metrics:")
    print(f"Sleep: {round(row['sleep_hours'],1)} hrs | Steps: {int(row['total_steps'])} | Stress: {round(raw_stress,3)}")

    print("\n--- Activity Suggestions ---")
    for s in suggestions[:3]:
        print("-", s)

    print("\nInsight:", generate_summary(row, mood, prod, raw_stress))

    return mood, prod


# ------------------ MAIN ------------------
if __name__ == "__main__":
    predict_day()