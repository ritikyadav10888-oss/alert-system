import { adminDb } from './firebase-admin';
import { isDev } from './db-config'; // I'll create this to share isDev logic

const DB_COLLECTION = isDev ? 'bookings_test' : 'bookings';

export const getBookings = async (): Promise<any[]> => {
    try {
        const snapshot = await adminDb.collection(DB_COLLECTION)
            .orderBy('timestamp', 'desc')
            .limit(1000)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                // Convert Admin Timestamp to Date
                timestamp: data.timestamp?.toDate() || new Date(data.timestamp)
            };
        });
    } catch (e) {
        console.error("Firestore Admin Fetch Error:", e);
        return [];
    }
};

export const saveBookings = async (bookings: any[]): Promise<void> => {
    try {
        const batch = adminDb.batch();

        for (const booking of bookings) {
            const bookingId = booking.id.toString();
            const docRef = adminDb.collection(DB_COLLECTION).doc(bookingId);

            const timestamp = booking.timestamp instanceof Date
                ? booking.timestamp
                : new Date(booking.timestamp);

            batch.set(docRef, {
                ...booking,
                timestamp: timestamp,
                updatedAt: new Date()
            }, { merge: true });
        }

        await batch.commit();
    } catch (e) {
        console.error("Firestore Admin Save Error:", e);
    }
};

export const clearHistory = async (): Promise<void> => {
    try {
        const snapshot = await adminDb.collection(DB_COLLECTION).get();
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    } catch (e) {
        console.error("Firestore Admin Clear Error:", e);
    }
};
