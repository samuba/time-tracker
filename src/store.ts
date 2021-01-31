import { formatDistance } from "date-fns";
import firebase from "firebase"
import "firebase/firestore"
import { derived, readable, writable } from 'svelte/store';

if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyAkkqMU1qe8HoCrEObNJXvxT3wIywz2ulU",
        authDomain: "time-tracker-1af57.firebaseapp.com",
        projectId: "time-tracker-1af57",
        storageBucket: "time-tracker-1af57.appspot.com",
        messagingSenderId: "191631527516",
        appId: "1:191631527516:web:74b335167125e9e48de099"
    });
}
const db = firebase.firestore()
const times = db.collection("times")


export type Time = {
    id: string,
    start: Date,
    end: Date,
}
export type NewTime = Omit<Time, "id">

function extractData(snapshot) {
    const data = snapshot.data()
    data.start = data.start ? data.start.toDate() : null
    data.end = data.end ? data.end.toDate() : null
    return { id: snapshot.id, ...data } as Time
}


// todo: get currentTime from store if already exists
function createCurrentTime() {
    const { subscribe, set, update } = writable({ start: null, end: null } as Time);
    return {
        subscribe,
        start: async () => {
            set(await addTime({ start: new Date(), end: null }))
        },
        stop: () => update(n => {
            const end = new Date();
            times.doc(n.id).update({ end })
            return { start: null, end: null } as Time;
        })
    }
}
export const currentTime = createCurrentTime();


function createTimes() {
    const { subscribe, set, update } = writable([] as Time[]);
    times.onSnapshot(ss => {
        const times = ss.docs.map(x => extractData(x))
        set(times);
    })
    return { subscribe };
}
export const theTimes = createTimes()

export function addTime(time: NewTime) {
    return times.add(time).then(x => {
        return { ...time, id: x.id } as Time
    })
}

export function deleteTime(id: string) {
    console.log("delete time: " + id)
    return times.doc(id).delete();
}