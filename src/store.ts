import firebase from "firebase"
import "firebase/firestore"
import { derived, Readable, readable, writable } from 'svelte/store';
import { initFirebase } from ".";
import { currentUser } from "./userStore";

initFirebase();

const db = firebase.firestore()
const times = db.collection("times")

export type Time = {
    id: string,
    start: Date,
    end: Date,
    userId: string,
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
    let userId = "";
    currentUser.authenticated(user => {
        userId = user.uid;
        times.where("userId", "==", userId).where("end", "==", null).onSnapshot(ss => {
            if (!ss.empty) {
                const timesWithNoEnd = ss.docs.map(x => extractData(x))
                console.log({ timesWithNoEnd })
                set(timesWithNoEnd[0])
            }
        })
    })
    return {
        subscribe,
        start: async () => { // todo: rename methods because they are confusing with time.start props
            set(await addTime({ start: new Date(), end: null, userId }))
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
    const { subscribe, set } = writable([] as Time[]);
    currentUser.authenticated(user => {
        times.where("userId", "==", user.uid).orderBy("start", "desc").onSnapshot(ss => {
            const times = ss.docs.map(x => extractData(x))
            set(times);
        })
    })
    return { subscribe };
}
export const allTimes = createTimes()

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