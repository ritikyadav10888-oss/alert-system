import requests
import os
from dotenv import load_dotenv
import json

load_dotenv('.env.local')
key = os.getenv('GEMINI_API_KEY')
# Trim whitespace just in case
if key: key = key.strip()

print(f"Key: {key[:5]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
try:
    res = requests.get(url)
    if res.status_code == 200:
        models = res.json().get('models', [])
        for m in models:
            print(f"Name: {m['name']}, Supported: {m.get('supportedGenerationMethods')}")
    else:
        print(f"Error: {res.status_code} - {res.text}")
except Exception as e:
    print(f"Failed: {e}")
