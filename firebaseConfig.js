import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAp4DuGQbARwiNgjh3l_0Fp38lCCCQPDYw",
  authDomain: "hireflow-33f2e.firebaseapp.com",
  projectId: "hireflow-33f2e",
  storageBucket: "hireflow-33f2e.firebasestorage.app",
  messagingSenderId: "832971842392",
  appId: "1:832971842392:android:2f99c5e68d9c4fdd11fb2d",
  databaseURL: "https://hireflow-33f2e.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
let authInstance;
if (Platform.OS === "web") {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;
