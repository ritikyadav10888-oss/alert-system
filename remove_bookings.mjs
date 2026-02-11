
import fs from 'fs';

const FILE_PATH = './data/bookings_test.json';
const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

const idsToRemove = ['2203', '2204'];
const filtered = data.filter(b => !idsToRemove.includes(b.id));

fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2));
console.log(`Removed ${data.length - filtered.length} records.`);
