import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initializeAdmin() {
    if (!admin.apps.length) {
        if (!firebaseAdminConfig.privateKey || !firebaseAdminConfig.clientEmail) {
            console.warn('[FirebaseAdmin] Missing Service Account credentials. Falling back to default app if available.');
            return admin.initializeApp({
                projectId: firebaseAdminConfig.projectId
            });
        }

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: firebaseAdminConfig.projectId,
                clientEmail: firebaseAdminConfig.clientEmail,
                privateKey: firebaseAdminConfig.privateKey,
            }),
        });
    }
    return admin.app();
}

const adminApp = initializeAdmin();
const adminDb = admin.firestore(adminApp);

// Set settings for performance and stability in Serverless
adminDb.settings({ ignoreUndefinedProperties: true });

export { adminDb, adminApp };
