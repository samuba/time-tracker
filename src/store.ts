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


// todo: use convert function to convert to own data model
function extractData(snapshot) {
    const data = snapshot.data()
    data.start = data.start ? data.start.toDate() : null
    data.end = data.end ? data.end.toDate() : null
    return { id: snapshot.id, ...data } as Time
}

function createCurrentTime() {
    const { subscribe, set, update } = writable({ start: null, end: null } as Time);
    times.where("end", "==", null).onSnapshot(ss => {
        if (!ss.empty) {
            const timesWithNoEnd = ss.docs.map(x => extractData(x))
            console.log({ timesWithNoEnd })
            set(timesWithNoEnd[0])
        }
    })
    return {
        subscribe,
        start: async () => { // todo: rename methods because they are confusing with time.start props
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
    times.orderBy("start", "desc").onSnapshot(ss => {
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

export function updateTime(id: string, time: Partial<Time>) {
    return times.doc(id).update(time)
}


export interface User extends firebase.User {
    jwt: string
}

function createCurrentUser() {
    const { subscribe, set } = writable(undefined as User | undefined)
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            set({ ...user, jwt: await user.getIdToken() })
        } else {
            set(undefined)
        }
    }, error => console.log("error while auth state changed", error));
    return { 
        subscribe, 
        logout: async () => await firebase.auth().signOut()
    }
}
export const currentUser = createCurrentUser();

