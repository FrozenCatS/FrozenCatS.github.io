import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEu3KCyrmcgNINO4hpiEXThBoOXQKFldE",
  authDomain: "movieranker-d8558.firebaseapp.com",
  projectId: "movieranker-d8558",
  storageBucket: "movieranker-d8558.appspot.com",
  messagingSenderId: "713147475118",
  appId: "1:713147475118:web:76870283fa54ae9832f93f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
