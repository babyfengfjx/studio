
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
// import { getFirestore, Firestore } from 'firebase/firestore'; // Import Firestore if needed later
// import { getStorage, FirebaseStorage } from 'firebase/storage'; // Import Storage if needed

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Ensure these environment variables are correctly set in your .env.local file
// and prefixed with NEXT_PUBLIC_ for client-side access.
// YOU MUST RESTART your development server after creating or modifying .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  // Check if all necessary config values are present
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
  ) {
    console.error(
      'Firebase configuration is missing or incomplete. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set in your .env.local file. Remember to restart the development server (e.g., `npm run dev`) after modifying the .env.local file.'
    );
    // Throw an error during development to make the configuration issue explicit.
    // This prevents the application from potentially running with invalid credentials.
    throw new Error("Invalid Firebase configuration. Check browser console and .env.local file.");
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
// const db: Firestore = getFirestore(app); // Initialize Firestore if needed
// const storage: FirebaseStorage = getStorage(app); // Initialize Storage if needed

export { app, auth };
// export { app, auth, db, storage }; // Export db/storage if needed
