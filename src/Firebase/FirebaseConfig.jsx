import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const FirebaseConfig = {
    apiKey: "AIzaSyDGV-A2Ln1qVI8x_1tn94to8T5ipxCtYxk",
    authDomain: "hrportal-b3ac4.firebaseapp.com",
    projectId: "hrportal-b3ac4",
    storageBucket: "hrportal-b3ac4.firebasestorage.app",
    messagingSenderId: "476446437858",
    appId: "1:476446437858:web:2513cbded2f7ac654189bb",
    measurementId: "G-DHVCTKCEGZ"
};

const app = initializeApp(FirebaseConfig);
const auth = getAuth(app);
const fireDB = getFirestore(app);

export { auth, fireDB, signInWithEmailAndPassword };