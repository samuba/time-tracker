<script lang="ts">
  import { addTime, theTimes, currentTime, currentUser } from "./store";
  import { format, intervalToDuration, isToday } from "date-fns";
  import { onDestroy } from "svelte";
  import type { Time } from "./store";
  import TimeEntry from "./TimeEntry.svelte";
  import Login from "./Login.svelte";

  let since = "";
  let overall = "";

  const calculateOverall = (times: Time[]) => {
    if (!times.length) return "";
    const accumulatedTimes = times
      .map((x) => Number(x.end || new Date()) - Number(x.start))
      .reduce((p, c, index, arr) => p + c);
    return formatDuration(accumulatedTimes);
  };

  const formatDuration = (milliseconds) => {
    const normalize = (time) => (time < 10 ? `0${time}` : time);
    let { seconds, minutes, hours, days, months } = intervalToDuration({
      start: 0,
      end: milliseconds,
    });
    days += months ? Math.round(months * 30) : 0;
    hours += days ? Math.round(days * 24) : 0;
    return `${normalize(hours)}:${normalize(minutes)}:${normalize(seconds)}`;
  };

  const interval = setInterval(() => {
    since = formatDuration(Number(new Date()) - Number($currentTime.start));
    overall = calculateOverall($theTimes);
  }, 1000);
  onDestroy(() => clearInterval(interval));
</script>

{#if !$currentUser}
  <Login />
{:else}
  <button
    class="border-gray-300 border rounded p-2 float-right mr-4 mt-4"
    on:click={currentUser.logout}
  >
    Logout
  </button>

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
        <p>
          Current Time: {since} (since {isToday($currentTime.start)
            ? "today " + format($currentTime.start, "HH:mm")
            : format($currentTime.start, "dd.MM.yyyy HH:mm")})
        </p>
        <button
          class="border-gray-300 border rounded p-2"
          on:click={currentTime.stop}
        >
          Stop Timer
        </button>
      {/if}

      <div class="mt-10">
        <h2 class="text-lg">All times (overall: {overall})</h2>

        {#each $theTimes.filter((x) => x.end != null) as time (time.start)}
          <TimeEntry {time} />
        {:else}
          No Data yet..
        {/each}
      </div>
    </div>
  </div>
{/if}
