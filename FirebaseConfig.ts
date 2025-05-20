import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCYH3qVWTVsrUtHsfl0AKzCP73zl7hSIy4",
  authDomain: "tourist-app-fe5f7.firebaseapp.com",
  projectId: "tourist-app-fe5f7",
  storageBucket: "tourist-app-fe5f7.firebasestorage.app",
  messagingSenderId: "808062798715",
  appId: "1:808062798715:web:7a564b2cf06a1825930bde",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
