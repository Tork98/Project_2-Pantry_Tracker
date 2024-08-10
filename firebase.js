// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKRpVxc-ZEgdX6YHRYIIyYicEiIiBzNgM",
  authDomain: "project-2-pantry-tracker-f8aae.firebaseapp.com",
  projectId: "project-2-pantry-tracker-f8aae",
  storageBucket: "project-2-pantry-tracker-f8aae.appspot.com",
  messagingSenderId: "976688087604",
  appId: "1:976688087604:web:1d034271e1842f0e380061",
  measurementId: "G-562MKK5QS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export const auth = getAuth(app);
export {firestore}

