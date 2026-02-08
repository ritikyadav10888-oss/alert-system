import os
import imap_tools
from imap_tools import MailBox, AND
import requests
import json
import re
from datetime import datetime
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'imap.gmail.com')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
API_URL = 'http://localhost:3000/api/upload-bookings'
API_SECRET = os.getenv('API_SECRET_KEY', 'dev-secret-123')

print(f"Starting Email Processor...")
print(f"User: {EMAIL_USER}")
print(f"Host: {EMAIL_HOST}")

def clean_text(text):
    if not text: return ""
    # Remove HTML tags approx
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_with_regex(subject, body, platform):
    data = {
        'platform': platform,
        'gameDate': 'MISSING',
        'gameTime': 'MISSING',
        'location': 'Unknown Location',
        'sport': 'General',
        'bookingName': 'N/A',
        'paidAmount': 'N/A',
        'bookingSlot': 'MISSING'
    }

    # 1. Location
    locations = {
        'Matoshree': ['Matoshree', 'Matoshri', 'Jogeshwari'],
        'Thane': ['Thane', 'Thane West'],
        'Borivali': ['Borivali'],
        'Dahisar': ['Dahisar', 'Dahisar East'],
        'Andheri': ['Andheri'],
        'Powai': ['Powai'],
        'Shivajinagar': ['Shivajinagar', 'Pune']
    }
    
    full_text = (subject + " " + body).lower()
    
    # 0. Junk Filtering
    junk_keywords = [
        'now live on district', 'download requested file', 'settlement report', 
        'payment report', 'payee advice', 'friend suggestion', 'security alert',
        'payout report', 'reprots', 'summary report'
    ]
    if any(kw in full_text for kw in junk_keywords):
        print(f"  -> Skipping junk/admin email: {subject}")
        return None

    for loc_name, aliases in locations.items():
        if any(alias.lower() in full_text for alias in aliases):
            data['location'] = loc_name
            break

    # 2. Sport
    sports = ['Badminton', 'Cricket', 'Pickleball', 'Football', 'Tennis', 'Squash']
    for s in sports:
        if s.lower() in full_text:
            data['sport'] = s
            break
    
    # Infer Sport from Venue/Context if missing
    if data['sport'] == 'General':
        if 'force playing fields' in full_text or 'court' in full_text:
            data['sport'] = 'Badminton'

    # 3. Booking Name
    patterns = [
        r'(?:Buyer|Purchased by|Ordered by|User Name|Customer Name|Player Name|Booking Name|Name|Customer|Player|Booked by)[\s:]+([A-Za-z ]+)',
        r'(?:^|\n)\s*(?:Hi|Dear|Hello|Hey),?\s+([A-Za-z ]+)'
    ]
    
    for pat in patterns:
        match = re.search(pat, body, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up
            name = name.split('\n')[0].split('|')[0].strip()
            
            # Validation
            forbidden = ['a', 'the', 'your', 'booking', 'team', 'thank', 'you', 'dear', 'it', 'is', 'to', 'from', 'this', 'by', 'playo', 'hudle', 'district', 'khelomore']
            lower_name = name.lower()
            is_forbidden = any(re.search(rf'\b{kw}\b', lower_name) for kw in forbidden)
            
            if len(name) >= 2 and len(name) < 40 and not is_forbidden:
                data['bookingName'] = name
                break

    # 4. Amount
    amount_match = re.search(r'(?:Total|Paid|Amount)[:\s]+(?:Rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)', body, re.IGNORECASE)
    if amount_match:
        data['paidAmount'] = f"₹{amount_match.group(1).replace(',', '')}"

    # 5. Date & Time (The tricky part)
    # District: "Date February 04 | 8:00pm"
    if platform == 'District':
        # Name correction for District (often in "You have a new purchase!" emails)
        # Body often contains: "Customer Name: Sagar Jogale"
        if data['bookingName'] == 'N/A':
            name_dist = re.search(r'Customer Name[:\s]+([A-Za-z ]+)', body, re.IGNORECASE)
            if name_dist:
                data['bookingName'] = name_dist.group(1).strip()
        
        district_match = re.search(r'Date\s+([A-Za-z]+\s+\d{1,2})\s*\|\s*(\d{1,2}:\d{2}\s*(?:am|pm))', body, re.IGNORECASE)
        if district_match:
            date_part = district_match.group(1) # e.g. February 04
            # Append current year if missing
            current_year = datetime.now().year
            # Check if next year (e.g. email in Dec for Jan booking)
            # For now, just assume current year or explicitly existing year?
            # District emails usually don't have year in that specific line "Date February 04 | ..."
            # So we append current year.
            try:
                dt = datetime.strptime(f"{date_part} {current_year}", "%B %d %Y")
                data['gameDate'] = dt.strftime("%Y-%m-%d") # Standardize to YYYY-MM-DD
            except:
                data['gameDate'] = f"{date_part} {current_year}"

            data['gameTime'] = district_match.group(2) # e.g. 8:00pm
            data['bookingSlot'] = f"{data['gameDate']} | {data['gameTime']}"
    
    # Generic / Playo / Hudle
    if data['gameDate'] == 'MISSING':
        date_Patterns = [
            r'(\d{1,2}\s+\w{3},\s*\d{4})',       # 24 Jan, 2026
            r'(\w{3}\s+\d{1,2},?\s*\d{4})',       # Jan 24, 2026
            r'(\d{1,2}-\d{2}-\d{4})',             # 24-01-2026
            r'(\d{4}-\d{2}-\d{2})'                # 2026-01-24
        ]
        for pat in date_Patterns:
            match = re.search(pat, body)
            if match:
                data['gameDate'] = match.group(1)
                break
    
    if data['gameTime'] == 'MISSING':
        time_match = re.search(r'(\d{1,2}:\d{2}\s*(?:AM|PM)(?:\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM))?)', body, re.IGNORECASE)
        if time_match:
            data['gameTime'] = time_match.group(1)

    if data['bookingSlot'] == 'MISSING' and data['gameDate'] != 'MISSING' and data['gameTime'] != 'MISSING':
        data['bookingSlot'] = f"{data['gameDate']} | {data['gameTime']}"

    return data

def call_gemini_api(email_body):
    if not GEMINI_API_KEY:
        print("No GEMINI_API_KEY found. Skipping AI.")
        return None
        
    models_to_try = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-pro"
    ]

    prompt = f"""
    Extract booking details from this email confirmation and return ONLY a raw JSON object.
    IMPORTANT:
    1. For "bookingName", extract the FULL NAME of the person who made the booking. 
       Ignore generic labels like "User", "Buyer", "Purchased by", "Customer", "Sport", "Staff", "Manager", "System". 
       If no real human name is found, return "N/A".
    2. For "gameDate", use format "D MMM YYYY" (e.g. 12 Feb 2026). If the year is missing or 2001, assume 2026.
    3. For "gameTime", provide the full time range (e.g. 06:00 PM - 07:00 PM).
    4. Ensure the response is valid JSON.

    {{
      "gameDate": "standardized date",
      "gameTime": "standardized time range",
      "location": "venue name",
      "sport": "name of sport",
      "bookingName": "full name of customer",
      "paidAmount": "amount with currency symbol"
    }}

    Email Body:
    {email_body[:4000]}
    """

    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=15)
            if response.status_code == 200:
                result = response.json()
                text_response = result['candidates'][0]['content']['parts'][0]['text']
                # Clean markdown
                clean_json = text_response.replace('```json', '').replace('```', '').strip()
                data = json.loads(clean_json)
                
                # Validation: Discard generic labels
                forbidden = ['user', 'buyer', 'customer', 'staff', 'purchased', 'ordered', 'booking', 'booked', 'hi', 'dear', 'team', 'thank']
                if data.get('bookingName') and any(f in data['bookingName'].lower() for f in forbidden):
                    if data['bookingName'].lower() in forbidden or 'name' in data['bookingName'].lower():
                        data['bookingName'] = 'N/A'
                
                print(f"  -> Success with {model_name}")
                return data
            elif response.status_code == 404:
                continue
            else:
                print(f"Gemini API Error with {model_name}: {response.status_code}")
                continue
        except Exception as e:
            print(f"Gemini Request Failed with {model_name}: {e}")
            continue
            
    print("  -> All models failed.")
    return None

def process_emails():
    # Fetch last 30 days
    try:
        with MailBox(EMAIL_HOST).login(EMAIL_USER, EMAIL_PASSWORD) as mailbox:
            # Search criteria
            print("Searching for emails (last 30 days)...")
            from datetime import timedelta
            start_date = (datetime.now() - timedelta(days=30)).date()
            criteria = AND(date_gte=start_date)
            
            bookings_to_upload = []

            for msg in mailbox.fetch(criteria, reverse=True, limit=50):
                subject = msg.subject
                body = msg.text or msg.html
                clean_body = clean_text(body)
                
                # Identify Platform
                platform = 'Unknown'
                lower_sub = (subject + " " + msg.from_).lower()
                
                if 'playo' in lower_sub: platform = 'Playo'
                elif 'hudle' in lower_sub: platform = 'Hudle'
                elif 'district' in lower_sub: platform = 'District'
                elif 'khelomore' in lower_sub: platform = 'Khelomore'
                
                if platform == 'Unknown': continue
                
                print(f"Processing: {subject} ({platform})")
                
                # 1. Regex Attempt
                data = extract_with_regex(subject, clean_body, platform)
                
                # 2. AI Fallback (Triggered if Name, Date, or Time is missing)
                if data['gameDate'] == 'MISSING' or data['gameTime'] == 'MISSING' or data['bookingName'] == 'N/A':
                    print(f"  -> Missing data ({'Name' if data['bookingName'] == 'N/A' else 'Date/Time'}). Trying AI...")
                    ai_data = call_gemini_api(clean_body)
                    if ai_data:
                        print("  -> AI Success!")
                        # Merge AI data
                        if data['gameDate'] == 'MISSING' or '2001' in data['gameDate']: 
                            data['gameDate'] = ai_data.get('gameDate', data['gameDate'])
                        if data['gameTime'] == 'MISSING': 
                            data['gameTime'] = ai_data.get('gameTime', data['gameTime'])
                        if data['location'] == 'Unknown Location': 
                            data['location'] = ai_data.get('location', data['location'])
                        if data['bookingName'] == 'N/A' and ai_data.get('bookingName') != 'N/A': 
                            data['bookingName'] = ai_data.get('bookingName', 'N/A')
                        
                        data['bookingSlot'] = f"{data['gameDate']} | {data['gameTime']}"

                data['id'] = msg.uid
                data['message'] = subject
                data['timestamp'] = msg.date.isoformat()
                
                if data['gameDate'] != 'MISSING':
                    bookings_to_upload.append(data)

            # Upload
            if bookings_to_upload:
                print(f"Uploading {len(bookings_to_upload)} bookings...")
                res = requests.post(API_URL, json={'bookings': bookings_to_upload}, headers={'x-api-key': API_SECRET})
                print(f"Upload Status: {res.status_code} - {res.text}")
            else:
                print("No valid bookings found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_emails()
