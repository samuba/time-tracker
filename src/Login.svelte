<script lang="ts">
    import { currentUser } from "./userStore";
    import { tick } from "svelte";
    import * as firebaseui from "firebaseui";
    import "firebaseui/dist/firebaseui.css";
    import firebase from "firebase";

    $: if (
        !$currentUser ||
        firebase.auth().isSignInWithEmailLink(window.location.href)
    ) {
        tick().then(() => injectFirebaseLoginButton());
    }

    const injectFirebaseLoginButton = () => {
        const authUi =
            firebaseui.auth.AuthUI.getInstance() ||
            new firebaseui.auth.AuthUI(firebase.auth());

        authUi.start("#firebaseui-auth-container", {
            signInOptions: [
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    signInMethod:
                        firebase.auth.EmailAuthProvider
                            .EMAIL_LINK_SIGN_IN_METHOD,
                },
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
            signInFlow: "popup",
        });
    };
</script>

<div class="flex mt-12 mb-12 justify-center mx-4">
    <div class="max-w-md">
        <h1 class="text-4xl mb-4">Trackerle</h1>
        <p class="text-lg">
            A cute little tool that helps track the time you
            spend on stuff.
        </p>
    </div>
</div>
<div id="firebaseui-auth-container" />
