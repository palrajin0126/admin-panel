import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import * as dotenv from 'dotenv';

dotenv.config();

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const dbAdmin = admin.firestore();
export const authAdmin = admin.auth();
export const messagingAdmin = admin.messaging(); // Initialize FCM admin
