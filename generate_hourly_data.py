import pandas as pd
import random

df = pd.read_csv("data/daily_data.csv")

rows = []

for _, row in df.iterrows():
    date = row["date"]
    steps = int(row["total_steps"]) if "total_steps" in row else int(row[3])

    # extract start & end hour (adjust index if needed)
    try:
        start_hour = int(row[13])
        end_hour = int(row[14])
    except:
        start_hour, end_hour = 6, 22  # fallback

    duration = max(1, end_hour - start_hour)

    # distribute steps randomly but realistically
    remaining_steps = steps

    for hour in range(start_hour, end_hour):
        if hour == end_hour - 1:
            step_val = remaining_steps
        else:
            step_val = random.randint(0, remaining_steps // duration + 50)

        remaining_steps -= step_val

        rows.append({
            "date": date,
            "hour": hour,
            "steps": max(0, step_val)
        })

hourly_df = pd.DataFrame(rows)

hourly_df.to_csv("data/hourly_data.csv", index=False)

print("✅ Hourly data created!")