
interface Booking {
    id: string;
    platform: 'Playo' | 'Hudle' | 'District' | 'Khelomore' | 'System';
    location: string;
    gameDate: string;
    gameTime: string;
    sport: string;
    paidAmount: string;
    timestamp: Date;
    message: string;
    bookingSlot: string;
    bookingName: string;
    managerName?: string;
}

const SPORTS = [
    { name: 'Cricket', priceMin: 1200, priceMax: 2000, weight: 0.4 },
    { name: 'Badminton', priceMin: 400, priceMax: 800, weight: 0.3 },
    { name: 'Pickleball', priceMin: 600, priceMax: 1000, weight: 0.2 },
    { name: 'Football', priceMin: 1500, priceMax: 2500, weight: 0.1 }
];

const PLATFORMS = ['Playo', 'Hudle', 'Khelomore', 'District'] as const;
const LOCATIONS = ['Thane', 'Baner', 'Model Colony', 'Dahisar', 'Borivali', 'Andheri', 'Matoshree'];
const NAMES = ['Rahul', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Priya', 'Karan', 'Neha', 'Suresh'];

const getRandomItem = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getWeightedSport = () => {
    const r = Math.random();
    let sum = 0;
    for (const s of SPORTS) {
        sum += s.weight;
        if (r <= sum) return s;
    }
    return SPORTS[0];
};

export const generateRealisticHistory = (baseData: any[]): any[] => {
    // If we have enough real data, don't generate too much
    if (baseData.length > 500) return baseData;

    const mockData: Booking[] = [];
    const now = new Date();

    // Generate data for past 30 days
    for (let d = 0; d < 30; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // More bookings on weekends (15-25) vs weekdays (8-15)
        const dailyCount = isWeekend ? getRandomInt(15, 25) : getRandomInt(8, 15);

        for (let i = 0; i < dailyCount; i++) {
            const sport = getWeightedSport();
            const platform = getRandomItem(PLATFORMS);
            const location = getRandomItem(LOCATIONS);

            // Peak hours logic: Morning 6-9, Evening 6-10
            let hour;
            const r = Math.random();
            if (r < 0.3) hour = getRandomInt(6, 9); // Morning
            else if (r < 0.8) hour = getRandomInt(18, 22); // Evening
            else hour = getRandomInt(10, 17); // Afternoon

            const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
            const gameTime = `${timeStr} - ${hour > 12 ? hour - 11 : hour + 1}:00 ${hour >= 11 ? 'PM' : 'AM'}`;

            const amount = getRandomInt(sport.priceMin, sport.priceMax);
            // Round to nearest 10
            const finalAmount = Math.round(amount / 10) * 10;

            // Adjust timestamp to be slightly varied
            const timestamp = new Date(date);
            timestamp.setHours(hour, getRandomInt(0, 59));

            mockData.push({
                id: `mock_${d}_${i}`,
                platform,
                location,
                gameDate: date.toLocaleDateString('en-GB'), // DD/MM/YYYY
                gameTime,
                sport: sport.name,
                paidAmount: `₹${finalAmount.toLocaleString('en-IN')}`,
                timestamp,
                message: `${platform} Booking #${getRandomInt(10000, 99999)}`,
                bookingSlot: `${timeStr} on ${date.toLocaleDateString()}`,
                bookingName: getRandomItem(NAMES),
                managerName: 'System (Mock)'
            });
        }
    }

    // Sort combined data by timestamp descending
    return [...baseData, ...mockData].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};
