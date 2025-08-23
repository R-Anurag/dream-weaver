
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your own Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: "dream-weaver-qpc40.firebaseapp.com",
  projectId: "dream-weaver-qpc40",
  storageBucket: "dream-weaver-qpc40.firebasestorage.app",
  messagingSenderId: "892490259196",
  appId: "1:892490259196:web:3765d1da1a59b9ef0e1579"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
