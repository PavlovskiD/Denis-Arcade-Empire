// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyB0Uy0h7R8ypVJ0o78zGMFlqObUa6Q9K-c",
  authDomain: "deni-sarcadeempire.firebaseapp.com",
  projectId: "deni-sarcadeempire",
  storageBucket: "deni-sarcadeempire.appspot.com",
  messagingSenderId: "203740082013",
  appId: "1:203740082013:web:e37c67858bd73d46cc42b4",
  measurementId: "G-QQYTCHJ4WY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

