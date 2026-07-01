// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAVlfdWnfa-HCKTMUQd0de0zO9AVrJbp6k",
  authDomain: "predictcareapp.firebaseapp.com",
  projectId: "predictcareapp",
  storageBucket: "predictcareapp.firebasestorage.app",
  messagingSenderId: "416282566646",
  appId: "1:416282566646:web:7ad6d61c86b74f134171d7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);