import requests
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import os
import sys


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# GRAPH DIRECTORY
HR_GRAPH_DIR = os.path.join(os.path.dirname(__file__), "hr_graph")
os.makedirs(HR_GRAPH_DIR, exist_ok=True)


def fetch_hr(access_token, date_str):

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    url = f"https://api.fitbit.com/1/user/-/activities/heart/date/{date_str}/1d/1min.json"

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print("API error:", response.status_code)
            return []

        data = response.json()

    except Exception as e:
        print("Request failed:", e)
        return []

    dataset = data.get("activities-heart-intraday", {}).get("dataset", [])

    return [entry.get("value") for entry in dataset]


def plot_hr(date_str, hr_values):

    if not hr_values:
        print(f"No HR data for {date_str}")
        return

    x = list(range(len(hr_values)))

    plt.figure(figsize=(12, 4))
    plt.plot(x, hr_values, linewidth=1)

    plt.title(f"Heart Rate on {date_str}")
    plt.xlabel("Hour of Day")
    plt.ylabel("Heart Rate (BPM)")

    hour_ticks = list(range(0, 1440, 60))
    hour_labels = list(range(24))

    plt.xticks(hour_ticks, hour_labels)
    plt.ylim(40, 160)

    plt.grid(alpha=0.3)
    plt.tight_layout()

    plt.savefig(os.path.join(HR_GRAPH_DIR, f"hr_{date_str}.png"))
    plt.close()


def generate_hr_graphs(access_token, start_date, end_date):

    day = start_date

    while day <= end_date:

        date_str = day.strftime("%Y-%m-%d")

        hr_values = fetch_hr(access_token, date_str)

        plot_hr(date_str, hr_values)

        day += timedelta(days=1)

    print("Heart rate graphs saved.")


def main():

    if len(sys.argv) < 2:
        print("Usage:")
        print("python hr_visualization.py <TOKEN> [start_date] [end_date]")
        sys.exit()

    access_token = sys.argv[1]

    if len(sys.argv) == 2:
        start_date = datetime.now()
        end_date = datetime.now()

    elif len(sys.argv) == 3:
        start_date = datetime.strptime(sys.argv[2], "%Y-%m-%d")
        end_date = start_date

    elif len(sys.argv) == 4:
        start_date = datetime.strptime(sys.argv[2], "%Y-%m-%d")
        end_date = datetime.strptime(sys.argv[3], "%Y-%m-%d")

    else:
        print("Invalid arguments")
        sys.exit()

    generate_hr_graphs(access_token, start_date, end_date)


if __name__ == "__main__":
    main()