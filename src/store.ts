import firebase from "firebase"
import "firebase/firestore"
import { writable } from 'svelte/store';

firebase.initializeApp({
    apiKey: "AIzaSyAkkqMU1qe8HoCrEObNJXvxT3wIywz2ulU",
    authDomain: "time-tracker-1af57.firebaseapp.com",
    projectId: "time-tracker-1af57",
    storageBucket: "time-tracker-1af57.appspot.com",
    messagingSenderId: "191631527516",
    appId: "1:191631527516:web:74b335167125e9e48de099"
});
 

const db = firebase.firestore()
const times = db.collection("times")

export const loading = writable(true);

function createTimes() {
    const { subscribe, set, update } = writable([]);

    times.onSnapshot(ss => {
        const times = ss.docs.map(x => { return {  id: x.id, ...x.data() }})
        set(times);
        loading.set(false)
    })
    return {subscribe };
}

export const theTimes = createTimes()


function createCount() {
	const { subscribe, set, update } = writable(0);
	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(0)
	};
}

export const count = createCount();

export function getTimes() {
    return times.get().then(snapshot => {
        return snapshot.docs.map(x => {
            return { ...x.data(), id: x.id }
        })
    })
}

export function startTime() {
    times.add({
        start: firebase.firestore.FieldValue.serverTimestamp(),
        end: null
    })
}

export function deleteTime(id) {
    return times.doc(id).delete();
}