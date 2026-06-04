import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

CLIENT_ID = "23TXMK"
CLIENT_SECRET = "b19bed40782c38915f7a78687262612b"

REDIRECT_URI = "http://localhost:5000/callback"

SCOPES = "activity heartrate sleep profile"

FITBIT_TOKEN_FILE = os.path.join(BASE_DIR, "fitbit_token.json")

LISTEN_API_KEY = os.environ.get(
    "LISTEN_API_KEY",
    "2a04ae160d0e42ddb4fd06a5b367a527",
)

# config.py
FITBIT_SCOPES = "activity heartrate sleep profile"
GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar']
