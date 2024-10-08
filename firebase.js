import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"

const firebaseConfig = {
    apiKey: "AIzaSyB4VKqbnhg3746as_0hhdfLOF3hvF3y9M0",
    authDomain: "blogging-application-5e207.firebaseapp.com",
    projectId: "blogging-application-5e207",
    storageBucket: "blogging-application-5e207.appspot.com",
    messagingSenderId: "290174443340",
    appId: "1:290174443340:web:b45b396d34cb484978b9e9"
};

var app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app)

export {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    db,
    auth,
    storage,
    ref,
    getDownloadURL,
    uploadBytes,
}