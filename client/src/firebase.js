import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAj9Zf-H7fZ93oxYFyDTW6chIdW-1-7O1g",
    authDomain: "dbchatroomtest.firebaseapp.com",
    projectId: "dbchatroomtest",
    storageBucket: "dbchatroomtest.appspot.com",
    messagingSenderId: "465223248067",
    appId: "1:465223248067:web:f71707dea068b29fa69a76",
    measurementId: "G-FQ4RW2HX19"
};

const firebaseApp = initializeApp(firebaseConfig);
export const firestoreDB = getFirestore(firebaseApp);