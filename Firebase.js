// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRv0RNeEJPM9afUtHD8FWPD3056jG1yVs",
  authDomain: "myproject-dca32.firebaseapp.com",
  projectId: "myproject-dca32",
  storageBucket: "myproject-dca32.appspot.com",
  messagingSenderId: "188125560150",
  appId: "1:188125560150:web:c1058f1922aeeb1acceaf7",
  measurementId: "G-NKK42WKNBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const storage = getStorage(app)
export{app , database, storage}
