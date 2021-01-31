<script lang="ts">
  import { addTime, deleteTime, theTimes, currentTime } from "./store";
  import { format, formatDistanceToNowStrict, formatDistanceStrict } from "date-fns";
  import { onDestroy } from "svelte";

  let since = "";

  const interval = setInterval(() => {
    if (!$currentTime.start) return since = "";
    since = formatDistanceToNowStrict($currentTime.start);
  }, 1000);
  onDestroy(() => clearInterval(interval));

  function formatPastTime(time) {
    if (!time.start) return
    if (!time.end) return "no end"
    return `${formatDistanceStrict(time.start, time.end)} (${format(time.start, "HH:mm")} - ${time.end && format(time.end, "HH:mm")})`
  }
</script>

<div class="flex justify-center pt-8">
  <div class="max-w-md">
    <h1 class="text-2xl">Time-Tracker</h1>

    {#if !$currentTime.start}
      <button
        class="border-gray-300 border rounded p-2"
        on:click={currentTime.start}
      >
        Start Timer
      </button>
    {:else}
      <p>{since} (since {format($currentTime.start, "HH:mm")})</p>
      <button
        class="border-gray-300 border rounded p-2"
        on:click={currentTime.stop}
      >
        Stop Timer
      </button>
    {/if}

    <div class="mt-10">
      <h2 class="text-lg">All times</h2>

      {#each $theTimes as time}
        <div class="bg-gray-100 p-2 px-4 mb-4">
          <span>{formatPastTime(time)}</span>
          <button
            class="border-gray-300 border rounded p-2"
            on:click={() => deleteTime(time.id)}
          >
            delete
          </button>
        </div>
      {:else}
        ...loading data
      {/each}
    </div>
  </div>
</div>
