import App from './App.svelte';
import './index.css';
import firebase from "firebase"

const app = new App({
  target: document.body,
});

export default app;

export function initFirebase() {
  if(!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyAkkqMU1qe8HoCrEObNJXvxT3wIywz2ulU",
      authDomain: "time-tracker-1af57.firebaseapp.com",
      projectId: "time-tracker-1af57",
      storageBucket: "time-tracker-1af57.appspot.com",
      messagingSenderId: "191631527516",
      appId: "1:191631527516:web:74b335167125e9e48de099"
    });
    firebase.firestore().enablePersistence();
  }
}
