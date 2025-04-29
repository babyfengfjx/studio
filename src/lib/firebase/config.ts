
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
// import { getFirestore, Firestore } from 'firebase/firestore'; // Import Firestore if needed later
// import { getStorage, FirebaseStorage } from 'firebase/storage'; // Import Storage if needed

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// ========================================================================
// IMPORTANT: Firebase Credentials Required!
// ========================================================================
// You MUST create a file named `.env.local` in the root of your project
// (next to package.json) and add your Firebase project's configuration keys.
//
// The keys MUST be prefixed with `NEXT_PUBLIC_` for Next.js to expose them
// to the browser.
//
// Example `.env.local` file contents:
//
// NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
// NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
// # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID (Optional)
//
// *** You MUST restart your development server (e.g., `npm run dev` or `yarn dev`)
// *** after creating or modifying the `.env.local` file for the changes to take effect.
//
// The "auth/api-key-not-valid" error means these environment variables
// are missing, incorrect, or the server wasn't restarted after changes.
// ========================================================================
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
    throw new Error("Invalid Firebase configuration. Check browser console and ensure `.env.local` is set up correctly and the server was restarted.");
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

