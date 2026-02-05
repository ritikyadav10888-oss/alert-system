import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    deleteDoc,
    doc,
    setDoc,
    Timestamp,
    where
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export const isDev = process.env.NODE_ENV === 'development';

const DB_COLLECTION = isDev ? 'bookings_test' : 'bookings';

export const getBookings = async (): Promise<any[]> => {
    try {
        const q = query(
            collection(db, DB_COLLECTION),
            orderBy('timestamp', 'desc'),
            limit(1000)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            // Convert Firestore Timestamp to Date if needed
            timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
        }));
    } catch (e) {
        console.error("Firestore Fetch Error:", e);
        return [];
    }
};

export const saveBookings = async (bookings: any[]): Promise<void> => {
    try {
        const colRef = collection(db, DB_COLLECTION);

        // Firestore is best used by adding individual docs, but to stay compatible with existing array-based logic:
        // We'll treat the 'bookings' as a single source of truth or individual entries.
        // For this system, we'll save EACH booking as a document if it doesn't exist.

        for (const booking of bookings) {
            const bookingId = booking.id.toString();
            const docRef = doc(db, DB_COLLECTION, bookingId);

            await setDoc(docRef, {
                ...booking,
                timestamp: booking.timestamp instanceof Date ? Timestamp.fromDate(booking.timestamp) : Timestamp.fromDate(new Date(booking.timestamp)),
                updatedAt: Timestamp.now()
            }, { merge: true });
        }
    } catch (e) {
        console.error("Firestore Save Error:", e);
    }
};

export const clearHistory = async (): Promise<void> => {
    try {
        const q = query(collection(db, DB_COLLECTION));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, DB_COLLECTION, d.id)));
        await Promise.all(deletePromises);
    } catch (e) {
        console.error("Firestore Clear Error:", e);
    }
};
