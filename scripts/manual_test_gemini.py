import requests
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print(f"Testing API Key: {GEMINI_API_KEY[:5]}...")

models_to_try = [
    "gemini-2.5-flash",
    "gemini-1.0-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

versions = ["v1beta", "v1"]


for version in versions:
    for model in models_to_try:
        print(f"Testing {model} ({version})...")
        url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": [{
                "parts": [{"text": "Hello, simply say 'OK'"}]
            }]
        }
        try:
            response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=10)
            if response.status_code == 200:
                print(f"  -> SUCCESS! {model} ({version}) works.")
                print(response.json())
                exit(0)
            else:
                print(f"  -> Failed: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"  -> Exception: {e}")
