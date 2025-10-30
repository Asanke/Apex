import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDfdafXnvowDJdQcHgIKY6k1LrDORLp3WY",
  authDomain: "studio-1417219424-43dad.firebaseapp.com",
  projectId: "studio-1417219424-43dad",
  storageBucket: "studio-1417219424-43dad.firebasestorage.app",
  messagingSenderId: "316844638927",
  appId: "1:316844638927:web:3c87dded33f8196d7d2dba"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
