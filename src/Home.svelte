<script lang="ts">
    import { allTimes, currentTime } from "./store";
    import { currentUser } from "./userStore";
    import { format, intervalToDuration, isToday } from "date-fns";
    import { onDestroy } from "svelte";
    import type { Time } from "./store";
    import TimeEntry from "./TimeEntry.svelte";
    import Button from "./Button.svelte";

    let since = "";

    $: pastTimes = $allTimes.filter((x) => x.end != null);
    $: days = getDays(pastTimes);
    $: overall = calculateOverall($allTimes)

    const getDays = (times) => {
        const days: Day[] = [];
        times.forEach((time) => {
            const day = days.filter(
                (x) => x.text === format(time.start, "dd.MM.yyyy")
            )?.[0];
            const overallMs = Number(time.end) - Number(time.start);
            if (day) {
                day.times.push(time);
                day.overallMs += overallMs;
                day.overall = formatDuration(day.overallMs);
            } else {
                days.push({
                    text: format(time.start, "dd.MM.yyyy"),
                    times: [time],
                    overallMs,
                    overall: formatDuration(overallMs),
                });
            }
        });
        return days;
    };

    const calculateOverall = (times: Time[]) => {
        if (!times.length) return "";
        const accumulatedTimes = times
            .map((x) => Number(x.end || new Date()) - Number(x.start))
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
        return `${normalize(hours)}:${normalize(minutes)}:${normalize(
            seconds
        )}`;
    };

    const interval = setInterval(() => {
        if (!$currentTime.start) return;
        since = formatDuration(Number(new Date()) - Number($currentTime.start));
        overall = calculateOverall($allTimes);
    }, 1000);
    onDestroy(() => clearInterval(interval));

    type Day = {
        text: string;
        overall: string;
        overallMs: number;
        times: Time[];
    };

    type Week = {
        text: String;
        days: Day[];
    };

    type Month = {
        text: String;
        weeks: Week[];
    };
</script>

<div class="w-full flex justify-between p-4">
    <div class="text-2xl">Time-Tracker</div>
    <Button on:click={currentUser.logout} text="Logout" />
</div>

<div class="flex justify-center pt-8">
    <div class="max-w-md">
        <div class="flex">
            {#if !$currentTime.start}
                <Button text="Start Timer" on:click={currentTime.start}  class="text-2xl px-4 py-2" />
            {:else}
                <Button
                    text="Stop Timer"
                    on:click={currentTime.stop}
                    class="text-2xl px-4 py-2"
                />
                <div class="ml-8 mt-4">
                    Current Time: <span class="font-mono">{since}</span> 
                </div>
            {/if}
        </div>

        {#if pastTimes.length > 0}
            <div class="mt-10">
                <h2 class="text-xl">
                    Overall: <span class="font-mono">{overall}</span>
                </h2>

                {#each days as day}
                    <div class="bg-gray-50 border mt-4 p-4">
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
            </div>
        {/if}
    </div>
</div>
