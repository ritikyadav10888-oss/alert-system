
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/bookings_test.json', 'utf8'));

const targets = data.filter(b => {
    const dString = b.gameDate || b.timestamp;
    // Check various formats or just simple string includes for Feb 3
    if (dString.includes('Feb 3') || dString.includes('Feb 03') || dString.includes('03 Feb')) return true;
    if (dString.includes('2026-02-03')) return true;
    if (dString.includes('03-02-2026')) return true;

    // Check if timestamp is specifically on that day (in UTC or local?)
    const d = new Date(b.timestamp);
    // Booking timestamp often is booking creation time, not game time. But let's check.
    // The user likely means gameDate.

    return false;
});

console.log('Found:', targets.length);
targets.forEach(t => {
    console.log(`ID: ${t.id}, GameDate: ${t.gameDate}, Time: ${t.gameTime}, Msg: ${t.message}`);
});
