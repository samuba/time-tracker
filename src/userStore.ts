import firebase from "firebase"
import "firebase/firestore"
import { Readable, writable } from 'svelte/store';
import { initFirebase } from ".";

initFirebase();

export interface User extends firebase.User {
    jwt: string
}

function createCurrentUser() {
    const { subscribe, set } = writable(undefined as User | undefined)

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const jwt = await user.getIdToken()
            set({ ...user, jwt })
        } else {
            set(null)
        }
    }, error => console.log("error while auth state changed", error));

    return {
        subscribe, 
        logout: async () => await firebase.auth().signOut(),
        authenticated: (callback: (user: User) => void) => {
            const unsubscribe = subscribe((user) => {
                if (!user) return;
                callback(user);
                unsubscribe()
            })
        }
    }
}
export const currentUser = createCurrentUser();