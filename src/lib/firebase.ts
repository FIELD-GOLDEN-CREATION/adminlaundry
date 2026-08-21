import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBC2OoyrRVDNsvc8ztGAfsiGRs5Sogjvu0",
  authDomain: "freshfold-86da1.firebaseapp.com",
  projectId: "freshfold-86da1",
  storageBucket: "freshfold-86da1.firebasestorage.app",
  messagingSenderId: "563839138064",
  appId: "1:563839138064:web:84f2655d9f33bcec038d95"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
