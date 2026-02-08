
const samples = [
    {
        name: 'District Purchase',
        text: `
        You have a new purchase!
        Customer Name: Sagar Jogale
        Amount: ₹950.01
        Date February 08 | 5:00pm
        Venue: Borivali
        `
    },
    {
        name: 'District Agreement',
        text: `
        Completed: "District Play X Matoshri Arts - Booking Services Agreement"
        Customer Name: Ayush Singhal
        Paid: Rs. 600
        `
    },
    {
        name: 'District with Date/Time mixed',
        text: `
        New Booking
        Customer: Kiran Dhanak
        Slot: Date Feb 08 | 5:00pm
        Paid: 950.01
        `
    },
    {
        name: 'Hudle Booking with IDs',
        text: `
        Hi,
        Your booking #HUD3757683981 is confirmed.
        Name: Kiran Dhanak
        Sport: Badminton
        Slot: Sat, Feb 14, 2026 8:00 AM - 10:00 AM
        `
    }
];

function extractBookingName(text: string): string {
    const patterns = [
        /(?:^|\n|[\*\•])\s*(?:Buyer|Purchased by|Ordered by|User Name|Customer Name|Player Name|Booking Name|Name|Customer|Player|Booked by)\s*[\s:]+\s*([A-Za-z]+(?:\s+[A-Za-z]+)*)/i,
        /(?:^|\n)\s*(?:Buyer|User Name|Customer Name|Booking Name|Name|User|Booked by)\s*:\s*([^\n\r\|]+)/i,
        /(?:Buyer|User Name|Customer Name|Booking Name|Name|User|Booked by)\s*[\s:]+\s*([^\n\r\|]+)/i
    ];

    const venueKeywords = [
        'playing', 'field', 'turf', 'club', 'trust', 'arts', 'sports', 'arena', 'court', 'venue',
        'force', 'matoshree', 'district', 'academy', 'insider', 'paytm', 'ground', 'fields',
        'partner', 'esteemed', 'business', 'organizer', 'manager', 'report', 'settlement', 'summary',
        'details', 'agreement', 'invoice', 'confirmation', 'booking id', 'transaction'
    ];

    // UPDATED: Added Paid, Rs, Currency Symbols, etc.
    const cleanupRegex = /(?:\s+|\||\n)(?:Mobile|Email|Phone|No|Contact|Sport|Venue|Address|Id|Date|Time|Slot|Status|Amount|Facility|Hi|Hello|Thank|Dear|By|Is|It|User ID|Buyer|Booking|Invoice|Payment|A booking|A completed|Details|Paid|Rs\.?|₹|INR)/i;

    for (const pattern of patterns) {
        const matches = Array.from(text.matchAll(new RegExp(pattern, 'gi')));
        for (const match of matches) {
            if (match && match[1]) {
                let name = match[1].trim();

                // Use the refined split
                name = name.split(cleanupRegex)[0].trim();
                name = name.replace(/^[\s\|\:\&\-\d\*\•]+|[\s\|\:\&\-\d\n\r]+$/g, "");

                const lowerName = name.toLowerCase();
                const isVenue = venueKeywords.some(kw => lowerName.includes(kw.toLowerCase()));

                const forbiddenKeywords = ['thank', 'you', 'dear', 'team', 'booking', 'it', 'is', 'the', 'your', 'a new', 'a booking', 'a completed', 'details', 'agreement'];
                const isForbidden = forbiddenKeywords.some(kw => {
                    const regex = new RegExp("\\b" + kw + "\\b", 'i');
                    return regex.test(lowerName);
                });

                if (name.length >= 2 && name.length < 40 && !isVenue && !isForbidden &&
                    !/\d/.test(name) &&
                    !lowerName.includes('email') && !lowerName.includes('mobile')) {
                    return name;
                }
            }
        }
    }
    return "N/A";
}

samples.forEach(s => {
    const result = extractBookingName(s.text);
    console.log(`Sample: ${s.name} | Extracted: [${result}]`);
});
