<script lang="ts">
  import { addTime, deleteTime, theTimes, currentTime } from "./store";
  import {
    format,
    formatDistanceStrict,
    intervalToDuration,
isToday,
  } from "date-fns";
  import { onDestroy } from "svelte";

  let since = "";
  let overall = "";

  const calculateOverall = (times: Time[]) => {
    if (!times.length) return "";
    const accumulatedTimes = times
      .map((x) => (x.end || new Date()) - x.start)
      .reduce((p, c, index, arr) => p + c);
    return formatDuration(accumulatedTimes);
  };

  const formatDuration = (milliseconds) => {
    const normalizeTime = (time) => (time < 10 ? `0${time}` : time);
    let { seconds, minutes, hours, days, months } = intervalToDuration({
      start: 0,
      end: milliseconds,
    });
    days += months ? Math.round(months * 30) : 0;
    hours += days ? Math.round(days * 24) : 0;
    return `${normalizeTime(hours)}:${normalizeTime(minutes)}:${normalizeTime(
      seconds
    )}`;
  }

  const interval = setInterval(() => {
    since = formatDuration(Number(new Date()) - Number($currentTime.start))
    overall = calculateOverall($theTimes);
  }, 1000);
  onDestroy(() => clearInterval(interval));

  function formatPastTime(time) {
    if (!time.start) return;
    if (!time.end) return "no end";
    return `${formatDistanceStrict(time.start, time.end)} (${format(
      time.start,
      "HH:mm"
    )} - ${time.end && format(time.end, "HH:mm")})`;
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
      <p>Current Time: {since} (since { isToday($currentTime.start) ? "today " + format($currentTime.start, "HH:mm") : format($currentTime.start, "dd.MM.yyyy HH:mm")})</p>
      <button
        class="border-gray-300 border rounded p-2"
        on:click={currentTime.stop}
      >
        Stop Timer
      </button>
    {/if}

    <div class="mt-10">
      <h2 class="text-lg">All times (overall: {overall})</h2>

      {#each $theTimes.filter((x) => x.end != null) as time}
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
