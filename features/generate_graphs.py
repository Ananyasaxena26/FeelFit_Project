import pandas as pd
import matplotlib.pyplot as plt
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# -----------------------------
# GRAPH DIRECTORY
# -----------------------------
GRAPH_DIR = os.path.join(os.path.dirname(__file__), "graphs")
os.makedirs(GRAPH_DIR, exist_ok=True)


def generate_graphs():

    try:
        df = pd.read_csv(os.path.join(BASE_DIR, "data", "daily_data.csv"))
    except Exception:
        print("Could not load dataset")
        return

    # -----------------------------
    # 1 HEART RATE TREND
    # -----------------------------
    if "avg_hr_day" in df.columns:
        plt.figure()
        plt.plot(df["avg_hr_day"])
        plt.title("Average Heart Rate Trend")
        plt.xlabel("Days")
        plt.ylabel("Heart Rate (BPM)")
        plt.grid(alpha=0.3)

        plt.savefig(os.path.join(GRAPH_DIR, "hr_trend.png"))
        plt.close()

    # -----------------------------
    # 2 STEPS TREND
    # -----------------------------
    if "total_steps" in df.columns:
        plt.figure()
        plt.plot(df["total_steps"])
        plt.title("Daily Steps Trend")
        plt.xlabel("Days")
        plt.ylabel("Steps")
        plt.grid(alpha=0.3)

        plt.savefig(os.path.join(GRAPH_DIR, "steps_trend.png"))
        plt.close()

    # -----------------------------
    # 3 SLEEP TREND
    # -----------------------------
    if "sleep_hours" in df.columns:
        plt.figure()
        plt.plot(df["sleep_hours"])
        plt.title("Sleep Hours Trend")
        plt.xlabel("Days")
        plt.ylabel("Sleep Hours")
        plt.grid(alpha=0.3)

        plt.savefig(os.path.join(GRAPH_DIR, "sleep_trend.png"))
        plt.close()

    # -----------------------------
    # 4 MOOD DISTRIBUTION
    # -----------------------------
    if "mood_score" in df.columns:
        plt.figure()
        plt.hist(df["mood_score"], bins=10)
        plt.title("Mood Score Distribution")
        plt.xlabel("Mood Score")
        plt.ylabel("Frequency")

        plt.savefig(os.path.join(GRAPH_DIR, "mood_distribution.png"))
        plt.close()

    # -----------------------------
    # 5 PRODUCTIVITY DISTRIBUTION
    # -----------------------------
    if "productivity_score" in df.columns:
        plt.figure()
        plt.hist(df["productivity_score"], bins=10)
        plt.title("Productivity Score Distribution")
        plt.xlabel("Productivity Score")
        plt.ylabel("Frequency")

        plt.savefig(os.path.join(GRAPH_DIR, "productivity_distribution.png"))
        plt.close()

    # -----------------------------
    # 6 SLEEP vs MOOD
    # -----------------------------
    if "sleep_hours" in df.columns and "mood_score" in df.columns:
        plt.figure()
        plt.scatter(df["sleep_hours"], df["mood_score"])
        plt.title("Sleep vs Mood")
        plt.xlabel("Sleep Hours")
        plt.ylabel("Mood Score")

        plt.savefig(os.path.join(GRAPH_DIR, "sleep_vs_mood.png"))
        plt.close()

    # -----------------------------
    # 7 STEPS vs PRODUCTIVITY
    # -----------------------------
    if "total_steps" in df.columns and "productivity_score" in df.columns:
        plt.figure()
        plt.scatter(df["total_steps"], df["productivity_score"])
        plt.title("Steps vs Productivity")
        plt.xlabel("Steps")
        plt.ylabel("Productivity Score")

        plt.savefig(os.path.join(GRAPH_DIR, "steps_vs_productivity.png"))
        plt.close()

    # -----------------------------
    # 8 CORRELATION HEATMAP
    # -----------------------------
    corr = df.corr(numeric_only=True)

    plt.figure(figsize=(10, 8))
    plt.imshow(corr, aspect="auto")
    plt.colorbar()

    plt.xticks(range(len(corr.columns)), corr.columns, rotation=90)
    plt.yticks(range(len(corr.columns)), corr.columns)

    plt.title("Feature Correlation Heatmap")
    plt.tight_layout()

    plt.savefig(os.path.join(GRAPH_DIR, "correlation_heatmap.png"))
    plt.close()

    print("Graphs generated successfully")