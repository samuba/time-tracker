<script lang="ts">
  import { allTimes, currentTime, now } from "./store";
  import { currentUser } from "./userStore";
  import {
endOfWeek,
    format,
    getWeek,
    getYear,
    intervalToDuration,
    isToday,
    startOfWeek,
  } from "date-fns";
  import { onDestroy } from "svelte";
  import type { Time } from "./store";
  import TimeEntry from "./TimeEntry.svelte";
  import Button from "./Button.svelte";
  import DateTime from "./DateTime.svelte";
  import ButtonLink from "./ButtonLink.svelte";

  let alternativeStartTime = undefined;

  $: since = $currentTime.start
    ? formatDuration(Number($now) - Number($currentTime.start))
    : "00:00:00";
  $: days = getDays($allTimes, $now);
  $: weeks = getWeeks(days);
  $: overall = calculateOverall($allTimes, $now);

  const formatDay = (date: Date) => {
    return isToday(date) ? "Today" : format(date, "dd.MM.yyyy");
  };

  const getWeeks = (days: Day[]) => {
    const weeks: { [key: number]: Week } = {};
    days.forEach((day) => {
      const refDate = day.times[0].start;
      const weekNumber = getWeek(refDate);
      const yearWeekNumber = getYear(refDate) + weekNumber;
      let week = weeks[yearWeekNumber];
      if (week) {
        week.days.push(day);
        week.overallMs += day.overallMs;
        week.overall = formatDuration(week.overallMs);
      } else {
        weeks[yearWeekNumber] = {
          text: `Calendar Week ${weekNumber}`,
          textSecondary: formatDay(startOfWeek(refDate)) + " - " + formatDay(endOfWeek(refDate)),
          days: [day],
          overallMs: day.overallMs,
          overall: day.overall,
        };
      }
    });
    return Object.entries(weeks)
      .sort((a) => Number(a[0]))
      .reverse()
      .map((x) => x[1]);
  };

  const getDays = (times, now: Date) => {
    const days: Day[] = [];
    times.forEach((time) => {
      const day = days.filter((x) => x.text === formatDay(time.start))?.[0];
      const overallMs = Number(time.end || now) - Number(time.start);
      if (day) {
        day.times.push(time);
        day.overallMs += overallMs;
        day.overall = formatDuration(day.overallMs);
      } else {
        days.push({
          text: formatDay(time.start),
          times: [time],
          overallMs,
          overall: formatDuration(overallMs),
        });
      }
    });
    return days;
  };

  const calculateOverall = (times: Time[], now: Date) => {
    if (!times.length) return "";
    const accumulatedTimes = times
      .map((x) => Number(x.end || now) - Number(x.start))
      .reduce((p, c) => p + c);
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

  type Day = {
    text: string;
    overall: string;
    overallMs: number;
    times: Time[];
  };

  type Week = {
    text: string;
    textSecondary: string;
    overallMs: number;
    overall: string;
    days: Day[];
  };

  type Month = {
    text: String;
    weeks: Week[];
  };
</script>

<div class="w-full flex justify-between p-4">
    <div class="flex">
        <img src="../assets/chronometer.svg" class="h-10 mr-2 -mt-1" alt="logo">
        <div class="text-2xl">Trackerle</div>
    </div>
  <ButtonLink on:click={currentUser.logout} text="Logout" />
</div>

<div class="flex justify-center pt-4 pb-4">
  <div class="max-w-md">
    <div class="flex flex-wrap justify-center  flex-col">
      <div class="mb-4 font-mono text-center text-5xl">{since}</div>
      {#if !$currentTime.start}
        <Button
          text="Start Timer"
          on:click={() => currentTime.start(alternativeStartTime)}
          class="text-3xl py-4 shadow"
        />
        <div class="mt-4 text-center">
          {#if alternativeStartTime}
            <label for="past-time-start-input" class="mr-2">Start Time:</label>
            <DateTime
              bind:value={alternativeStartTime}
              id="past-time-start-input"
            />
          {:else}
            <ButtonLink
              text="Start from the past"
              on:click={() => (alternativeStartTime = new Date())}
            />
          {/if}
        </div>
      {:else}
        <Button
          text="Stop Timer"
          on:click={() => {
            currentTime.stop();
            alternativeStartTime = undefined;
          }}
          class="text-3xl py-4"
        />
      {/if}
    </div>

    {#if $allTimes.length > 0}
      <div class="mt-10">
        <h2 class="flex justify-between text-xl px-4 -mb-4">
          Overall <span class="font-mono">{overall}</span>
        </h2>

        {#each weeks as week}
          <h2 class="flex justify-between text-xl mb-4 mt-8 px-4" title={week.textSecondary}>
            {week.text} <span class="font-mono">{week.overall}</span>
          </h2>

          {#each week.days as day}
            <div class="bg-yellow-50 mt-4 p-4 shadow">
              <div class="text-lg flex justify-between font-mono">
                <span class="font-semibold">{day.text}</span>
                {day.overall}
              </div>
              <div>
                {#each day.times as time (time.start)}
                  <TimeEntry {time} />
                {/each}
              </div>
            </div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>
</div>
