<script lang="ts">
    import {  startTime, deleteTime, theTimes } from "./store";

let name = "worldsssisss";

function start() {
  startTime();
}
</script>

<h1>Hello {name}!</h1>

<button class="border-gray-300 border" on:click={startTime}>Start</button>

  {#each $theTimes as time}
  <div>
    <p>start: {time.start}</p>
    <p>end: {time.end}</p>
    
    <button class="border-gray-300 border" on:click="{() => deleteTime(time.id)}">delete</button>
    <br />
  </div>

  {:else}
    ...loading data 
  {/each}
