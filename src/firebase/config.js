import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAhC6UjHILW2LCERiA_SdgoXkog4kRvidI').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'informationsecurity-8b377.firebaseapp.com').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'informationsecurity-8b377').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'informationsecurity-8b377.firebasestorage.app').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '193755410467').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '1:193755410467:web:ae3095cbb20239a6df8196').trim(),
};

if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase API key. Check VITE_FIREBASE_API_KEY in .env');
}

console.info('[Firebase] Using project:', firebaseConfig.projectId, 'key suffix:', firebaseConfig.apiKey.slice(-6));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

export { auth, db };
