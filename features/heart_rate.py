import requests


def get_intraday_hr(access_token, date):

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    url = f"https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d/1min.json"

    try:
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print("Fitbit API error:", response.status_code)
            return []

        data = response.json()

    except Exception as e:
        print("Error fetching heart rate:", e)
        return []

    dataset = data.get("activities-heart-intraday", {}).get("dataset", [])

    result = []

    for entry in dataset:

        result.append({
            "time": entry.get("time"),
            "hr": entry.get("value")
        })

    return result