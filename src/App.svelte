<script lang="ts">
  import { currentUser } from "./userStore";
  import Login from "./Login.svelte";
  import Home from "./Home.svelte";

</script>

{#if $currentUser === undefined}
  <!-- 
    currentUser is undefined if we do not have a authentication result yet.
    maybe we show a loading indicator here in the future.
  -->
{:else if $currentUser === null}
  <Login />
{:else}
  <Home />
{/if}
