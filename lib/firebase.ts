// Firebase client initialisation. The web config is public by design — security
// is enforced by Firestore Security Rules and Firebase Auth settings, not by
// hiding these values.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// These are the public Firebase web config values for the `drover-9717a`
// project. They are PUBLIC by design (security is enforced by Firestore Rules +
// Auth settings), so embedding them as defaults is safe and means the static
// build never depends on CI environment variables being present. Env vars still
// override them if set.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCNVgOMnyxy1dAnXwZmZZDELUmM1Owrt-E',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'drover-9717a.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'drover-9717a',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'drover-9717a.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '235302504218',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:235302504218:web:d59ab7dc3ee75787a9cea3',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XLFS3JF79M',
};

// Reuse the app across hot-reloads / route changes.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
