// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDCFskXLJLsK-qhCCPipztpK3hIDmOQT3o",
    authDomain: "erp-municipalidades.firebaseapp.com",
    projectId: "erp-municipalidades",
    storageBucket: "erp-municipalidades.firebasestorage.app",
    messagingSenderId: "391274758329",
    appId: "1:391274758329:web:0e18687ea770f9bf811b68",
    measurementId: "G-MP0JLKEEYS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
